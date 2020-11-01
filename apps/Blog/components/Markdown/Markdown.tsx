import cn from 'classnames';
import Image from 'next/image';
import Link from 'next/link';
import { FC, ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Highlight } from './Hightlight/Hightlight';

import styles from './Markdown.module.scss';

const renderers = {
  code: ({ language, value }: { language: string; value: string }) => (
    <Highlight code={value} language={language} />
  ),
  image: ({ alt, src }: { alt: string; src: string }) => (
    <Image alt={alt} src={src} unsized />
  ),
  link: ({ children, href }: { children: ReactNode; href: string }) =>
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
