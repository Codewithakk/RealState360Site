import React, { useEffect, useState, useRef } from 'react';
import { api } from '../api/client';
import { Plus, Edit, Trash2, Eye, X, Upload, Image as ImageIcon } from 'lucide-react';
import type { House } from '../types';
const BASE_URL = 'http://localhost:5000';

const getImageUrl = (path?: string) => {
  if (!path) {
    return 'https://via.placeholder.com/400x300?text=No+Image';
  }

  // If it's already a full URL
  if (path.startsWith('http')) return path;

  // Clean path and add BASE_URL
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_URL}${cleanPath}`;
};

export default function Houses() {
  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingHouse, setEditingHouse] = useState<House | null>(null);
  
  // File refs
  const coverImageRef = useRef<HTMLInputElement>(null);
  const additionalImagesRef = useRef<HTMLInputElement>(null);
  const galleryImagesRef = useRef<HTMLInputElement>(null);
  
  // Selected files state
  const [selectedCoverFile, setSelectedCoverFile] = useState<File | null>(null);
  const [selectedAdditionalFiles, setSelectedAdditionalFiles] = useState<File[]>([]);
  const [selectedGalleryFiles, setSelectedGalleryFiles] = useState<File[]>([]);
  
  // Feature input state
  const [newFeatureInput, setNewFeatureInput] = useState('');
  
  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    location: '',
    price: '',
    bedrooms: 0,
    bathrooms: 0,
    area: '',
    year: '',
    description: '',
    longDescription: '',
    features: [] as string[],
    image: '',
    images: [] as string[],
    gallery: [] as string[],
    videoUrl: '',
    isActive: true
  });

  useEffect(() => {
    fetchHouses();
  }, []);

  useEffect(() => {
    if (editingHouse) {
      setForm({
        title: editingHouse.title || '',
        subtitle: editingHouse.subtitle || '',
        location: editingHouse.location || '',
        price: editingHouse.price || '',
        bedrooms: editingHouse.bedrooms || 0,
        bathrooms: editingHouse.bathrooms || 0,
        area: editingHouse.area || '',
        year: editingHouse.year || '',
        description: editingHouse.description || '',
        longDescription: editingHouse.longDescription || '',
        features: editingHouse.features || [],
        image: editingHouse.image || '',
        images: editingHouse.images || [],
        gallery: editingHouse.gallery || [],
        videoUrl: editingHouse.videoUrl || '',
        isActive: editingHouse.isActive !== undefined ? editingHouse.isActive : true
      });
    } else {
      setForm({
        title: '',
        subtitle: '',
        location: '',
        price: '',
        bedrooms: 0,
        bathrooms: 0,
        area: '',
        year: '',
        description: '',
        longDescription: '',
        features: [],
        image: '',
        images: [],
        gallery: [],
        videoUrl: '',
        isActive: true
      });
    }
    // Reset file selections when editing house changes
    setSelectedCoverFile(null);
    setSelectedAdditionalFiles([]);
    setSelectedGalleryFiles([]);
    setNewFeatureInput(''); // Reset feature input
  }, [editingHouse]);

  const fetchHouses = async () => {
    try {
      setLoading(true);
      const data = await api.getHouses();
      setHouses(data);
    } catch (error) {
      console.error('Failed to fetch houses:', error);
      alert('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'number') {
      setForm(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm(prev => ({ ...prev, [name]: checked }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: checked }));
  };

  const addFeature = () => {
    if (newFeatureInput.trim()) {
      setForm(prev => ({
        ...prev,
        features: [...prev.features, newFeatureInput.trim()]
      }));
      setNewFeatureInput(''); // Clear the input
    }
  };

  const removeFeature = (index: number) => {
    setForm(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleCoverImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedCoverFile(file);
      // Show preview
      const previewUrl = URL.createObjectURL(file);
      setForm(prev => ({ ...prev, image: previewUrl }));
    }
  };

  const handleAdditionalImagesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setSelectedAdditionalFiles(prev => [...prev, ...newFiles]);
      // Add preview URLs
      newFiles.forEach(file => {
        const previewUrl = URL.createObjectURL(file);
        setForm(prev => ({ ...prev, images: [...prev.images, previewUrl] }));
      });
    }
  };

  const handleGalleryImagesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setSelectedGalleryFiles(prev => [...prev, ...newFiles]);
      // Add preview URLs
      newFiles.forEach(file => {
        const previewUrl = URL.createObjectURL(file);
        setForm(prev => ({ ...prev, gallery: [...prev.gallery, previewUrl] }));
      });
    }
  };

  const removeCoverImage = () => {
    setSelectedCoverFile(null);
    setForm(prev => ({ ...prev, image: '' }));
    if (coverImageRef.current) coverImageRef.current.value = '';
  };

  const removeAdditionalImage = (index: number) => {
    setSelectedAdditionalFiles(prev => prev.filter((_, i) => i !== index));
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const removeGalleryImage = (index: number) => {
    setSelectedGalleryFiles(prev => prev.filter((_, i) => i !== index));
    setForm(prev => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    if (!form.title || !form.subtitle || !form.location || !form.price || !form.description) {
      alert('Please fill all required fields');
      return;
    }

    if (!selectedCoverFile && !form.image && !editingHouse) {
      alert('Please select a cover image');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();

      // Add all text fields
      Object.entries(form).forEach(([key, value]) => {
        if (key === 'features') {
          // Features array to comma-separated string
          if (value.length > 0) {
            formData.append('features', value.join(','));
          }
        } else if (key === 'images' || key === 'gallery') {
          // Skip these - they'll be handled by file uploads
          return;
        } else if (key === 'image') {
          // Skip - handled by file upload
          return;
        } else if (value !== undefined && value !== null && value !== '') {
          formData.append(key, String(value));
        }
      });

      // Add existing image URLs as JSON strings (for update)
      if (editingHouse) {
        // Only send existing images if there are no new files
        if (selectedAdditionalFiles.length === 0 && form.images.length > 0) {
          const existingImages = form.images.filter(img => img.startsWith('/uploads/'));
          if (existingImages.length > 0) {
            formData.append('images', JSON.stringify(existingImages));
          }
        }
        
        if (selectedGalleryFiles.length === 0 && form.gallery.length > 0) {
          const existingGallery = form.gallery.filter(img => img.startsWith('/uploads/'));
          if (existingGallery.length > 0) {
            formData.append('gallery', JSON.stringify(existingGallery));
          }
        }
      }

      // Add cover image file
      if (selectedCoverFile) {
        formData.append('image', selectedCoverFile);
      }

      // Add additional images files
      if (selectedAdditionalFiles.length > 0) {
        selectedAdditionalFiles.forEach(file => {
          formData.append('images', file);
        });
      }

      // Add gallery images files
      if (selectedGalleryFiles.length > 0) {
        selectedGalleryFiles.forEach(file => {
          formData.append('gallery', file);
        });
      }

      // Debug log
      console.log('FormData contents:');
      for (let pair of formData.entries()) {
        if (pair[1] instanceof File) {
          console.log(pair[0], 'File:', pair[1].name);
        } else {
          console.log(pair[0], pair[1]);
        }
      }

      if (editingHouse) {
        await api.updateHouse(editingHouse._id, formData);
        alert('Property updated successfully!');
      } else {
        await api.createHouse(formData);
        alert('Property created successfully!');
      }

      setShowModal(false);
      setEditingHouse(null);
      await fetchHouses();

    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || 'Failed to save property');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this property? This will also delete all rooms associated with it.')) {
      try {
        await api.deleteHouse(id);
        await fetchHouses();
        alert('Property deleted successfully!');
      } catch (error) {
        console.error('Delete failed:', error);
        alert('Failed to delete property');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Properties</h1>
          <p className="text-gray-500 mt-1">Manage your virtual tour properties</p>
        </div>
        <button
          onClick={() => {
            setEditingHouse(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-white text-dark-400 rounded-lg font-medium hover:bg-gray-200 transition-colors"
        >
          <Plus size={18} />
          Add Property
        </button>
      </div>

      {houses.length === 0 ? (
        <div className="text-center py-12 bg-dark-300 rounded-xl border border-gray-800">
          <p className="text-gray-500">No properties yet. Click "Add Property" to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {houses.map((house) => (
            <div key={house._id || house.id} className="bg-dark-300 rounded-xl border border-gray-800 overflow-hidden hover:border-gray-700 transition-all">
              <div className="relative h-48 bg-dark-200">
                <img
                  src={getImageUrl(house.image)}
                  alt={house.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=No+Image';
                  }}
                />
                <div className="absolute top-3 right-3 flex gap-2">
                  <button
                    onClick={() => window.open(`/house/${house._id || house.id}`, '_blank')}
                    className="p-2 bg-black/50 backdrop-blur rounded-lg hover:bg-black/70 transition-colors"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setEditingHouse(house);
                      setShowModal(true);
                    }}
                    className="p-2 bg-black/50 backdrop-blur rounded-lg hover:bg-black/70 transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(house._id || house.id)}
                    className="p-2 bg-red-500/50 backdrop-blur rounded-lg hover:bg-red-500/70 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                {!house.isActive && (
                  <div className="absolute bottom-3 left-3 px-2 py-1 bg-red-500/80 backdrop-blur rounded-lg text-xs">
                    Draft
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold">{house.title}</h3>
                <p className="text-gray-500 text-sm mb-2">{house.subtitle}</p>
                <div className="flex justify-between items-center">
                  <span className="text-white font-bold">{house.price}</span>
                  <div className="flex gap-3 text-xs text-gray-500">
                    <span>🛏️ {house.bedrooms}</span>
                    <span>🛁 {house.bathrooms}</span>
                    <span>📐 {house.area}</span>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {house.features?.slice(0, 3).map((feature, idx) => (
                    <span key={idx} className="text-xs px-2 py-0.5 bg-white/10 rounded-full">
                      {feature}
                    </span>
                  ))}
                  {house.features?.length > 3 && (
                    <span className="text-xs px-2 py-0.5 bg-white/10 rounded-full">
                      +{house.features.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-300 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center sticky top-0 bg-dark-300">
              <h2 className="text-xl font-bold">{editingHouse ? 'Edit Property' : 'Add New Property'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-white/10 rounded-lg">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg focus:outline-none focus:border-white"
                    placeholder="Luxury Villa"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Subtitle *</label>
                  <input
                    type="text"
                    name="subtitle"
                    value={form.subtitle}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg focus:outline-none focus:border-white"
                    placeholder="Mediterranean Paradise"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Location *</label>
                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg focus:outline-none focus:border-white"
                    placeholder="Costa del Sol, Spain"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Price *</label>
                  <input
                    type="text"
                    name="price"
                    value={form.price}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg focus:outline-none focus:border-white"
                    placeholder="$4,250,000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Year Built</label>
                  <input
                    type="text"
                    name="year"
                    value={form.year}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg focus:outline-none focus:border-white"
                    placeholder="2024"
                  />
                </div>
              </div>

              {/* Specifications */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Bedrooms *</label>
                  <input
                    type="number"
                    name="bedrooms"
                    value={form.bedrooms}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg focus:outline-none focus:border-white"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Bathrooms *</label>
                  <input
                    type="number"
                    name="bathrooms"
                    value={form.bathrooms}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg focus:outline-none focus:border-white"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Area *</label>
                  <input
                    type="text"
                    name="area"
                    value={form.area}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg focus:outline-none focus:border-white"
                    placeholder="650 m²"
                  />
                </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={form.isActive}
                      onChange={handleCheckboxChange}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Active / Published</span>
                  </label>
                </div>
              </div>

              {/* Descriptions */}
              <div>
                <label className="block text-sm font-medium mb-2">Short Description *</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg focus:outline-none focus:border-white"
                  placeholder="Brief description of the property..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Long Description</label>
                <textarea
                  name="longDescription"
                  value={form.longDescription}
                  onChange={handleInputChange}
                  rows={5}
                  className="w-full px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg focus:outline-none focus:border-white"
                  placeholder="Detailed description for the property page..."
                />
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-medium mb-2">Features / Amenities</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newFeatureInput}
                    onChange={(e) => setNewFeatureInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                    className="flex-1 px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg focus:outline-none focus:border-white"
                    placeholder="e.g., Private Pool, Home Cinema, Wine Cellar"
                  />
                  <button
                    onClick={addFeature}
                    className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.features.map((feature, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-white/10 rounded-full text-sm flex items-center gap-2"
                    >
                      {feature}
                      <button
                        onClick={() => removeFeature(idx)}
                        className="hover:text-red-400"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Cover Image Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">Cover Image *</label>
                <div className="flex gap-4 items-start">
                  <div className="flex-1">
                    <input
                      ref={coverImageRef}
                      type="file"
                      accept="image/*"
                      onChange={handleCoverImageSelect}
                      className="hidden"
                    />
                    <button
                      onClick={() => coverImageRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                    >
                      <Upload size={16} />
                      Select Cover Image
                    </button>
                    {selectedCoverFile && (
                      <p className="text-xs text-gray-500 mt-1">{selectedCoverFile.name}</p>
                    )}
                  </div>
                  {form.image && (
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-dark-200">
                      <img src={form.image.startsWith('blob:') ? form.image : getImageUrl(form.image)} alt="Cover" className="w-full h-full object-cover" />
                      <button
                        onClick={removeCoverImage}
                        className="absolute top-1 right-1 p-1 bg-black/50 rounded-full hover:bg-red-500"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Images */}
              <div>
                <label className="block text-sm font-medium mb-2">Additional Images</label>
                <div className="flex gap-4 items-start">
                  <div className="flex-1">
                    <input
                      ref={additionalImagesRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleAdditionalImagesSelect}
                      className="hidden"
                    />
                    <button
                      onClick={() => additionalImagesRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                    >
                      <ImageIcon size={16} />
                      Select Additional Images
                    </button>
                    {selectedAdditionalFiles.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">{selectedAdditionalFiles.length} file(s) selected</p>
                    )}
                  </div>
                </div>
                {form.images.length > 0 && (
                  <div className="flex flex-wrap gap-3 mt-4">
                    {form.images.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative w-20 h-20 rounded-lg overflow-hidden bg-dark-200"
                      >
                        <img
                          src={img.startsWith('blob:') ? img : getImageUrl(img)}
                          alt={`Additional ${idx}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => removeAdditionalImage(idx)}
                          className="absolute top-1 right-1 p-1 bg-black/50 rounded-full hover:bg-red-500"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Gallery Images Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">Gallery Images</label>
                <div className="flex gap-4 items-start">
                  <div className="flex-1">
                    <input
                      ref={galleryImagesRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleGalleryImagesSelect}
                      className="hidden"
                    />
                    <button
                      onClick={() => galleryImagesRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                    >
                      <ImageIcon size={16} />
                      Select Gallery Images
                    </button>
                    {selectedGalleryFiles.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">{selectedGalleryFiles.length} file(s) selected</p>
                    )}
                  </div>
                </div>
                {form.gallery.length > 0 && (
                  <div className="flex flex-wrap gap-3 mt-4">
                    {form.gallery.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative w-20 h-20 rounded-lg overflow-hidden bg-dark-200"
                      >
                        <img
                          src={img.startsWith('blob:') ? img : getImageUrl(img)}
                          alt={`Gallery ${idx}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => removeGalleryImage(idx)}
                          className="absolute top-1 right-1 p-1 bg-black/50 rounded-full hover:bg-red-500"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Video URL */}
              <div>
                <label className="block text-sm font-medium mb-2">Video URL (Optional)</label>
                <input
                  type="text"
                  name="videoUrl"
                  value={form.videoUrl}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-dark-200 border border-gray-700 rounded-lg focus:outline-none focus:border-white"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-800 flex justify-end gap-3 sticky bottom-0 bg-dark-300">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-700 rounded-lg hover:bg-white/5 transition-colors"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-4 py-2 bg-white text-dark-400 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Saving...' : (editingHouse ? 'Save Changes' : 'Create Property')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}