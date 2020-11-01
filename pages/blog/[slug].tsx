import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import { Post } from '~/apps/Blog/components/Post/Post';
import { BlogPost } from '~/apps/Blog/interfaces/BlogPost';
import { getBlogPost } from '~/apps/Blog/utils/getBlogPost';
import { getBlogPosts } from '~/apps/Blog/utils/getBlogPosts';

const PostPage: NextPage<Props> = ({ post }) => (
  <>
    <Head>
      <title>{post.title}</title>
      <meta name="description" content={post.description} />
      <link
        rel="preload"
        href="/JetBrainsMono-Regular.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
    </Head>
    <Post post={post} />
  </>
);

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: getBlogPosts().map(({ slug }) => ({ params: { slug } })),
  fallback: false,
});

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => ({
  props: { post: getBlogPost(params?.slug as string) },
});

export default PostPage;

interface Props {
  post: BlogPost;
}
