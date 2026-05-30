/**
 * Test Suite for Storage Module (localStorage operations)
 * Tests for Requirements 9.1-9.11
 */

// Mock localStorage for testing
class LocalStorageMock {
    constructor() {
        this.store = {};
    }

    getItem(key) {
        return this.store[key] || null;
    }

    setItem(key, value) {
        this.store[key] = String(value);
    }

    removeItem(key) {
        delete this.store[key];
    }

    clear() {
        this.store = {};
    }
}

// Replace global localStorage with mock
global.localStorage = new LocalStorageMock();

// Mock DOM elements for error/warning display
global.document = {
    getElementById: (id) => ({
        textContent: '',
        style: { display: 'none' },
        className: ''
    }),
    createElement: (tag) => ({
        id: '',
        className: '',
        textContent: '',
        style: { display: 'none' },
        insertBefore: () => {}
    }),
    body: {
        insertBefore: () => {},
        firstChild: null
    }
};

// ============================================================================
// UNIT TESTS - Storage Module
// ============================================================================

describe('StorageModule - saveTransactions', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    test('should save transactions to localStorage under "transactions" key', () => {
        const transactions = [
            { id: '1', itemName: 'Coffee', amount: 5.50, category: 'Food', timestamp: 1000 }
        ];
        
        const result = StorageModule.saveTransactions(transactions);
        
        expect(result).toBe(true);
        expect(localStorage.getItem('transactions')).toBe(JSON.stringify(transactions));
    });

    test('should return false when localStorage is unavailable', () => {
        const originalSetItem = localStorage.setItem;
        localStorage.setItem = () => { throw new Error('QuotaExceededError'); };
        
        const transactions = [{ id: '1', itemName: 'Coffee', amount: 5.50, category: 'Food', timestamp: 1000 }];
        const result = StorageModule.saveTransactions(transactions);
        
        expect(result).toBe(false);
        localStorage.setItem = originalSetItem;
    });

    test('should serialize transactions to JSON format', () => {
        const transactions = [
            { id: '1', itemName: 'Coffee', amount: 5.50, category: 'Food', timestamp: 1000 },
            { id: '2', itemName: 'Bus', amount: 2.00, category: 'Transport', timestamp: 2000 }
        ];
        
        StorageModule.saveTransactions(transactions);
        const stored = localStorage.getItem('transactions');
        
        expect(stored).toBe(JSON.stringify(transactions));
        expect(JSON.parse(stored)).toEqual(transactions);
    });

    test('should handle empty transaction array', () => {
        const transactions = [];
        
        const result = StorageModule.saveTransactions(transactions);
        
        expect(result).toBe(true);
        expect(localStorage.getItem('transactions')).toBe(JSON.stringify([]));
    });

    test('should handle large transaction amounts', () => {
        const transactions = [
            { id: '1', itemName: 'Expensive Item', amount: 999999.99, category: 'Fun', timestamp: 1000 }
        ];
        
        const result = StorageModule.saveTransactions(transactions);
        
        expect(result).toBe(true);
        expect(JSON.parse(localStorage.getItem('transactions'))[0].amount).toBe(999999.99);
    });
});

describe('StorageModule - loadTransactions', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    test('should load transactions from localStorage', () => {
        const transactions = [
            { id: '1', itemName: 'Coffee', amount: 5.50, category: 'Food', timestamp: 1000 }
        ];
        localStorage.setItem('transactions', JSON.stringify(transactions));
        
        const loaded = StorageModule.loadTransactions();
        
        expect(loaded).toEqual(transactions);
    });

    test('should return empty array when no transactions stored', () => {
        const loaded = StorageModule.loadTransactions();
        
        expect(loaded).toEqual([]);
    });

    test('should detect corrupted data (non-array)', () => {
        localStorage.setItem('transactions', JSON.stringify({ invalid: 'data' }));
        
        const loaded = StorageModule.loadTransactions();
        
        expect(loaded).toEqual([]);
    });

    test('should detect corrupted transaction (missing required fields)', () => {
        const corrupted = [
            { id: '1', itemName: 'Coffee' } // missing amount, category, timestamp
        ];
        localStorage.setItem('transactions', JSON.stringify(corrupted));
        
        const loaded = StorageModule.loadTransactions();
        
        expect(loaded).toEqual([]);
    });

    test('should detect corrupted transaction (invalid field types)', () => {
        const corrupted = [
            { id: 123, itemName: 'Coffee', amount: '5.50', category: 'Food', timestamp: 1000 } // id should be string, amount should be number
        ];
        localStorage.setItem('transactions', JSON.stringify(corrupted));
        
        const loaded = StorageModule.loadTransactions();
        
        expect(loaded).toEqual([]);
    });

    test('should detect invalid JSON', () => {
        localStorage.setItem('transactions', 'invalid json {]');
        
        const loaded = StorageModule.loadTransactions();
        
        expect(loaded).toEqual([]);
    });

    test('should load multiple transactions', () => {
        const transactions = [
            { id: '1', itemName: 'Coffee', amount: 5.50, category: 'Food', timestamp: 1000 },
            { id: '2', itemName: 'Bus', amount: 2.00, category: 'Transport', timestamp: 2000 },
            { id: '3', itemName: 'Movie', amount: 15.00, category: 'Fun', timestamp: 3000 }
        ];
        localStorage.setItem('transactions', JSON.stringify(transactions));
        
        const loaded = StorageModule.loadTransactions();
        
        expect(loaded).toEqual(transactions);
        expect(loaded.length).toBe(3);
    });

    test('should preserve transaction data types', () => {
        const transactions = [
            { id: '1', itemName: 'Coffee', amount: 5.50, category: 'Food', timestamp: 1704067200000 }
        ];
        localStorage.setItem('transactions', JSON.stringify(transactions));
        
        const loaded = StorageModule.loadTransactions();
        
        expect(typeof loaded[0].id).toBe('string');
        expect(typeof loaded[0].itemName).toBe('string');
        expect(typeof loaded[0].amount).toBe('number');
        expect(typeof loaded[0].category).toBe('string');
        expect(typeof loaded[0].timestamp).toBe('number');
    });
});

describe('StorageModule - saveUserPreferences', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    test('should save user preferences to localStorage under "userPreferences" key', () => {
        const preferences = { theme: 'dark', sortBy: 'amount' };
        
        const result = StorageModule.saveUserPreferences(preferences);
        
        expect(result).toBe(true);
        expect(localStorage.getItem('userPreferences')).toBe(JSON.stringify(preferences));
    });

    test('should serialize preferences to JSON format', () => {
        const preferences = { theme: 'light', sortBy: 'date' };
        
        StorageModule.saveUserPreferences(preferences);
        const stored = localStorage.getItem('userPreferences');
        
        expect(stored).toBe(JSON.stringify(preferences));
        expect(JSON.parse(stored)).toEqual(preferences);
    });

    test('should return false when localStorage is unavailable', () => {
        const originalSetItem = localStorage.setItem;
        localStorage.setItem = () => { throw new Error('QuotaExceededError'); };
        
        const preferences = { theme: 'dark', sortBy: 'amount' };
        const result = StorageModule.saveUserPreferences(preferences);
        
        expect(result).toBe(false);
        localStorage.setItem = originalSetItem;
    });

    test('should handle all valid theme values', () => {
        const themes = ['light', 'dark'];
        
        themes.forEach(theme => {
            localStorage.clear();
            const preferences = { theme, sortBy: 'date' };
            const result = StorageModule.saveUserPreferences(preferences);
            
            expect(result).toBe(true);
            expect(JSON.parse(localStorage.getItem('userPreferences')).theme).toBe(theme);
        });
    });

    test('should handle all valid sort options', () => {
        const sortOptions = ['date', 'amount', 'category'];
        
        sortOptions.forEach(sortBy => {
            localStorage.clear();
            const preferences = { theme: 'light', sortBy };
            const result = StorageModule.saveUserPreferences(preferences);
            
            expect(result).toBe(true);
            expect(JSON.parse(localStorage.getItem('userPreferences')).sortBy).toBe(sortBy);
        });
    });
});

describe('StorageModule - loadUserPreferences', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    test('should load user preferences from localStorage', () => {
        const preferences = { theme: 'dark', sortBy: 'amount' };
        localStorage.setItem('userPreferences', JSON.stringify(preferences));
        
        const loaded = StorageModule.loadUserPreferences();
        
        expect(loaded).toEqual(preferences);
    });

    test('should return default preferences when none stored', () => {
        const loaded = StorageModule.loadUserPreferences();
        
        expect(loaded).toEqual({ theme: 'light', sortBy: 'date' });
    });

    test('should detect corrupted preferences (non-object)', () => {
        localStorage.setItem('userPreferences', JSON.stringify(['invalid', 'array']));
        
        const loaded = StorageModule.loadUserPreferences();
        
        expect(loaded).toEqual({ theme: 'light', sortBy: 'date' });
    });

    test('should detect corrupted preferences (missing fields)', () => {
        localStorage.setItem('userPreferences', JSON.stringify({ theme: 'dark' })); // missing sortBy
        
        const loaded = StorageModule.loadUserPreferences();
        
        expect(loaded).toEqual({ theme: 'light', sortBy: 'date' });
    });

    test('should detect corrupted preferences (invalid field types)', () => {
        localStorage.setItem('userPreferences', JSON.stringify({ theme: 123, sortBy: true }));
        
        const loaded = StorageModule.loadUserPreferences();
        
        expect(loaded).toEqual({ theme: 'light', sortBy: 'date' });
    });

    test('should detect invalid JSON', () => {
        localStorage.setItem('userPreferences', 'invalid json {]');
        
        const loaded = StorageModule.loadUserPreferences();
        
        expect(loaded).toEqual({ theme: 'light', sortBy: 'date' });
    });

    test('should correct invalid theme value', () => {
        localStorage.setItem('userPreferences', JSON.stringify({ theme: 'invalid', sortBy: 'date' }));
        
        const loaded = StorageModule.loadUserPreferences();
        
        expect(loaded.theme).toBe('light');
        expect(loaded.sortBy).toBe('date');
    });

    test('should correct invalid sortBy value', () => {
        localStorage.setItem('userPreferences', JSON.stringify({ theme: 'light', sortBy: 'invalid' }));
        
        const loaded = StorageModule.loadUserPreferences();
        
        expect(loaded.theme).toBe('light');
        expect(loaded.sortBy).toBe('date');
    });

    test('should preserve valid preferences', () => {
        const preferences = { theme: 'dark', sortBy: 'category' };
        localStorage.setItem('userPreferences', JSON.stringify(preferences));
        
        const loaded = StorageModule.loadUserPreferences();
        
        expect(loaded).toEqual(preferences);
    });
});

describe('StorageModule - isStorageAvailable', () => {
    test('should return true when localStorage is available', () => {
        const result = StorageModule.isStorageAvailable();
        
        expect(result).toBe(true);
    });

    test('should return false when localStorage is unavailable', () => {
        const originalSetItem = localStorage.setItem;
        localStorage.setItem = () => { throw new Error('Storage unavailable'); };
        
        const result = StorageModule.isStorageAvailable();
        
        expect(result).toBe(false);
        localStorage.setItem = originalSetItem;
    });
});

// ============================================================================
// PROPERTY-BASED TESTS - Storage Module
// ============================================================================

describe('StorageModule - Property: Transaction Persistence Round-Trip', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    test('should preserve all transaction fields through save/load cycle', () => {
        // Property: For any set of transactions, saving them to localStorage and then loading them 
        // SHALL return an equivalent set of transactions with all fields preserved.
        // Validates: Requirements 1.4, 9.1, 9.3, 9.5

        const testCases = [
            [{ id: '1', itemName: 'Coffee', amount: 5.50, category: 'Food', timestamp: 1000 }],
            [
                { id: '1', itemName: 'Coffee', amount: 5.50, category: 'Food', timestamp: 1000 },
                { id: '2', itemName: 'Bus', amount: 2.00, category: 'Transport', timestamp: 2000 }
            ],
            [
                { id: '1', itemName: 'Item with spaces', amount: 123.45, category: 'Fun', timestamp: 1704067200000 },
                { id: '2', itemName: 'Special chars: @#$%', amount: 999999.99, category: 'Food', timestamp: 1704067300000 }
            ]
        ];

        testCases.forEach(transactions => {
            localStorage.clear();
            
            // Save
            const saveResult = StorageModule.saveTransactions(transactions);
            expect(saveResult).toBe(true);
            
            // Load
            const loaded = StorageModule.loadTransactions();
            
            // Verify
            expect(loaded).toEqual(transactions);
            expect(loaded.length).toBe(transactions.length);
            
            loaded.forEach((transaction, index) => {
                expect(transaction.id).toBe(transactions[index].id);
                expect(transaction.itemName).toBe(transactions[index].itemName);
                expect(transaction.amount).toBe(transactions[index].amount);
                expect(transaction.category).toBe(transactions[index].category);
                expect(transaction.timestamp).toBe(transactions[index].timestamp);
            });
        });
    });
});

describe('StorageModule - Property: User Preferences Serialization', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    test('should preserve preferences through save/load cycle', () => {
        // Property: For any user preferences object, serializing it to JSON and deserializing it 
        // SHALL produce an equivalent preferences object.
        // Validates: Requirements 9.2, 9.11

        const testCases = [
            { theme: 'light', sortBy: 'date' },
            { theme: 'dark', sortBy: 'amount' },
            { theme: 'light', sortBy: 'category' },
            { theme: 'dark', sortBy: 'date' }
        ];

        testCases.forEach(preferences => {
            localStorage.clear();
            
            // Save
            const saveResult = StorageModule.saveUserPreferences(preferences);
            expect(saveResult).toBe(true);
            
            // Load
            const loaded = StorageModule.loadUserPreferences();
            
            // Verify
            expect(loaded).toEqual(preferences);
            expect(loaded.theme).toBe(preferences.theme);
            expect(loaded.sortBy).toBe(preferences.sortBy);
        });
    });
});

describe('StorageModule - Property: Corruption Detection', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    test('should detect and handle corrupted transaction data', () => {
        // Property: For any corrupted transaction data, loading it SHALL return an empty array
        // and the application SHALL continue operating.
        // Validates: Requirements 9.9

        const corruptedCases = [
            'not json at all',
            '{"invalid": "structure"}',
            '[{"id": "1"}]', // missing required fields
            '[{"id": 123, "itemName": "test", "amount": "5.50", "category": "Food", "timestamp": 1000}]', // wrong types
            'null',
            'undefined'
        ];

        corruptedCases.forEach(corrupted => {
            localStorage.clear();
            localStorage.setItem('transactions', corrupted);
            
            const loaded = StorageModule.loadTransactions();
            
            expect(Array.isArray(loaded)).toBe(true);
            expect(loaded.length).toBe(0);
        });
    });

    test('should detect and handle corrupted preferences data', () => {
        // Property: For any corrupted preferences data, loading it SHALL return default preferences
        // and the application SHALL continue operating.
        // Validates: Requirements 9.9

        const corruptedCases = [
            'not json at all',
            '["invalid", "array"]',
            '{"theme": "light"}', // missing sortBy
            '{"theme": 123, "sortBy": true}', // wrong types
            'null',
            'undefined'
        ];

        corruptedCases.forEach(corrupted => {
            localStorage.clear();
            localStorage.setItem('userPreferences', corrupted);
            
            const loaded = StorageModule.loadUserPreferences();
            
            expect(loaded).toEqual({ theme: 'light', sortBy: 'date' });
        });
    });
});

// ============================================================================
// UNIT TESTS - UI Module (renderBalance)
// ============================================================================

describe('UIModule - renderBalance', () => {
    let mockBalanceDisplay;

    beforeEach(() => {
        // Create mock DOM element
        mockBalanceDisplay = {
            textContent: '',
            id: 'totalBalance'
        };
        
        // Mock document.getElementById
        global.document.getElementById = (id) => {
            if (id === 'totalBalance') {
                return mockBalanceDisplay;
            }
            return { textContent: '', style: { display: 'none' }, className: '' };
        };
    });

    test('should display formatted balance with dollar sign', () => {
        UIModule.renderBalance(100.00);
        
        expect(mockBalanceDisplay.textContent).toBe('$100.00');
    });

    test('should display balance with 2 decimal places', () => {
        UIModule.renderBalance(50.5);
        
        expect(mockBalanceDisplay.textContent).toBe('$50.50');
    });

    test('should display zero balance as $0.00', () => {
        UIModule.renderBalance(0.00);
        
        expect(mockBalanceDisplay.textContent).toBe('$0.00');
    });

    test('should display balance with thousands separator', () => {
        UIModule.renderBalance(1234.56);
        
        expect(mockBalanceDisplay.textContent).toBe('$1,234.56');
    });

    test('should display large balance with thousands separators', () => {
        UIModule.renderBalance(999999.99);
        
        expect(mockBalanceDisplay.textContent).toBe('$999,999.99');
    });

    test('should display very large balance up to 999,999,999.99', () => {
        UIModule.renderBalance(999999999.99);
        
        expect(mockBalanceDisplay.textContent).toBe('$999,999,999.99');
    });

    test('should handle small decimal amounts', () => {
        UIModule.renderBalance(0.01);
        
        expect(mockBalanceDisplay.textContent).toBe('$0.01');
    });

    test('should handle balance with single decimal place', () => {
        UIModule.renderBalance(10.5);
        
        expect(mockBalanceDisplay.textContent).toBe('$10.50');
    });

    test('should update existing balance display', () => {
        UIModule.renderBalance(100.00);
        expect(mockBalanceDisplay.textContent).toBe('$100.00');
        
        UIModule.renderBalance(200.00);
        expect(mockBalanceDisplay.textContent).toBe('$200.00');
    });

    test('should handle balance of 1000.00', () => {
        UIModule.renderBalance(1000.00);
        
        expect(mockBalanceDisplay.textContent).toBe('$1,000.00');
    });

    test('should handle balance of 10000.00', () => {
        UIModule.renderBalance(10000.00);
        
        expect(mockBalanceDisplay.textContent).toBe('$10,000.00');
    });

    test('should handle balance of 100000.00', () => {
        UIModule.renderBalance(100000.00);
        
        expect(mockBalanceDisplay.textContent).toBe('$100,000.00');
    });

    test('should handle balance of 1000000.00', () => {
        UIModule.renderBalance(1000000.00);
        
        expect(mockBalanceDisplay.textContent).toBe('$1,000,000.00');
    });
});

// ============================================================================
// PROPERTY-BASED TESTS - UI Module (renderBalance)
// ============================================================================

describe('UIModule - Property: Balance Display Formatting', () => {
    let mockBalanceDisplay;

    beforeEach(() => {
        mockBalanceDisplay = {
            textContent: '',
            id: 'totalBalance'
        };
        
        global.document.getElementById = (id) => {
            if (id === 'totalBalance') {
                return mockBalanceDisplay;
            }
            return { textContent: '', style: { display: 'none' }, className: '' };
        };
    });

    test('should always display balance with exactly 2 decimal places', () => {
        // Property: For any calculated balance, displaying it SHALL show exactly two decimal places 
        // with thousands separator, up to a maximum of 999,999,999.99.
        // Validates: Requirements 4.2, 13.1

        const testBalances = [
            0.00, 0.01, 0.10, 1.00, 5.50, 10.00, 50.99, 100.00, 
            1000.00, 10000.00, 100000.00, 1000000.00, 999999.99, 999999999.99
        ];

        testBalances.forEach(balance => {
            UIModule.renderBalance(balance);
            
            // Extract the numeric part from the display
            const displayText = mockBalanceDisplay.textContent;
            expect(displayText.startsWith('$')).toBe(true);
            
            // Check that it has exactly 2 decimal places
            const decimalPart = displayText.split('.')[1];
            expect(decimalPart.length).toBe(2);
        });
    });

    test('should always include dollar sign prefix', () => {
        // Property: For any balance, the display SHALL include a dollar sign prefix.
        // Validates: Requirements 4.2, 13.1

        const testBalances = [0.00, 5.50, 100.00, 1000.00, 999999.99];

        testBalances.forEach(balance => {
            UIModule.renderBalance(balance);
            
            expect(mockBalanceDisplay.textContent.startsWith('$')).toBe(true);
        });
    });

    test('should apply thousands separator for amounts >= 1000', () => {
        // Property: For any balance >= 1000, the display SHALL include thousands separators.
        // Validates: Requirements 4.2, 13.1

        const testBalances = [
            { balance: 999.99, shouldHaveComma: false },
            { balance: 1000.00, shouldHaveComma: true },
            { balance: 10000.00, shouldHaveComma: true },
            { balance: 100000.00, shouldHaveComma: true },
            { balance: 1000000.00, shouldHaveComma: true },
            { balance: 999999999.99, shouldHaveComma: true }
        ];

        testBalances.forEach(({ balance, shouldHaveComma }) => {
            UIModule.renderBalance(balance);
            
            const hasComma = mockBalanceDisplay.textContent.includes(',');
            expect(hasComma).toBe(shouldHaveComma);
        });
    });

    test('should update DOM element with formatted balance', () => {
        // Property: For any balance, calling renderBalance SHALL update the DOM element's textContent.
        // Validates: Requirements 4.2, 13.1

        const testBalances = [0.00, 5.50, 100.00, 1000.00];

        testBalances.forEach(balance => {
            mockBalanceDisplay.textContent = '';
            UIModule.renderBalance(balance);
            
            expect(mockBalanceDisplay.textContent.length > 0).toBe(true);
            expect(mockBalanceDisplay.textContent).toContain('$');
        });
    });
});

// ============================================================================
// UNIT TESTS - Sorting Module (Sort Preference Management)
// ============================================================================

describe('SortingModule - setSortPreference', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    test('should set sort preference to "date"', () => {
        const result = SortingModule.setSortPreference('date');
        
        expect(result).toBe(true);
        expect(localStorage.getItem('userPreferences')).toBe(JSON.stringify({ theme: 'light', sortBy: 'date' }));
    });

    test('should set sort preference to "amount"', () => {
        const result = SortingModule.setSortPreference('amount');
        
        expect(result).toBe(true);
        expect(localStorage.getItem('userPreferences')).toBe(JSON.stringify({ theme: 'light', sortBy: 'amount' }));
    });

    test('should set sort preference to "category"', () => {
        const result = SortingModule.setSortPreference('category');
        
        expect(result).toBe(true);
        expect(localStorage.getItem('userPreferences')).toBe(JSON.stringify({ theme: 'light', sortBy: 'category' }));
    });

    test('should preserve existing theme preference when setting sort preference', () => {
        localStorage.setItem('userPreferences', JSON.stringify({ theme: 'dark', sortBy: 'date' }));
        
        const result = SortingModule.setSortPreference('amount');
        
        expect(result).toBe(true);
        const saved = JSON.parse(localStorage.getItem('userPreferences'));
        expect(saved.theme).toBe('dark');
        expect(saved.sortBy).toBe('amount');
    });

    test('should default to "date" for invalid sort preference', () => {
        const result = SortingModule.setSortPreference('invalid');
        
        expect(result).toBe(true);
        const saved = JSON.parse(localStorage.getItem('userPreferences'));
        expect(saved.sortBy).toBe('date');
    });

    test('should return false when localStorage is unavailable', () => {
        const originalSetItem = localStorage.setItem;
        localStorage.setItem = () => { throw new Error('QuotaExceededError'); };
        
        const result = SortingModule.setSortPreference('amount');
        
        expect(result).toBe(false);
        localStorage.setItem = originalSetItem;
    });

    test('should handle all valid sort options', () => {
        const sortOptions = ['date', 'amount', 'category'];
        
        sortOptions.forEach(sortBy => {
            localStorage.clear();
            const result = SortingModule.setSortPreference(sortBy);
            
            expect(result).toBe(true);
            const saved = JSON.parse(localStorage.getItem('userPreferences'));
            expect(saved.sortBy).toBe(sortBy);
        });
    });
});

describe('SortingModule - getSortPreference', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    test('should get sort preference "date"', () => {
        localStorage.setItem('userPreferences', JSON.stringify({ theme: 'light', sortBy: 'date' }));
        
        const preference = SortingModule.getSortPreference();
        
        expect(preference).toBe('date');
    });

    test('should get sort preference "amount"', () => {
        localStorage.setItem('userPreferences', JSON.stringify({ theme: 'light', sortBy: 'amount' }));
        
        const preference = SortingModule.getSortPreference();
        
        expect(preference).toBe('amount');
    });

    test('should get sort preference "category"', () => {
        localStorage.setItem('userPreferences', JSON.stringify({ theme: 'light', sortBy: 'category' }));
        
        const preference = SortingModule.getSortPreference();
        
        expect(preference).toBe('category');
    });

    test('should return default "date" when no preference stored', () => {
        const preference = SortingModule.getSortPreference();
        
        expect(preference).toBe('date');
    });

    test('should return default "date" when preferences are corrupted', () => {
        localStorage.setItem('userPreferences', 'invalid json');
        
        const preference = SortingModule.getSortPreference();
        
        expect(preference).toBe('date');
    });

    test('should return default "date" when sortBy field is missing', () => {
        localStorage.setItem('userPreferences', JSON.stringify({ theme: 'dark' }));
        
        const preference = SortingModule.getSortPreference();
        
        expect(preference).toBe('date');
    });
});

// ============================================================================
// PROPERTY-BASED TESTS - Sort Preference Management
// ============================================================================

describe('SortingModule - Property: Sort Preference Persistence', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    test('should persist sort preference through set/get cycle', () => {
        // Property: For any sort preference (date, amount, or category), saving it to localStorage 
        // and then loading it SHALL return the same preference value.
        // Validates: Requirements 7.5, 7.7

        const sortOptions = ['date', 'amount', 'category'];

        sortOptions.forEach(sortBy => {
            localStorage.clear();
            
            // Set preference
            const setResult = SortingModule.setSortPreference(sortBy);
            expect(setResult).toBe(true);
            
            // Get preference
            const retrieved = SortingModule.getSortPreference();
            
            // Verify
            expect(retrieved).toBe(sortBy);
        });
    });

    test('should maintain sort preference across multiple set/get cycles', () => {
        // Property: For any sequence of sort preference changes, each change SHALL be 
        // persisted and retrievable.
        // Validates: Requirements 7.5, 7.7

        const sequence = ['date', 'amount', 'category', 'date', 'amount'];

        sequence.forEach(sortBy => {
            const setResult = SortingModule.setSortPreference(sortBy);
            expect(setResult).toBe(true);
            
            const retrieved = SortingModule.getSortPreference();
            expect(retrieved).toBe(sortBy);
        });
    });

    test('should preserve sort preference when theme changes', () => {
        // Property: Changing theme preference SHALL NOT affect sort preference.
        // Validates: Requirements 7.5, 7.7

        SortingModule.setSortPreference('amount');
        
        // Change theme
        const preferences = StorageModule.loadUserPreferences();
        StorageModule.saveUserPreferences({ ...preferences, theme: 'dark' });
        
        // Verify sort preference is unchanged
        const retrieved = SortingModule.getSortPreference();
        expect(retrieved).toBe('amount');
    });
});

// ============================================================================
// TEST UTILITIES
// ============================================================================

function expect(actual) {
    return {
        toBe(expected) {
            if (actual !== expected) {
                throw new Error(`Expected ${expected}, but got ${actual}`);
            }
        },
        toEqual(expected) {
            if (JSON.stringify(actual) !== JSON.stringify(expected)) {
                throw new Error(`Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`);
            }
        },
        toContain(expected) {
            if (!actual.includes(expected)) {
                throw new Error(`Expected array to contain ${expected}`);
            }
        }
    };
}

function describe(name, fn) {
    console.log(`\n${name}`);
    fn();
}

function test(name, fn) {
    try {
        fn();
        console.log(`  ✓ ${name}`);
    } catch (e) {
        console.error(`  ✗ ${name}`);
        console.error(`    ${e.message}`);
    }
}

function beforeEach(fn) {
    // This is a simplified beforeEach - in a real test framework, this would be handled properly
}

// Run tests if this file is executed directly
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { describe, test, expect, beforeEach };
}
