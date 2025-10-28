import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, ThumbsDown, User, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Button } from './ui/button';
import { Card } from './ui/card';

const ProductReviews = ({ productId }) => {
  const { user, profile } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    comment: ''
  });

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!user) {
      alert('Tanpri konekte pou lage yon avi');
      return;
    }

    if (!reviewForm.title.trim() || !reviewForm.comment.trim()) {
      alert('Tanpri ranpli tout chan yo');
      return;
    }

    try {
      if (editingReview) {
        // Update existing review
        const { error } = await supabase
          .from('reviews')
          .update({
            rating: reviewForm.rating,
            title: reviewForm.title,
            comment: reviewForm.comment,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingReview.id);

        if (error) throw error;
      } else {
        // Create new review
        const { error } = await supabase
          .from('reviews')
          .insert([{
            product_id: productId,
            user_id: user.id,
            rating: reviewForm.rating,
            title: reviewForm.title,
            comment: reviewForm.comment
          }]);

        if (error && error.code !== '23505') throw error; // Ignore duplicate error
      }

      alert(editingReview ? 'Avi mete ajou!' : 'Avi ou lage!');
      setShowReviewForm(false);
      setEditingReview(null);
      setReviewForm({ rating: 5, title: '', comment: '' });
      fetchReviews();
    } catch (error) {
      alert(`Erè: ${error.message}`);
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setReviewForm({
      rating: review.rating,
      title: review.title || '',
      comment: review.comment || ''
    });
    setShowReviewForm(true);
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Ou sèten ou vle efase avi sa?')) return;

    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;

      alert('Avi efase!');
      fetchReviews();
    } catch (error) {
      alert(`Erè: ${error.message}`);
    }
  };

  const toggleHelpful = async (reviewId) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ helpful_count: reviews.find(r => r.id === reviewId).helpful_count + 1 })
        .eq('id', reviewId);

      if (error) throw error;
      fetchReviews();
    } catch (error) {
      console.error('Error toggling helpful:', error);
    }
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  const userReview = reviews.find(r => r.user_id === user?.id);

  if (loading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Average Rating */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="flex items-center gap-4">
          <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
          <div>
            <div className="flex items-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={24}
                  className={i < Math.floor(averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                />
              ))}
            </div>
            <p className="text-sm text-gray-600">
              Baz sou {reviews.length} avi
            </p>
          </div>
        </div>
      </div>

      {/* Review Form */}
      {user && !userReview && !showReviewForm && (
        <Button onClick={() => setShowReviewForm(true)}>
          Ekri Yon Avi
        </Button>
      )}

      {showReviewForm && (
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">
            {editingReview ? 'Modifye Avi Ou' : 'Ekri Yon Avi'}
          </h3>

          {/* Rating */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setReviewForm({...reviewForm, rating})}
                  className={`p-2 rounded ${
                    reviewForm.rating >= rating
                      ? 'bg-yellow-400 text-white'
                      : 'bg-gray-200'
                  }`}
                >
                  <Star size={20} className={reviewForm.rating >= rating ? 'fill-current' : ''} />
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Tit</label>
            <input
              type="text"
              value={reviewForm.title}
              onChange={(e) => setReviewForm({...reviewForm, title: e.target.value})}
              placeholder="Tit avi ou"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          {/* Comment */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Kòmantè</label>
            <textarea
              value={reviewForm.comment}
              onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
              placeholder="Sere kòmantè ou..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button onClick={handleSubmitReview}>
              {editingReview ? 'Mete Ajou' : 'Pibliye'}
            </Button>
            <Button variant="outline" onClick={() => {
              setShowReviewForm(false);
              setEditingReview(null);
              setReviewForm({ rating: 5, title: '', comment: '' });
            }}>
              Anile
            </Button>
          </div>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map(review => (
          <Card key={review.id} className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <User size={20} className="text-gray-400" />
                <span className="font-medium">Itilizatè</span>
              </div>
              <div className="flex gap-2">
                {/* Stars */}
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                    />
                  ))}
                </div>
              </div>
            </div>

            <h4 className="font-semibold mb-2">{review.title}</h4>
            <p className="text-gray-700 mb-3">{review.comment}</p>

            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>{new Date(review.created_at).toLocaleDateString()}</span>
              <div className="flex gap-4">
                <button
                  onClick={() => toggleHelpful(review.id)}
                  className="flex items-center gap-1 hover:text-blue-600"
                >
                  <ThumbsUp size={16} />
                  <span>{review.helpful_count}</span>
                </button>

                {user && review.user_id === user.id && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditReview(review)}
                      className="hover:text-blue-600"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      className="hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {reviews.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          Pa gen avi pòko. Se ou an premye!
        </div>
      )}
    </div>
  );
};

export default ProductReviews;

