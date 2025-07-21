import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { 
  PhotoIcon, 
  DocumentTextIcon, 
  EyeIcon,
  XMarkIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function CreatePost() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [form, setForm] = useState({
    title: "",
    summary: "",
    author: user?.name || "",
    content: "",
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(false);

  // Character limits
  const limits = {
    title: 100,
    summary: 200,
    content: 10000
  };

  const handleImageUpload = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    const res = await api.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data.url;
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }
      
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
      setError("");
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (!form.title.trim() || !form.content.trim()) {
      setError("Title and content are required");
      setLoading(false);
      return;
    }

    try {
      let imageUrl = "";
      
      if (imageFile) {
        setUploading(true);
        imageUrl = await handleImageUpload(imageFile);
        setUploading(false);
      }

      const postData = {
        ...form,
        image: imageUrl,
      };

      const token = localStorage.getItem("token");

      await api.post("/posts", postData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      navigate("/");
    } catch (err) {
      console.error("Post creation failed:", err);
      setError(err.response?.data?.message || "Failed to create post. Please try again.");
      setUploading(false);
    } finally {
      setLoading(false);
    }
  };

  const getCharacterCount = (field) => {
    return form[field]?.length || 0;
  };

  const isCharacterLimitExceeded = (field) => {
    return getCharacterCount(field) > limits[field];
  };

  if (preview) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Preview Header */}
            <div className="bg-gradient-to-r from-primary-500 to-blue-500 px-8 py-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Preview Mode</h1>
                <button
                  onClick={() => setPreview(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Preview Content */}
            <div className="p-8">
              {imagePreview && (
                <img 
                  src={imagePreview} 
                  alt={form.title}
                  className="w-full h-64 object-cover rounded-xl mb-6"
                />
              )}
              
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{form.title || "Untitled"}</h1>
              
              <div className="flex items-center space-x-4 text-gray-500 mb-6">
                <span>By {form.author}</span>
                <span>•</span>
                <span>{new Date().toLocaleDateString()}</span>
              </div>

              {form.summary && (
                <p className="text-xl text-gray-600 mb-8 font-medium leading-relaxed">
                  {form.summary}
                </p>
              )}

              <div className="prose max-w-none">
                <div className="whitespace-pre-line text-gray-800 leading-relaxed">
                  {form.content || "No content yet..."}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Create Your Story</h1>
          <p className="text-xl text-gray-600">Share your thoughts with the world</p>
        </div>

        {/* Main Form */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-scale-in">
          
          {/* Form Header */}
          <div className="bg-gradient-to-r from-primary-500 to-blue-500 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <DocumentTextIcon className="w-8 h-8 text-white" />
                <h2 className="text-2xl font-bold text-white">New Post</h2>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setPreview(true)}
                  className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <EyeIcon className="w-5 h-5" />
                  <span>Preview</span>
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-8 mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3 animate-fade-in">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            
            {/* Image Upload */}
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-4">
                Cover Image (Optional)
              </label>
              
              {imagePreview ? (
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 hover:border-primary-400 rounded-xl p-12 text-center cursor-pointer transition-colors group"
                >
                  <PhotoIcon className="w-16 h-16 mx-auto text-gray-400 group-hover:text-primary-500 transition-colors mb-4" />
                  <p className="text-lg text-gray-600 mb-2">Click to upload an image</p>
                  <p className="text-sm text-gray-400">PNG, JPG up to 5MB</p>
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Title */}
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-3">
                Title *
              </label>
              <input
                type="text"
                required
                className={`w-full px-6 py-4 border-2 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-lg ${
                  isCharacterLimitExceeded('title') 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-200'
                }`}
                placeholder="Give your story a compelling title..."
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <div className={`text-right text-sm mt-2 ${
                isCharacterLimitExceeded('title') ? 'text-red-500' : 'text-gray-500'
              }`}>
                {getCharacterCount('title')} / {limits.title}
              </div>
            </div>

            {/* Summary */}
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-3">
                Summary
              </label>
              <textarea
                className={`w-full px-6 py-4 border-2 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 h-24 resize-none ${
                  isCharacterLimitExceeded('summary') 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-200'
                }`}
                placeholder="Write a brief summary to hook your readers..."
                value={form.summary}
                onChange={(e) => setForm({ ...form, summary: e.target.value })}
              />
              <div className={`text-right text-sm mt-2 ${
                isCharacterLimitExceeded('summary') ? 'text-red-500' : 'text-gray-500'
              }`}>
                {getCharacterCount('summary')} / {limits.summary}
              </div>
            </div>

            {/* Author */}
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-3">
                Author
              </label>
              <input
                type="text"
                required
                className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-gray-50"
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-3">
                Content *
              </label>
              <textarea
                required
                className={`w-full px-6 py-4 border-2 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 h-96 resize-y ${
                  isCharacterLimitExceeded('content') 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-200'
                }`}
                placeholder="Tell your story... Write from your heart and let your creativity flow. Share your experiences, insights, and perspectives with the world."
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
              />
              <div className={`text-right text-sm mt-2 ${
                isCharacterLimitExceeded('content') ? 'text-red-500' : 'text-gray-500'
              }`}>
                {getCharacterCount('content')} / {limits.content}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 rounded-xl font-semibold text-lg transition-colors"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={loading || uploading || Object.values(form).some(val => !val.trim()) || Object.keys(limits).some(field => isCharacterLimitExceeded(field))}
                className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-primary-500/25 transition-all duration-200 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Publishing...</span>
                  </>
                ) : uploading ? (
                  <>
                    <CloudArrowUpIcon className="w-6 h-6" />
                    <span>Uploading Image...</span>
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-6 h-6" />
                    <span>Publish Story</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
