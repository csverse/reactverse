// jsdom lacks these browser APIs that Mantine relies on.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  }),
});

class ResizeObserverStub {
  observe() {
    return undefined;
  }
  unobserve() {
    return undefined;
  }
  disconnect() {
    return undefined;
  }
}
(window as unknown as { ResizeObserver: unknown }).ResizeObserver =
  ResizeObserverStub;

window.HTMLElement.prototype.scrollIntoView = () => undefined;

// axe-core probes canvas support; jsdom has no canvas, so answer "not available" quietly.
HTMLCanvasElement.prototype.getContext = (() => null) as unknown as HTMLCanvasElement['getContext'];
