import { EditableState } from '../../../interfaces/EditableState';
import { Selection } from '../../../interfaces/Selection';
import { createSelection } from '../../../utils/createSelection';
import { spliceString } from '../../../utils/spliceString';
import { getLine } from './getLine';
import { getLineOffset } from './getLineOffset';

const COMMENT = '// ';

export function comment(
  code: string,
  selection: Selection
): EditableState | undefined {
  const firstLineOffset = getLineOffset(code, selection[0]);
  const lastLineOffset = getLineOffset(code, selection[1]);
  const lineOffsets = [] as number[];
  let newCode = code;

  for (let i = firstLineOffset; i <= lastLineOffset; i++) {
    const lineOffset = getLineOffset(code, i);

    if (!lineOffsets.includes(lineOffset)) {
      lineOffsets.push(lineOffset);
    }
  }

  const uncomment = lineOffsets.every((offset) =>
    /^((\s*\/\/.*)|(\s*))$/.test(getLine(code, offset))
  );

  if (uncomment) {
    const lineOffsetsToUncomment = lineOffsets.filter(
      (offset) => !/^\s*$/.test(getLine(code, offset))
    );

    lineOffsetsToUncomment.forEach((lineOffset, index) => {
      const correctedLineOffset = lineOffset - index * COMMENT.length;
      const lineCommentOffset = getLine(newCode, correctedLineOffset).indexOf(
        COMMENT
      );

      newCode = spliceString(
        newCode,
        correctedLineOffset + lineCommentOffset,
        COMMENT.length
      );
    });

    const firstLineCommentOffset = getLine(code, firstLineOffset).indexOf(
      COMMENT
    );

    return {
      code: newCode,
      selection: createSelection(
        selection[0] <= firstLineOffset + firstLineCommentOffset
          ? selection[0]
          : selection[0] - COMMENT.length,
        selection[1] - COMMENT.length * lineOffsetsToUncomment.length
      ),
    };
  }

  const commentOffset = lineOffsets.reduce(
    (currentCommentOffset, lineOffset) => {
      const lineCommentOffset = Array.from(getLine(code, lineOffset)).findIndex(
        (char) => /\S/.test(char)
      );

      return lineCommentOffset >= 0
        ? Math.min(currentCommentOffset, lineCommentOffset)
        : currentCommentOffset;
    },
    Number.MAX_SAFE_INTEGER
  );

  if (commentOffset === Number.MAX_SAFE_INTEGER) {
    return undefined;
  }

  const lineOffsetsToComment = lineOffsets.filter((offset) => {
    const line = getLine(code, offset);
    return line.length >= commentOffset && !/^\s*$/.test(line);
  });

  lineOffsetsToComment.forEach((lineOffset, index) => {
    newCode = spliceString(
      newCode,
      lineOffset + commentOffset + index * COMMENT.length,
      0,
      COMMENT
    );
  });

  return {
    code: newCode,
    selection: createSelection(
      selection[0] <= firstLineOffset + commentOffset
        ? selection[0]
        : selection[0] + COMMENT.length,
      selection[1] + COMMENT.length * lineOffsetsToComment.length
    ),
  };
}
