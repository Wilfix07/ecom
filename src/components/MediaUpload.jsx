import React, { useState } from 'react';
import { Upload, X, Image as ImageIcon, Video, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';

const MediaUpload = ({ productId, onMediaUpload, existingMedia = {} }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [previews, setPreviews] = useState({
    image_1: existingMedia.image_1 || '',
    image_2: existingMedia.image_2 || '',
    image_3: existingMedia.image_3 || '',
    video_url: existingMedia.video_url || ''
  });

  const handleFileUpload = async (file, fieldName) => {
    if (!file) return;

    try {
      setUploading(true);
      setUploadProgress({ ...uploadProgress, [fieldName]: 0 });

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('product-media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-media')
        .getPublicUrl(filePath);

      // Update preview
      setPreviews({ ...previews, [fieldName]: publicUrl });
      
      // Notify parent component
      if (onMediaUpload) {
        onMediaUpload(fieldName, publicUrl);
      }

      setUploadProgress({ ...uploadProgress, [fieldName]: 100 });
    } catch (error) {
      console.error('Error uploading file:', error);
      alert(`Erè nan chaje ${fieldName}`);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (fieldName) => {
    setPreviews({ ...previews, [fieldName]: '' });
    if (onMediaUpload) {
      onMediaUpload(fieldName, '');
    }
  };

  return (
    <div className="space-y-4">
      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Descriptions Pwodui
        </label>
        <textarea
          name="description"
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Dekri pwodui a an detay..."
        />
      </div>

      {/* Images */}
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((num) => {
          const fieldName = `image_${num}`;
          const hasImage = previews[fieldName];

          return (
            <div key={num} className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <label className="flex flex-col items-center justify-center cursor-pointer h-40 relative bg-gray-50 hover:bg-gray-100 transition-colors">
                {hasImage ? (
                  <div className="relative w-full h-full group">
                    <img 
                      src={hasImage} 
                      alt={`Product ${num}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleRemove(fieldName);
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <ImageIcon size={32} className="text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600 mb-1">Imaj {num}</span>
                    <Upload size={20} className="text-gray-400" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e.target.files[0], fieldName)}
                      className="hidden"
                      id={`image_${num}`}
                    />
                  </>
                )}
              </label>
              {uploadProgress[fieldName] && uploadProgress[fieldName] < 100 && (
                <div className="mt-2">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${uploadProgress[fieldName]}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Video */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Videyo Pwodui (YouTube URL ou fichier)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            name="video_url"
            value={previews.video_url}
            onChange={(e) => setPreviews({ ...previews, video_url: e.target.value })}
            placeholder="https://youtube.com/watch?v=... ou URL vidéo"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Video size={20} />
            Upload Fichier
          </button>
        </div>
      </div>
    </div>
  );
};

export default MediaUpload;

