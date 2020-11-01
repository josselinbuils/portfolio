import cn from 'classnames';
import Link from 'next/link';
import { FC } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import styles from './Markdown.module.scss';

const renderers = {
  link: ({ href, children }: any) =>
    href.startsWith('/') ? (
      <Link href={href}>
        <a>{children}</a>
      </Link>
    ) : (
      <a href={href}>{children}</a>
    ),
};

export const Markdown: FC<Props> = ({
  children,
  className,
  tag: MarkdownTag = 'div',
  ...forwardedProps
}) => (
  <MarkdownTag className={cn(styles.markdown, className)}>
    <ReactMarkdown
      plugins={[remarkGfm]}
      renderers={renderers}
      source={children as string}
      {...forwardedProps}
    />
  </MarkdownTag>
);

interface Props {
  className?: string;
  tag?: keyof JSX.IntrinsicElements;
}
