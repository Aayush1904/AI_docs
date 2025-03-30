'use client'
import useProject from '@/hooks/use-project';
import { cn } from '@/lib/utils';
import Lottie from 'lottie-react';
import GithubAvatar from "../../../../public/GithubAvatar.json";
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';

const CommitLog = ({projectId}) => {
  const [commits, setCommits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { project } = useProject();

  useEffect(() => {
    if (!projectId) return;
    const fetchCommits = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/projects/commits/${projectId}`);
        if (!response.ok) throw new Error('Failed to fetch commits');
        const data = await response.json();
        setCommits(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCommits();
  }, [projectId]);

  if (loading) return <div className="text-center">Loading commits...</div>;
  if (error) return <div className="text-red-500 text-center">Error: {error}</div>;
  if (commits.length === 0) return <div className="text-center">No commits found.</div>;

  return (
    <div className="p-4 rounded-lg shadow-lg bg-white">
      <h2 className="text-lg font-bold mb-4">Commit History</h2>
      <ul className='space-y-6'>
        {commits.map((commit, commitIdx) => (
          <li key={commit.id} className='relative flex gap-x-4 p-4 border-b border-gray-200'>
            <div className={cn(
                commitIdx === commits.length - 1 ? 'h-6' : '-bottom-6', 
                'absolute left-0 top-0 flex w-6 justify-center'
            )}>
                <div className='w-px translate-x-1 bg-gray-200 '></div>
            </div>
             <div className="flex-none">
              {commit.commitAuthorAvatar ? (
                <img
                  src={commit.commitAuthorAvatar}
                  alt="Avatar"
                  className='w-12 h-12 rounded-full bg-gray-50'
                />
              ) : (
                <Lottie
                  animationData={GithubAvatar}
                  loop
                  autoPlay
                  className='w-12 h-12 rounded-full bg-gray-50'
                />
              )}
            </div>
            <div className='flex-auto rounded-md p-3 ring-1 ring-gray-200'>
                <div className='flex justify-between items-center mb-1'>
                    <Link target='_blank' href={`${project?.githubUrl}/commits/${commit.commitHash}`} className='text-sm leading-5 text-gray-500 hover:text-blue-500'>
                      <span className='font-medium text-gray-800'>
                          {commit.commitAuthorName}
                      </span>{" "}
                      <span className='inline-flex items-center'>
                          committed
                          <ExternalLink className='ml-1 size-4 text-gray-500 hover:text-blue-500' />
                      </span>
                    </Link>
                    <span className="text-xs text-gray-400">
                      {new Date(commit.commitDate).toLocaleDateString()}
                    </span>
                </div>
                <span className='font-semibold text-gray-900'>{commit.commitMessage}</span>
                <pre className='mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-600'>{commit.summary}</pre>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CommitLog;