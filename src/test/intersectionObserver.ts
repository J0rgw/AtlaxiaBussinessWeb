import { vi } from "vitest";

type Callback = (entries: IntersectionObserverEntry[]) => void;

/**
 * Controllable IntersectionObserver for tests.
 * `setIntersecting(id, true)` reports that the element with that id crossed the root.
 */
export function mockIntersectionObserver() {
  const observers: Array<{
    callback: Callback;
    targets: Set<Element>;
    options?: IntersectionObserverInit;
  }> = [];

  class MockIntersectionObserver {
    private record: {
      callback: Callback;
      targets: Set<Element>;
      options?: IntersectionObserverInit;
    };
    constructor(callback: Callback, options?: IntersectionObserverInit) {
      this.record = { callback, targets: new Set(), options };
      observers.push(this.record);
    }
    observe(target: Element) {
      this.record.targets.add(target);
    }
    unobserve(target: Element) {
      this.record.targets.delete(target);
    }
    disconnect() {
      this.record.targets.clear();
    }
    takeRecords() {
      return [];
    }
  }

  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

  return {
    setIntersecting(id: string, isIntersecting: boolean) {
      for (const { callback, targets } of observers) {
        const target = Array.from(targets).find((el) => el.id === id);
        if (target) {
          callback([{ target, isIntersecting } as unknown as IntersectionObserverEntry]);
        }
      }
    },
    /** Options each observer was created with, in order. */
    options() {
      return observers.map((observer) => observer.options);
    },
    restore() {
      vi.unstubAllGlobals();
    },
  };
}
