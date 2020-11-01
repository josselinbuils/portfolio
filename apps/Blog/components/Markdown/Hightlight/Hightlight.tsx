import { FC, useEffect, useState } from 'react';
import { cancelable } from '~/platform/utils/cancelable';
import { highlightCode } from '~/platform/utils/highlightCode/highlightCode';

import styles from './Hightlight.module.scss';

export const Highlight: FC<Props> = ({ code, language }) => {
  const [markup, setMarkup] = useState(code);

  useEffect(() => {
    const [promise, cancel] = cancelable(highlightCode(code, language));
    promise.then(setMarkup);
    return cancel;
  }, [code, language]);

  return (
    <pre className={styles.highlight}>
      <code dangerouslySetInnerHTML={{ __html: markup }} />
    </pre>
  );
};

interface Props {
  code: string;
  language: string;
}
