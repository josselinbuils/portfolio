import ReactMarkdown from 'react-markdown';
import { Window } from '~/platform/components/Window/Window';
import { WindowComponent } from '~/platform/components/Window/WindowComponent';
import { BlogDescriptor } from './BlogDescriptor';
import { BlogArticle } from '~/apps/Blog/interfaces/BlogArticle';

const Blog: WindowComponent<BlogProps> = ({
  article,
  windowRef,
  ...injectedWindowProps
}) => (
  <Window
    background="#fbfbfb"
    minHeight={600}
    minWidth={800}
    ref={windowRef}
    startMaximized
    title={BlogDescriptor.appName}
    titleColor="black"
    {...injectedWindowProps}
  >
    <>
      Hello {article?.slug}
      <ReactMarkdown source={article?.content || ''} />
    </>
  </Window>
);

export default Blog;

export interface BlogProps {
  article?: BlogArticle;
}
