'use client'
import useProject from '@/hooks/use-project';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';

// Dynamically import Lottie with SSR disabled
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });
import GithubAvatar from "../../../../public/GithubAvatar.json";
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

const CommitLog = ({projectId}) => {
  const [commits, setCommits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { project } = useProject();
  const { userId } = useAuth();
  const [commentThreads, setCommentThreads] = useState({}); // {commitId: {comments, userMap, input, editingIdx, editValue}}

  // Helper to fetch commits (with error handling for 429)
  const fetchCommits = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(api.backend.projects.getCommits(projectId));
      if (response.status === 429) {
        const data = await response.json();
        throw new Error(data.error || 'GitHub API rate limit exceeded. Please add a GitHub token or try again later.');
      }
      if (!response.ok) throw new Error('Failed to fetch commits');
      const data = await response.json();
      setCommits(data);
      // Fetch comments for each commit
      data.forEach(commit => fetchComments(commit.id));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch comments for a commit
  const fetchComments = async (commitId) => {
    const res = await fetch(api.backend.comments.get(commitId));
    const data = await res.json();
    const userMap = {};
    (data.comments || []).forEach(c => { if (c.user) userMap[c.userId] = c.user; });
    setCommentThreads(prev => ({
      ...prev,
      [commitId]: {
        ...(prev[commitId] || {}),
        comments: data.comments || [],
        userMap,
        input: '',
        editingIdx: null,
        editValue: '',
      }
    }));
  };

  // Add comment
  const handleAddComment = async (commitId) => {
    const thread = commentThreads[commitId] || {};
    if (!thread.input.trim()) return;
    const res = await fetch(api.backend.comments.create(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: thread.input,
        userId,
        projectId: project.id,
        commitId,
      }),
    });
    const data = await res.json();
    if (data.comment) {
      setCommentThreads(prev => ({
        ...prev,
        [commitId]: {
          ...prev[commitId],
          comments: [...(prev[commitId]?.comments || []), data.comment],
          input: '',
          userMap: { ...prev[commitId]?.userMap, [data.comment.userId]: data.comment.user },
        }
      }));
    }
  };

  // Edit comment
  const handleEditComment = (commitId, idx) => {
    setCommentThreads(prev => ({
      ...prev,
      [commitId]: {
        ...prev[commitId],
        editingIdx: idx,
        editValue: prev[commitId].comments[idx].text,
      }
    }));
  };
  const handleSaveEdit = async (commitId, idx) => {
    const thread = commentThreads[commitId];
    const comment = thread.comments[idx];
    const res = await fetch(api.backend.comments.create(), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: comment.id, text: thread.editValue, userId }),
    });
    const data = await res.json();
    if (data.success) {
      setCommentThreads(prev => ({
        ...prev,
        [commitId]: {
          ...prev[commitId],
          comments: thread.comments.map((c, i) => i === idx ? { ...c, text: thread.editValue } : c),
          editingIdx: null,
          editValue: '',
        }
      }));
    }
  };

  // Delete comment
  const handleDeleteComment = async (commitId, idx) => {
    const thread = commentThreads[commitId];
    const comment = thread.comments[idx];
    const res = await fetch(api.backend.comments.create(), {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: comment.id, userId }),
    });
    const data = await res.json();
    if (data.success) {
      setCommentThreads(prev => ({
        ...prev,
        [commitId]: {
          ...prev[commitId],
          comments: thread.comments.filter((_, i) => i !== idx),
        }
      }));
    }
  };

  useEffect(() => {
    if (!projectId) return;
    fetchCommits();
    // eslint-disable-next-line
  }, [projectId]);

  if (loading) return <div className="text-center p-4">Loading commits...</div>;

  if (error) return (
    <div className="flex flex-col items-center justify-center p-6 bg-red-50 rounded-lg border border-red-200 max-w-xl mx-auto">
      <svg className="w-10 h-10 text-red-400 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0ZM12 17h.01" /></svg>
      <p className="text-red-700 font-semibold text-lg mb-2">{error.includes('rate limit') ? 'GitHub API Rate Limit Exceeded' : 'Error loading commits'}</p>
      <p className="text-red-600 text-sm mb-4 text-center">
        {error.includes('rate limit')
          ? 'You have hit the GitHub API rate limit. Please add a GitHub token in project settings or try again later.'
          : error}
      </p>
      <button
        onClick={fetchCommits}
        className="px-4 py-2 rounded bg-gradient-to-r from-teal-500 to-blue-500 text-white font-medium shadow hover:from-teal-600 hover:to-blue-600 transition"
      >
        Retry
      </button>
    </div>
  );

  if (commits.length === 0) return <div className="text-center p-4">No commits found.</div>;

  return (
    <div className="p-2 sm:p-4 rounded-lg">
      <h2 className="text-lg font-bold mb-4 px-2 sm:px-0">Commit History</h2>
      <ul className='space-y-4'>
        {commits.map((commit, commitIdx) => {
          const thread = commentThreads[commit.id] || { comments: [], userMap: {}, input: '', editingIdx: null, editValue: '' };
          const comments = Array.isArray(thread.comments) ? thread.comments : [];
          return (
            <li key={commit.id} className='relative flex flex-col sm:flex-row gap-4 p-3 sm:p-4'>
              {/* Timeline indicator */}
              <div className={cn(
                  commitIdx === commits.length - 1 ? 'h-6' : '-bottom-6', 
                  'absolute left-0 top-0 flex w-6 justify-center sm:block' , 'hidden'
              )}>
                  <div className='w-px translate-x-1 bg-gray-200 h-full'></div>
              </div>
              {/* Avatar */}
              <div className="flex-shrink-0 pl-6 sm:pl-0">
                {commit.commitAuthorAvatar ? (
                  <img
                    src={commit.commitAuthorAvatar}
                    alt="Avatar"
                    className='w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-50'
                  />
                ) : (
                  <Lottie
                    animationData={GithubAvatar}
                    loop
                    autoPlay
                    className='w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-50'
                  />
                )}
              </div>
              {/* Commit details */}
              <div className='flex-1 min-w-0 rounded-md p-3 ring-1 ring-gray-200'>
                <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 mb-2'>
                  <Link 
                    target='_blank' 
                    href={`${project?.githubUrl}/commits/${commit.commitHash}`} 
                    className='text-sm leading-5 hover:text-blue-500 line-clamp-1'
                  >
                    <span className='font-medium text-gray-800'>
                        {commit.commitAuthorName}
                    </span>{" "}
                    <span className='inline-flex items-center'>
                        committed
                        <ExternalLink className='ml-1 size-3 sm:size-4' />
                    </span>
                  </Link>
                  <span className="text-xs text-gray-400">
                    {new Date(commit.commitDate).toLocaleDateString()}
                  </span>
                </div>
                <p className='font-semibold text-gray-900 line-clamp-2'>
                  {commit.commitMessage}
                </p>
                <pre className='mt-2 text-sm leading-6 text-gray-600 whitespace-pre-wrap break-words'>
                  {commit.summary}
                </pre>
                {/* Comment Thread */}
                <div className="mt-4">
                  <h4 className="text-md font-medium mb-1">Comments</h4>
                  <div className="space-y-3">
                    {comments.length === 0 && <div className="text-gray-400 text-sm">No comments yet.</div>}
                    {comments.map((c, idx) => (
                      <div key={c.id} className="flex items-start gap-2 bg-gray-50 rounded-md p-2">
                        <div className="flex-1">
                          <div className="text-xs text-gray-500 mb-1">
                            {thread.userMap[c.userId]?.firstName || 'User'}
                            {thread.userMap[c.userId]?.lastName ? ' ' + thread.userMap[c.userId].lastName : ''}
                            {thread.userMap[c.userId]?.emailAddress ? ` (${thread.userMap[c.userId].emailAddress})` : ''}
                            • {new Date(c.createdAt).toLocaleString()}
                          </div>
                          {thread.editingIdx === idx ? (
                            <div className="flex gap-2">
                              <input
                                className="flex-1 rounded border px-2 py-1 text-sm"
                                value={thread.editValue}
                                onChange={e => setCommentThreads(prev => ({
                                  ...prev,
                                  [commit.id]: { ...prev[commit.id], editValue: e.target.value }
                                }))}
                              />
                              <Button size="sm" variant="default" onClick={() => handleSaveEdit(commit.id, idx)}>Save</Button>
                              <Button size="sm" variant="default" onClick={() => setCommentThreads(prev => ({ ...prev, [commit.id]: { ...prev[commit.id], editingIdx: null, editValue: '' } }))}>Cancel</Button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between w-full">
                              <span className="text-sm text-gray-800 break-words">{c.text}</span>
                              {c.userId === userId && (
                                <div className="flex gap-2 ml-4">
                                  <Button size="sm" variant="default" onClick={() => handleEditComment(commit.id, idx)}>Edit</Button>
                                  <Button size="sm" variant="default" onClick={() => handleDeleteComment(commit.id, idx)}>Delete</Button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <input
                      className="flex-1 rounded border px-2 py-1 text-sm"
                      placeholder="Add a comment..."
                      value={thread.input}
                      onChange={e => setCommentThreads(prev => ({ ...prev, [commit.id]: { ...prev[commit.id], input: e.target.value } }))}
                      onKeyDown={e => { if (e.key === 'Enter') handleAddComment(commit.id); }}
                    />
                    <Button size="sm" onClick={() => handleAddComment(commit.id)}>Add</Button>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default CommitLog;