// Mock Chart.js for testing
global.Chart = jest.fn(() => ({
    data: { labels: [], datasets: [] },
    update: jest.fn()
}));

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
};

global.localStorage = localStorageMock;
