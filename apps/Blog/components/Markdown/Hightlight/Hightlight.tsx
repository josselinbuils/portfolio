import { FC, useEffect, useRef, useState } from 'react';
import { useLazy } from '~/platform/hooks/useLazy';
import { cancelable } from '~/platform/utils/cancelable';
import { highlightCode } from '~/platform/utils/highlightCode/highlightCode';

import styles from './Hightlight.module.scss';

export const Highlight: FC<Props> = ({ code, language }) => {
  const preElementRef = useRef<HTMLPreElement>(null);
  const { hasBeenDisplayed } = useLazy(preElementRef);
  const [markup, setMarkup] = useState(code);

  useEffect(() => {
    if (hasBeenDisplayed) {
      const [promise, cancel] = cancelable(highlightCode(code, language));
      promise.then(setMarkup);
      return cancel;
    }
  }, [code, hasBeenDisplayed, language]);

  return (
    <pre className={styles.highlight} ref={preElementRef}>
      <code dangerouslySetInnerHTML={{ __html: markup }} />
    </pre>
  );
};

interface Props {
  code: string;
  language: string;
}
