// ============================================================================
// TRANSACTION VALIDATION MODULE
// ============================================================================

/**
 * Validates a transaction with the given parameters.
 * 
 * @param {string} itemName - The name of the transaction item
 * @param {number|string} amount - The transaction amount
 * @param {string} category - The transaction category
 * @returns {Object} Validation result with valid flag and error messages array
 */
function validateTransaction(itemName, amount, category) {
    const errors = [];
    
    // Validate item name
    if (typeof itemName !== 'string') {
        errors.push('Item name must be a string');
    } else {
        const trimmedName = itemName.trim();
        if (trimmedName.length === 0) {
            errors.push('Item name cannot be empty');
        } else if (trimmedName.length > 100) {
            errors.push('Item name must be 100 characters or less');
        }
    }
    
    // Validate amount
    const numAmount = Number(amount);
    if (isNaN(numAmount)) {
        errors.push('Amount must be a valid number');
    } else if (numAmount <= 0) {
        errors.push('Amount must be greater than 0');
    } else if (numAmount > 999999.99) {
        errors.push('Amount cannot exceed 999,999.99');
    } else {
        // Check decimal places
        const decimalPlaces = (amount.toString().split('.')[1] || '').length;
        if (decimalPlaces > 2) {
            errors.push('Amount must have at most 2 decimal places');
        }
    }
    
    // Validate category
    const validCategories = ['Food', 'Transport', 'Fun'];
    if (!validCategories.includes(category)) {
        errors.push('Category must be one of: Food, Transport, or Fun');
    }
    
    return {
        valid: errors.length === 0,
        errors: errors
    };
}

// ============================================================================
// STORAGE MODULE
// ============================================================================

const StorageModule = (() => {
    const TRANSACTIONS_KEY = 'transactions';
    const PREFERENCES_KEY = 'userPreferences';

    /**
     * Check if localStorage is available
     * @returns {boolean} true if localStorage is available, false otherwise
     */
    const isStorageAvailable = () => {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    };

    /**
     * Display error message to user
     * @param {string} message - The error message to display
     */
    const displayError = (message) => {
        console.error(message);
        // Create error notification element if it doesn't exist
        let errorNotification = document.getElementById('errorNotification');
        if (!errorNotification) {
            errorNotification = document.createElement('div');
            errorNotification.id = 'errorNotification';
            errorNotification.className = 'notification error';
            document.body.insertBefore(errorNotification, document.body.firstChild);
        }
        errorNotification.textContent = message;
        errorNotification.style.display = 'block';
        setTimeout(() => {
            errorNotification.style.display = 'none';
        }, 5000);
    };

    /**
     * Display warning message to user
     * @param {string} message - The warning message to display
     */
    const displayWarning = (message) => {
        console.warn(message);
        // Create warning notification element if it doesn't exist
        let warningNotification = document.getElementById('warningNotification');
        if (!warningNotification) {
            warningNotification = document.createElement('div');
            warningNotification.id = 'warningNotification';
            warningNotification.className = 'notification warning';
            document.body.insertBefore(warningNotification, document.body.firstChild);
        }
        warningNotification.textContent = message;
        warningNotification.style.display = 'block';
        setTimeout(() => {
            warningNotification.style.display = 'none';
        }, 5000);
    };

    /**
     * Validate transaction object structure
     * @param {Object} transaction - Transaction object to validate
     * @returns {boolean} true if transaction is valid, false otherwise
     */
    const isValidTransaction = (transaction) => {
        return (
            typeof transaction === 'object' &&
            transaction !== null &&
            typeof transaction.id === 'string' &&
            typeof transaction.itemName === 'string' &&
            typeof transaction.amount === 'number' &&
            typeof transaction.category === 'string' &&
            typeof transaction.timestamp === 'number'
        );
    };

    /**
     * Save transactions to localStorage with error handling
     * @param {Array} transactions - Array of transaction objects to save
     * @returns {boolean} true if save was successful, false otherwise
     */
    const saveTransactions = (transactions) => {
        if (!isStorageAvailable()) {
            displayError('Failed to save data. localStorage is unavailable. Please try again.');
            return false;
        }

        try {
            const serialized = JSON.stringify(transactions);
            localStorage.setItem(TRANSACTIONS_KEY, serialized);
            return true;
        } catch (e) {
            if (e.name === 'QuotaExceededError') {
                displayError('Failed to save data. Storage quota exceeded. Please delete some transactions.');
            } else {
                displayError('Failed to save data. Please try again.');
            }
            return false;
        }
    };

    /**
     * Load transactions from localStorage with error handling
     * @returns {Array} Array of transaction objects, or empty array if load fails
     */
    const loadTransactions = () => {
        if (!isStorageAvailable()) {
            displayWarning('Local storage is unavailable. Your data will not persist after closing the browser.');
            return [];
        }

        try {
            const data = localStorage.getItem(TRANSACTIONS_KEY);
            if (!data) {
                return [];
            }

            const transactions = JSON.parse(data);
            
            // Validate all transactions
            if (!Array.isArray(transactions)) {
                displayError('Stored data is corrupted. Starting with empty data.');
                return [];
            }

            // Filter out invalid transactions
            const validTransactions = transactions.filter(isValidTransaction);
            
            if (validTransactions.length < transactions.length) {
                displayError('Some stored transactions were corrupted and have been removed.');
            }

            return validTransactions;
        } catch (e) {
            displayError('Stored data is corrupted. Starting with empty data.');
            return [];
        }
    };

    /**
     * Save user preferences to localStorage
     * @param {Object} preferences - User preferences object
     * @returns {boolean} true if save was successful, false otherwise
     */
    const saveUserPreferences = (preferences) => {
        if (!isStorageAvailable()) {
            displayWarning('Local storage is unavailable. Your preferences will not persist.');
            return false;
        }

        try {
            const serialized = JSON.stringify(preferences);
            localStorage.setItem(PREFERENCES_KEY, serialized);
            return true;
        } catch (e) {
            displayWarning('Failed to save preferences. Your preferences will not persist.');
            return false;
        }
    };

    /**
     * Load user preferences from localStorage
     * @returns {Object} User preferences object with defaults
     */
    const loadUserPreferences = () => {
        const defaults = { theme: 'light', sortBy: 'date' };

        if (!isStorageAvailable()) {
            return defaults;
        }

        try {
            const data = localStorage.getItem(PREFERENCES_KEY);
            if (!data) {
                return defaults;
            }

            const preferences = JSON.parse(data);
            
            // Validate preferences
            if (typeof preferences !== 'object' || preferences === null) {
                return defaults;
            }

            return {
                theme: preferences.theme || defaults.theme,
                sortBy: preferences.sortBy || defaults.sortBy
            };
        } catch (e) {
            return defaults;
        }
    };

    return {
        saveTransactions,
        loadTransactions,
        saveUserPreferences,
        loadUserPreferences,
        isStorageAvailable,
        displayError,
        displayWarning
    };
})();

// ============================================================================
// TRANSACTION MANAGEMENT MODULE
// ============================================================================

const TransactionModule = (() => {
    let transactions = [];

    /**
     * Add a new transaction
     * @param {string} itemName - The name of the transaction item
     * @param {number|string} amount - The transaction amount
     * @param {string} category - The transaction category
     * @returns {Object} Result object with success flag and transaction or errors
     */
    const addTransaction = (itemName, amount, category) => {
        const validation = validateTransaction(itemName, amount, category);
        if (!validation.valid) {
            return { success: false, errors: validation.errors };
        }

        const transaction = {
            id: Date.now().toString(),
            itemName: itemName.trim(),
            amount: parseFloat(amount),
            category: category,
            timestamp: Date.now()
        };

        transactions.unshift(transaction);
        StorageModule.saveTransactions(transactions);

        return { success: true, transaction: transaction };
    };

    /**
     * Delete a transaction by ID
     * @param {string} id - The transaction ID to delete
     * @returns {boolean} true if deletion was successful, false otherwise
     */
    const deleteTransaction = (id) => {
        const index = transactions.findIndex(t => t.id === id);
        if (index === -1) {
            return false;
        }

        transactions.splice(index, 1);
        StorageModule.saveTransactions(transactions);
        return true;
    };

    /**
     * Get all transactions
     * @returns {Array} Array of all transactions
     */
    const getTransactions = () => {
        return transactions;
    };

    /**
     * Load transactions from storage
     */
    const loadFromStorage = () => {
        transactions = StorageModule.loadTransactions();
    };

    return {
        addTransaction,
        deleteTransaction,
        getTransactions,
        loadFromStorage
    };
})();

// ============================================================================
// CALCULATION MODULE
// ============================================================================

const CalculationModule = (() => {
    /**
     * Calculate total balance from transactions
     * @param {Array} transactions - Array of transactions
     * @returns {number} Total balance rounded to 2 decimal places
     */
    const calculateTotalBalance = (transactions) => {
        const total = transactions.reduce((sum, t) => sum + t.amount, 0);
        // Round half-up to 2 decimal places
        return Math.round(total * 100) / 100;
    };

    /**
     * Calculate category totals
     * @param {Array} transactions - Array of transactions
     * @returns {Object} Object with Food, Transport, Fun totals
     */
    const calculateCategoryTotals = (transactions) => {
        const totals = {
            Food: 0,
            Transport: 0,
            Fun: 0
        };

        transactions.forEach(t => {
            if (totals.hasOwnProperty(t.category)) {
                totals[t.category] += t.amount;
            }
        });

        // Round each category to 2 decimal places
        Object.keys(totals).forEach(key => {
            totals[key] = Math.round(totals[key] * 100) / 100;
        });

        return totals;
    };

    /**
     * Calculate category percentages
     * @param {Array} transactions - Array of transactions
     * @returns {Object} Object with Food, Transport, Fun percentages
     */
    const calculateCategoryPercentages = (transactions) => {
        const totals = calculateCategoryTotals(transactions);
        const total = calculateTotalBalance(transactions);

        const percentages = {
            Food: 0,
            Transport: 0,
            Fun: 0
        };

        if (total === 0) {
            return percentages;
        }

        Object.keys(percentages).forEach(key => {
            percentages[key] = parseFloat(((totals[key] / total) * 100).toFixed(1));
        });

        return percentages;
    };

    /**
     * Calculate monthly totals
     * @param {Array} transactions - Array of transactions
     * @param {number} year - Year to filter by
     * @param {number} month - Month to filter by (1-12)
     * @returns {Object} Object with total and byCategory
     */
    const calculateMonthlyTotals = (transactions, year, month) => {
        const filtered = transactions.filter(t => {
            const date = new Date(t.timestamp);
            return date.getFullYear() === year && date.getMonth() === month - 1;
        });

        const total = calculateTotalBalance(filtered);
        const byCategory = calculateCategoryTotals(filtered);

        return { total, byCategory };
    };

    return {
        calculateTotalBalance,
        calculateCategoryTotals,
        calculateCategoryPercentages,
        calculateMonthlyTotals
    };
})();

// ============================================================================
// SORTING MODULE
// ============================================================================

const SortingModule = (() => {
    /**
     * Sort transactions by specified criteria
     * @param {Array} transactions - Array of transactions to sort
     * @param {string} sortBy - Sort criteria: 'date', 'amount', or 'category'
     * @returns {Array} Sorted array of transactions
     */
    const sortTransactions = (transactions, sortBy) => {
        const sorted = [...transactions];

        switch (sortBy) {
            case 'amount':
                sorted.sort((a, b) => b.amount - a.amount);
                break;
            case 'category':
                sorted.sort((a, b) => {
                    if (a.category !== b.category) {
                        return a.category.localeCompare(b.category);
                    }
                    return b.timestamp - a.timestamp;
                });
                break;
            case 'date':
            default:
                sorted.sort((a, b) => b.timestamp - a.timestamp);
                break;
        }

        return sorted;
    };

    /**
     * Set sort preference and persist to localStorage
     * @param {string} sortBy - Sort criteria: 'date', 'amount', or 'category'
     * @returns {boolean} true if preference was saved successfully
     */
    const setSortPreference = (sortBy) => {
        const validSortOptions = ['date', 'amount', 'category'];
        
        if (!validSortOptions.includes(sortBy)) {
            console.warn(`Invalid sort preference: ${sortBy}. Using default 'date'.`);
            sortBy = 'date';
        }

        const preferences = StorageModule.loadUserPreferences();
        return StorageModule.saveUserPreferences({ ...preferences, sortBy });
    };

    /**
     * Get current sort preference from localStorage
     * @returns {string} Current sort preference ('date', 'amount', or 'category')
     */
    const getSortPreference = () => {
        const preferences = StorageModule.loadUserPreferences();
        return preferences.sortBy || 'date';
    };

    return {
        sortTransactions,
        setSortPreference,
        getSortPreference
    };
})();

// ============================================================================
// FILTERING MODULE
// ============================================================================

const FilteringModule = (() => {
    /**
     * Filter transactions by month
     * @param {Array} transactions - Array of transactions
     * @param {number} year - Year to filter by
     * @param {number} month - Month to filter by (1-12)
     * @returns {Array} Filtered array of transactions
     */
    const filterByMonth = (transactions, year, month) => {
        return transactions.filter(t => {
            const date = new Date(t.timestamp);
            return date.getFullYear() === year && date.getMonth() === month - 1;
        });
    };

    return {
        filterByMonth
    };
})();

// ============================================================================
// FORMATTING MODULE
// ============================================================================

const FormattingModule = (() => {
    /**
     * Format amount with 2 decimal places and thousands separator
     * @param {number} amount - Amount to format
     * @returns {string} Formatted amount string
     */
    const formatAmount = (amount) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    /**
     * Format balance with 2 decimal places and thousands separator
     * @param {number} balance - Balance to format
     * @returns {string} Formatted balance string
     */
    const formatBalance = (balance) => {
        return formatAmount(balance);
    };

    return {
        formatAmount,
        formatBalance
    };
})();

// ============================================================================
// UI MODULE
// ============================================================================

const UIModule = (() => {
    /**
     * Escape HTML special characters
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    const escapeHtml = (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };

    /**
     * Render transaction list
     * @param {Array} transactions - Array of transactions to render
     */
    const renderTransactionList = (transactions) => {
        const listContainer = document.getElementById('transactionList');

        if (transactions.length === 0) {
            listContainer.innerHTML = '<div class="empty-state">No transactions yet. Add your first expense!</div>';
            return;
        }

        const displayTransactions = transactions.slice(0, 1000);

        listContainer.innerHTML = displayTransactions.map(t => `
            <div class="transaction-item ${t.category.toLowerCase()}">
                <div class="transaction-info">
                    <div class="transaction-name">${escapeHtml(t.itemName)}</div>
                    <div class="transaction-category">${t.category}</div>
                </div>
                <div class="transaction-amount">$${FormattingModule.formatAmount(t.amount)}</div>
                <button class="btn-delete" data-id="${t.id}" aria-label="Delete transaction">Delete</button>
            </div>
        `).join('');
    };

    /**
     * Render balance display
     * @param {number} balance - Balance to display
     */
    const renderBalance = (balance) => {
        const balanceDisplay = document.getElementById('totalBalance');
        balanceDisplay.textContent = `$${FormattingModule.formatBalance(balance)}`;
    };

    /**
     * Render pie chart
     * @param {Object} categoryTotals - Object with category totals
     */
    const renderChart = (categoryTotals) => {
        const canvas = document.getElementById('categoryChart');
        const chartEmptyState = document.getElementById('chartEmptyState');

        // Check if Chart.js is available
        if (typeof Chart === 'undefined') {
            canvas.style.display = 'none';
            chartEmptyState.textContent = 'Chart library failed to load. Chart visualization is disabled.';
            chartEmptyState.style.display = 'block';
            return;
        }

        // Calculate total to determine if we should show empty state
        const total = categoryTotals.Food + categoryTotals.Transport + categoryTotals.Fun;

        if (total === 0) {
            canvas.style.display = 'none';
            chartEmptyState.textContent = 'Add transactions to see spending breakdown';
            chartEmptyState.style.display = 'block';
            return;
        }

        canvas.style.display = 'block';
        chartEmptyState.style.display = 'none';

        const percentages = CalculationModule.calculateCategoryPercentages(
            TransactionModule.getTransactions()
        );

        const ctx = canvas.getContext('2d');

        // Destroy existing chart if it exists
        if (window.categoryChartInstance) {
            window.categoryChartInstance.destroy();
        }

        window.categoryChartInstance = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Food', 'Transport', 'Fun'],
                datasets: [{
                    data: [categoryTotals.Food, categoryTotals.Transport, categoryTotals.Fun],
                    backgroundColor: ['#e74c3c', '#3498db', '#f39c12'],
                    borderColor: '#fff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = FormattingModule.formatAmount(context.parsed);
                                const percentage = percentages[label] || 0;
                                return `${label}: $${value} (${percentage}%)`;
                            }
                        }
                    },
                    datalabels: {
                        formatter: (value, ctx) => {
                            const label = ctx.chart.data.labels[ctx.dataIndex];
                            const percentage = percentages[label] || 0;
                            return `${percentage}%`;
                        }
                    }
                }
            }
        });
    };

    /**
     * Render form - initialize form with default values and clear any errors
     */
    const renderForm = () => {
        const form = document.getElementById('transactionForm');
        form.reset();
        
        // Clear all error messages
        document.querySelectorAll('.error-message').forEach(el => {
            el.classList.remove('show');
            el.textContent = '';
        });
        
        // Set default category to empty (no selection)
        document.getElementById('category').value = '';
        
        // Focus on item name input for better UX
        document.getElementById('itemName').focus();
    };

    /**
     * Clear form inputs
     */
    const clearForm = () => {
        document.getElementById('transactionForm').reset();
        document.querySelectorAll('.error-message').forEach(el => {
            el.classList.remove('show');
            el.textContent = '';
        });
    };

    /**
     * Render monthly view
     * @param {Object} monthlyData - Monthly data object
     */
    const renderMonthlyView = (monthlyData) => {
        const monthlyContent = document.getElementById('monthlyContent');

        if (monthlyData.total === 0) {
            monthlyContent.innerHTML = '<div class="empty-state">No expenses this month</div>';
            return;
        }

        monthlyContent.innerHTML = `
            <div class="monthly-summary">
                <div class="monthly-card">
                    <div class="monthly-card-label">Total Spending</div>
                    <div class="monthly-card-value">$${FormattingModule.formatAmount(monthlyData.total)}</div>
                </div>
                <div class="monthly-card">
                    <div class="monthly-card-label">Food</div>
                    <div class="monthly-card-value">$${FormattingModule.formatAmount(monthlyData.byCategory.Food)}</div>
                </div>
                <div class="monthly-card">
                    <div class="monthly-card-label">Transport</div>
                    <div class="monthly-card-value">$${FormattingModule.formatAmount(monthlyData.byCategory.Transport)}</div>
                </div>
                <div class="monthly-card">
                    <div class="monthly-card-label">Fun</div>
                    <div class="monthly-card-value">$${FormattingModule.formatAmount(monthlyData.byCategory.Fun)}</div>
                </div>
            </div>
        `;
    };

    return {
        renderTransactionList,
        renderBalance,
        renderChart,
        clearForm,
        renderForm,
        renderMonthlyView,
        escapeHtml
    };
})();

// ============================================================================
// THEME MODULE
// ============================================================================

const ThemeModule = (() => {
    /**
     * Toggle between light and dark theme
     */
    const toggleTheme = () => {
        const body = document.body;
        const isDark = body.classList.contains('dark-theme');
        const preferences = StorageModule.loadUserPreferences();

        if (isDark) {
            body.classList.remove('dark-theme');
            StorageModule.saveUserPreferences({ ...preferences, theme: 'light' });
        } else {
            body.classList.add('dark-theme');
            StorageModule.saveUserPreferences({ ...preferences, theme: 'dark' });
        }
    };

    /**
     * Apply theme to document
     * @param {string} theme - Theme to apply ('light' or 'dark')
     */
    const applyTheme = (theme) => {
        const body = document.body;
        if (theme === 'dark') {
            body.classList.add('dark-theme');
        } else {
            body.classList.remove('dark-theme');
        }
    };

    return {
        toggleTheme,
        applyTheme
    };
})();

// ============================================================================
// APPLICATION INITIALIZATION
// ============================================================================

/**
 * Update all UI elements
 * @param {string} sortBy - Sort criteria to use
 */
function updateUI(sortBy = 'date') {
    const transactions = TransactionModule.getTransactions();
    const sortedTransactions = SortingModule.sortTransactions(transactions, sortBy);
    const balance = CalculationModule.calculateTotalBalance(transactions);
    const categoryTotals = CalculationModule.calculateCategoryTotals(transactions);

    UIModule.renderTransactionList(sortedTransactions);
    UIModule.renderBalance(balance);
    UIModule.renderChart(categoryTotals);
}

/**
 * Handle form submission
 * @param {Event} e - Form submit event
 */
function handleFormSubmit(e) {
    e.preventDefault();

    const itemName = document.getElementById('itemName').value;
    const amount = document.getElementById('amount').value;
    const category = document.getElementById('category').value;

    // Clear previous errors
    document.querySelectorAll('.error-message').forEach(el => {
        el.classList.remove('show');
        el.textContent = '';
    });

    // Validate
    const validation = validateTransaction(itemName, amount, category);

    if (!validation.valid) {
        // Display errors
        validation.errors.forEach(error => {
            if (error.includes('Item name')) {
                const el = document.getElementById('itemNameError');
                el.textContent = error;
                el.classList.add('show');
            } else if (error.includes('Amount')) {
                const el = document.getElementById('amountError');
                el.textContent = error;
                el.classList.add('show');
            } else if (error.includes('Category')) {
                const el = document.getElementById('categoryError');
                el.textContent = error;
                el.classList.add('show');
            }
        });
        return;
    }

    // Add transaction
    const result = TransactionModule.addTransaction(itemName, amount, category);

    if (result.success) {
        UIModule.clearForm();
        const preferences = StorageModule.loadUserPreferences();
        updateUI(preferences.sortBy);
    }
}

/**
 * Handle delete button click
 * @param {string} id - Transaction ID to delete
 */
function handleDeleteTransaction(id) {
    if (TransactionModule.deleteTransaction(id)) {
        const preferences = StorageModule.loadUserPreferences();
        updateUI(preferences.sortBy);
    }
}

/**
 * Handle sort preference change
 * @param {Event} e - Change event
 */
function handleSortChange(e) {
    const sortBy = e.target.value;
    const preferences = StorageModule.loadUserPreferences();
    StorageModule.saveUserPreferences({ ...preferences, sortBy });
    updateUI(sortBy);
}

/**
 * Handle theme toggle
 */
function handleThemeToggle() {
    ThemeModule.toggleTheme();
}

/**
 * Switch to monthly view
 */
function switchToMonthlyView() {
    const now = new Date();
    const monthlyData = CalculationModule.calculateMonthlyTotals(
        TransactionModule.getTransactions(),
        now.getFullYear(),
        now.getMonth() + 1
    );
    UIModule.renderMonthlyView(monthlyData);
    document.getElementById('monthlyView').classList.remove('hidden');
}

/**
 * Switch to main view
 */
function switchToMainView() {
    document.getElementById('monthlyView').classList.add('hidden');
}

/**
 * Handle monthly view button click
 */
function handleMonthlyView() {
    switchToMonthlyView();
}

/**
 * Handle return from monthly view
 */
function handleBackToMain() {
    switchToMainView();
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
    // Form submission
    document.getElementById('transactionForm').addEventListener('submit', handleFormSubmit);

    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', handleThemeToggle);

    // Sort preference
    document.getElementById('sortBy').addEventListener('change', handleSortChange);

    // Monthly view
    document.getElementById('monthlyViewBtn').addEventListener('click', handleMonthlyView);
    document.getElementById('returnBtn').addEventListener('click', handleBackToMain);

    // Load sort preference
    const preferences = StorageModule.loadUserPreferences();
    document.getElementById('sortBy').value = preferences.sortBy;
}

/**
 * Initialize the application
 */
function initializeApp() {
    // Load data from storage
    TransactionModule.loadFromStorage();
    const preferences = StorageModule.loadUserPreferences();

    // Apply theme
    ThemeModule.applyTheme(preferences.theme);

    // Initialize form
    UIModule.renderForm();

    // Render initial UI
    updateUI(preferences.sortBy);

    // Set up event listeners
    setupEventListeners();

    // Event delegation for delete buttons
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-delete')) {
            const id = e.target.getAttribute('data-id');
            handleDeleteTransaction(id);
        }
    });
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
