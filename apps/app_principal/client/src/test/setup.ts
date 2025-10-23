// Polyfill for PointerEvent and hasPointerCapture for Radix UI components in JSDOM
if (!global.PointerEvent) {
  class PointerEvent extends MouseEvent {
    constructor(type: string, params: PointerEventInit) {
      super(type, params);
    }
  }
  global.PointerEvent = PointerEvent as any;
}

if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false;
}

// Polyfill for scrollIntoView
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}

import '@testing-library/jest-dom';