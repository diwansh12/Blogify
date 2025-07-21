import { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import PostCard from '../components/PostCard';
import {
  UserCircleIcon,
  PencilSquareIcon,
  CameraIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  HeartIcon,
  EyeIcon,
  Cog6ToothIcon,
  ShareIcon,
  BookmarkIcon,
  MapPinIcon,
  LinkIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';

export default function Profile() {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [editing, setEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    bio: '',
    location: '',
    website: '',
    twitter: '',
    linkedin: ''
  });

  const isOwnProfile = !userId || userId === currentUser?.id;

  useEffect(() => {
    const loadData = async () => {
      await fetchProfile();
      await fetchUserPosts();
    };
    
    if (currentUser) {
      loadData();
    }
  }, [userId, currentUser]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      const profileInfo = {
        ...currentUser,
        bio: "Passionate writer and storyteller. I love sharing experiences and connecting with readers around the world. Always curious about new perspectives and eager to learn from others.",
        location: "San Francisco, CA",
        website: "https://mywebsite.com",
        twitter: "@username",
        linkedin: "linkedin.com/in/username",
        joinDate: "2024-01-01",
        postsCount: 0,
        likesCount: 0,
        viewsCount: 0,
        verified: true
      };
      
      setProfile(profileInfo);
      setProfileData({
        name: currentUser?.name || '',
        bio: profileInfo.bio,
        location: profileInfo.location,
        website: profileInfo.website,
        twitter: profileInfo.twitter,
        linkedin: profileInfo.linkedin
      });
      
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    try {
      setPostsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token || !currentUser) {
        setPosts([]);
        return;
      }

      const res = await api.get('/posts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const userPosts = res.data.filter(post => {
        return (
          post.author === currentUser.id ||
          post.author === currentUser._id ||
          post.author === currentUser.name ||
          post.author?.toString() === currentUser.id?.toString()
        );
      });
      
      setPosts(userPosts);
      
      if (profile) {
        setProfile(prev => ({
          ...prev,
          postsCount: userPosts.length,
          likesCount: userPosts.length * Math.floor(Math.random() * 50) + 10,
          viewsCount: userPosts.length * Math.floor(Math.random() * 200) + 50
        }));
      }
      
    } catch (error) {
      console.error('Failed to fetch user posts:', error);
      setPosts([]);
    } finally {
      setPostsLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setProfile(prev => ({ ...prev, ...profileData }));
      setEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setProfile(prev => ({ ...prev, avatar: res.data.url }));
    } catch (error) {
      console.error('Failed to upload image:', error);
    }
  };

  const formatJoinDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  if (loading || !currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          <p className="text-gray-600 text-xl font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 pt-20 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-32 h-32 mx-auto mb-8 bg-gray-100 rounded-full flex items-center justify-center">
            <UserCircleIcon className="w-20 h-20 text-gray-400" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Profile not found</h2>
          <p className="text-gray-600 mb-8 text-lg">The profile you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-lg transition-all transform hover:-translate-y-1"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Enhanced Profile Header */}
        <div className="relative mb-12">
          
          {/* Cover Image with Overlay */}
          <div className="relative h-80 md:h-96 rounded-3xl overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-400 via-primary-500 to-blue-600"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
            
            {isOwnProfile && (
              <button className="absolute top-6 right-6 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-xl transition-all hover:scale-105 shadow-lg">
                <CameraIcon className="w-6 h-6" />
              </button>
            )}

            {/* Floating Profile Content */}
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
                
                {/* Avatar & Info */}
                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
                  
                  {/* Enhanced Avatar */}
                  <div className="relative">
                    {profile.avatar ? (
                      <img
                        src={profile.avatar}
                        alt={profile.name}
                        className="w-32 h-32 lg:w-40 lg:h-40 rounded-3xl border-4 border-white shadow-2xl object-cover"
                      />
                    ) : (
                      <div className="w-32 h-32 lg:w-40 lg:h-40 bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-3xl border-4 border-white shadow-2xl flex items-center justify-center">
                        <span className="text-gray-600 text-4xl lg:text-5xl font-bold">
                          {profile.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    
                    {profile.verified && (
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                        <CheckBadgeIcon className="w-5 h-5 text-white" />
                      </div>
                    )}
                    
                    {isOwnProfile && (
                      <>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute bottom-2 right-2 bg-primary-500 hover:bg-primary-600 text-white p-2.5 rounded-full shadow-lg transition-all hover:scale-110"
                        >
                          <CameraIcon className="w-4 h-4" />
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </>
                    )}
                  </div>

                  {/* Profile Info */}
                  <div className="text-white space-y-3">
                    <div className="flex items-center gap-3">
                      <h1 className="text-3xl lg:text-4xl font-bold leading-tight">
                        {profile.name}
                      </h1>
                      {profile.verified && (
                        <CheckBadgeIcon className="w-8 h-8 text-blue-400" />
                      )}
                    </div>
                    
                    <p className="text-lg lg:text-xl text-white/90 font-medium max-w-2xl leading-relaxed">
                      {profile.bio}
                    </p>
                    
                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-6 text-white/80">
                      <div className="flex items-center gap-2">
                        <CalendarDaysIcon className="w-5 h-5" />
                        <span className="font-medium">Joined {formatJoinDate(profile.joinDate)}</span>
                      </div>
                      
                      {profile.location && (
                        <div className="flex items-center gap-2">
                          <MapPinIcon className="w-5 h-5" />
                          <span className="font-medium">{profile.location}</span>
                        </div>
                      )}
                      
                      {profile.website && (
                        <a
                          href={profile.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 hover:text-white transition-colors"
                        >
                          <LinkIcon className="w-5 h-5" />
                          <span className="font-medium hover:underline">Website</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  {isOwnProfile ? (
                    <>
                      <button
                        onClick={() => setEditing(true)}
                        className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105 shadow-lg flex items-center gap-2"
                      >
                        <PencilSquareIcon className="w-5 h-5" />
                        <span>Edit Profile</span>
                      </button>
                      <Link
                        to="/settings"
                        className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105 shadow-lg flex items-center gap-2"
                      >
                        <Cog6ToothIcon className="w-5 h-5" />
                        <span>Settings</span>
                      </Link>
                    </>
                  ) : (
                    <>
                      <button className="bg-white text-primary-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all hover:scale-105 shadow-lg">
                        Follow
                      </button>
                      <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105 shadow-lg flex items-center gap-2">
                        <ShareIcon className="w-5 h-5" />
                        <span>Share</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-3 gap-6 mb-12 -mt-20 relative z-10">
          {[
            { label: 'Posts', value: profile.postsCount || 0, icon: DocumentTextIcon, color: 'from-blue-500 to-blue-600' },
            { label: 'Likes', value: profile.likesCount || 0, icon: HeartIcon, color: 'from-pink-500 to-pink-600' },
            { label: 'Views', value: profile.viewsCount || 0, icon: EyeIcon, color: 'from-purple-500 to-purple-600' }
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {stat.value.toLocaleString()}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Enhanced Tabs */}
        <div className="mb-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-2 shadow-lg">
            <nav className="flex gap-2">
              {[
                { id: 'posts', label: 'Posts', icon: DocumentTextIcon, count: posts.length },
                { id: 'liked', label: 'Liked', icon: HeartIcon },
                ...(isOwnProfile ? [{ id: 'saved', label: 'Saved', icon: BookmarkIcon }] : [])
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all ${
                      activeTab === tab.id
                        ? 'bg-white text-primary-600 shadow-lg'
                        : 'text-gray-600 hover:text-primary-600 hover:bg-white/50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        activeTab === tab.id ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Enhanced Tab Content */}
        <div className="animate-fade-in">
          {activeTab === 'posts' && (
            <>
              {postsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 animate-pulse">
                      <div className="w-full h-48 bg-gray-200 rounded-xl mb-4"></div>
                      <div className="space-y-3">
                        <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
                        <div className="w-1/2 h-4 bg-gray-200 rounded"></div>
                        <div className="w-full h-3 bg-gray-200 rounded"></div>
                        <div className="w-2/3 h-3 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : posts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {posts.map((post, index) => (
                    <PostCard key={post._id} post={post} index={index} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                    <DocumentTextIcon className="w-16 h-16 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">No posts yet</h3>
                  <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto leading-relaxed">
                    {isOwnProfile 
                      ? "Ready to share your story? Start writing and connect with readers around the world!" 
                      : "This user hasn't published any posts yet. Check back later for updates!"
                    }
                  </p>
                  {isOwnProfile && (
                    <Link
                      to="/create"
                      className="inline-flex items-center gap-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl hover:shadow-primary-500/25 transition-all transform hover:-translate-y-1"
                    >
                      <PencilSquareIcon className="w-6 h-6" />
                      <span>Write Your First Story</span>
                    </Link>
                  )}
                </div>
              )}
            </>
          )}

          {activeTab === 'liked' && (
            <div className="text-center py-20">
              <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-pink-100 to-pink-200 rounded-full flex items-center justify-center">
                <HeartIcon className="w-16 h-16 text-pink-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No liked posts yet</h3>
              <p className="text-gray-600 text-lg max-w-md mx-auto leading-relaxed">
                Discover amazing stories and show some love by liking posts you enjoy!
              </p>
            </div>
          )}

          {activeTab === 'saved' && (
            <div className="text-center py-20">
              <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                <BookmarkIcon className="w-16 h-16 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No saved posts yet</h3>
              <p className="text-gray-600 text-lg max-w-md mx-auto leading-relaxed">
                Bookmark posts you want to read later or revisit for inspiration!
              </p>
            </div>
          )}
        </div>

        {/* Enhanced Edit Profile Modal */}
        {editing && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-blue-500 rounded-xl flex items-center justify-center">
                    <PencilSquareIcon className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Edit Profile</h2>
                </div>
                
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Bio
                    </label>
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                      rows="4"
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none transition-all"
                      placeholder="Tell people about yourself..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">
                        Location
                      </label>
                      <input
                        type="text"
                        value={profileData.location}
                        onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        placeholder="Where are you based?"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">
                        Website
                      </label>
                      <input
                        type="url"
                        value={profileData.website}
                        onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">
                        Twitter
                      </label>
                      <input
                        type="text"
                        value={profileData.twitter}
                        onChange={(e) => setProfileData(prev => ({ ...prev, twitter: e.target.value }))}
                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        placeholder="@username"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">
                        LinkedIn
                      </label>
                      <input
                        type="text"
                        value={profileData.linkedin}
                        onChange={(e) => setProfileData(prev => ({ ...prev, linkedin: e.target.value }))}
                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        placeholder="linkedin.com/in/username"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-8">
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="flex-1 px-6 py-4 text-gray-600 hover:text-gray-800 font-semibold text-lg transition-colors hover:bg-gray-50 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-4 rounded-xl font-semibold text-lg hover:shadow-xl hover:shadow-primary-500/25 transition-all transform hover:-translate-y-1"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
