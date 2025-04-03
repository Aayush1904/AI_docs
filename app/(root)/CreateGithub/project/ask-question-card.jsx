'use client'
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import useProject from '@/hooks/use-project'
import React from 'react'
import { askQuestion } from './actions';
import { readStreamableValue } from 'ai/rsc';
import MDEditor from '@uiw/react-md-editor';
import CodeReferences from './codeReferences';
import toast from 'react-hot-toast';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useAuth } from '@clerk/nextjs';
import RemoveMarkdown from 'remove-markdown';

const AskQuestionCard = () => {
    const {project} = useProject();
    const [question, setQuestion] = React.useState('');
    const [open, setOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [fileReferences, setFileReferences] = React.useState([]);
    const [answer, setAnswer] = React.useState('');
    const [isSaving, setIsSaving] = React.useState(false);
    const { userId } = useAuth();

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!project?.id) return;
        
        setLoading(true);
        setOpen(true);
        setAnswer('');
        setFileReferences([]);
        
        try {
            const { output, fileReferences } = await askQuestion(question, project.id);
            setFileReferences(fileReferences);
            
            let fullAnswer = '';
            for await (const chunk of readStreamableValue(output)) {
                if (chunk) {
                    fullAnswer = chunk;
                    setAnswer(fullAnswer);
                }
            }
        } catch (error) {
            toast.error('Failed to get answer');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

const handleSaveAnswer = async () => {
  if (!project?.id || !answer?.trim() || !question?.trim()) {
    toast.error('Question and answer are required');
    return;
  }

  setIsSaving(true);
  try {
    const response = await fetch(`http://localhost:5001/api/projects/saveAnswer/${project.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        question: question.trim(), 
        answer: answer.trim(),
        fileReferences: fileReferences, 
        userId: userId 
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to save question');
    }

    toast.success('Question saved successfully');
    return data;
    
  } catch (error) {
    console.error('Save error:', error);
    toast.error(error.message || 'Failed to save question');
  } finally {
    setIsSaving(false);
  }
};

    // const renderAnswerContent = () => {
    //     if (!answer) return null;
    //     return answer.split('\n\n').map((paragraph, index) => {
    //         if (!paragraph.trim()) return null;
    //         if (paragraph.startsWith('- ') || paragraph.startsWith('* ')) {
    //             return (
    //                 <ul key={index} className="list-disc pl-6 mb-4 space-y-1">
    //                     {paragraph.split('\n').map((item, i) => (
    //                         <li key={i}>
    //                             {item.replace(/^[-*]\s+/, '')}
    //                         </li>
    //                     ))}
    //                 </ul>
    //             );
    //         }
    //         return (
    //             <p key={index} className="mb-4leading-relaxed">
    //                 {paragraph}
    //             </p>
    //         );
    //     });
    // };

    const renderAnswerContent = () => {
    if (!answer) return null;

    // First, clean the answer by removing standalone stars
    // const cleanedAnswer = answer
    //     .replace(/(^|\s)\*(\s|$)/g, ' ')  
    //     .replace(/\*\*(.*?)\*\*/g, '$1') 
    //     .replace(/\*(.*?)\*/g, '$1');     
    const cleanedAnswer = RemoveMarkdown(answer);

    // Split by lines to handle different content types
    const lines = cleanedAnswer.split('\n');
    const elements = [];
    let currentList = [];
    let currentCodeBlock = [];
    let inCodeBlock = false;

    for (const line of lines) {
        // Handle code blocks
        if (line.startsWith('```')) {
            if (inCodeBlock) {
                // End of code block
                elements.push(
                    <SyntaxHighlighter 
                        language={currentCodeBlock[0]?.replace('```', '') || 'javascript'}
                        style={atomDark}
                        key={`code-${elements.length}`}
                        className="rounded-md my-4"
                    >
                        {currentCodeBlock.slice(1).join('\n')}
                    </SyntaxHighlighter>
                );
                currentCodeBlock = [];
                inCodeBlock = false;
            } else {
                // Start of code block
                inCodeBlock = true;
            }
            continue;
        }

        if (inCodeBlock) {
            currentCodeBlock.push(line);
            continue;
        }

        // Handle bullet points (now using cleaned lines without stars)
        if (line.startsWith('- ') || line.trim().startsWith('-')) {
            currentList.push(line.replace(/^-\s*/, ''));
            continue;
        }

        // If we have items in current list but hit a non-list item
        if (currentList.length > 0) {
            elements.push(
                <ul key={`list-${elements.length}`} className="list-disc pl-6 mb-4 space-y-1">
                    {currentList.map((item, i) => (
                        <li key={i}>{item}</li>
                    ))}
                </ul>
            );
            currentList = [];
        }

        // Handle regular text (with stars already removed)
        if (line.trim()) {
            // Check for headings
            if (line.startsWith('## ')) {
                elements.push(
                    <h2 key={`heading-${elements.length}`} className="text-xl font-semibold mt-6 mb-3">
                        {line.replace('## ', '')}
                    </h2>
                );
            } else if (line.startsWith('### ')) {
                elements.push(
                    <h3 key={`heading-${elements.length}`} className="text-lg font-medium mt-4 mb-2">
                        {line.replace('### ', '')}
                    </h3>
                );
            } else {
                elements.push(
                    <p key={`para-${elements.length}`} className="mb-4 leading-relaxed">
                        {line}
                    </p>
                );
            }
        }
    }

    // Add any remaining list items
    if (currentList.length > 0) {
        elements.push(
            <ul key={`list-${elements.length}`} className="list-disc pl-6 mb-4 space-y-1">
                {currentList.map((item, i) => (
                    <li key={i}>{item}</li>
                ))}
            </ul>
        );
    }

    // Add any remaining code (shouldn't happen with proper markdown)
    if (currentCodeBlock.length > 0) {
        elements.push(
            <SyntaxHighlighter 
                language="javascript"
                style={atomDark}
                key={`code-${elements.length}`}
                className="rounded-md my-4"
            >
                {currentCodeBlock.join('\n')}
            </SyntaxHighlighter>
        );
    }

    return elements;
};

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[80vw] max-h-[90vh] overflow-auto">
                    <DialogHeader>
                        <div className="flex items-center justify-between">
                            <DialogTitle className="text-xl font-semibold">
                                {question}
                            </DialogTitle>
                            <Button 
                                variant="outline" 
                                onClick={handleSaveAnswer}
                                disabled={isSaving || loading}
                                className="ml-4"
                            >
                                {isSaving ? 'Saving...' : 'Save Answer'}
                            </Button>
                        </div>
                    </DialogHeader>
                    
                    <div className="prose prose-invert max-w-none p-4 rounded-lg  my-4">
                        {renderAnswerContent()}
                    </div>
                    
                    <div className="h-4"></div>
                    
                    {fileReferences.length > 0 && (
                        <>
                            <h3 className="text-lg font-medium mb-2">References</h3>
                            <CodeReferences fileReferences={fileReferences} />
                        </>
                    )}
                    
                    <div className="flex justify-end mt-4">
                        <Button 
                            type="button" 
                            onClick={() => setOpen(false)}
                            variant="ghost"
                        >
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>   
            
            <Card className="relative col-span-3">
                <CardHeader>
                    <CardTitle className="text-xl">Ask a Question</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit}>
                        <Textarea 
                            placeholder="Which file to edit?" 
                            value={question}
                            onChange={e => setQuestion(e.target.value)}
                        />
                        <div className="h-4"></div>
                        <Button 
                            type="submit" 
                            disabled={loading}
                            className="w-full"
                        >
                            {loading ? 'Thinking...' : 'Ask NeuralDocs'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </>
    )
}

export default AskQuestionCard