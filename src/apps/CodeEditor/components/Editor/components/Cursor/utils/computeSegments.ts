import { type Selection } from '@/apps/CodeEditor/interfaces/Selection';
import { type Position } from '@/platform/interfaces/Position';
import { getOffsetPosition } from '../../../utils/getOffsetPosition';

const END_LINE_SPACE_PX = 7;

export interface Segment extends Position<number> {
  width: number;
}

export function computeSegments(
  code: string,
  selection: Selection,
  parent: HTMLTextAreaElement,
): Segment[] {
  const segments: Segment[] = [];
  let segmentStartPosition: Position<number> | undefined;

  if (selection[1] !== selection[0]) {
    for (let offset = selection[0]; offset <= selection[1]; offset++) {
      const isLineEnd = code[offset] === '\n';
      const isLastOffset = offset === selection[1];

      if (segmentStartPosition === undefined) {
        segmentStartPosition = getOffsetPosition(code, parent, offset);
      }
      if (isLineEnd || isLastOffset) {
        segments.push({
          ...segmentStartPosition,
          width:
            getOffsetPosition(code, parent, offset).x -
            segmentStartPosition.x +
            (isLineEnd && !isLastOffset ? END_LINE_SPACE_PX : 0),
        });
        segmentStartPosition = undefined;
      }
    }
  }
  return segments;
}
