/* eslint-disable no-eval */
/* tslint:disable:no-eval */

export function execCode(code: string | undefined): void {
  if (code) {
    try {
      console.log(eval(code) || 'undefined');
    } catch (error) {
      console.error(error);
    }
  } else {
    console.log('No code to execute');
  }
}
