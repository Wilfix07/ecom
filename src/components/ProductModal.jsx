import React, { useState, useEffect, useRef } from 'react';
import { X, Upload } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ProductMediaUpload from './ProductMediaUpload';

const ProductModal = ({ product, onClose, onSave, categories = [] }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'Electronics',
    image: '📱',
    rating: '0',
    reviews: '0',
    stock: '0',
    sales: '0',
    discount: '0',
  });

  const [mediaData, setMediaData] = useState({
    description: '',
    image_1: '',
    image_2: '',
    image_3: '',
    video_url: ''
  });

  const isEditMode = !!product;
  const fileInputRef = useRef(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (file) => {
    if (!file) return;

    try {
      setUploadingImage(true);

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
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('product-media')
        .getPublicUrl(filePath);

      // Update form data with uploaded image URL
      setFormData({ ...formData, image: urlData.publicUrl });
      alert('Imaj chaje avèk siksè!');
    } catch (error) {
      alert(`Erè nan chaje imaj la: ${error.message}`);
    } finally {
      setUploadingImage(false);
    }
  };

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        price: product.price || '',
        category: product.category || 'Electronics',
        image: product.image || '📱',
        rating: product.rating || '0',
        reviews: product.reviews || '0',
        stock: product.stock || '0',
        sales: product.sales || '0',
        discount: product.discount || '0',
      });
      
      setMediaData({
        description: product.description || '',
        image_1: product.image_1 || '',
        image_2: product.image_2 || '',
        image_3: product.image_3 || '',
        video_url: product.video_url || ''
      });
    }
  }, [product]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const productData = {
      name: formData.name,
      price: parseFloat(formData.price),
      category: formData.category,
      image: formData.image,
      rating: parseFloat(formData.rating) || 0,
      reviews: parseInt(formData.reviews) || 0,
      stock: parseInt(formData.stock),
      sales: parseInt(formData.sales) || 0,
      discount: parseInt(formData.discount) || 0,
      description: mediaData.description,
      image_1: mediaData.image_1,
      image_2: mediaData.image_2,
      image_3: mediaData.image_3,
      video_url: mediaData.video_url,
    };

    onSave(productData);
  };

  const handleMediaChange = (field, value) => {
    setMediaData({ ...mediaData, [field]: value });
  };

  const emojis = ['📱', '💻', '⌚', '👕', '👟', '🎒', '🎧', '📷', '🎮', '🔊', '⌨️', '🖱️'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            {isEditMode ? 'Modifye Pwodui' : 'Ajoute Pwodui'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Name */}
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Non Pwodui *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ekzanp: Smartphone Samsung A54"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Pri (HTG) *
              </label>
              <input
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="12500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Kategori *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Electronics">Electronics</option>
                <option value="Fashion">Fashion</option>
                <option value="Shoes">Shoes</option>
                <option value="Home">Home</option>
                <option value="Beauty">Beauty</option>
                <option value="Sports">Sports</option>
              </select>
            </div>

            {/* Stock */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Stock *
              </label>
              <input
                type="number"
                required
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="50"
              />
            </div>

            {/* Discount */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Rabè (%) 
              </label>
              <input
                type="number"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="15"
                min="0"
                max="100"
              />
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Rating
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="4.5"
                min="0"
                max="5"
              />
            </div>

            {/* Reviews */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Revyè
              </label>
              <input
                type="number"
                value={formData.reviews}
                onChange={(e) => setFormData({ ...formData, reviews: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="234"
              />
            </div>

            {/* Sales */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Vant
              </label>
              <input
                type="number"
                value={formData.sales}
                onChange={(e) => setFormData({ ...formData, sales: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="145"
              />
            </div>

            {/* Image/Emoji ou URL */}
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Imaj (URL, Upload, ou Emoji) *
              </label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/image.jpg ou 📱"
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files[0]) {
                        handleImageUpload(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:bg-gray-400"
                  >
                    <Upload size={18} />
                    {uploadingImage ? 'Chajman...' : 'Upload'}
                  </button>
                  <div className="flex gap-1">
                    {emojis.slice(0, 2).map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setFormData({ ...formData, image: emoji })}
                        className="px-2 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-xl"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Preview */}
                {formData.image && formData.image.startsWith('http') && (
                  <div className="w-32 h-32 border-2 border-gray-300 rounded-lg overflow-hidden">
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Upload yon fichier, mete yon URL, oswa chwazi yon emoji
              </p>
            </div>
          </div>

          {/* Media Upload Section */}
          <ProductMediaUpload 
            onMediaChange={handleMediaChange}
            existingMedia={mediaData}
          />

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Anile
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isEditMode ? 'Sove Chanjman' : 'Ajoute Pwodui'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;

