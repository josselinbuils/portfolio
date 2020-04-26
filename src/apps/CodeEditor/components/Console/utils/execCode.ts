/* eslint-disable no-eval */
/* tslint:disable:no-eval */

export function execCode(code: string): void {
  if (code.length > 0) {
    try {
      console.log(eval(code) || 'undefined');
    } catch (error) {
      console.error(error);
    }
  }
}
