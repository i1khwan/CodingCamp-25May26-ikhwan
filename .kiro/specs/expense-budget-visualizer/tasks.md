# Implementation Plan: Expense & Budget Visualizer

## Overview

The implementation follows a layered approach, starting with core data structures and validation, then building the storage layer, followed by UI rendering, and finally integrating all components. Each task builds incrementally, with property-based tests validating correctness properties throughout the implementation.

## Tasks

- [x] 1. Set up project structure and core data models
  - Create `index.html` with semantic HTML5 structure and Chart.js CDN reference
  - Create `css/styles.css` with CSS variables for theming and responsive layout
  - Create `js/app.js` with module organization and initialization
  - Define Transaction and UserPreferences data structures
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7, 14.8, 15.1, 15.2, 15.3, 15.4_

- [x] 2. Implement transaction validation and core business logic
  - [x] 2.1 Implement transaction validation functions
    - Create `validateTransaction(itemName, amount, category)` function
    - Validate item name (non-empty after trim, max 100 chars)
    - Validate amount (numeric, positive, 0.01-999999.99, 2 decimal places)
    - Validate category (must be Food, Transport, or Fun)
    - Return validation result with error messages
    - _Requirements: 1.1, 1.2, 1.5, 1.6_


- [x] 3. Implement transaction management (CRUD operations)
  - [x] 3.1 Implement transaction add/delete functions
    - Create `addTransaction(itemName, amount, category)` function with unique ID generation
    - Create `deleteTransaction(id)` function
    - Create `getTransactions()` function
    - Maintain in-memory transaction list
    - _Requirements: 1.3, 1.4, 3.2, 3.3_

- [x] 4. Implement storage layer with localStorage integration
  - [x] 4.1 Implement localStorage operations with error handling
    - Create `saveTransactions(transactions)` function with error handling
    - Create `loadTransactions()` function with corruption detection
    - Create `saveUserPreferences(preferences)` function
    - Create `loadUserPreferences()` function
    - Handle localStorage unavailability gracefully
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9, 9.10, 9.11_

- [x] 5. Implement calculation functions
  - [x] 5.1 Implement balance and category calculations
    - Create `calculateTotalBalance(transactions)` function with round-half-up rounding
    - Create `calculateCategoryTotals(transactions)` function
    - Create `calculateCategoryPercentages(transactions)` function
    - Create `calculateMonthlyTotals(transactions, year, month)` function
    - _Requirements: 4.1, 5.3, 6.3_

- [x] 6. Implement sorting and filtering functions
  - [x] 6.1 Implement transaction sorting and filtering
    - Create `sortTransactions(transactions, sortBy)` function
    - Implement sort by date (reverse chronological, newest first)
    - Implement sort by amount (highest to lowest)
    - Implement sort by category (alphabetical with secondary date sort)
    - Create `filterByMonth(transactions, year, month)` function
    - _Requirements: 2.1, 7.2, 7.3, 6.2, 6.3, 6.4_


- [x] 7. Implement formatting functions
  - [x] 7.1 Implement amount and balance formatting
    - Create `formatAmount(amount)` function with 2 decimal places and thousands separator
    - Create `formatBalance(balance)` function with 2 decimal places and thousands separator
    - _Requirements: 2.4, 4.2_


- [x] 8. Implement UI rendering functions
  - [x] 8.1 Implement transaction list rendering
    - Create `renderTransactionList(transactions)` function
    - Display each transaction with item name, amount, category, and delete button
    - Apply color coding by category
    - Handle empty state with "No transactions yet. Add your first expense!" message
    - Limit display to 1000 transactions
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 2.8, 13.1, 13.6_

  - [x] 8.2 Implement balance display rendering
    - Create `renderBalance(balance)` function
    - Display formatted total balance prominently
    - _Requirements: 4.2, 13.1_

  - [x] 8.3 Implement form rendering and clearing
    - Create `renderForm()` function to initialize form
    - Create `clearForm()` function to reset input fields
    - _Requirements: 1.1, 1.7_


- [x] 9. Implement Chart.js integration
  - [x] 9.1 Implement pie chart rendering
    - Create `renderChart(categoryTotals)` function
    - Display pie chart with Food, Transport, Fun segments
    - Show labels and percentage values with 1 decimal place
    - Handle empty state with "Add transactions to see spending breakdown" message
    - Handle Chart.js CDN failure gracefully
    - _Requirements: 5.1, 5.2, 5.3, 5.6, 5.8, 15.6_

- [x] 10. Implement theme functionality
  - [x] 10.1 Implement theme toggle and persistence
    - Create `toggleTheme()` function
    - Create `applyTheme(theme)` function
    - Load theme preference from localStorage on startup
    - Default to light theme if no preference exists
    - Apply theme to all UI elements (background, text, buttons, chart)
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9_


- [x] 11. Implement sorting preference functionality
  - [x] 11.1 Implement sort preference management
    - Create `setSortPreference(sortBy)` function
    - Create `getSortPreference()` function
    - Load sort preference from localStorage on startup
    - Default to date sort if no preference exists
    - Re-sort transaction list when preference changes
    - _Requirements: 7.1, 7.4, 7.5, 7.6, 7.7_


- [x] 12. Implement monthly summary view
  - [x] 12.1 Implement monthly summary rendering and navigation
    - Create `renderMonthlyView(monthlyData)` function
    - Display total spending for current month with 2 decimal places
    - Display spending by category (Food, Transport, Fun) with 2 decimal places
    - Handle empty state with "No expenses this month" message
    - Create `switchToMonthlyView()` function
    - Create `switchToMainView()` function
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8_

- [x] 13. Implement event listeners and form submission
  - [x] 13.1 Implement form submission and transaction addition
    - Add event listener for form submit
    - Validate form inputs
    - Display validation error messages inline
    - Add transaction on valid submission
    - Clear form after successful submission
    - Update all UI elements (list, balance, chart)
    - _Requirements: 1.1, 1.3, 1.5, 1.6, 1.7, 13.4_

  - [x] 13.2 Implement delete button event listeners
    - Add event listeners for delete buttons
    - Handle transaction deletion
    - Update all UI elements (list, balance, chart)
    - Display visual confirmation of deletion
    - _Requirements: 3.1, 3.3, 3.5, 3.6, 3.8_

  - [x] 13.3 Implement theme toggle event listener
    - Add event listener for theme toggle button
    - Handle keyboard accessibility (Enter/Space)
    - _Requirements: 8.1, 8.8_

  - [x] 13.4 Implement sort preference event listeners
    - Add event listeners for sort controls
    - Update transaction list on sort change
    - _Requirements: 7.1, 7.4_

  - [x] 13.5 Implement monthly summary navigation listeners
    - Add event listeners for monthly summary button
    - Add event listener for return button
    - _Requirements: 6.1, 6.5, 6.6_

- [x] 14. Implement application initialization
  - [x] 14.1 Implement startup sequence
    - Load transactions from localStorage
    - Load user preferences from localStorage
    - Handle localStorage unavailability with warning message
    - Handle corrupted data with error message
    - Apply saved theme
    - Apply saved sort preference
    - Render initial UI (transaction list, balance, chart)
    - Initialize event listeners
    - _Requirements: 2.6, 2.7, 9.3, 9.4, 9.8, 9.9, 9.10, 11.1_


- [x] 15. Implement responsive design and accessibility
  - [x] 15.1 Implement responsive CSS and layout
    - Create mobile-first responsive layout using flexbox/CSS grid
    - Ensure no horizontal scrolling at 320px-1920px widths
    - Set minimum font sizes (14px body, 16px inputs)
    - Set touch-friendly button sizes (44x44px minimum)
    - Ensure color contrast ratios (4.5:1 normal, 3:1 large text)
    - Use semantic HTML5 elements
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 13.2, 13.3, 13.7, 13.8, 13.9_

  - [x] 15.2 Implement accessibility features
    - Associate form labels with inputs via `<label>` elements
    - Add ARIA labels for icon-only buttons
    - Ensure keyboard navigation (Tab, Enter, Space)
    - Provide visible focus indicators
    - Use semantic HTML structure for screen readers
    - _Requirements: 8.8, 13.1_


- [x] 17. Implement error handling and edge cases
  - [x] 17.1 Implement comprehensive error handling
    - Handle localStorage save failures with error message
    - Handle localStorage load failures with error message
    - Handle Chart.js CDN failure with error message and graceful degradation
    - Display validation error messages inline
    - Display deletion failure with recovery
    - _Requirements: 2.7, 3.7, 9.8, 9.9, 9.10, 15.6_

  - [x] 17.2 Implement edge case handling
    - Handle empty transaction list (zero balance, empty chart, empty monthly summary)
    - Handle single transaction
    - Handle 1000+ transactions (display limit)
    - Handle very large amounts (up to 999,999,999.99)
    - Handle transactions from different months
    - _Requirements: 2.5, 2.8, 4.6, 5.6, 5.8, 6.7_

- [x] 18. Implement performance optimizations
  - [x] 18.1 Implement performance optimizations
    - Use lazy rendering for DOM updates
    - Debounce chart updates
    - Batch localStorage operations
    - Reuse Chart.js instance instead of recreating
    - Use efficient sorting algorithms
    - _Requirements: 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8, 11.9_

## Notes

- Tasks marked with `*` are optional property-based tests and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties across 100+ iterations
- Unit tests validate specific examples and edge cases
- Checkpoints ensure incremental validation of functionality
- All code should follow vanilla JavaScript best practices with no external frameworks
- localStorage operations should include error handling and graceful degradation
- Chart.js should be loaded from CDN with fallback error handling

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["2.1", "3.1", "4.1", "5.1", "6.1", "7.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "2.4", "2.5", "3.2", "3.3", "4.2", "4.3", "4.4", "5.2", "5.3", "5.4", "5.5", "5.6", "6.2", "6.3", "6.4", "6.5", "7.2", "7.3"] },
    { "id": 3, "tasks": ["8.1", "8.2", "8.3", "9.1", "10.1", "11.1", "12.1"] },
    { "id": 4, "tasks": ["8.4", "8.5", "10.2", "11.2"] },
    { "id": 5, "tasks": ["13.1", "13.2", "13.3", "13.4", "13.5"] },
    { "id": 6, "tasks": ["14.1", "15.1", "15.2"] },
    { "id": 7, "tasks": ["14.2"] },
    { "id": 8, "tasks": ["17.1", "17.2"] },
    { "id": 9, "tasks": ["18.1"] }
  ]
}
```
