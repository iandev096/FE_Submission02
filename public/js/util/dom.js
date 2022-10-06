/**
 *
 * @param {string} tagName
 * @param {string} selector class or ID
 * @param {string} textContent
 */
export function createElem(tagName, selector = "", textContent) {
  const elem = document.createElement(tagName);
  const selectorIndicator = selector[0];

  const isClass = selectorIndicator === ".";
  const isID = selectorIndicator === "#";
  if (isClass) {
    elem.classList.add(selector.slice(1));
  } else if (isID) {
    elem.setAttribute("id", selector.slice(1));
  }

  if (textContent) {
    elem.textContent = textContent;
  }

  return elem;
}
