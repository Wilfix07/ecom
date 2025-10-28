import React, { useState, useEffect } from 'react';
import { Search, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import BlogPostCard from './BlogPostCard';
import SEO from './SEO';
import SocialShare from './SocialShare';

const BlogPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*, blog_comments(count)')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (error) throw error;
      
      // Add comment count to each post
      const postsWithCounts = (data || []).map(post => ({
        ...post,
        comment_count: post.blog_comments?.[0]?.count || 0
      }));
      
      setPosts(postsWithCounts);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <SEO
        title="Blog - TechMart Haiti"
        description="Li dènye nouvèl, konsey, ak gran nouvèl TechMart Haiti"
        keywords="blog, artik, nouvèl, techmart, haiti"
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Blog Nou</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Dekouvri dènye nouvèl, konsey ak infòmasyon itil sou pwodwi ak sèvis nou yo
          </p>
        </div>

        {/* Search */}
        <div className="mb-8 max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Chèche nan blog..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Posts Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Pa gen artik pou kounye a</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map(post => (
              <BlogPostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default BlogPage;

