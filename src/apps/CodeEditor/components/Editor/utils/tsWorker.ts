import { checkTypes } from '@/apps/CodeEditor/components/Editor/utils/checkTypes';

onmessage = ({ data }) => {
  const { code } = data;
  postMessage({ lintIssues: checkTypes(code) });
};
