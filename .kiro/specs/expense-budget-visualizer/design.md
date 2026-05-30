# Design Document: Expense & Budget Visualizer

## Overview

The Expense & Budget Visualizer is a client-side web application built with vanilla JavaScript that enables users to track daily spending through transaction management, visual analytics, and monthly summaries. The application persists all data to browser localStorage, providing a seamless offline-first experience.

**Key Design Principles:**
- Pure client-side architecture with no backend dependencies
- Vanilla JavaScript with minimal external dependencies (Chart.js only)
- Separation of concerns: HTML structure, CSS styling, JavaScript behavior
- Responsive design supporting 320px to 1920px screen widths
- Offline-first with localStorage persistence
- Property-based testing for core business logic

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interface Layer                      │
│  (HTML + CSS + DOM Manipulation)                            │
├─────────────────────────────────────────────────────────────┤
│                  Application Logic Layer                     │
│  (Transaction Management, Calculations, Sorting, Filtering) │
├─────────────────────────────────────────────────────────────┤
│                   Data Persistence Layer                     │
│  (localStorage with JSON serialization)                     │
├─────────────────────────────────────────────────────────────┤
│                  Visualization Layer                         │
│  (Chart.js for pie chart rendering)                        │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User Input** → Form validation → Transaction creation
2. **Transaction Storage** → In-memory state + localStorage persistence
3. **Display Updates** → Transaction list, balance, chart, monthly summary
4. **User Preferences** → Theme and sort preference persistence
5. **Data Loading** → Application startup loads from localStorage

### Module Organization

The application is organized into logical modules within `js/app.js`:

- **Storage Module**: localStorage operations with error handling
- **Transaction Module**: Transaction CRUD operations and validation
- **Calculation Module**: Balance and percentage calculations
- **Sorting Module**: Transaction sorting logic
- **Filtering Module**: Monthly summary filtering
- **UI Module**: DOM manipulation and rendering
- **Theme Module**: Theme switching and persistence
- **Chart Module**: Chart.js integration

## Components and Interfaces

### 1. Transaction Object

```javascript
{
  id: string (UUID or timestamp),
  itemName: string (1-100 characters),
  amount: number (0.01 to 999999.99, 2 decimal places),
  category: string ('Food' | 'Transport' | 'Fun'),
  timestamp: number (milliseconds since epoch)
}
```

### 2. User Preferences Object

```javascript
{
  theme: string ('light' | 'dark'),
  sortBy: string ('date' | 'amount' | 'category')
}
```

### 3. Application State

```javascript
{
  transactions: Transaction[],
  userPreferences: UserPreferences,
  currentView: string ('main' | 'monthly'),
  isStorageAvailable: boolean
}
```

### 4. Core Functions

#### Transaction Management
- `addTransaction(itemName, amount, category)` → Transaction
- `deleteTransaction(id)` → void
- `getTransactions()` → Transaction[]
- `validateTransaction(itemName, amount, category)` → {valid: boolean, errors: string[]}

#### Calculations
- `calculateTotalBalance(transactions)` → number
- `calculateCategoryTotals(transactions)` → {Food: number, Transport: number, Fun: number}
- `calculateCategoryPercentages(transactions)` → {Food: number, Transport: number, Fun: number}
- `calculateMonthlyTotals(transactions, year, month)` → {total: number, byCategory: object}

#### Sorting & Filtering
- `sortTransactions(transactions, sortBy)` → Transaction[]
- `filterByMonth(transactions, year, month)` → Transaction[]

#### Storage
- `saveTransactions(transactions)` → void
- `loadTransactions()` → Transaction[]
- `saveUserPreferences(preferences)` → void
- `loadUserPreferences()` → UserPreferences

#### UI Rendering
- `renderTransactionList(transactions)` → void
- `renderBalance(balance)` → void
- `renderChart(categoryTotals)` → void
- `renderMonthlyView(monthlyData)` → void
- `renderEmptyState()` → void

## Data Models

### Transaction Storage Format

Transactions are stored in localStorage as a JSON array:

```json
{
  "transactions": [
    {
      "id": "1704067200000",
      "itemName": "Coffee",
      "amount": 5.50,
      "category": "Food",
      "timestamp": 1704067200000
    }
  ]
}
```

### User Preferences Storage Format

```json
{
  "userPreferences": {
    "theme": "dark",
    "sortBy": "date"
  }
}
```

### Validation Rules

**Item Name:**
- Non-empty after trimming whitespace
- Maximum 100 characters
- Stored as-is (preserving case)

**Amount:**
- Numeric value
- Positive (> 0)
- Between 0.01 and 999,999.99
- Rounded to 2 decimal places using round-half-up

**Category:**
- Must be one of: 'Food', 'Transport', 'Fun'
- Case-sensitive

**Timestamp:**
- Generated at transaction creation time
- Stored as milliseconds since epoch
- Used for chronological ordering and monthly filtering

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Valid Transaction Addition

*For any* valid transaction (non-empty trimmed item name, positive amount between 0.01 and 999,999.99, valid category), adding it to the transaction list SHALL result in the transaction appearing in the list with all fields preserved.

**Validates: Requirements 1.3, 1.4, 2.3**

### Property 2: Invalid Item Name Rejection

*For any* string composed entirely of whitespace characters or empty string, attempting to add a transaction with that item name SHALL be rejected and the transaction list SHALL remain unchanged.

**Validates: Requirements 1.5**

### Property 3: Invalid Amount Rejection

*For any* amount that is non-numeric, negative, zero, or exceeds 999,999.99, attempting to add a transaction with that amount SHALL be rejected and the transaction list SHALL remain unchanged.

**Validates: Requirements 1.6**

### Property 4: Category Constraint Enforcement

*For any* category value that is not one of 'Food', 'Transport', or 'Fun', attempting to add a transaction with that category SHALL be rejected.

**Validates: Requirements 1.2**

### Property 5: Reverse Chronological Ordering

*For any* set of transactions added in sequence, retrieving the transaction list SHALL return them in reverse chronological order (newest first) based on their creation timestamps.

**Validates: Requirements 2.1**

### Property 6: Amount Formatting

*For any* valid transaction amount, displaying it SHALL show exactly two decimal places with thousands separator (e.g., 1,234.56 for 1234.56).

**Validates: Requirements 2.4**

### Property 7: Transaction Deletion

*For any* transaction in the list, deleting it by ID SHALL remove it from the transaction list and it SHALL no longer be retrievable.

**Validates: Requirements 3.3**

### Property 8: Balance Calculation Correctness

*For any* set of transactions, the calculated total balance SHALL equal the sum of all transaction amounts rounded to 2 decimal places using round-half-up rounding.

**Validates: Requirements 4.1**

### Property 9: Balance Display Formatting

*For any* calculated balance, displaying it SHALL show exactly two decimal places with thousands separator, up to a maximum of 999,999,999.99.

**Validates: Requirements 4.2**

### Property 10: Category Percentage Calculation

*For any* set of transactions, the percentage for each category SHALL be calculated as (category total / overall total) * 100, rounded to 1 decimal place, and all category percentages SHALL sum to 100.0%.

**Validates: Requirements 5.3**

### Property 11: Monthly Filtering

*For any* set of transactions and a given month/year, filtering transactions for that month SHALL return only transactions whose creation timestamp falls within that calendar month.

**Validates: Requirements 6.2, 6.3, 6.4**

### Property 12: Monthly Category Breakdown

*For any* set of transactions filtered to a specific month, the sum of category totals SHALL equal the total monthly spending.

**Validates: Requirements 6.3**

### Property 13: Sort by Amount (Descending)

*For any* set of transactions, sorting by amount SHALL order them from highest to lowest amount.

**Validates: Requirements 7.2**

### Property 14: Sort by Category (Alphabetical with Secondary Sort)

*For any* set of transactions, sorting by category SHALL order them alphabetically by category name (Food, Fun, Transport) with secondary sort by creation date (newest first) within each category.

**Validates: Requirements 7.3**

### Property 15: Sort Preference Persistence

*For any* sort preference (date, amount, or category), saving it to localStorage and then loading it SHALL return the same preference value.

**Validates: Requirements 7.5, 7.7**

### Property 16: Theme Preference Persistence

*For any* theme preference (light or dark), saving it to localStorage and then loading it SHALL return the same theme value.

**Validates: Requirements 8.4, 8.5**

### Property 17: Transaction Persistence Round-Trip

*For any* set of transactions, saving them to localStorage and then loading them SHALL return an equivalent set of transactions with all fields preserved.

**Validates: Requirements 1.4, 9.1, 9.3, 9.5**

### Property 18: User Preferences Serialization

*For any* user preferences object, serializing it to JSON and deserializing it SHALL produce an equivalent preferences object.

**Validates: Requirements 9.2, 9.11**

### Property 19: Zero Balance for Empty List

*For any* empty transaction list, the calculated total balance SHALL be 0.00.

**Validates: Requirements 4.6**

### Property 20: Zero Percentage for Zero Category Spending

*For any* set of transactions where a category has zero spending, that category's percentage in the chart SHALL be 0.0%.

**Validates: Requirements 5.7**

### Property 21: Form Clearing After Submission

*For any* valid transaction submission, the input form fields (item name, amount, category) SHALL be cleared to their initial empty state.

**Validates: Requirements 1.7**

### Property 22: Unique Transaction Identifiers

*For any* two transactions added at different times, their unique identifiers (timestamp or UUID) SHALL be different.

**Validates: Requirements 3.2**

### Property 23: Deletion Persistence

*For any* transaction deleted from the list, deleting it from localStorage and then loading transactions SHALL not return that transaction.

**Validates: Requirements 3.4**

### Property 24: Maximum Transaction Display

*For any* transaction list containing 1000 or more transactions, the application SHALL display a maximum of 1000 transactions in the UI.

**Validates: Requirements 2.5**

### Property 25: Timestamp Preservation

*For any* transaction, the creation timestamp stored with the transaction SHALL match the time it was created (within 1 second tolerance).

**Validates: Requirements 6.8**

## Error Handling

### Input Validation Errors

**Item Name Validation:**
- Empty or whitespace-only: Display "Item name cannot be empty"
- Exceeds 100 characters: Display "Item name must be 100 characters or less"

**Amount Validation:**
- Non-numeric: Display "Amount must be a valid number"
- Negative or zero: Display "Amount must be greater than 0"
- Exceeds 999,999.99: Display "Amount cannot exceed 999,999.99"

**Category Validation:**
- Not selected: Display "Please select a category"
- Invalid value: Display "Invalid category selected"

### Storage Errors

**localStorage Unavailable:**
- At startup: Display warning "Local storage is unavailable. Your data will not persist after closing the browser."
- During save: Display error "Failed to save data. Please try again."
- Recovery: Continue operating with in-memory storage only

**Corrupted Data:**
- At startup: Display error "Stored data is corrupted. Starting with empty data."
- Recovery: Initialize with empty transaction list and default preferences

**Chart.js CDN Failure:**
- Display error "Chart library failed to load. Chart visualization is disabled."
- Recovery: Disable chart display, maintain all other functionality

### Performance Monitoring

- Track operation timing for balance updates (target: < 100ms)
- Track operation timing for chart updates (target: < 500ms)
- Track operation timing for localStorage operations (target: < 100ms)
- Log warnings if operations exceed targets

## Testing Strategy

### Unit Tests (Example-Based)

**Input Validation:**
- Valid transaction with all fields
- Empty item name
- Whitespace-only item name
- Negative amount
- Zero amount
- Amount exceeding limit
- Invalid category
- Item name exceeding 100 characters

**Empty States:**
- Empty transaction list displays "No transactions yet" message
- Empty monthly summary displays "No expenses this month" message
- Empty chart displays "Add transactions to see spending breakdown" message

**Error Handling:**
- localStorage unavailable at startup
- localStorage corrupted at startup
- localStorage unavailable during save
- Chart.js CDN failure

**UI Interactions:**
- Theme toggle switches between light and dark
- Monthly summary view opens and closes
- Sort preference changes and persists
- Delete button removes transaction

### Property-Based Tests

**Transaction Management (100+ iterations each):**
- Property 1: Valid transaction addition
- Property 2: Invalid item name rejection
- Property 3: Invalid amount rejection
- Property 4: Category constraint enforcement
- Property 7: Transaction deletion

**Calculations (100+ iterations each):**
- Property 8: Balance calculation correctness
- Property 10: Category percentage calculation
- Property 12: Monthly category breakdown

**Sorting & Filtering (100+ iterations each):**
- Property 5: Reverse chronological ordering
- Property 13: Sort by amount (descending)
- Property 14: Sort by category (alphabetical)
- Property 11: Monthly filtering

**Persistence (100+ iterations each):**
- Property 15: Sort preference persistence
- Property 16: Theme preference persistence
- Property 17: Transaction persistence round-trip
- Property 18: User preferences serialization
- Property 23: Deletion persistence

**Formatting (100+ iterations each):**
- Property 6: Amount formatting
- Property 9: Balance display formatting

**Edge Cases (100+ iterations each):**
- Property 19: Zero balance for empty list
- Property 20: Zero percentage for zero category spending
- Property 21: Form clearing after submission
- Property 22: Unique transaction identifiers
- Property 24: Maximum transaction display
- Property 25: Timestamp preservation

### Integration Tests

**End-to-End Workflows:**
- Add transaction → verify in list, balance, chart, localStorage
- Delete transaction → verify removed from list, balance, chart, localStorage
- Switch theme → verify applied to all elements, persisted
- Change sort → verify list reordered, preference persisted
- View monthly summary → verify filtered data, return to main view
- Reload page → verify all data and preferences restored

**Performance Tests:**
- Add 1000 transactions → verify performance targets met
- Delete transaction from 1000-item list → verify performance targets met
- Render chart with 1000 transactions → verify performance targets met

**Responsive Design Tests:**
- Test at 320px, 768px, 1024px, 1920px widths
- Verify no horizontal scrolling
- Verify touch targets are 44x44px minimum
- Verify font sizes meet minimums
- Test orientation change

**Browser Compatibility Tests:**
- Chrome 120+
- Firefox 121+
- Edge 120+
- Safari 17+

## File Structure

```
project-root/
├── index.html              # HTML structure
├── css/
│   └── styles.css         # All styling
├── js/
│   └── app.js             # All JavaScript logic
└── .kiro/
    └── specs/
        └── expense-budget-visualizer/
            ├── requirements.md
            ├── design.md
            └── tasks.md
```

### HTML Structure (index.html)

- Semantic HTML5 elements: `<header>`, `<main>`, `<section>`, `<article>`, `<footer>`
- No inline CSS or JavaScript
- Chart.js loaded from CDN
- Viewport meta tag for mobile responsiveness

### CSS Structure (css/styles.css)

- CSS variables for theme colors (light/dark)
- Flexbox and CSS Grid for responsive layout
- Mobile-first approach
- Minimum font sizes: 14px body, 16px inputs
- Touch-friendly button sizes: 44x44px minimum
- Color contrast ratios: 4.5:1 for normal text, 3:1 for large text

### JavaScript Structure (js/app.js)

- Modular organization with clear separation of concerns
- No external dependencies except Chart.js
- Event listeners for user interactions
- localStorage operations with error handling
- DOM manipulation for rendering
- No inline event handlers in HTML

## Performance Considerations

### Optimization Strategies

1. **Lazy Rendering**: Only update DOM elements that changed
2. **Debouncing**: Debounce chart updates when multiple transactions change
3. **Efficient Sorting**: Use native Array.sort() with optimized comparators
4. **localStorage Batching**: Batch multiple updates into single save operation
5. **Chart Caching**: Reuse Chart.js instance, update data instead of recreating

### Performance Targets

- Initial page load: < 2 seconds
- Transaction add/delete: < 100ms for list and balance updates
- Chart update: < 500ms
- localStorage operations: < 100ms
- Theme toggle: < 200ms
- Monthly summary view switch: < 100ms

### Memory Management

- Limit transaction list to 1000 items in display
- Implement transaction cleanup for very old data (optional future feature)
- Avoid memory leaks in event listeners (use event delegation)
- Clean up Chart.js instance on view changes

## Browser Compatibility

### Supported Browsers

- Chrome 120+
- Firefox 121+
- Edge 120+
- Safari 17+

### Required Web APIs

- localStorage (with fallback to in-memory storage)
- DOM Level 3 Events
- ES6 JavaScript features (arrow functions, template literals, const/let)
- Fetch API (for Chart.js CDN loading)
- JSON (stringify/parse)

### Polyfills

- No polyfills required for supported browser versions
- Graceful degradation if localStorage unavailable

## Accessibility Considerations

### WCAG 2.1 Compliance

- **Color Contrast**: 4.5:1 for normal text, 3:1 for large text
- **Touch Targets**: 44x44px minimum for all interactive elements
- **Keyboard Navigation**: All controls operable via keyboard (Tab, Enter, Space)
- **Focus Indicators**: Visible focus states on all interactive elements
- **Semantic HTML**: Proper use of heading hierarchy, labels, and form elements
- **Error Messages**: Clear, descriptive error messages displayed inline
- **Theme Toggle**: Keyboard accessible (Enter/Space key)

### Accessibility Features

- Form labels associated with inputs via `<label>` elements
- ARIA labels for icon-only buttons
- Semantic HTML structure for screen readers
- High contrast theme option (dark mode)
- Readable typography with 1.5 line height

## Security Considerations

### Data Security

- All data stored locally in browser (no transmission to servers)
- No sensitive data (passwords, tokens) stored
- JSON serialization prevents code injection
- Input validation prevents malicious data entry

### XSS Prevention

- No use of `innerHTML` with user input
- Use `textContent` for displaying user-entered text
- Sanitize transaction data before display

### localStorage Security

- Data stored in localStorage is accessible to any script on the same origin
- No sensitive data stored
- Recommend HTTPS for deployment

## Future Enhancements

1. **Data Export**: Export transactions as CSV
2. **Budget Limits**: Set and track budget limits per category
3. **Recurring Transactions**: Support recurring expense entries
4. **Data Backup**: Cloud backup and sync
5. **Advanced Analytics**: Trend analysis, spending forecasts
6. **Multi-Currency**: Support for different currencies
7. **Categories Management**: Allow custom categories
8. **Receipt Upload**: Attach images to transactions
9. **Sharing**: Share expense reports with others
10. **Mobile App**: Native mobile application

## Deployment Considerations

### Hosting

- Static file hosting (GitHub Pages, Netlify, Vercel)
- No backend server required
- CDN for Chart.js library

### Build Process

- No build process required
- Direct deployment of HTML, CSS, JavaScript files
- Optional: Minification for production

### Monitoring

- Client-side error tracking (optional)
- Performance monitoring (optional)
- User analytics (optional, with privacy considerations)

