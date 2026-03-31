import '@testing-library/jest-dom';

// Prevent error "Not implemented: window.scrollTo" from jsdom
if (typeof window !== 'undefined') {
  Object.defineProperty(global.window, 'scrollTo', { value: jest.fn() });
}
