import React from 'react';
import { Calendar, User, Eye, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from './ui/card';

const BlogPostCard = ({ post }) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Featured Image */}
      {post.featured_image && (
        <Link to={`/blog/${post.slug}`}>
          <div className="w-full h-48 bg-gray-100 overflow-hidden">
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/800x400?text=Blog+Post';
              }}
            />
          </div>
        </Link>
      )}

      {/* Content */}
      <div className="p-6">
        {/* Meta Info */}
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            <span>{new Date(post.published_at || post.created_at).toLocaleDateString('ht-HT')}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye size={14} />
            <span>{post.views || 0} vwè</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare size={14} />
            <span>{post.comment_count || 0}</span>
          </div>
        </div>

        {/* Title */}
        <Link to={`/blog/${post.slug}`}>
          <h2 className="text-xl font-bold mb-2 hover:text-blue-600 transition-colors">
            {post.title}
          </h2>
        </Link>

        {/* Excerpt */}
        <p className="text-gray-600 mb-4 line-clamp-3">
          {post.excerpt}
        </p>

        {/* Read More */}
        <Link
          to={`/blog/${post.slug}`}
          className="text-blue-600 hover:text-blue-700 font-semibold"
        >
          Li plis →
        </Link>
      </div>
    </Card>
  );
};

export default BlogPostCard;

