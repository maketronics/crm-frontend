import React, { useState, useEffect } from 'react';
import { Button, Input } from '../ui';
import { leadService } from '../../lib/leadService';
import { authStore } from '../../stores/authStore';
import type { LeadComment, CreateCommentRequest } from '../../types';
import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

interface CommentsSectionProps {
  leadId: string;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({ leadId }) => {
  const [comments, setComments] = useState<LeadComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = authStore((state) => state.user);

  useEffect(() => {
    fetchComments();
  }, [leadId]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const fetchedComments = await leadService.getComments(leadId);
      setComments(fetchedComments);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setIsSubmitting(true);
    try {
      const commentData: CreateCommentRequest = {
        personId: user.id || user.name || 'current-user',
        message: newComment.trim(),
      };

      const createdComment = await leadService.addComment(leadId, commentData);
      setComments([...comments, createdComment]);
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <ChatBubbleLeftIcon className="h-5 w-5 text-gray-500" />
        <h3 className="text-lg font-semibold text-gray-900">
          Comments ({comments.length})
        </h3>
      </div>

      {/* Add Comment Form */}
      <form onSubmit={handleSubmitComment} className="space-y-3">
        <div>
          <Input
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
        <div className="flex justify-end">
          <Button
            type="submit"
            size="sm"
            disabled={!newComment.trim() || isSubmitting}
            isLoading={isSubmitting}
          >
            Add Comment
          </Button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-4">
            <p className="text-gray-500">Loading comments...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-500">No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-gray-50 rounded-lg p-4 border border-gray-200"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium text-gray-900">
                  {comment.createdBy}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(comment.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-gray-700">{comment.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};