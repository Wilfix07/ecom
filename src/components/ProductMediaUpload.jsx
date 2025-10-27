import React, { useState } from 'react';
import { Upload, X, Image as ImageIcon, Video, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';

const ProductMediaUpload = ({ onMediaChange, existingMedia = {} }) => {
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState({
    description: existingMedia.description || '',
    image_1: existingMedia.image_1 || '',
    image_2: existingMedia.image_2 || '',
    image_3: existingMedia.image_3 || '',
    video_url: existingMedia.video_url || ''
  });

  const handleFileUpload = async (file, fieldName) => {
    if (!file) return;

    try {
      setUploading(true);
      console.log('Uploading file to Supabase Storage:', file.name);

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product-media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      console.log('Upload successful:', uploadData);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('product-media')
        .getPublicUrl(filePath);

      console.log('Public URL generated:', urlData.publicUrl);
      
      setPreviews({ ...previews, [fieldName]: urlData.publicUrl });
      
      if (onMediaChange) {
        onMediaChange(fieldName, urlData.publicUrl);
      }

      alert('Imaj chaje avèk siksè!');
    } catch (error) {
      console.error('Error uploading file:', error);
      alert(`Erè nan chaje ${fieldName}: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (fieldName) => {
    setPreviews({ ...previews, [fieldName]: '' });
    if (onMediaChange) {
      onMediaChange(fieldName, '');
    }
  };

  const handleUrlInput = (fieldName, value) => {
    setPreviews({ ...previews, [fieldName]: value });
    if (onMediaChange) {
      onMediaChange(fieldName, value);
    }
  };

  return (
    <div className="space-y-4 mt-6">
      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Descriptions Pwodui
        </label>
        <textarea
          value={previews.description}
          onChange={(e) => handleUrlInput('description', e.target.value)}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Dekri pwodui a an detay..."
        />
      </div>

      {/* Images */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Imaj Pwodui (3 imaj maksimòm)
        </label>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((num) => {
            const fieldName = `image_${num}`;
            const hasImage = previews[fieldName];

            return (
              <div key={num} className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                <label className="flex flex-col items-center justify-center cursor-pointer h-32 relative bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg border-2 border-dashed border-gray-300">
                  {hasImage ? (
                    <div className="relative w-full h-full group">
                      <img 
                        src={hasImage} 
                        alt={`Product ${num}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <div className="absolute top-2 right-2 flex gap-1">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            document.getElementById(`image_${num}`).click();
                          }}
                          className="bg-blue-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Changem imaj"
                        >
                          <Upload size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleRemove(fieldName);
                          }}
                          className="bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Efase"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <ImageIcon size={32} className="text-gray-400 mb-2" />
                      <span className="text-xs text-gray-600 mb-1">Imaj {num}</span>
                      <Upload size={16} className="text-gray-400" />
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
                <div className="mt-2">
                  <label className="block text-xs text-gray-500 mb-1">ou</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={hasImage || ''}
                      onChange={(e) => handleUrlInput(fieldName, e.target.value)}
                      placeholder={`URL imaj ${num}`}
                      disabled={uploading}
                      className="flex-1 text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    />
                    {uploading && (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Video */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Videyo Pwodui
        </label>
        <input
          type="url"
          value={previews.video_url}
          onChange={(e) => handleUrlInput('video_url', e.target.value)}
          placeholder="https://youtube.com/watch?v=... ou URL lòt videyo"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-1">
          Mete URL videyo YouTube oswa lòt platfòm
        </p>
      </div>
    </div>
  );
};

export default ProductMediaUpload;

