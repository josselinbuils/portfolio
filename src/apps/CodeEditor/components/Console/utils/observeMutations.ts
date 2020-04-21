export function observeMutations(
  element: HTMLElement,
  callback: () => void
): () => void {
  const observer = new MutationObserver(callback);

  observer.observe(element, {
    childList: true,
    subtree: true,
  });

  return () => observer.disconnect();
}
