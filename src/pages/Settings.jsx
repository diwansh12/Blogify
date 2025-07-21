import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext'; // Add this import
import { useNavigate } from 'react-router-dom';
import api from '../api';
import {
  UserCircleIcon,
  KeyIcon,
  BellIcon,
  EyeIcon,
  ShieldCheckIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  Cog6ToothIcon,
  MoonIcon,
  SunIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';

export default function Settings() {
  const { user, logout } = useAuth();
  const { theme, fontSize, language, compactMode, updateAppearance } = useTheme(); // Add this
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('account');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  // Account Settings
  const [accountData, setAccountData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Notification Settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    commentNotifications: true,
    likeNotifications: true,
    followNotifications: true,
    weeklyDigest: true,
    marketingEmails: false
  });

  // Privacy Settings
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showLocation: true,
    allowComments: true,
    allowDirectMessages: true,
    dataProcessing: true
  });

  // Local appearance state for the form
  const [appearanceForm, setAppearanceForm] = useState({
    theme: theme,
    language: language,
    fontSize: fontSize,
    compactMode: compactMode
  });

  // Update form when theme context changes
  useEffect(() => {
    setAppearanceForm({
      theme,
      language,
      fontSize,
      compactMode
    });
  }, [theme, language, fontSize, compactMode]);

  // Rest of your existing functions...
  const showMessage = (type, message) => {
    if (type === 'success') {
      setSuccess(message);
      setError('');
    } else {
      setError(message);
      setSuccess('');
    }
    
    setTimeout(() => {
      setSuccess('');
      setError('');
    }, 5000);
  };

  const handleAccountUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      if (accountData.name !== user.name || accountData.email !== user.email) {
        await api.put('/auth/profile', {
          name: accountData.name,
          email: accountData.email
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      if (accountData.newPassword && accountData.currentPassword) {
        if (accountData.newPassword !== accountData.confirmPassword) {
          throw new Error('New passwords do not match');
        }

        await api.put('/auth/password', {
          currentPassword: accountData.currentPassword,
          newPassword: accountData.newPassword
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setAccountData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
      }

      showMessage('success', 'Account updated successfully!');
    } catch (err) {
      showMessage('error', err.response?.data?.message || err.message || 'Failed to update account');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationUpdate = async () => {
    setLoading(true);
    try {
      localStorage.setItem('notifications', JSON.stringify(notifications));
      showMessage('success', 'Notification preferences updated!');
    } catch (err) {
      showMessage('error', 'Failed to update notifications');
    } finally {
      setLoading(false);
    }
  };

  const handlePrivacyUpdate = async () => {
    setLoading(true);
    try {
      localStorage.setItem('privacy', JSON.stringify(privacy));
      showMessage('success', 'Privacy settings updated!');
    } catch (err) {
      showMessage('error', 'Failed to update privacy settings');
    } finally {
      setLoading(false);
    }
  };

  // Updated appearance handler
  const handleAppearanceUpdate = async () => {
    setLoading(true);
    try {
      // Update theme context (this will automatically save to localStorage and apply changes)
      updateAppearance(appearanceForm);
      showMessage('success', 'Appearance settings updated!');
    } catch (err) {
      showMessage('error', 'Failed to update appearance');
    } finally {
      setLoading(false);
    }
  };

  // Handle real-time appearance changes
  const handleAppearanceChange = (key, value) => {
    setAppearanceForm(prev => ({ ...prev, [key]: value }));
    // Apply changes immediately for better UX
    updateAppearance({ [key]: value });
  };

  // Rest of your existing functions...
  const handleAccountDeletion = async () => {
    const confirmation = prompt('Type "DELETE" to confirm account deletion:');
    if (confirmation !== 'DELETE') return;

    const doubleConfirm = window.confirm(
      'Are you absolutely sure? This action cannot be undone and will permanently delete all your posts, comments, and data.'
    );
    if (!doubleConfirm) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await api.delete('/auth/account', {
        headers: { Authorization: `Bearer ${token}` }
      });

      logout();
      navigate('/');
      showMessage('success', 'Account deleted successfully');
    } catch (err) {
      showMessage('error', 'Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  const handleDataExport = async () => {
    setLoading(true);
    try {
      const userData = {
        profile: user,
        posts: [],
        comments: [],
        exportDate: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(userData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `blogify-data-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);

      showMessage('success', 'Data exported successfully!');
    } catch (err) {
      showMessage('error', 'Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedNotifications = localStorage.getItem('notifications');
    const savedPrivacy = localStorage.getItem('privacy');

    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }
    if (savedPrivacy) {
      setPrivacy(JSON.parse(savedPrivacy));
    }
  }, []);

  const tabs = [
    { id: 'account', name: 'Account', icon: UserCircleIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'privacy', name: 'Privacy & Security', icon: ShieldCheckIcon },
    { id: 'appearance', name: 'Appearance', icon: SunIcon },
    { id: 'danger', name: 'Danger Zone', icon: ExclamationTriangleIcon }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center space-x-3 mb-4">
            <Cog6ToothIcon className="w-8 h-8 text-primary-600" />
            <h1 className="text-4xl font-bold text-gray-900">Settings</h1>
          </div>
          <p className="text-xl text-gray-600">Manage your account, privacy, and preferences</p>
        </div>

        {/* Success/Error Messages */}
        {(success || error) && (
          <div className={`mb-8 p-4 rounded-xl flex items-center space-x-3 animate-fade-in ${
            success 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {success ? (
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            ) : (
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
            )}
            <p className="font-medium">{success || error}</p>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar - same as before */}
          <div className="lg:w-1/4">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-2 animate-fade-in">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all ${
                        activeTab === tab.id
                          ? 'bg-primary-50 text-primary-600 shadow-sm'
                          : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:w-3/4">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-8 animate-fade-in">
              
              {/* Account Settings - same as before */}
              {activeTab === 'account' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Account Settings</h2>
                  
                  <form onSubmit={handleAccountUpdate} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Display Name
                        </label>
                        <input
                          type="text"
                          value={accountData.name}
                          onChange={(e) => setAccountData(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={accountData.email}
                          onChange={(e) => setAccountData(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-8">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6">Change Password</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Current Password
                          </label>
                          <input
                            type="password"
                            value={accountData.currentPassword}
                            onChange={(e) => setAccountData(prev => ({ ...prev, currentPassword: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              New Password
                            </label>
                            <input
                              type="password"
                              value={accountData.newPassword}
                              onChange={(e) => setAccountData(prev => ({ ...prev, newPassword: e.target.value }))}
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Confirm New Password
                            </label>
                            <input
                              type="password"
                              value={accountData.confirmPassword}
                              onChange={(e) => setAccountData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={loading}
                        className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                      >
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Notification Settings - same as before... */}
              {activeTab === 'notifications' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Notification Preferences</h2>
                  
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Notifications</h3>
                      <div className="space-y-4">
                        {[
                          { key: 'emailNotifications', label: 'Email notifications', desc: 'Receive notifications via email' },
                          { key: 'commentNotifications', label: 'New comments', desc: 'When someone comments on your posts' },
                          { key: 'likeNotifications', label: 'Likes and reactions', desc: 'When someone likes your posts or comments' },
                          { key: 'followNotifications', label: 'New followers', desc: 'When someone follows you' },
                          { key: 'weeklyDigest', label: 'Weekly digest', desc: 'Weekly summary of your activity' },
                          { key: 'marketingEmails', label: 'Marketing emails', desc: 'Tips, feature updates, and promotions' }
                        ].map((item) => (
                          <label key={item.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                            <div>
                              <div className="font-medium text-gray-900">{item.label}</div>
                              <div className="text-sm text-gray-500">{item.desc}</div>
                            </div>
                            <input
                              type="checkbox"
                              checked={notifications[item.key]}
                              onChange={(e) => setNotifications(prev => ({ 
                                ...prev, 
                                [item.key]: e.target.checked 
                              }))}
                              className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                            />
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Push Notifications</h3>
                      <label className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                        <div>
                          <div className="font-medium text-gray-900">Push notifications</div>
                          <div className="text-sm text-gray-500">Receive push notifications on your devices</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifications.pushNotifications}
                          onChange={(e) => setNotifications(prev => ({ 
                            ...prev, 
                            pushNotifications: e.target.checked 
                          }))}
                          className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                        />
                      </label>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={handleNotificationUpdate}
                        disabled={loading}
                        className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                      >
                        {loading ? 'Saving...' : 'Save Preferences'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy & Security - same as before... */}
              {activeTab === 'privacy' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Privacy & Security</h2>
                  
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Visibility</h3>
                      <div className="space-y-3">
                        {[
                          { value: 'public', label: 'Public', desc: 'Anyone can view your profile' },
                          { value: 'private', label: 'Private', desc: 'Only approved followers can view your profile' }
                        ].map((option) => (
                          <label key={option.value} className="flex items-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                            <input
                              type="radio"
                              name="profileVisibility"
                              value={option.value}
                              checked={privacy.profileVisibility === option.value}
                              onChange={(e) => setPrivacy(prev => ({ 
                                ...prev, 
                                profileVisibility: e.target.value 
                              }))}
                              className="w-4 h-4 text-primary-600 focus:ring-primary-500 mr-4"
                            />
                            <div>
                              <div className="font-medium text-gray-900">{option.label}</div>
                              <div className="text-sm text-gray-500">{option.desc}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Data & Privacy</h3>
                      <div className="space-y-4">
                        {[
                          { key: 'showEmail', label: 'Show email on profile', desc: 'Display your email address publicly' },
                          { key: 'showLocation', label: 'Show location', desc: 'Display your location on your profile' },
                          { key: 'allowComments', label: 'Allow comments', desc: 'Let others comment on your posts' },
                          { key: 'allowDirectMessages', label: 'Allow direct messages', desc: 'Let others send you private messages' },
                          { key: 'dataProcessing', label: 'Data processing consent', desc: 'Allow us to process your data for analytics and improvements' }
                        ].map((item) => (
                          <label key={item.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                            <div>
                              <div className="font-medium text-gray-900">{item.label}</div>
                              <div className="text-sm text-gray-500">{item.desc}</div>
                            </div>
                            <input
                              type="checkbox"
                              checked={privacy[item.key]}
                              onChange={(e) => setPrivacy(prev => ({ 
                                ...prev, 
                                [item.key]: e.target.checked 
                              }))}
                              className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                            />
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={handlePrivacyUpdate}
                        disabled={loading}
                        className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                      >
                        {loading ? 'Saving...' : 'Save Settings'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Updated Appearance Settings with Real-time Changes */}
              {activeTab === 'appearance' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Appearance</h2>
                  
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Theme</h3>
                      <p className="text-sm text-gray-600 mb-6">Choose how Blogify looks to you. Changes apply immediately.</p>
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { value: 'light', label: 'Light', icon: SunIcon, desc: 'Clean and bright interface' },
                          { value: 'dark', label: 'Dark', icon: MoonIcon, desc: 'Easy on the eyes in low light' },
                          { value: 'system', label: 'System', icon: DevicePhoneMobileIcon, desc: 'Follows your device setting' }
                        ].map((themeOption) => {
                          const Icon = themeOption.icon;
                          return (
                            <label key={themeOption.value} className={`flex flex-col items-center p-6 border-2 rounded-xl cursor-pointer transition-all hover:shadow-lg ${
                              appearanceForm.theme === themeOption.value 
                                ? 'border-primary-500 bg-primary-50 shadow-lg' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}>
                              <Icon className={`w-8 h-8 mb-3 ${
                                appearanceForm.theme === themeOption.value ? 'text-primary-600' : 'text-gray-600'
                              }`} />
                              <span className={`font-medium mb-1 ${
                                appearanceForm.theme === themeOption.value ? 'text-primary-900' : 'text-gray-900'
                              }`}>{themeOption.label}</span>
                              <span className="text-xs text-gray-500 text-center">{themeOption.desc}</span>
                              <input
                                type="radio"
                                name="theme"
                                value={themeOption.value}
                                checked={appearanceForm.theme === themeOption.value}
                                onChange={(e) => handleAppearanceChange('theme', e.target.value)}
                                className="sr-only"
                              />
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Display Settings</h3>
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Language
                          </label>
                          <select
                            value={appearanceForm.language}
                            onChange={(e) => handleAppearanceChange('language', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          >
                            <option value="en">English</option>
                            <option value="es">Spanish</option>
                            <option value="fr">French</option>
                            <option value="de">German</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Font Size
                          </label>
                          <div className="grid grid-cols-3 gap-3">
                            {[
                              { value: 'small', label: 'Small', example: 'Aa' },
                              { value: 'medium', label: 'Medium', example: 'Aa' },
                              { value: 'large', label: 'Large', example: 'Aa' }
                            ].map((size) => (
                              <label key={size.value} className={`flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                                appearanceForm.fontSize === size.value 
                                  ? 'border-primary-500 bg-primary-50' 
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}>
                                <span className={`mb-2 font-bold ${
                                  size.value === 'small' ? 'text-sm' : 
                                  size.value === 'medium' ? 'text-base' : 'text-lg'
                                }`}>{size.example}</span>
                                <span className="text-sm font-medium text-gray-900">{size.label}</span>
                                <input
                                  type="radio"
                                  name="fontSize"
                                  value={size.value}
                                  checked={appearanceForm.fontSize === size.value}
                                  onChange={(e) => handleAppearanceChange('fontSize', e.target.value)}
                                  className="sr-only"
                                />
                              </label>
                            ))}
                          </div>
                        </div>

                        <label className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                          <div>
                            <div className="font-medium text-gray-900">Compact mode</div>
                            <div className="text-sm text-gray-500">Show more content in less space</div>
                          </div>
                          <input
                            type="checkbox"
                            checked={appearanceForm.compactMode}
                            onChange={(e) => handleAppearanceChange('compactMode', e.target.checked)}
                            className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Theme Preview */}
                    <div className="border-t border-gray-200 pt-8">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
                      <div className="bg-gray-50 rounded-xl p-6">
                        <p className="text-sm text-gray-600 mb-4">Changes are applied automatically. Here's how your content will look:</p>
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                          <h4 className="font-bold text-gray-900 mb-2">Sample Blog Post</h4>
                          <p className="text-gray-600 text-sm mb-3">This is how your content will appear with the current settings.</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>By John Doe</span>
                            <span>•</span>
                            <span>5 min read</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-2 rounded-lg text-sm">
                        ✓ Changes saved automatically
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Danger Zone - same as before... */}
              {activeTab === 'danger' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Danger Zone</h2>
                  
                  <div className="space-y-6">
                    <div className="p-6 border-2 border-yellow-200 bg-yellow-50 rounded-xl">
                      <h3 className="text-lg font-semibold text-yellow-800 mb-4">Export Your Data</h3>
                      <p className="text-yellow-700 mb-4">
                        Download a copy of all your data including posts, comments, and profile information.
                      </p>
                      <button
                        onClick={handleDataExport}
                        disabled={loading}
                        className="bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
                      >
                        {loading ? 'Exporting...' : 'Export Data'}
                      </button>
                    </div>

                    <div className="p-6 border-2 border-red-200 bg-red-50 rounded-xl">
                      <h3 className="text-lg font-semibold text-red-800 mb-4">Delete Account</h3>
                      <p className="text-red-700 mb-4">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                      <button
                        onClick={handleAccountDeletion}
                        disabled={loading}
                        className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                      >
                        <TrashIcon className="w-5 h-5" />
                        <span>{loading ? 'Deleting...' : 'Delete Account'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
