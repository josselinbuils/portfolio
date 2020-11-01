import { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import { Posts } from '~/apps/Blog/components/Posts/Posts';
import { getBlogPosts } from '~/apps/Blog/utils/getBlogPosts';
import { BlogPostMetadata } from '~/apps/Blog/interfaces/BlogPostMetadata';

const BlogPage: NextPage<Props> = ({ posts }) => (
  <>
    <Head>
      <title>Opinionated</title>
      <meta
        name="description"
        content="Hey, I'm Josselin, a full-stack JavaScript developer 😄 Here are some posts where I give my opinion on code stuff 👨‍💻"
      />
    </Head>
    <Posts posts={posts} />
  </>
);

export const getStaticProps: GetStaticProps<Props> = async () => ({
  props: { posts: getBlogPosts() },
});

export default BlogPage;

interface Props {
  posts: BlogPostMetadata[];
}
