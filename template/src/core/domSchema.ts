/** Unified type for HTML and SVG elements. */
export type DOMElement =
  HTMLElement |
  SVGElement;

/** 
 * Unified type for either a pointer event or a mouse event, with support for both
 * React synthetic events and native DOM events.
 */
export type PointerEventLike<T extends Element = Element> =
  PointerEvent |
  MouseEvent |
  React.PointerEvent<T> |
  React.MouseEvent<T>;

/** 
 * Represents an actual DOM element or some sort of supported reference to it, like a React ref or a RefProxy.
 */
export type DOMTarget<T extends Element = Element> =
  T |
  React.RefObject<T>;