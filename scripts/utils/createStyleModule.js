export default function createStyleModule(cssVariableName, id) {
  return `\
import styleInject from '@/platform/utils/injectStyles';

export const ssrStyleSheet = { id: '${id}', css: ${cssVariableName} };

if (typeof window !== 'undefined') {
  styleInject(${cssVariableName});
}`;
}
