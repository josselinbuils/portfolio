import { checkTypes } from './checkTypes';
import { createLanguageService } from './createLanguageService';

onmessage = ({ data }) => {
  const { action, args, uuid } = data;

  switch (action) {
    case 'checkTypes':
      postMessage({ result: checkTypes(args[0]), uuid });
      break;

    case 'transpile':
      postMessage({ result: createLanguageService(args[0]).transpile(), uuid });
      break;

    default:
      console.error(`Unknown action: ${action}.`);
      break;
  }
};
