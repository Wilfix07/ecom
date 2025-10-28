import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Save, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Card } from './ui/card';

const BlogManagement = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    featured_image: '',
    status: 'draft'
  });

  useEffect(() => {
    if (user) {
      loadPosts();
    }
  }, [user]);

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Auto-generate slug from title
    if (name === 'title') {
      setFormData(prev => ({
        ...prev,
        title: value,
        slug: editingPost ? prev.slug : generateSlug(value)
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const postData = {
        ...formData,
        author_id: user.id,
        published_at: formData.status === 'published' ? new Date().toISOString() : null
      };

      if (editingPost) {
        const { error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', editingPost.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('blog_posts')
          .insert([postData]);

        if (error) throw error;
      }

      setShowModal(false);
      setEditingPost(null);
      setFormData({
        title: '',
        slug: '',
        content: '',
        excerpt: '',
        featured_image: '',
        status: 'draft'
      });
      loadPosts();
    } catch (error) {
      console.error('Error saving post:', error);
      alert('Erè nan sèvi post lan');
    }
  };

  const handleDelete = async (postId) => {
    if (!confirm('Eske ou sèten ou vle efase post sa?')) return;

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;
      loadPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const openEditModal = (post) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt,
      featured_image: post.featured_image,
      status: post.status
    });
    setShowModal(true);
  };

  if (!user) {
    return (
      <div className="p-8 text-center">
        <p>Tanpri konekte pou wè paj sa.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Jesyon Blog</h1>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={20} className="mr-2" />
          Nouvo Post
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">Chaje...</div>
      ) : (
        <div className="grid gap-4">
          {posts.map(post => (
            <Card key={post.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{post.title}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(post.created_at).toLocaleDateString('ht-HT')} 
                    {' • '}
                    Status: {post.status}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                  >
                    <Eye size={16} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(post)}
                  >
                    <Edit size={16} />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(post.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">
                  {editingPost ? 'Modifye Post' : 'Nouvo Post'}
                </h2>
                <Button variant="ghost" onClick={() => {
                  setShowModal(false);
                  setEditingPost(null);
                }}>
                  <X size={20} />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Tit</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">Slug (URL)</label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">Imaj Prensipal</label>
                  <input
                    type="url"
                    name="featured_image"
                    value={formData.featured_image}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">Rezime</label>
                  <textarea
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="Yon kout rezime..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">Kontni</label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    rows={10}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Publishe</option>
                    <option value="archived">Archive</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <Button type="submit">
                    <Save size={18} className="mr-2" />
                    Sere
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowModal(false);
                      setEditingPost(null);
                    }}
                  >
                    Anile
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default BlogManagement;

