import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import {
  ChatBubbleLeftIcon,
  HeartIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowUturnLeftIcon,
  PaperAirplaneIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

export default function Comments({ postId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      const res = await api.get(`/posts/${postId}/comments`);
      setComments(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await api.post(`/posts/${postId}/comments`, {
        content: newComment,
        parentComment: replyTo?.id || null
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setNewComment('');
      setReplyTo(null);
      fetchComments();
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = async (commentId) => {
    if (!editContent.trim()) return;

    try {
      const token = localStorage.getItem('token');
      await api.put(`/comments/${commentId}`, {
        content: editContent
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setEditingComment(null);
      setEditContent('');
      fetchComments();
    } catch (error) {
      console.error('Failed to edit comment:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      const token = localStorage.getItem('token');
      await api.delete(`/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      fetchComments();
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const handleLikeComment = async (commentId) => {
    if (!user) return;

    try {
      const token = localStorage.getItem('token');
      await api.post(`/comments/${commentId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      fetchComments();
    } catch (error) {
      console.error('Failed to like comment:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    
    if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffHours < 168) {
      return `${Math.ceil(diffHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const CommentItem = ({ comment, isReply = false }) => {
    const isAuthor = user && user.id === comment.author._id;
    const hasLiked = user && comment.likes?.includes(user.id);

    return (
      <div className={`${isReply ? 'ml-12' : ''} mb-6`}>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          {/* Comment Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {comment.author.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">{comment.author.name}</p>
                <p className="text-sm text-gray-500">
                  {formatDate(comment.createdAt)}
                  {comment.isEdited && <span className="ml-2 text-xs">(edited)</span>}
                </p>
              </div>
            </div>

            {isAuthor && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setEditingComment(comment._id);
                    setEditContent(comment.content);
                  }}
                  className="text-gray-400 hover:text-blue-500 transition-colors"
                >
                  <PencilSquareIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDeleteComment(comment._id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Comment Content */}
          {editingComment === comment._id ? (
            <div className="mb-4">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                rows="3"
              />
              <div className="flex justify-end space-x-2 mt-2">
                <button
                  onClick={() => {
                    setEditingComment(null);
                    setEditContent('');
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleEditComment(comment._id)}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-800 mb-4 leading-relaxed">{comment.content}</p>
          )}

          {/* Comment Actions */}
          <div className="flex items-center space-x-6">
            <button
              onClick={() => handleLikeComment(comment._id)}
              disabled={!user}
              className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors disabled:opacity-50"
            >
              {hasLiked ? (
                <HeartSolidIcon className="w-5 h-5 text-red-500" />
              ) : (
                <HeartIcon className="w-5 h-5" />
              )}
              <span className="text-sm font-medium">{comment.likes?.length || 0}</span>
            </button>

            {!isReply && (
              <button
                onClick={() => setReplyTo({ id: comment._id, author: comment.author.name })}
                disabled={!user}
                className="flex items-center space-x-2 text-gray-500 hover:text-primary-500 transition-colors disabled:opacity-50"
              >
                <ArrowUturnLeftIcon className="w-5 h-5" />
                <span className="text-sm font-medium">Reply</span>
              </button>
            )}
          </div>
        </div>

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4">
            {comment.replies.map((reply) => (
              <CommentItem key={reply._id} comment={reply} isReply={true} />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="flex items-center space-x-3 mb-8">
          <ChatBubbleLeftIcon className="w-6 h-6 text-primary-600" />
          <h3 className="text-2xl font-bold text-gray-900">Comments</h3>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-100 rounded-xl p-6 animate-pulse">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                <div className="space-y-2">
                  <div className="w-24 h-4 bg-gray-300 rounded"></div>
                  <div className="w-16 h-3 bg-gray-300 rounded"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="w-full h-4 bg-gray-300 rounded"></div>
                <div className="w-3/4 h-4 bg-gray-300 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <ChatBubbleLeftIcon className="w-6 h-6 text-primary-600" />
          <h3 className="text-2xl font-bold text-gray-900">
            Comments ({comments.length})
          </h3>
        </div>
      </div>

      {/* Comment Form */}
      {user ? (
        <form onSubmit={handleSubmitComment} className="mb-12">
          {replyTo && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <p className="text-blue-800">
                  Replying to <strong>{replyTo.author}</strong>
                </p>
                <button
                  type="button"
                  onClick={() => setReplyTo(null)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </div>
            </div>
          )}
          
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-sm">
                  {user.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={replyTo ? `Reply to ${replyTo.author}...` : "Share your thoughts..."}
                  className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  rows="4"
                  disabled={submitting}
                />
                
                <div className="flex justify-between items-center mt-4">
                  <p className="text-sm text-gray-500">
                    {1000 - newComment.length} characters remaining
                  </p>
                  
                  <button
                    type="submit"
                    disabled={!newComment.trim() || submitting || newComment.length > 1000}
                    className="flex items-center space-x-2 bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Posting...</span>
                      </>
                    ) : (
                      <>
                        <PaperAirplaneIcon className="w-5 h-5" />
                        <span>{replyTo ? 'Reply' : 'Comment'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center mb-12">
          <ChatBubbleLeftIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Join the Conversation</h4>
          <p className="text-gray-600 mb-4">Sign in to comment and engage with other readers.</p>
          <div className="space-x-4">
            <a
              href="/login"
              className="bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors inline-block"
            >
              Sign In
            </a>
            <a
              href="/register"
              className="border border-primary-500 text-primary-600 px-6 py-3 rounded-lg hover:bg-primary-50 transition-colors inline-block"
            >
              Sign Up
            </a>
          </div>
        </div>
      )}

      {/* Comments List */}
      {comments.length > 0 ? (
        <div>
          {comments.map((comment) => (
            <CommentItem key={comment._id} comment={comment} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <ChatBubbleLeftIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h4 className="text-xl font-semibold text-gray-900 mb-2">No comments yet</h4>
          <p className="text-gray-600">
            {user ? "Be the first to share your thoughts!" : "Sign in to start the conversation."}
          </p>
        </div>
      )}
    </div>
  );
}
