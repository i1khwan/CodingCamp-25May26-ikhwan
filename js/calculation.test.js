// ============================================================================
// UNIT TESTS FOR CALCULATION MODULE
// ============================================================================

/**
 * Simple test runner for unit tests
 */
class TestRunner {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
    }
    
    test(name, fn) {
        this.tests.push({ name, fn });
    }
    
    run() {
        console.log('Running calculation tests...\n');
        
        this.tests.forEach(test => {
            try {
                test.fn();
                this.passed++;
                console.log(`✓ ${test.name}`);
            } catch (error) {
                this.failed++;
                console.error(`✗ ${test.name}`);
                console.error(`  ${error.message}\n`);
            }
        });
        
        console.log(`\n${this.passed} passed, ${this.failed} failed`);
        return this.failed === 0;
    }
}

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

function assertAlmostEqual(actual, expected, tolerance = 0.01, message) {
    if (Math.abs(actual - expected) > tolerance) {
        throw new Error(`${message}\nExpected: ${expected}\nActual: ${actual}`);
    }
}

function assertObjectEqual(actual, expected, message) {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`${message}\nExpected: ${JSON.stringify(expected)}\nActual: ${JSON.stringify(actual)}`);
    }
}

// ============================================================================
// TEST SUITE FOR CALCULATION FUNCTIONS
// ============================================================================

const runner = new TestRunner();

// ============================================================================
// Tests for calculateTotalBalance
// ============================================================================

runner.test('calculateTotalBalance: Empty transaction list returns 0.00', () => {
    const result = CalculationModule.calculateTotalBalance([]);
    assertEqual(result, 0.00, 'Empty list should return 0.00');
});

runner.test('calculateTotalBalance: Single transaction', () => {
    const transactions = [
        { id: '1', itemName: 'Coffee', amount: 5.50, category: 'Food', timestamp: Date.now() }
    ];
    const result = CalculationModule.calculateTotalBalance(transactions);
    assertEqual(result, 5.50, 'Single transaction should return correct amount');
});

runner.test('calculateTotalBalance: Multiple transactions sum correctly', () => {
    const transactions = [
        { id: '1', itemName: 'Coffee', amount: 5.50, category: 'Food', timestamp: Date.now() },
        { id: '2', itemName: 'Bus', amount: 2.50, category: 'Transport', timestamp: Date.now() },
        { id: '3', itemName: 'Movie', amount: 15.00, category: 'Fun', timestamp: Date.now() }
    ];
    const result = CalculationModule.calculateTotalBalance(transactions);
    assertEqual(result, 23.00, 'Sum of transactions should be 23.00');
});

runner.test('calculateTotalBalance: Round-half-up rounding to 2 decimal places', () => {
    const transactions = [
        { id: '1', itemName: 'Item1', amount: 0.01, category: 'Food', timestamp: Date.now() },
        { id: '2', itemName: 'Item2', amount: 0.02, category: 'Food', timestamp: Date.now() },
        { id: '3', itemName: 'Item3', amount: 0.02, category: 'Food', timestamp: Date.now() }
    ];
    const result = CalculationModule.calculateTotalBalance(transactions);
    assertEqual(result, 0.05, 'Sum should be 0.05');
});

runner.test('calculateTotalBalance: Large amounts', () => {
    const transactions = [
        { id: '1', itemName: 'Item1', amount: 999999.99, category: 'Food', timestamp: Date.now() }
    ];
    const result = CalculationModule.calculateTotalBalance(transactions);
    assertEqual(result, 999999.99, 'Large amount should be handled correctly');
});

runner.test('calculateTotalBalance: Handles string amounts by converting to number', () => {
    const transactions = [
        { id: '1', itemName: 'Coffee', amount: '5.50', category: 'Food', timestamp: Date.now() },
        { id: '2', itemName: 'Bus', amount: '2.50', category: 'Transport', timestamp: Date.now() }
    ];
    const result = CalculationModule.calculateTotalBalance(transactions);
    assertEqual(result, 8.00, 'String amounts should be converted and summed');
});

runner.test('calculateTotalBalance: Null or undefined transactions parameter returns 0', () => {
    const result1 = CalculationModule.calculateTotalBalance(null);
    const result2 = CalculationModule.calculateTotalBalance(undefined);
    assertEqual(result1, 0.00, 'Null should return 0.00');
    assertEqual(result2, 0.00, 'Undefined should return 0.00');
});

// ============================================================================
// Tests for calculateCategoryTotals
// ============================================================================

runner.test('calculateCategoryTotals: Empty transaction list returns zeros', () => {
    const result = CalculationModule.calculateCategoryTotals([]);
    assertObjectEqual(result, { Food: 0, Transport: 0, Fun: 0 }, 'Empty list should return all zeros');
});

runner.test('calculateCategoryTotals: Single Food transaction', () => {
    const transactions = [
        { id: '1', itemName: 'Coffee', amount: 5.50, category: 'Food', timestamp: Date.now() }
    ];
    const result = CalculationModule.calculateCategoryTotals(transactions);
    assertObjectEqual(result, { Food: 5.50, Transport: 0, Fun: 0 }, 'Food total should be 5.50');
});

runner.test('calculateCategoryTotals: Multiple categories', () => {
    const transactions = [
        { id: '1', itemName: 'Coffee', amount: 5.50, category: 'Food', timestamp: Date.now() },
        { id: '2', itemName: 'Bus', amount: 2.50, category: 'Transport', timestamp: Date.now() },
        { id: '3', itemName: 'Movie', amount: 15.00, category: 'Fun', timestamp: Date.now() }
    ];
    const result = CalculationModule.calculateCategoryTotals(transactions);
    assertObjectEqual(result, { Food: 5.50, Transport: 2.50, Fun: 15.00 }, 'All categories should have correct totals');
});

runner.test('calculateCategoryTotals: Multiple transactions in same category', () => {
    const transactions = [
        { id: '1', itemName: 'Coffee', amount: 5.50, category: 'Food', timestamp: Date.now() },
        { id: '2', itemName: 'Lunch', amount: 12.00, category: 'Food', timestamp: Date.now() },
        { id: '3', itemName: 'Dinner', amount: 18.50, category: 'Food', timestamp: Date.now() }
    ];
    const result = CalculationModule.calculateCategoryTotals(transactions);
    assertObjectEqual(result, { Food: 36.00, Transport: 0, Fun: 0 }, 'Food total should be sum of all food items');
});

runner.test('calculateCategoryTotals: Null or undefined transactions parameter returns zeros', () => {
    const result1 = CalculationModule.calculateCategoryTotals(null);
    const result2 = CalculationModule.calculateCategoryTotals(undefined);
    assertObjectEqual(result1, { Food: 0, Transport: 0, Fun: 0 }, 'Null should return all zeros');
    assertObjectEqual(result2, { Food: 0, Transport: 0, Fun: 0 }, 'Undefined should return all zeros');
});

// ============================================================================
// Tests for calculateCategoryPercentages
// ============================================================================

runner.test('calculateCategoryPercentages: Empty transaction list returns zeros', () => {
    const result = CalculationModule.calculateCategoryPercentages([]);
    assertObjectEqual(result, { Food: 0.0, Transport: 0.0, Fun: 0.0 }, 'Empty list should return all zeros');
});

runner.test('calculateCategoryPercentages: Single category with 100%', () => {
    const transactions = [
        { id: '1', itemName: 'Coffee', amount: 5.50, category: 'Food', timestamp: Date.now() }
    ];
    const result = CalculationModule.calculateCategoryPercentages(transactions);
    assertObjectEqual(result, { Food: 100.0, Transport: 0.0, Fun: 0.0 }, 'Single category should be 100%');
});

runner.test('calculateCategoryPercentages: Equal distribution across categories', () => {
    const transactions = [
        { id: '1', itemName: 'Coffee', amount: 10.00, category: 'Food', timestamp: Date.now() },
        { id: '2', itemName: 'Bus', amount: 10.00, category: 'Transport', timestamp: Date.now() },
        { id: '3', itemName: 'Movie', amount: 10.00, category: 'Fun', timestamp: Date.now() }
    ];
    const result = CalculationModule.calculateCategoryPercentages(transactions);
    assertObjectEqual(result, { Food: 33.3, Transport: 33.3, Fun: 33.3 }, 'Equal amounts should give ~33.3% each');
});

runner.test('calculateCategoryPercentages: Unequal distribution', () => {
    const transactions = [
        { id: '1', itemName: 'Coffee', amount: 50.00, category: 'Food', timestamp: Date.now() },
        { id: '2', itemName: 'Bus', amount: 30.00, category: 'Transport', timestamp: Date.now() },
        { id: '3', itemName: 'Movie', amount: 20.00, category: 'Fun', timestamp: Date.now() }
    ];
    const result = CalculationModule.calculateCategoryPercentages(transactions);
    assertObjectEqual(result, { Food: 50.0, Transport: 30.0, Fun: 20.0 }, 'Percentages should match distribution');
});

runner.test('calculateCategoryPercentages: Percentages sum to 100%', () => {
    const transactions = [
        { id: '1', itemName: 'Coffee', amount: 5.50, category: 'Food', timestamp: Date.now() },
        { id: '2', itemName: 'Bus', amount: 2.50, category: 'Transport', timestamp: Date.now() },
        { id: '3', itemName: 'Movie', amount: 15.00, category: 'Fun', timestamp: Date.now() }
    ];
    const result = CalculationModule.calculateCategoryPercentages(transactions);
    const sum = result.Food + result.Transport + result.Fun;
    assertAlmostEqual(sum, 100.0, 0.1, 'Percentages should sum to 100%');
});

runner.test('calculateCategoryPercentages: Rounded to 1 decimal place', () => {
    const transactions = [
        { id: '1', itemName: 'Item1', amount: 1.00, category: 'Food', timestamp: Date.now() },
        { id: '2', itemName: 'Item2', amount: 2.00, category: 'Transport', timestamp: Date.now() }
    ];
    const result = CalculationModule.calculateCategoryPercentages(transactions);
    // 1/3 = 33.333... should round to 33.3
    // 2/3 = 66.666... should round to 66.7
    assert(result.Food.toString().split('.')[1].length <= 1, 'Food percentage should have 1 decimal place');
    assert(result.Transport.toString().split('.')[1].length <= 1, 'Transport percentage should have 1 decimal place');
});

runner.test('calculateCategoryPercentages: Null or undefined transactions parameter returns zeros', () => {
    const result1 = CalculationModule.calculateCategoryPercentages(null);
    const result2 = CalculationModule.calculateCategoryPercentages(undefined);
    assertObjectEqual(result1, { Food: 0.0, Transport: 0.0, Fun: 0.0 }, 'Null should return all zeros');
    assertObjectEqual(result2, { Food: 0.0, Transport: 0.0, Fun: 0.0 }, 'Undefined should return all zeros');
});

// ============================================================================
// Tests for calculateMonthlyTotals
// ============================================================================

runner.test('calculateMonthlyTotals: Empty transaction list returns zeros', () => {
    const result = CalculationModule.calculateMonthlyTotals([], 2024, 5);
    assertObjectEqual(result, { 
        total: 0.00, 
        byCategory: { Food: 0.00, Transport: 0.00, Fun: 0.00 } 
    }, 'Empty list should return zeros');
});

runner.test('calculateMonthlyTotals: Single transaction in specified month', () => {
    const date = new Date(2024, 4, 15); // May 15, 2024
    const transactions = [
        { id: '1', itemName: 'Coffee', amount: 5.50, category: 'Food', timestamp: date.getTime() }
    ];
    const result = CalculationModule.calculateMonthlyTotals(transactions, 2024, 5);
    assertObjectEqual(result, { 
        total: 5.50, 
        byCategory: { Food: 5.50, Transport: 0.00, Fun: 0.00 } 
    }, 'Should include transaction from May');
});

runner.test('calculateMonthlyTotals: Filters out transactions from other months', () => {
    const mayDate = new Date(2024, 4, 15); // May 15, 2024
    const juneDate = new Date(2024, 5, 15); // June 15, 2024
    const transactions = [
        { id: '1', itemName: 'Coffee', amount: 5.50, category: 'Food', timestamp: mayDate.getTime() },
        { id: '2', itemName: 'Bus', amount: 2.50, category: 'Transport', timestamp: juneDate.getTime() }
    ];
    const result = CalculationModule.calculateMonthlyTotals(transactions, 2024, 5);
    assertObjectEqual(result, { 
        total: 5.50, 
        byCategory: { Food: 5.50, Transport: 0.00, Fun: 0.00 } 
    }, 'Should only include May transactions');
});

runner.test('calculateMonthlyTotals: Multiple transactions in same month', () => {
    const date1 = new Date(2024, 4, 10); // May 10, 2024
    const date2 = new Date(2024, 4, 20); // May 20, 2024
    const transactions = [
        { id: '1', itemName: 'Coffee', amount: 5.50, category: 'Food', timestamp: date1.getTime() },
        { id: '2', itemName: 'Lunch', amount: 12.00, category: 'Food', timestamp: date2.getTime() }
    ];
    const result = CalculationModule.calculateMonthlyTotals(transactions, 2024, 5);
    assertObjectEqual(result, { 
        total: 17.50, 
        byCategory: { Food: 17.50, Transport: 0.00, Fun: 0.00 } 
    }, 'Should sum all May transactions');
});

runner.test('calculateMonthlyTotals: Multiple categories in same month', () => {
    const date = new Date(2024, 4, 15); // May 15, 2024
    const transactions = [
        { id: '1', itemName: 'Coffee', amount: 5.50, category: 'Food', timestamp: date.getTime() },
        { id: '2', itemName: 'Bus', amount: 2.50, category: 'Transport', timestamp: date.getTime() },
        { id: '3', itemName: 'Movie', amount: 15.00, category: 'Fun', timestamp: date.getTime() }
    ];
    const result = CalculationModule.calculateMonthlyTotals(transactions, 2024, 5);
    assertObjectEqual(result, { 
        total: 23.00, 
        byCategory: { Food: 5.50, Transport: 2.50, Fun: 15.00 } 
    }, 'Should include all categories from May');
});

runner.test('calculateMonthlyTotals: Handles different years correctly', () => {
    const may2023 = new Date(2023, 4, 15); // May 15, 2023
    const may2024 = new Date(2024, 4, 15); // May 15, 2024
    const transactions = [
        { id: '1', itemName: 'Coffee', amount: 5.50, category: 'Food', timestamp: may2023.getTime() },
        { id: '2', itemName: 'Bus', amount: 2.50, category: 'Transport', timestamp: may2024.getTime() }
    ];
    const result = CalculationModule.calculateMonthlyTotals(transactions, 2024, 5);
    assertObjectEqual(result, { 
        total: 2.50, 
        byCategory: { Food: 0.00, Transport: 2.50, Fun: 0.00 } 
    }, 'Should only include May 2024 transactions');
});

runner.test('calculateMonthlyTotals: Null or undefined transactions parameter returns zeros', () => {
    const result1 = CalculationModule.calculateMonthlyTotals(null, 2024, 5);
    const result2 = CalculationModule.calculateMonthlyTotals(undefined, 2024, 5);
    assertObjectEqual(result1, { 
        total: 0.00, 
        byCategory: { Food: 0.00, Transport: 0.00, Fun: 0.00 } 
    }, 'Null should return zeros');
    assertObjectEqual(result2, { 
        total: 0.00, 
        byCategory: { Food: 0.00, Transport: 0.00, Fun: 0.00 } 
    }, 'Undefined should return zeros');
});

runner.test('calculateMonthlyTotals: January (month 1)', () => {
    const date = new Date(2024, 0, 15); // January 15, 2024
    const transactions = [
        { id: '1', itemName: 'Coffee', amount: 5.50, category: 'Food', timestamp: date.getTime() }
    ];
    const result = CalculationModule.calculateMonthlyTotals(transactions, 2024, 1);
    assertObjectEqual(result, { 
        total: 5.50, 
        byCategory: { Food: 5.50, Transport: 0.00, Fun: 0.00 } 
    }, 'Should handle January correctly');
});

runner.test('calculateMonthlyTotals: December (month 12)', () => {
    const date = new Date(2024, 11, 15); // December 15, 2024
    const transactions = [
        { id: '1', itemName: 'Coffee', amount: 5.50, category: 'Food', timestamp: date.getTime() }
    ];
    const result = CalculationModule.calculateMonthlyTotals(transactions, 2024, 12);
    assertObjectEqual(result, { 
        total: 5.50, 
        byCategory: { Food: 5.50, Transport: 0.00, Fun: 0.00 } 
    }, 'Should handle December correctly');
});

// ============================================================================
// Integration Tests
// ============================================================================

runner.test('Integration: Balance equals sum of category totals', () => {
    const transactions = [
        { id: '1', itemName: 'Coffee', amount: 5.50, category: 'Food', timestamp: Date.now() },
        { id: '2', itemName: 'Bus', amount: 2.50, category: 'Transport', timestamp: Date.now() },
        { id: '3', itemName: 'Movie', amount: 15.00, category: 'Fun', timestamp: Date.now() }
    ];
    
    const balance = CalculationModule.calculateTotalBalance(transactions);
    const categoryTotals = CalculationModule.calculateCategoryTotals(transactions);
    const categorySum = categoryTotals.Food + categoryTotals.Transport + categoryTotals.Fun;
    
    assertEqual(balance, categorySum, 'Balance should equal sum of category totals');
});

runner.test('Integration: Monthly total equals sum of monthly category totals', () => {
    const date = new Date(2024, 4, 15); // May 15, 2024
    const transactions = [
        { id: '1', itemName: 'Coffee', amount: 5.50, category: 'Food', timestamp: date.getTime() },
        { id: '2', itemName: 'Bus', amount: 2.50, category: 'Transport', timestamp: date.getTime() },
        { id: '3', itemName: 'Movie', amount: 15.00, category: 'Fun', timestamp: date.getTime() }
    ];
    
    const monthlyData = CalculationModule.calculateMonthlyTotals(transactions, 2024, 5);
    const categorySum = monthlyData.byCategory.Food + monthlyData.byCategory.Transport + monthlyData.byCategory.Fun;
    
    assertEqual(monthlyData.total, categorySum, 'Monthly total should equal sum of category totals');
});

// Run all tests
runner.run();
