import { loadBlog } from './data';
import { BlogIndex, BlogNotFound, BlogPost } from './pages';

// Development preview of the blog. The published site serves the pages that
// `npm run build` pre-builds from the same components (see scripts/prerender-blog.mjs).
export async function renderBlog(reactRoot, slug) {
  const { shop, patterns, posts } = await loadBlog();
  const post = slug ? posts.find(item => item.slug === slug) : null;
  document.title = post ? `${post.seoTitle} — BelleBloomThreads` : 'The journal — BelleBloomThreads';
  if (slug && !post) reactRoot.render(<BlogNotFound root="/" shop={shop} />);
  else if (post) reactRoot.render(<BlogPost root="/" shop={shop} post={post} posts={posts} />);
  else reactRoot.render(<BlogIndex root="/" shop={shop} posts={posts} patterns={patterns} />);
}
