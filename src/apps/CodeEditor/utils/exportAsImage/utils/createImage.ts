export async function createImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);

    image.onerror = () =>
      reject(new Error('Unable to generate image from svg'));

    image.src = src;
  });
}
