import '@testing-library/jest-dom';
import { vi } from 'vitest';
// Basic Tauri API shims to avoid runtime errors in jsdom tests
// Consumers can override in individual tests as needed.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
globalThis.__TAURI__ = globalThis.__TAURI__ || {
    invoke: vi.fn(),
    event: { listen: vi.fn(), emit: vi.fn() },
};
// ResizeObserver mock
class MockResizeObserver {
    constructor() {
        Object.defineProperty(this, "observe", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: vi.fn()
        });
        Object.defineProperty(this, "unobserve", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: vi.fn()
        });
        Object.defineProperty(this, "disconnect", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: vi.fn()
        });
    }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;
globalThis.ResizeObserver = globalThis.ResizeObserver || MockResizeObserver;
// IntersectionObserver mock
class MockIntersectionObserver {
    constructor(_, __) {
        Object.defineProperty(this, "observe", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: vi.fn()
        });
        Object.defineProperty(this, "unobserve", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: vi.fn()
        });
        Object.defineProperty(this, "disconnect", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: vi.fn()
        });
        Object.defineProperty(this, "takeRecords", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: vi.fn(() => [])
        });
    }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;
globalThis.IntersectionObserver = globalThis.IntersectionObserver || MockIntersectionObserver;
globalThis.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
});
