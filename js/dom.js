/**
 * Minimal DOM helper.
 *
 * `el(tag, props, ...children)` creates an element, applies a small set of
 * props and appends children. Text is ALWAYS inserted via textContent (or
 * createTextNode for string children) — never innerHTML — so any string that
 * originates from LocalStorage, an import or user input stays inert.
 *
 * @param {string} tag
 * @param {{class?: string, text?: string, title?: string, onclick?: function, attrs?: Record<string, string>}} [props]
 * @param {...(Node|string|number)} children
 * @returns {HTMLElement}
 */
export function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);

  if (props.class) {
    node.className = props.class;
  }
  if (props.text !== undefined && props.text !== null) {
    node.textContent = props.text;
  }
  if (props.title !== undefined && props.title !== null) {
    node.title = props.title;
  }
  if (typeof props.onclick === "function") {
    node.onclick = props.onclick;
  }
  if (props.attrs) {
    for (const [key, value] of Object.entries(props.attrs)) {
      if (value !== undefined && value !== null) {
        node.setAttribute(key, value);
      }
    }
  }

  for (const child of children) {
    if (child === undefined || child === null) {
      continue;
    }
    node.appendChild(
      typeof child === "string" || typeof child === "number"
        ? document.createTextNode(String(child))
        : child
    );
  }

  return node;
}
