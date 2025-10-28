import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, User, Eye, ArrowLeft, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Card } from './ui/card';
import SEO from './SEO';
import SocialShare from './SocialShare';

const BlogDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPost();
  }, [slug]);

  useEffect(() => {
    if (post?.id) {
      loadComments();
      incrementViews();
    }
  }, [post]);

  const loadPost = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      setPost(data);
    } catch (error) {
      console.error('Error loading post:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_comments')
        .select('*')
        .eq('post_id', post.id)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const incrementViews = async () => {
    try {
      await supabase.rpc('increment', {
        row_id: post.id,
        view_count: 1
      });
    } catch (error) {
      // Fallback if increment function doesn't exist
      await supabase
        .from('blog_posts')
        .update({ views: post.views + 1 })
        .eq('id', post.id);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Tanpri konekte pou komante');
      return;
    }
    if (!newComment.trim()) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('blog_comments')
        .insert([{
          post_id: post.id,
          user_id: user.id,
          content: newComment,
          is_approved: true
        }]);

      if (error) throw error;
      
      setNewComment('');
      loadComments();
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Erè nan sèvi kòmantè a');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <p>Post pa jwenn</p>
        <Button onClick={() => navigate('/blog')} className="mt-4">
          <ArrowLeft size={18} className="mr-2" />
          Retounen nan Blog
        </Button>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={post.title}
        description={post.excerpt}
        ogImage={post.featured_image}
        canonicalUrl={`/blog/${post.slug}`}
        schemaMarkup={{
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.title,
          description: post.excerpt,
          image: post.featured_image,
          datePublished: post.published_at,
          dateModified: post.updated_at,
          author: {
            '@type': 'Organization',
            name: 'TechMart Haiti'
          }
        }}
      />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/blog')}
          className="mb-6"
        >
          <ArrowLeft size={18} className="mr-2" />
          Retounen
        </Button>

        {/* Featured Image */}
        {post.featured_image && (
          <div className="w-full h-96 bg-gray-100 rounded-lg overflow-hidden mb-8">
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/800x400?text=Blog+Post';
              }}
            />
          </div>
        )}

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            <div className="flex items-center gap-1">
              <Calendar size={16} />
              <span>{new Date(post.published_at || post.created_at).toLocaleDateString('ht-HT')}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye size={16} />
              <span>{post.views || 0} vwè</span>
            </div>
          </div>

          {/* Social Share */}
          <SocialShare
            url={`https://techmart-haiti.com/blog/${post.slug}`}
            title={post.title}
            description={post.excerpt}
            image={post.featured_image}
          />
        </div>

        {/* Content */}
        <div className="prose max-w-none mb-12">
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>

        {/* Comments Section */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Kòmantè ({comments.length})</h2>

          {/* Comment Form */}
          {user ? (
            <form onSubmit={handleSubmitComment} className="mb-8">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Kite yon kòmantè..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2"
                required
              />
              <Button type="submit" disabled={saving}>
                <Send size={18} className="mr-2" />
                {saving ? 'Sèvi...' : 'Pòte'}
              </Button>
            </form>
          ) : (
            <div className="mb-8 p-4 bg-blue-50 rounded-lg text-center">
              <p>Tanpri konekte pou kite yon kòmantè</p>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {comments.map(comment => (
              <div key={comment.id} className="border-b pb-4 last:border-0">
                <div className="flex items-center gap-2 mb-2">
                  <User size={16} className="text-gray-500" />
                  <span className="font-semibold">Itilizatè</span>
                  <span className="text-sm text-gray-500">
                    {new Date(comment.created_at).toLocaleDateString('ht-HT')}
                  </span>
                </div>
                <p className="text-gray-700">{comment.content}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
};

export default BlogDetail;

