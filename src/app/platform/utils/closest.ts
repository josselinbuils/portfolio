/**
 * Gets the first element that matches the selector by testing the element itself and traversing up through its
 * ancestors in the DOM tree.
 *
 * @see {@link https://api.jquery.com/closest|jQuery documentation}
 *
 * @param element Element to check first
 * @param selector Selector to find
 * @returns Element if found, null otherwise
 */
export function closest(
  element: HTMLElement,
  selector: string
): HTMLElement | undefined {
  let closestElement: HTMLElement | null = element;

  do {
    if (closestElement.matches(selector)) {
      return closestElement;
    }
    closestElement = closestElement.parentElement;
  } while (closestElement !== null);

  return undefined;
}
