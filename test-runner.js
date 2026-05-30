// ============================================================================
// SIMPLE TEST RUNNER FOR TRANSACTION MANAGEMENT (Task 3.1)
// ============================================================================

// Mock localStorage
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => {
            store[key] = value.toString();
        },
        removeItem: (key) => {
            delete store[key];
        },
        clear: () => {
            store = {};
        }
    };
})();

global.localStorage = localStorageMock;

// Mock Chart.js
global.Chart = class {
    constructor(ctx, config) {
        this.ctx = ctx;
        this.config = config;
        this.data = config.data;
    }
    update() {}
};

// Mock DOM elements
global.document = {
    getElementById: (id) => ({
        textContent: '',
        innerHTML: '',
        value: '',
        classList: {
            add: () => {},
            remove: () => {},
            contains: () => false
        },
        style: {},
        addEventListener: () => {},
        appendChild: () => {},
        querySelectorAll: () => [],
        dataset: {}
    }),
    createElement: (tag) => ({
        className: '',
        innerHTML: '',
        textContent: '',
        dataset: {},
        appendChild: () => {},
        classList: {
            add: () => {},
            remove: () => {},
            contains: () => false
        }
    }),
    body: {
        classList: {
            add: () => {},
            remove: () => {}
        }
    },
    readyState: 'complete'
};

global.window = {
    localStorage: localStorageMock
};

// Load the app.js file
const fs = require('fs');
const appCode = fs.readFileSync('./js/app.js', 'utf8');

// Extract only the functions we need (remove event listeners and initialization)
const functionsToTest = appCode
    .split('// ============================================================================')[0] +
    appCode.split('// ============================================================================')[1] +
    appCode.split('// ============================================================================')[2] +
    appCode.split('// ============================================================================')[3] +
    appCode.split('// ============================================================================')[4] +
    appCode.split('// ============================================================================')[5] +
    appCode.split('// ============================================================================')[6];

// Execute the functions
eval(functionsToTest);

// ============================================================================
// TEST FRAMEWORK
// ============================================================================

let testsPassed = 0;
let testsFailed = 0;
const failedTests = [];

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

function assertEqual(actual, expected, message) {
    if (actual !== expected) {
        throw new Error(`${message}\nExpected: ${expected}\nActual: ${actual}`);
    }
}

function test(name, fn) {
    try {
        fn();
        console.log(`✓ ${name}`);
        testsPassed++;
    } catch (error) {
        console.log(`✗ ${name}`);
        console.log(`  Error: ${error.message}`);
        testsFailed++;
        failedTests.push({ name, error: error.message });
    }
}

function describe(suiteName, fn) {
    console.log(`\n${suiteName}`);
    fn();
}

function beforeEach(fn) {
    // Store for later use
    global.beforeEachFn = fn;
}

// ============================================================================
// TESTS: Transaction Management Functions
// ============================================================================

describe('Transaction Management - addTransaction()', () => {
    beforeEach(() => {
        appState.transactions = [];
        localStorage.clear();
    });

    test('should add a valid transaction to the list', () => {
        appState.transactions = [];
        const transaction = addTransaction('Coffee', 5.50, 'Food');
        
        assert(transaction !== undefined, 'Transaction should be defined');
        assertEqual(transaction.itemName, 'Coffee', 'Item name should match');
        assertEqual(transaction.amount, 5.50, 'Amount should match');
        assertEqual(transaction.category, 'Food', 'Category should match');
        assert(transaction.id !== undefined, 'ID should be defined');
        assert(transaction.timestamp !== undefined, 'Timestamp should be defined');
        assertEqual(appState.transactions.length, 1, 'Should have 1 transaction');
    });

    test('should trim whitespace from item name', () => {
        appState.transactions = [];
        const transaction = addTransaction('  Coffee  ', 5.50, 'Food');
        
        assertEqual(transaction.itemName, 'Coffee', 'Item name should be trimmed');
    });

    test('should generate unique IDs for different transactions', () => {
        appState.transactions = [];
        const t1 = addTransaction('Coffee', 5.50, 'Food');
        const t2 = addTransaction('Bus', 2.00, 'Transport');
        
        assert(t1.id !== t2.id, 'IDs should be different');
    });

    test('should add multiple transactions to the list', () => {
        appState.transactions = [];
        addTransaction('Coffee', 5.50, 'Food');
        addTransaction('Bus', 2.00, 'Transport');
        addTransaction('Movie', 15.00, 'Fun');
        
        assertEqual(appState.transactions.length, 3, 'Should have 3 transactions');
    });

    test('should preserve all transaction fields', () => {
        appState.transactions = [];
        const transaction = addTransaction('Lunch', 12.99, 'Food');
        
        assert(transaction.hasOwnProperty('id'), 'Should have id property');
        assert(transaction.hasOwnProperty('itemName'), 'Should have itemName property');
        assert(transaction.hasOwnProperty('amount'), 'Should have amount property');
        assert(transaction.hasOwnProperty('category'), 'Should have category property');
        assert(transaction.hasOwnProperty('timestamp'), 'Should have timestamp property');
    });

    test('should store transaction with correct amount precision', () => {
        appState.transactions = [];
        const transaction = addTransaction('Item', 10.99, 'Food');
        
        assertEqual(transaction.amount, 10.99, 'Amount should have correct precision');
    });
});

describe('Transaction Management - deleteTransaction()', () => {
    test('should delete a transaction by ID', () => {
        appState.transactions = [];
        const t1 = addTransaction('Coffee', 5.50, 'Food');
        const t2 = addTransaction('Bus', 2.00, 'Transport');
        
        assertEqual(appState.transactions.length, 2, 'Should have 2 transactions');
        
        const deleted = deleteTransaction(t1.id);
        
        assert(deleted === true, 'Should return true');
        assertEqual(appState.transactions.length, 1, 'Should have 1 transaction');
        assertEqual(appState.transactions[0].id, t2.id, 'Remaining transaction should be t2');
    });

    test('should return false when deleting non-existent transaction', () => {
        appState.transactions = [];
        addTransaction('Coffee', 5.50, 'Food');
        
        const deleted = deleteTransaction('non-existent-id');
        
        assert(deleted === false, 'Should return false');
        assertEqual(appState.transactions.length, 1, 'Should still have 1 transaction');
    });

    test('should not affect other transactions when deleting one', () => {
        appState.transactions = [];
        const t1 = addTransaction('Coffee', 5.50, 'Food');
        const t2 = addTransaction('Bus', 2.00, 'Transport');
        const t3 = addTransaction('Movie', 15.00, 'Fun');
        
        deleteTransaction(t2.id);
        
        assertEqual(appState.transactions.length, 2, 'Should have 2 transactions');
        assert(appState.transactions.some(t => t.id === t1.id), 't1 should still exist');
        assert(appState.transactions.some(t => t.id === t3.id), 't3 should still exist');
        assert(!appState.transactions.some(t => t.id === t2.id), 't2 should not exist');
    });

    test('should handle deleting from empty list', () => {
        appState.transactions = [];
        const deleted = deleteTransaction('any-id');
        
        assert(deleted === false, 'Should return false');
        assertEqual(appState.transactions.length, 0, 'Should still be empty');
    });

    test('should delete all transactions one by one', () => {
        appState.transactions = [];
        const t1 = addTransaction('Coffee', 5.50, 'Food');
        const t2 = addTransaction('Bus', 2.00, 'Transport');
        const t3 = addTransaction('Movie', 15.00, 'Fun');
        
        deleteTransaction(t1.id);
        assertEqual(appState.transactions.length, 2, 'Should have 2 transactions');
        
        deleteTransaction(t2.id);
        assertEqual(appState.transactions.length, 1, 'Should have 1 transaction');
        
        deleteTransaction(t3.id);
        assertEqual(appState.transactions.length, 0, 'Should have 0 transactions');
    });
});

describe('Transaction Management - getTransactions()', () => {
    test('should return empty array when no transactions exist', () => {
        appState.transactions = [];
        const transactions = getTransactions();
        
        assert(Array.isArray(transactions), 'Should return an array');
        assertEqual(transactions.length, 0, 'Should be empty');
    });

    test('should return all transactions', () => {
        appState.transactions = [];
        addTransaction('Coffee', 5.50, 'Food');
        addTransaction('Bus', 2.00, 'Transport');
        addTransaction('Movie', 15.00, 'Fun');
        
        const transactions = getTransactions();
        
        assertEqual(transactions.length, 3, 'Should have 3 transactions');
    });

    test('should return transactions in the order they were added', () => {
        appState.transactions = [];
        const t1 = addTransaction('Coffee', 5.50, 'Food');
        const t2 = addTransaction('Bus', 2.00, 'Transport');
        const t3 = addTransaction('Movie', 15.00, 'Fun');
        
        const transactions = getTransactions();
        
        assertEqual(transactions[0].id, t1.id, 'First should be t1');
        assertEqual(transactions[1].id, t2.id, 'Second should be t2');
        assertEqual(transactions[2].id, t3.id, 'Third should be t3');
    });

    test('should return all transaction fields', () => {
        appState.transactions = [];
        addTransaction('Coffee', 5.50, 'Food');
        
        const transactions = getTransactions();
        const transaction = transactions[0];
        
        assert(transaction.hasOwnProperty('id'), 'Should have id');
        assert(transaction.hasOwnProperty('itemName'), 'Should have itemName');
        assert(transaction.hasOwnProperty('amount'), 'Should have amount');
        assert(transaction.hasOwnProperty('category'), 'Should have category');
        assert(transaction.hasOwnProperty('timestamp'), 'Should have timestamp');
    });
});

describe('Transaction Validation - validateTransaction()', () => {
    test('should validate a correct transaction', () => {
        const result = validateTransaction('Coffee', 5.50, 'Food');
        
        assert(result.valid === true, 'Should be valid');
        assertEqual(result.errors.length, 0, 'Should have no errors');
    });

    test('should reject empty item name', () => {
        const result = validateTransaction('', 5.50, 'Food');
        
        assert(result.valid === false, 'Should be invalid');
        assert(result.errors.some(e => e.includes('Item name')), 'Should have item name error');
    });

    test('should reject whitespace-only item name', () => {
        const result = validateTransaction('   ', 5.50, 'Food');
        
        assert(result.valid === false, 'Should be invalid');
        assert(result.errors.some(e => e.includes('Item name')), 'Should have item name error');
    });

    test('should reject item name exceeding 100 characters', () => {
        const longName = 'A'.repeat(101);
        const result = validateTransaction(longName, 5.50, 'Food');
        
        assert(result.valid === false, 'Should be invalid');
        assert(result.errors.some(e => e.includes('100 characters')), 'Should have length error');
    });

    test('should reject non-numeric amount', () => {
        const result = validateTransaction('Coffee', 'abc', 'Food');
        
        assert(result.valid === false, 'Should be invalid');
        assert(result.errors.some(e => e.includes('valid number')), 'Should have amount error');
    });

    test('should reject negative amount', () => {
        const result = validateTransaction('Coffee', -5.50, 'Food');
        
        assert(result.valid === false, 'Should be invalid');
        assert(result.errors.some(e => e.includes('greater than 0')), 'Should have amount error');
    });

    test('should reject zero amount', () => {
        const result = validateTransaction('Coffee', 0, 'Food');
        
        assert(result.valid === false, 'Should be invalid');
        assert(result.errors.some(e => e.includes('greater than 0')), 'Should have amount error');
    });

    test('should reject amount exceeding maximum', () => {
        const result = validateTransaction('Coffee', 1000000, 'Food');
        
        assert(result.valid === false, 'Should be invalid');
        assert(result.errors.some(e => e.includes('exceed')), 'Should have amount error');
    });

    test('should reject invalid category', () => {
        const result = validateTransaction('Coffee', 5.50, 'InvalidCategory');
        
        assert(result.valid === false, 'Should be invalid');
        assert(result.errors.some(e => e.includes('category')), 'Should have category error');
    });

    test('should reject empty category', () => {
        const result = validateTransaction('Coffee', 5.50, '');
        
        assert(result.valid === false, 'Should be invalid');
        assert(result.errors.some(e => e.includes('category')), 'Should have category error');
    });
});

describe('Edge Cases', () => {
    test('should handle transaction with maximum amount', () => {
        appState.transactions = [];
        const transaction = addTransaction('Expensive Item', 999999.99, 'Fun');
        
        assertEqual(transaction.amount, 999999.99, 'Should handle max amount');
        assertEqual(appState.transactions.length, 1, 'Should be added');
    });

    test('should handle transaction with minimum amount', () => {
        appState.transactions = [];
        const transaction = addTransaction('Cheap Item', 0.01, 'Food');
        
        assertEqual(transaction.amount, 0.01, 'Should handle min amount');
        assertEqual(appState.transactions.length, 1, 'Should be added');
    });

    test('should handle transaction with long item name', () => {
        appState.transactions = [];
        const longName = 'A'.repeat(100);
        const transaction = addTransaction(longName, 5.50, 'Food');
        
        assertEqual(transaction.itemName.length, 100, 'Should handle long name');
    });

    test('should handle all three categories', () => {
        appState.transactions = [];
        const t1 = addTransaction('Food Item', 5.50, 'Food');
        const t2 = addTransaction('Transport Item', 2.00, 'Transport');
        const t3 = addTransaction('Fun Item', 15.00, 'Fun');
        
        assertEqual(t1.category, 'Food', 'Should handle Food');
        assertEqual(t2.category, 'Transport', 'Should handle Transport');
        assertEqual(t3.category, 'Fun', 'Should handle Fun');
    });

    test('should handle 100+ transactions', () => {
        appState.transactions = [];
        for (let i = 0; i < 100; i++) {
            addTransaction(`Item ${i}`, (i % 100) + 1, ['Food', 'Transport', 'Fun'][i % 3]);
        }
        
        assertEqual(appState.transactions.length, 100, 'Should handle 100+ transactions');
    });
});

// ============================================================================
// TEST SUMMARY
// ============================================================================

console.log('\n' + '='.repeat(60));
console.log(`Tests Passed: ${testsPassed}`);
console.log(`Tests Failed: ${testsFailed}`);
console.log('='.repeat(60));

if (testsFailed > 0) {
    console.log('\nFailed Tests:');
    failedTests.forEach(test => {
        console.log(`  - ${test.name}`);
    });
    process.exit(1);
} else {
    console.log('\n✓ All tests passed!');
    process.exit(0);
}
