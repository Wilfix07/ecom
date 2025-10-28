import React from 'react';
import { Facebook, Twitter, Instagram, Share2, Linkedin } from 'lucide-react';

const SocialShare = ({ url, title, description, image }) => {
  const encodedUrl = encodeURIComponent(url || window.location.href);
  const encodedTitle = encodeURIComponent(title || '');
  const encodedDescription = encodeURIComponent(description || '');
  const encodedImage = encodeURIComponent(image || '');

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%20${encodedUrl}`
  };

  const handleShare = (platform) => {
    if (platform === 'facebook') {
      window.open(shareLinks.facebook, '_blank', 'width=600,height=400');
    } else if (platform === 'twitter') {
      window.open(shareLinks.twitter, '_blank', 'width=600,height=400');
    } else if (platform === 'linkedin') {
      window.open(shareLinks.linkedin, '_blank', 'width=600,height=400');
    } else if (platform === 'whatsapp') {
      window.open(shareLinks.whatsapp, '_blank');
    } else if (platform === 'email') {
      window.location.href = shareLinks.email;
    }
  };

  // Native Web Share API
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm font-semibold mr-2">Pataje:</span>
      
      {/* Facebook */}
      <button
        onClick={() => handleShare('facebook')}
        className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        aria-label="Share on Facebook"
      >
        <Facebook size={20} />
      </button>

      {/* Twitter/X */}
      <button
        onClick={() => handleShare('twitter')}
        className="p-2 rounded-full bg-black text-white hover:bg-gray-800 transition-colors"
        aria-label="Share on Twitter"
      >
        <Twitter size={20} />
      </button>

      {/* LinkedIn */}
      <button
        onClick={() => handleShare('linkedin')}
        className="p-2 rounded-full bg-blue-700 text-white hover:bg-blue-800 transition-colors"
        aria-label="Share on LinkedIn"
      >
        <Linkedin size={20} />
      </button>

      {/* WhatsApp */}
      <button
        onClick={() => handleShare('whatsapp')}
        className="p-2 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors"
        aria-label="Share on WhatsApp"
      >
        <Instagram size={20} />
      </button>

      {/* Email */}
      <button
        onClick={() => handleShare('email')}
        className="p-2 rounded-full bg-gray-600 text-white hover:bg-gray-700 transition-colors"
        aria-label="Share via Email"
      >
        <Share2 size={20} />
      </button>

      {/* Native Share (Mobile) */}
      {navigator.share && (
        <button
          onClick={handleNativeShare}
          className="p-2 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-colors"
          aria-label="Share"
        >
          <Share2 size={20} />
        </button>
      )}
    </div>
  );
};

export default SocialShare;

