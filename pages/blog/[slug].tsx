import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import { Post } from '~/apps/Blog/components/Post/Post';
import { BlogPost } from '~/apps/Blog/interfaces/BlogPost';
import { getBlogPost } from '~/apps/Blog/utils/getBlogPost';
import { getBlogPosts } from '~/apps/Blog/utils/getBlogPosts';

const PostPage: NextPage<Props> = ({ post }) => <Post post={post} />;

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
