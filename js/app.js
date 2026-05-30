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
     * Load transactions from localStorage with corruption detection
     * @returns {Array} Array of transaction objects, or empty array if load fails
     */
    const loadTransactions = () => {
        if (!isStorageAvailable()) {
            displayWarning('Local storage is unavailable. Your data will not persist after closing the browser.');
            return [];
        }

        try {
            const stored = localStorage.getItem(TRANSACTIONS_KEY);

            // If nothing stored, return empty array
            if (stored === null) {
                return [];
            }

            // Try to parse the JSON
            const transactions = JSON.parse(stored);

            // Validate that it's an array
            if (!Array.isArray(transactions)) {
                displayError('Stored data is corrupted. Starting with empty data.');
                return [];
            }

            // Validate each transaction has required fields
            for (const transaction of transactions) {
                if (!isValidTransaction(transaction)) {
                    displayError('Stored data is corrupted. Starting with empty data.');
                    return [];
                }
            }

            return transactions;
        } catch (e) {
            if (e instanceof SyntaxError) {
                displayError('Stored data is corrupted. Starting with empty data.');
            } else {
                displayError('Failed to load data. Starting with empty data.');
            }
            return [];
        }
    };

    /**
     * Save user preferences to localStorage
     * @param {Object} preferences - User preferences object with theme and sortBy
     * @returns {boolean} true if save was successful, false otherwise
     */
    const saveUserPreferences = (preferences) => {
        if (!isStorageAvailable()) {
            displayWarning('Local storage is unavailable. Your preferences will not persist after closing the browser.');
            return false;
        }

        try {
            const serialized = JSON.stringify(preferences);
            localStorage.setItem(PREFERENCES_KEY, serialized);
            return true;
        } catch (e) {
            if (e.name === 'QuotaExceededError') {
                displayWarning('Failed to save preferences. Storage quota exceeded.');
            } else {
                displayWarning('Failed to save preferences. Please try again.');
            }
            return false;
        }
    };

    /**
     * Load user preferences from localStorage
     * @returns {Object} User preferences object with default values if not found
     */
    const loadUserPreferences = () => {
        if (!isStorageAvailable()) {
            return {
                theme: 'light',
                sortBy: 'date'
            };
        }

        try {
            const stored = localStorage.getItem(PREFERENCES_KEY);

            // If nothing stored, return defaults
            if (stored === null) {
                return {
                    theme: 'light',
                    sortBy: 'date'
                };
            }

            // Try to parse the JSON
            const preferences = JSON.parse(stored);

            // Validate the preferences object
            if (
                typeof preferences !== 'object' ||
                preferences === null ||
                typeof preferences.theme !== 'string' ||
                typeof preferences.sortBy !== 'string'
            ) {
                displayError('Stored preferences are corrupted. Using default preferences.');
                return {
                    theme: 'light',
                    sortBy: 'date'
                };
            }

            // Validate theme and sortBy values
            const validThemes = ['light', 'dark'];
            const validSortOptions = ['date', 'amount', 'category'];

            if (!validThemes.includes(preferences.theme)) {
                preferences.theme = 'light';
            }

            if (!validSortOptions.includes(preferences.sortBy)) {
                preferences.sortBy = 'date';
            }

            return preferences;
        } catch (e) {
            if (e instanceof SyntaxError) {
                displayError('Stored preferences are corrupted. Using default preferences.');
            } else {
                displayError('Failed to load preferences. Using default preferences.');
            }
            return {
                theme: 'light',
                sortBy: 'date'
            };
        }
    };

    return {
        isStorageAvailable,
        saveTransactions,
        loadTransactions,
        saveUserPreferences,
        loadUserPreferences,
        displayError,
        displayWarning
    };
})();

// ============================================================================
// TRANSACTION VALIDATION MODULE
// ============================================================================

const ValidationModule = (() => {
    const validateItemName = (itemName) => {
        const trimmed = itemName.trim();
        if (trimmed.length === 0) {
            return { valid: false, error: 'Item name cannot be empty' };
        }
        if (itemName.length > 100) {
            return { valid: false, error: 'Item name must be 100 characters or less' };
        }
        return { valid: true };
    };

    const validateAmount = (amount) => {
        const num = parseFloat(amount);
        if (isNaN(num)) {
            return { valid: false, error: 'Amount must be a valid number' };
        }
        if (num <= 0) {
            return { valid: false, error: 'Amount must be greater than 0' };
        }
        if (num > 999999.99) {
            return { valid: false, error: 'Amount cannot exceed 999,999.99' };
        }
        return { valid: true };
    };

    const validateCategory = (category) => {
        const validCategories = ['Food', 'Transport', 'Fun'];
        if (!category || !validCategories.includes(category)) {
            return { valid: false, error: 'Please select a valid category' };
        }
        return { valid: true };
    };

    const validateTransaction = (itemName, amount, category) => {
        const errors = [];

        const itemNameValidation = validateItemName(itemName);
        if (!itemNameValidation.valid) {
            errors.push(itemNameValidation.error);
        }

        const amountValidation = validateAmount(amount);
        if (!amountValidation.valid) {
            errors.push(amountValidation.error);
        }

        const categoryValidation = validateCategory(category);
        if (!categoryValidation.valid) {
            errors.push(categoryValidation.error);
        }

        return {
            valid: errors.length === 0,
            errors
        };
    };

    return {
        validateTransaction,
        validateItemName,
        validateAmount,
        validateCategory
    };
})();

// ============================================================================
// TRANSACTION MANAGEMENT MODULE
// ============================================================================

const TransactionModule = (() => {
    let transactions = [];

    const generateId = () => {
        return Date.now().toString();
    };

    const addTransaction = (itemName, amount, category) => {
        const validation = ValidationModule.validateTransaction(itemName, amount, category);
        if (!validation.valid) {
            return { success: false, errors: validation.errors };
        }

        const transaction = {
            id: generateId(),
            itemName: itemName.trim(),
            amount: parseFloat(amount).toFixed(2),
            category,
            timestamp: Date.now()
        };

        transactions.push(transaction);
        StorageModule.saveTransactions(transactions);
        return { success: true, transaction };
    };

    const deleteTransaction = (id) => {
        const index = transactions.findIndex(t => t.id === id);
        if (index === -1) {
            return { success: false, error: 'Transaction not found' };
        }

        transactions.splice(index, 1);
        StorageModule.saveTransactions(transactions);
        return { success: true };
    };

    const getTransactions = () => {
        return [...transactions];
    };

    const setTransactions = (newTransactions) => {
        transactions = newTransactions;
    };

    const loadTransactions = () => {
        transactions = StorageModule.loadTransactions();
    };

    return {
        addTransaction,
        deleteTransaction,
        getTransactions,
        setTransactions,
        loadTransactions
    };
})();

// ============================================================================
// CALCULATION MODULE
// ============================================================================

const CalculationModule = (() => {
    const roundHalfUp = (num, decimals = 2) => {
        const factor = Math.pow(10, decimals);
        return Math.round(num * factor) / factor;
    };

    const calculateTotalBalance = (transactions) => {
        const total = transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
        return roundHalfUp(total, 2);
    };

    const calculateCategoryTotals = (transactions) => {
        const totals = {
            Food: 0,
            Transport: 0,
            Fun: 0
        };

        transactions.forEach(t => {
            if (totals.hasOwnProperty(t.category)) {
                totals[t.category] += parseFloat(t.amount);
            }
        });

        Object.keys(totals).forEach(key => {
            totals[key] = roundHalfUp(totals[key], 2);
        });

        return totals;
    };

    const calculateCategoryPercentages = (transactions) => {
        const totals = calculateCategoryTotals(transactions);
        const total = calculateTotalBalance(transactions);

        const percentages = {
            Food: 0,
            Transport: 0,
            Fun: 0
        };

        if (total > 0) {
            Object.keys(percentages).forEach(key => {
                percentages[key] = roundHalfUp((totals[key] / total) * 100, 1);
            });
        }

        return percentages;
    };

    const calculateMonthlyTotals = (transactions, year, month) => {
        const filtered = FilterModule.filterByMonth(transactions, year, month);
        const total = calculateTotalBalance(filtered);
        const byCategory = calculateCategoryTotals(filtered);

        return {
            total,
            byCategory
        };
    };

    return {
        calculateTotalBalance,
        calculateCategoryTotals,
        calculateCategoryPercentages,
        calculateMonthlyTotals,
        roundHalfUp
    };
})();

// ============================================================================
// SORTING AND FILTERING MODULE
// ============================================================================

const FilterModule = (() => {
    /**
     * Sorts transactions based on the specified sort criteria
     * @param {Array} transactions - Array of transaction objects
     * @param {string} sortBy - Sort criteria: 'date', 'amount', or 'category'
     * @returns {Array} Sorted array of transactions
     */
    const sortTransactions = (transactions, sortBy = 'date') => {
        const sorted = [...transactions];

        switch (sortBy) {
            case 'date':
                // Reverse chronological order (newest first)
                sorted.sort((a, b) => b.timestamp - a.timestamp);
                break;

            case 'amount':
                // Highest to lowest amount
                sorted.sort((a, b) => {
                    const amountA = parseFloat(a.amount);
                    const amountB = parseFloat(b.amount);
                    return amountB - amountA;
                });
                break;

            case 'category':
                // Alphabetical by category, then by date (newest first) within each category
                sorted.sort((a, b) => {
                    const categoryCompare = a.category.localeCompare(b.category);
                    if (categoryCompare !== 0) {
                        return categoryCompare;
                    }
                    // Secondary sort by date (newest first)
                    return b.timestamp - a.timestamp;
                });
                break;

            default:
                // Default to date sort
                sorted.sort((a, b) => b.timestamp - a.timestamp);
        }

        return sorted;
    };

    /**
     * Filters transactions for a specific month
     * @param {Array} transactions - Array of transaction objects
     * @param {number} year - Year (e.g., 2024)
     * @param {number} month - Month (1-12)
     * @returns {Array} Filtered array of transactions for the specified month
     */
    const filterByMonth = (transactions, year, month) => {
        return transactions.filter(transaction => {
            const date = new Date(transaction.timestamp);
            return date.getFullYear() === year && date.getMonth() + 1 === month;
        });
    };

    return {
        sortTransactions,
        filterByMonth
    };
})();

// ============================================================================
// FORMATTING MODULE
// ============================================================================

const FormattingModule = (() => {
    const formatAmount = (amount) => {
        const num = parseFloat(amount);
        return num.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    const formatBalance = (balance) => {
        const num = parseFloat(balance);
        if (num > 999999999.99) {
            return '999,999,999.99';
        }
        return num.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    return {
        formatAmount,
        formatBalance
    };
})();

// ============================================================================
// UI RENDERING MODULE
// ============================================================================

const UIModule = (() => {
    let currentChart = null;

    const renderTransactionList = (transactions) => {
        const listContainer = document.getElementById('transactionList');
        
        if (transactions.length === 0) {
            listContainer.innerHTML = '<p class="empty-state">No transactions yet. Add your first expense!</p>';
            return;
        }

        // Limit to 1000 transactions
        const displayTransactions = transactions.slice(0, 1000);

        listContainer.innerHTML = displayTransactions.map(transaction => `
            <div class="transaction-item">
                <div class="transaction-info">
                    <span class="category-badge ${transaction.category}">${transaction.category}</span>
                    <div class="transaction-details">
                        <div class="transaction-name">${escapeHtml(transaction.itemName)}</div>
                    </div>
                </div>
                <div class="transaction-amount">$${FormattingModule.formatAmount(transaction.amount)}</div>
                <button class="delete-btn" data-id="${transaction.id}">Delete</button>
            </div>
        `).join('');

        // Add event listeners to delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                handleDeleteTransaction(id);
            });
        });
    };

    const renderBalance = (balance) => {
        const balanceDisplay = document.getElementById('totalBalance');
        balanceDisplay.textContent = `$${FormattingModule.formatBalance(balance)}`;
    };

    const renderChart = (categoryTotals) => {
        const chartContainer = document.getElementById('chartContainer');
        const canvas = document.getElementById('spendingChart');

        const total = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);

        if (total === 0) {
            chartContainer.innerHTML = '<p class="empty-state">Add transactions to see spending breakdown</p>';
            if (currentChart) {
                currentChart.destroy();
                currentChart = null;
            }
            return;
        }

        const percentages = CalculationModule.calculateCategoryPercentages(TransactionModule.getTransactions());

        const chartData = {
            labels: ['Food', 'Transport', 'Fun'],
            datasets: [{
                data: [categoryTotals.Food, categoryTotals.Transport, categoryTotals.Fun],
                backgroundColor: ['#e74c3c', '#3498db', '#9b59b6'],
                borderColor: ['#c0392b', '#2980b9', '#8e44ad'],
                borderWidth: 2
            }]
        };

        if (currentChart) {
            currentChart.destroy();
        }

        currentChart = new Chart(canvas, {
            type: 'pie',
            data: chartData,
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
                    }
                }
            }
        });
    };

    const renderMonthlyView = (monthlyData) => {
        const summaryContainer = document.getElementById('monthlySummary');

        if (monthlyData.total === 0) {
            summaryContainer.innerHTML = '<p class="empty-state">No expenses this month</p>';
            return;
        }

        const html = `
            <div class="monthly-summary-item">
                <span class="monthly-summary-label">Total Spending</span>
                <span class="monthly-summary-amount">$${FormattingModule.formatBalance(monthlyData.total)}</span>
            </div>
            <div class="monthly-summary-item">
                <span class="monthly-summary-label">Food</span>
                <span class="monthly-summary-amount">$${FormattingModule.formatAmount(monthlyData.byCategory.Food)}</span>
            </div>
            <div class="monthly-summary-item">
                <span class="monthly-summary-label">Transport</span>
                <span class="monthly-summary-amount">$${FormattingModule.formatAmount(monthlyData.byCategory.Transport)}</span>
            </div>
            <div class="monthly-summary-item">
                <span class="monthly-summary-label">Fun</span>
                <span class="monthly-summary-amount">$${FormattingModule.formatAmount(monthlyData.byCategory.Fun)}</span>
            </div>
        `;

        summaryContainer.innerHTML = html;
    };

    const renderEmptyState = () => {
        const listContainer = document.getElementById('transactionList');
        listContainer.innerHTML = '<p class="empty-state">No transactions yet. Add your first expense!</p>';
    };

    const clearForm = () => {
        document.getElementById('transactionForm').reset();
        document.getElementById('formErrors').innerHTML = '';
        document.getElementById('formErrors').classList.remove('show');
    };

    const showFormErrors = (errors) => {
        const errorContainer = document.getElementById('formErrors');
        if (errors.length > 0) {
            errorContainer.innerHTML = '<ul>' + errors.map(e => `<li>${e}</li>`).join('') + '</ul>';
            errorContainer.classList.add('show');
        } else {
            errorContainer.innerHTML = '';
            errorContainer.classList.remove('show');
        }
    };

    const escapeHtml = (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };

    return {
        renderTransactionList,
        renderBalance,
        renderChart,
        renderMonthlyView,
        renderEmptyState,
        clearForm,
        showFormErrors,
        escapeHtml
    };
})();

// ============================================================================
// THEME MODULE
// ============================================================================

const ThemeModule = (() => {
    const applyTheme = (theme) => {
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
            document.getElementById('themeToggle').textContent = '☀️';
        } else {
            document.body.classList.remove('dark-theme');
            document.getElementById('themeToggle').textContent = '🌙';
        }
    };

    const toggleTheme = () => {
        const isDark = document.body.classList.contains('dark-theme');
        const newTheme = isDark ? 'light' : 'dark';
        applyTheme(newTheme);

        const preferences = StorageModule.loadUserPreferences();
        preferences.theme = newTheme;
        StorageModule.saveUserPreferences(preferences);
    };

    return {
        applyTheme,
        toggleTheme
    };
})();

// ============================================================================
// SORT PREFERENCE MODULE
// ============================================================================

const SortModule = (() => {
    const setSortPreference = (sortBy) => {
        const preferences = StorageModule.loadUserPreferences();
        preferences.sortBy = sortBy;
        StorageModule.saveUserPreferences(preferences);
    };

    const getSortPreference = () => {
        const preferences = StorageModule.loadUserPreferences();
        return preferences.sortBy || 'date';
    };

    const updateSortButtons = (sortBy) => {
        document.querySelectorAll('.sort-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-sort') === sortBy) {
                btn.classList.add('active');
            }
        });
    };

    return {
        setSortPreference,
        getSortPreference,
        updateSortButtons
    };
})();

// ============================================================================
// EVENT HANDLERS
// ============================================================================

const handleAddTransaction = (e) => {
    e.preventDefault();

    const itemName = document.getElementById('itemName').value;
    const amount = document.getElementById('amount').value;
    const category = document.getElementById('category').value;

    const result = TransactionModule.addTransaction(itemName, amount, category);

    if (!result.success) {
        UIModule.showFormErrors(result.errors);
        return;
    }

    UIModule.showFormErrors([]);
    UIModule.clearForm();
    updateUI();
};

const handleDeleteTransaction = (id) => {
    const result = TransactionModule.deleteTransaction(id);
    if (result.success) {
        updateUI();
    } else {
        alert('Failed to delete transaction');
    }
};

const handleSortChange = (e) => {
    const sortBy = e.target.getAttribute('data-sort');
    SortModule.setSortPreference(sortBy);
    SortModule.updateSortButtons(sortBy);
    updateUI();
};

const handleThemeToggle = () => {
    ThemeModule.toggleTheme();
};

const handleMonthlyView = () => {
    document.getElementById('mainView').style.display = 'none';
    document.getElementById('monthlyView').style.display = 'block';

    const now = new Date();
    const monthlyData = CalculationModule.calculateMonthlyTotals(
        TransactionModule.getTransactions(),
        now.getFullYear(),
        now.getMonth() + 1
    );

    UIModule.renderMonthlyView(monthlyData);
};

const handleBackToMain = () => {
    document.getElementById('mainView').style.display = 'block';
    document.getElementById('monthlyView').style.display = 'none';
};

// ============================================================================
// UI UPDATE FUNCTION
// ============================================================================

const updateUI = () => {
    const transactions = TransactionModule.getTransactions();
    const sortBy = SortModule.getSortPreference();
    const sortedTransactions = FilterModule.sortTransactions(transactions, sortBy);

    UIModule.renderTransactionList(sortedTransactions);

    const balance = CalculationModule.calculateTotalBalance(transactions);
    UIModule.renderBalance(balance);

    const categoryTotals = CalculationModule.calculateCategoryTotals(transactions);
    UIModule.renderChart(categoryTotals);
};

// ============================================================================
// INITIALIZATION
// ============================================================================

const initializeApp = () => {
    // Load data from storage
    TransactionModule.loadTransactions();
    const preferences = StorageModule.loadUserPreferences();

    // Apply theme
    ThemeModule.applyTheme(preferences.theme);

    // Apply sort preference
    SortModule.updateSortButtons(preferences.sortBy);

    // Render initial UI
    updateUI();

    // Set up event listeners
    document.getElementById('transactionForm').addEventListener('submit', handleAddTransaction);
    document.getElementById('themeToggle').addEventListener('click', handleThemeToggle);
    document.getElementById('monthlyButton').addEventListener('click', handleMonthlyView);
    document.getElementById('backButton').addEventListener('click', handleBackToMain);

    // Sort button listeners
    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.addEventListener('click', handleSortChange);
    });

    // Check if localStorage is available
    if (!StorageModule.isStorageAvailable()) {
        console.warn('localStorage is not available. Data will not persist.');
    }
};

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
