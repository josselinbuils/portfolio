import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Blog, { BlogProps } from '~/apps/Blog/Blog';
import { BlogDescriptor } from '~/apps/Blog/BlogDescriptor';
import { Home } from '~/platform/components/Home';
import { InjectorProvider } from '~/platform/providers/InjectorProvider/InjectorProvider';
import {
  DefaultApp,
  WindowManager,
} from '~/platform/services/WindowManager/WindowManager';
import { BlogArticle } from '~/apps/Blog/interfaces/BlogArticle';

const Article: NextPage<Props> = ({ article }) => {
  WindowManager.defaultApp = {
    appDescriptor: BlogDescriptor,
    windowComponent: Blog,
    windowProps: {
      article,
      startMaximized: true,
    },
  } as DefaultApp<BlogProps>;

  return (
    <InjectorProvider>
      <Home />
    </InjectorProvider>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  const articleSlugs = require
    .context('~/apps/Blog/posts', false, /\.md$/)
    .keys()
    .map((key) => key.replace(/^.*[\\/]/g, '').slice(0, -3));

  return {
    paths: articleSlugs.map((slug) => ({ params: { slug } })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const slug = params?.slug as string;
  const content = (await import(`~/apps/Blog/posts/${slug}.md`)).default;

  return {
    props: {
      article: { content, slug },
    },
  };
};

export default Article;

interface Props {
  article: BlogArticle;
}
