import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Basic Tauri API shims to avoid runtime errors in jsdom tests
// Consumers can override in individual tests as needed.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).__TAURI__ = (globalThis as any).__TAURI__ || {
  invoke: vi.fn(),
  event: { listen: vi.fn(), emit: vi.fn() },
}

// ResizeObserver mock
class MockResizeObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(globalThis as any).ResizeObserver = (globalThis as any).ResizeObserver || MockResizeObserver

// IntersectionObserver mock
class MockIntersectionObserver {
  constructor(_: unknown, __?: unknown) {}
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
  takeRecords = vi.fn(() => [])
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(globalThis as any).IntersectionObserver = (globalThis as any).IntersectionObserver || MockIntersectionObserver

// MatchMedia mock (used by some UI libs)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(globalThis as any).matchMedia = (query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
})

