// 'use client'
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// import { Textarea } from '@/components/ui/textarea';
// import useProject from '@/hooks/use-project'
// import React from 'react'
// import { askQuestion } from './actions';
// import { readStreamableValue } from 'ai/rsc';

// const AskQuestionCard = () => {
//     const {project} = useProject();
//     const [question , setQuestion] = React.useState('')
//     const [open , setOpen] = React.useState(false)
//     const [loading , setLoading] = React.useState(false)
//     const [fileReferences, setFileReferences] = React.useState([]);
//     const [answer , setAnswer] = React.useState("")

//     // const onSubmit = async(e) => {
//     //     e.preventDefault();
//     //     if(!project?.id) return
//     //     setLoading(true)
//     //     setOpen(true)

//     //     const {output , fileReferences} = await askQuestion(question , project.id)
//     //     setFileReferences(fileReferences)

//     //     // for await (const delta of readStreamableValue(output)){
//     //     //     if(delta){
//     //     //         setAnswer(ans => ans + delta)
//     //     //     }
//     //     // }
//     //     for await (const delta of readStreamableValue(output)) {
//     //         console.log("Received Stream Chunk:", delta); // Debugging
//     //         if (delta) {
//     //             setAnswer(ans => ans + delta);
//     //         }
//     //         }
//     //     setLoading(false)
//     // }

//     const onSubmit = async (e) => {
//     e.preventDefault();
//     if (!project?.id) return;
    
//     setLoading(true);
//     setOpen(true);
//     setAnswer('')
    
//     const { output, fileReferences } = await askQuestion(question, project.id);
//     setFileReferences(fileReferences);
    
//    for await (const delta of readStreamableValue(output)) {
//             if (delta) {
//                 setAnswer(output => output + delta); 
//             }
//         }

//     setLoading(false);
// };

//   return (
//     <>
//         <Dialog open={open} onOpenChange = {setOpen}>
//             <DialogContent>
//                 <DialogHeader>
//                     <DialogTitle>
//                         Welcome
//                     </DialogTitle>
//                 </DialogHeader>
//                 <div>{answer}</div>
//                 <h1>File References</h1>
//                 {fileReferences.map((file, index) => (
//     <div key={index}>
//         <span>{file.fileName}</span>
//         <small>{file.filePath}</small>
//     </div>
// ))}
//             </DialogContent>
//         </Dialog>   
//       <Card className="relative col-span-3">
//         <CardHeader>
//             <CardTitle>Ask a Question</CardTitle>
//         </CardHeader>
//         <CardContent>
//             <form onSubmit={onSubmit}>
//                 <Textarea 
//                         placeholder="Which file to edit?" 
//                         value={question}
//                         onChange={e => setQuestion(e.target.value)}
//                         />
//                 <div className="h-4"></div>
//                 <Button type='submit'>
//                     Ask NeuralDocs
//                 </Button>
//             </form>
//         </CardContent>
//       </Card>
//     </>
//   )
// }

// export default AskQuestionCard


'use client'
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import useProject from '@/hooks/use-project';
import React from 'react';
import { askQuestion } from './actions';
import { readStreamableValue } from 'ai/rsc';

const AskQuestionCard = () => {
    const { project } = useProject();
    const [question, setQuestion] = React.useState('');
    const [open, setOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [fileReferences, setFileReferences] = React.useState([]);
    const [answerChunks, setAnswerChunks] = React.useState([]); // Use an array to store chunks

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!project?.id) return;

        setLoading(true);
        setOpen(true);

        const { output, fileReferences } = await askQuestion(question, project.id);
        setFileReferences(fileReferences);

        // Read the streamable value and update the answer chunks
        const chunks = []; // Temporary array to hold chunks
        for await (const delta of readStreamableValue(output)) {
            if (delta) {
                chunks.push(delta); // Collect chunks in a temporary array
            }
        }

        // Update state with all chunks at once
        setAnswerChunks(chunks);

        setLoading(false);
    };

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Welcome</DialogTitle>
                    </DialogHeader>
                    <div>{answerChunks.join('')}</div> {/* Join chunks for display */}
                    <h1>File References</h1>
                    {fileReferences.map((file, index) => (
                        <div key={index}>
                            <span>{file.fileName}</span>
                            <small>{file.filePath}</small>
                        </div>
                    ))}
                </DialogContent>
            </Dialog>
            <Card className="relative col-span-3">
                <CardHeader>
                    <CardTitle>Ask a Question</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit}>
                        <Textarea 
                            placeholder="Which file to edit?" 
                            value={question}
                            onChange={e => setQuestion(e.target.value)}
                        />
                        <div className="h-4"></div>
                        <Button type='submit' disabled={loading}>
                            {loading ? 'Loading...' : 'Ask NeuralDocs'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </>
    );
}

export default AskQuestionCard;