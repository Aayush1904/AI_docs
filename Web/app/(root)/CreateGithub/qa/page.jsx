"use client"

import React, { useEffect, useState } from 'react';
import AskQuestionCard from '../project/ask-question-card';
import useProject from '../../../../hooks/use-project';
import { Sheet } from '../../../../components/ui/sheet';
import { api } from '@/lib/api';

const QAPage = () => {
  const { project } = useProject();
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

useEffect(() => {
  const fetchQuestions = async () => {
    if (!project?.id) {
      setError('No project selected');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching questions...');
      const response = await fetch(
        api.backend.projects.getQuestions(project.id),
        {
         headers: {
      'Accept': 'application/json', 
    }
        }
      );
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch questions');
      }
      
      const data = await response.json();
      console.log('Questions data:', data);
      setQuestions(data);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message || 'Failed to load questions');
    } finally {
      setIsLoading(false);
    }
  };

  fetchQuestions();
}, [project?.id]);

  return (
    <Sheet>
      <AskQuestionCard />
      <div className="h-4"></div>
      <h1 className="text-xl font-semibold">Saved Questions</h1>
      <div className="h-2"></div>
      
      {error && (
        <div className="text-red-500 mb-4">
          Error: {error}
        </div>
      )}
      
      <div className="flex flex-col gap-2">
        {isLoading ? (
          <div>Loading questions...</div>
        ) : questions?.length ? (
          questions.map((question) => (
            <div 
              key={question.id} 
              className="p-4 border rounded-lg bg-card text-card-foreground"
            >
              <div className="flex items-center gap-2 mb-2">
                {question.user.imageUrl && (
                  <img 
                    src={question.user.imageUrl} 
                    alt="User" 
                    className="w-6 h-6 rounded-full"
                  />
                )}
                <span className="font-medium">
                  {question.user.firstName} {question.user.lastName}
                </span>
                <span className="text-sm text-muted-foreground">
                  {new Date(question.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h3 className="font-semibold">{question.question}</h3>
              <p className="text-muted-foreground mt-1">{question.answer}</p>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground">
            {isLoading ? 'Loading...' : 'No questions saved yet'}
          </p>
        )}
      </div>
    </Sheet>
  );
};

export default QAPage;