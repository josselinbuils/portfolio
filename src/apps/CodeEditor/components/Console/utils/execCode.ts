export function execCode(code: string): void {
  if (code.length > 0) {
    try {
      console.log(window.eval(code));
    } catch (error) {
      console.error(error);
    }
  }
}
