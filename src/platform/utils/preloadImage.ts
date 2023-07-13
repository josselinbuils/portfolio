export async function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const image = new Image();
    image.src = src;
    image.onload = () => resolve();
    image.onerror = () => resolve(); // Preload should not be blocking
  });
}
