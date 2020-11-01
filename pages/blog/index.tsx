import { GetStaticProps, NextPage } from 'next';
import { Posts } from '~/apps/Blog/components/Posts/Posts';
import { getBlogPosts } from '~/apps/Blog/utils/getBlogPosts';
import { BlogPostMetadata } from '~/apps/Blog/interfaces/BlogPostMetadata';

const BlogPage: NextPage<Props> = ({ posts }) => <Posts posts={posts} />;

export const getStaticProps: GetStaticProps<Props> = async () => ({
  props: { posts: getBlogPosts().map(({ slug, title }) => ({ slug, title })) },
});

export default BlogPage;

interface Props {
  posts: BlogPostMetadata[];
}
