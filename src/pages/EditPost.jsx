import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api";
import { 
  PhotoIcon, 
  DocumentTextIcon, 
  EyeIcon,
  XMarkIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline';

export default function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    author: "",
    content: "",
    image: ""
  });
  
  const [newImageFile, setNewImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(false);

  // Character limits
  const limits = {
    title: 100,
    summary: 200,
    content: 10000
  };

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get(`/posts/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        setFormData(res.data);
        setImagePreview(res.data.image || "");
        setLoading(false);
      } catch (err) {
        console.error("❌ Failed to fetch post:", err);
        setError("Failed to load post for editing");
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (file) => {
    const formDataUpload = new FormData();
    formDataUpload.append("image", file);

    const res = await api.post("/upload", formDataUpload, {
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
      
      setNewImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
      setError("");
    }
  };

  const removeImage = () => {
    setNewImageFile(null);
    setImagePreview("");
    setFormData(prev => ({ ...prev, image: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    // Validation
    if (!formData.title.trim() || !formData.content.trim()) {
      setError("Title and content are required");
      setSaving(false);
      return;
    }

    try {
      let imageUrl = formData.image;
      
      if (newImageFile) {
        setUploading(true);
        imageUrl = await handleImageUpload(newImageFile);
        setUploading(false);
      }

      const updateData = {
        ...formData,
        image: imageUrl,
      };

      const token = localStorage.getItem("token");

      await api.put(`/posts/${id}`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      navigate(`/post/${id}`);
    } catch (err) {
      console.error("Post update failed:", err);
      setError(err.response?.data?.message || "Failed to update post. Please try again.");
      setUploading(false);
    } finally {
      setSaving(false);
    }
  };

  const getCharacterCount = (field) => {
    return formData[field]?.length || 0;
  };

  const isCharacterLimitExceeded = (field) => {
    return getCharacterCount(field) > limits[field];
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          <p className="text-gray-600 text-lg">Loading post...</p>
        </div>
      </div>
    );
  }

  // Preview Mode
  if (preview) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Preview Header */}
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-8 py-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Preview Changes</h1>
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
                  alt={formData.title}
                  className="w-full h-64 object-cover rounded-xl mb-6"
                />
              )}
              
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{formData.title || "Untitled"}</h1>
              
              <div className="flex items-center space-x-4 text-gray-500 mb-6">
                <span>By {formData.author}</span>
                <span>•</span>
                <span>Updated {new Date().toLocaleDateString()}</span>
              </div>

              {formData.summary && (
                <p className="text-xl text-gray-600 mb-8 font-medium leading-relaxed">
                  {formData.summary}
                </p>
              )}

              <div className="prose max-w-none">
                <div className="whitespace-pre-line text-gray-800 leading-relaxed">
                  {formData.content || "No content yet..."}
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
        
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors mb-8 group"
        >
          <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Post</span>
        </button>

        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Edit Your Story</h1>
          <p className="text-xl text-gray-600">Update and improve your content</p>
        </div>

        {/* Main Form */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-scale-in">
          
          {/* Form Header */}
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <PencilSquareIcon className="w-8 h-8 text-white" />
                <h2 className="text-2xl font-bold text-white">Editing Post</h2>
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

          <form onSubmit={handleUpdate} className="p-8 space-y-8">
            
            {/* Image Upload */}
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-4">
                Cover Image
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
                  {newImageFile && (
                    <div className="absolute bottom-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      New image selected
                    </div>
                  )}
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 hover:border-yellow-400 rounded-xl p-12 text-center cursor-pointer transition-colors group"
                >
                  <PhotoIcon className="w-16 h-16 mx-auto text-gray-400 group-hover:text-yellow-500 transition-colors mb-4" />
                  <p className="text-lg text-gray-600 mb-2">Click to upload a new image</p>
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
                name="title"
                required
                className={`w-full px-6 py-4 border-2 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 text-lg ${
                  isCharacterLimitExceeded('title') 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-200'
                }`}
                placeholder="Update your story title..."
                value={formData.title}
                onChange={handleChange}
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
                name="summary"
                className={`w-full px-6 py-4 border-2 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 h-24 resize-none ${
                  isCharacterLimitExceeded('summary') 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-200'
                }`}
                placeholder="Update your story summary..."
                value={formData.summary}
                onChange={handleChange}
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
                name="author"
                required
                className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                value={formData.author}
                onChange={handleChange}
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-3">
                Content *
              </label>
              <textarea
                name="content"
                required
                className={`w-full px-6 py-4 border-2 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 h-96 resize-y ${
                  isCharacterLimitExceeded('content') 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-200'
                }`}
                placeholder="Update your story content..."
                value={formData.content}
                onChange={handleChange}
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
                onClick={() => navigate(`/post/${id}`)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 rounded-xl font-semibold text-lg transition-colors"
              >
                Cancel Changes
              </button>
              
              <button
                type="submit"
                disabled={saving || uploading || !formData.title.trim() || !formData.content.trim() || Object.keys(limits).some(field => isCharacterLimitExceeded(field))}
                className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-yellow-500/25 transition-all duration-200 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
              >
                {saving ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving Changes...</span>
                  </>
                ) : uploading ? (
                  <>
                    <CloudArrowUpIcon className="w-6 h-6" />
                    <span>Uploading Image...</span>
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-6 h-6" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Help Text */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6 animate-fade-in" style={{ animationDelay: '400ms' }}>
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">📝 Editing Tips</h3>
          <ul className="text-yellow-700 space-y-1">
            <li>• Use the preview feature to see how your changes will look</li>
            <li>• You can upload a new cover image or keep the existing one</li>
            <li>• Character limits help maintain readability</li>
            <li>• Your changes won't be saved until you click "Save Changes"</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
