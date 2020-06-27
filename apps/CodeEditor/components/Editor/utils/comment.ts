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
  const firstLineOffset = getLineOffset(code, selection.start);
  const lastLineOffset = getLineOffset(code, selection.end);
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
      const correctedOffset = lineOffset - index * COMMENT.length;

      newCode = spliceString(
        newCode,
        correctedOffset + getLine(newCode, correctedOffset).indexOf(COMMENT),
        COMMENT.length
      );
    });

    return {
      code: newCode,
      selection: createSelection(
        selection.start - COMMENT.length,
        selection.end - COMMENT.length * lineOffsetsToUncomment.length
      ),
    };
  }

  const commentOffset = lineOffsets.reduce(
    (currentCommentOffset, lineOffset) => {
      const lineCommentOffset = Array.from(
        getLine(code, lineOffset)
      ).findIndex((char) => /\S/.test(char));

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
      selection.start + COMMENT.length,
      selection.end + COMMENT.length * lineOffsetsToComment.length
    ),
  };
}
