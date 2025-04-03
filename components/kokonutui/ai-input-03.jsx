// // "use client";

// // import {
// //     Text,
// //     CheckCheck,
// //     ArrowDownWideNarrow,
// //     CornerRightDown,
// //     Loader2,
// // } from "lucide-react";
// // import { useState } from "react";
// // import { Textarea } from "@/components/ui/textarea";
// // import { cn } from "@/lib/utils";
// // import { useAutoResizeTextarea } from "@/hooks/use-auto-resize-textarea";

// // const ITEMS = [
// //     {
// //         text: "Summary",
// //         icon: Text,
// //         colors: {
// //             icon: "text-orange-600",
// //             border: "border-orange-500",
// //             bg: "bg-orange-100",
// //         },
// //         prompt: "Summarize the following text concisely:",
// //     },
// //     {
// //         text: "Fix Spelling and Grammar",
// //         icon: CheckCheck,
// //         colors: {
// //             icon: "text-emerald-600",
// //             border: "border-emerald-500",
// //             bg: "bg-emerald-100",
// //         },
// //         prompt: "Fix grammar and spelling mistakes in the following text:",
// //     },
// //     {
// //         text: "Make shorter",
// //         icon: ArrowDownWideNarrow,
// //         colors: {
// //             icon: "text-purple-600",
// //             border: "border-purple-500",
// //             bg: "bg-purple-100",
// //         },
// //         prompt: "Make the following text shorter while keeping the meaning:",
// //     },
// // ];

// // export default function AIInput_03() {
// //     const [inputValue, setInputValue] = useState("");
// //     const [selectedItem, setSelectedItem] = useState(ITEMS[2].text);
// //     const [loading, setLoading] = useState(false);

// //     const { textareaRef, adjustHeight } = useAutoResizeTextarea({
// //         minHeight: 52,
// //         maxHeight: 250,
// //     });

// //     const currentItem = ITEMS.find((item) => item.text === selectedItem);

// //     const handleSubmit = async () => {
// //         if (!inputValue.trim()) return;

// //         setLoading(true);

// //         try {
// //             const response = await fetch("/api/ai-process", {
// //                 method: "POST",
// //                 headers: { "Content-Type": "application/json" },
// //                 body: JSON.stringify({ prompt: `${currentItem.prompt} ${inputValue}` }),
// //             });

// //             const data = await response.json();
// //             setInputValue(data.result || inputValue); // Directly update the input field
// //         } catch (error) {
// //             console.error("Error:", error);
// //         }

// //         setLoading(false);
// //         adjustHeight(true);
// //     };

// //     return (
// //         <div className="w-full py-4 px-3 sm:px-4 lg:px-6">
// //             <div className="relative max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl w-full mx-auto">
// //                 <div className="relative border border-black/10 dark:border-white/10 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] p-3 md:p-4 pb-16">
// //                     <div className="flex flex-col">
// //                         {/* Textarea */}
// //                         <div className="overflow-y-auto max-h-[250px] pb-6">
// //                             <Textarea
// //                                 ref={textareaRef}
// //                                 placeholder="Enter your text here..."
// //                                 className={cn(
// //                                     "w-full rounded-xl pr-10 pt-3 pb-3 border-none text-black dark:text-white resize-none bg-transparent",
// //                                     "text-base sm:text-lg md:text-xl leading-[1.3]",
// //                                     "min-h-[52px] md:min-h-[72px] max-h-[250px]"
// //                                 )}
// //                                 value={inputValue}
// //                                 onChange={(e) => {
// //                                     setInputValue(e.target.value);
// //                                     adjustHeight();
// //                                 }}
// //                                 onKeyDown={(e) => {
// //                                     if (e.key === "Enter" && !e.shiftKey) {
// //                                         e.preventDefault();
// //                                         handleSubmit();
// //                                     }
// //                                 }}
// //                             />
// //                         </div>

// //                         {/* Floating AI Button */}
// //                         <div className="absolute left-3 bottom-4 z-10">
// //                             <button
// //                                 type="button"
// //                                 onClick={handleSubmit}
// //                                 disabled={loading}
// //                                 className={cn(
// //                                     "inline-flex items-center gap-1 px-3 py-1 text-xs md:text-sm font-medium rounded-md border",
// //                                     currentItem?.colors.bg,
// //                                     currentItem?.colors.border,
// //                                     loading && "opacity-50 cursor-not-allowed"
// //                                 )}
// //                             >
// //                                 {loading ? (
// //                                     <Loader2 className="w-4 h-4 animate-spin" />
// //                                 ) : (
// //                                     <>
// //                                         <currentItem.icon className={`w-4 h-4 ${currentItem?.colors.icon}`} />
// //                                         <span className={`${currentItem?.colors.icon}`}>{selectedItem}</span>
// //                                     </>
// //                                 )}
// //                             </button>
// //                         </div>
// //                     </div>

// //                     {/* Enter Icon */}
// //                     <CornerRightDown className="absolute right-3 top-3 w-4 h-4 transition-all dark:text-white" />
// //                 </div>
// //             </div>

// //             {/* Feature Selection Buttons */}
// //             <div className="flex flex-wrap gap-1.5 mt-5 max-w-md mx-auto justify-start">
// //                 {ITEMS.filter((item) => item.text !== selectedItem).map(({ text, icon: Icon, colors }) => (
// //                     <button
// //                         type="button"
// //                         key={text}
// //                         className="flex items-center gap-1.5 px-3 py-1 text-xs md:text-sm font-medium rounded-full border transition-all shrink-0"
// //                         onClick={() => setSelectedItem(text)}
// //                     >
// //                         <Icon className={cn("h-4 w-4", colors.icon)} />
// //                         <span className="text-black/70 dark:text-white/70 whitespace-nowrap">{text}</span>
// //                     </button>
// //                 ))}
// //             </div>
// //         </div>
// //     );
// // }


// "use client";

// import {
//     Text,
//     CheckCheck,
//     ArrowDownWideNarrow,
//     CornerRightDown,
//     Loader2,
// } from "lucide-react";
// import { useState } from "react";
// import { Textarea } from "@/components/ui/textarea";
// import { cn } from "@/lib/utils";
// import { useAutoResizeTextarea } from "@/hooks/use-auto-resize-textarea";

// const ITEMS = [
//     {
//         text: "Search Documents",  // Changed from Summary
//         icon: Text,
//         colors: {
//             icon: "text-orange-600",
//             border: "border-orange-500",
//             bg: "bg-orange-100",
//         },
//         type: "search"  // Added type distinction
//     },
//     {
//         text: "Fix Spelling and Grammar",
//         icon: CheckCheck,
//         colors: {
//             icon: "text-emerald-600",
//             border: "border-emerald-500",
//             bg: "bg-emerald-100",
//         },
//         type: "process",
//         prompt: "Fix grammar and spelling mistakes in the following text:",
//     },
//     {
//         text: "Make shorter",
//         icon: ArrowDownWideNarrow,
//         colors: {
//             icon: "text-purple-600",
//             border: "border-purple-500",
//             bg: "bg-purple-100",
//         },
//         type: "process",
//         prompt: "Make the following text shorter while keeping the meaning:",
//     },
// ];

// export default function AIInput_03() {
//     const [inputValue, setInputValue] = useState("");
//     const [selectedItem, setSelectedItem] = useState(ITEMS[0].text); // Default to Search
//     const [loading, setLoading] = useState(false);
//     const [searchResults, setSearchResults] = useState([]); // Added results state

//     const { textareaRef, adjustHeight } = useAutoResizeTextarea({
//         minHeight: 52,
//         maxHeight: 250,
//     });

//     const currentItem = ITEMS.find((item) => item.text === selectedItem);

//     const handleSubmit = async () => {
//         if (!inputValue.trim()) return;

//         setLoading(true);

//         try {
//             if (currentItem.type === "search") {
//                 // Handle document search
//                 const response = await fetch("http://localhost:8000/api/search", {
//                     method: "POST",
//                     headers: { "Content-Type": "application/json" },
//                     body: JSON.stringify({ query: inputValue }),
//                 });

//                 const data = await response.json();
//                 setSearchResults(data.results);
//             } else {
//                 // Handle text processing
//                 const response = await fetch("/api/ai-process", {
//                     method: "POST",
//                     headers: { "Content-Type": "application/json" },
//                     body: JSON.stringify({ 
//                         prompt: `${currentItem.prompt} ${inputValue}` 
//                     }),
//                 });

//                 const data = await response.json();
//                 setInputValue(data.result || inputValue);
//             }
//         } catch (error) {
//             console.error("Error:", error);
//         }

//         setLoading(false);
//         adjustHeight(true);
//     };

//     return (
//         <div className="w-full py-4 px-3 sm:px-4 lg:px-6">
//             <div className="relative max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl w-full mx-auto">
//                 <div className="relative border border-black/10 dark:border-white/10 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] p-3 md:p-4 pb-16">
//                     <div className="flex flex-col">
//                         {/* Textarea */}
//                         <div className="overflow-y-auto max-h-[250px] pb-6">
//                             <Textarea
//                                 ref={textareaRef}
//                                 placeholder="Enter your text here..."
//                                 className={cn(
//                                     "w-full rounded-xl pr-10 pt-3 pb-3 border-none text-black dark:text-white resize-none bg-transparent",
//                                     "text-base sm:text-lg md:text-xl leading-[1.3]",
//                                     "min-h-[52px] md:min-h-[72px] max-h-[250px]"
//                                 )}
//                                 value={inputValue}
//                                 onChange={(e) => {
//                                     setInputValue(e.target.value);
//                                     adjustHeight();
//                                 }}
//                                 onKeyDown={(e) => {
//                                     if (e.key === "Enter" && !e.shiftKey) {
//                                         e.preventDefault();
//                                         handleSubmit();
//                                     }
//                                 }}
//                             />
//                         </div>

//                         {/* Floating AI Button */}
//                         <div className="absolute left-3 bottom-4 z-10">
//                             <button
//                                 type="button"
//                                 onClick={handleSubmit}
//                                 disabled={loading}
//                                 className={cn(
//                                     "inline-flex items-center gap-1 px-3 py-1 text-xs md:text-sm font-medium rounded-md border",
//                                     currentItem?.colors.bg,
//                                     currentItem?.colors.border,
//                                     loading && "opacity-50 cursor-not-allowed"
//                                 )}
//                             >
//                                 {loading ? (
//                                     <Loader2 className="w-4 h-4 animate-spin" />
//                                 ) : (
//                                     <>
//                                         <currentItem.icon className={`w-4 h-4 ${currentItem?.colors.icon}`} />
//                                         <span className={`${currentItem?.colors.icon}`}>{selectedItem}</span>
//                                     </>
//                                 )}
//                             </button>
//                         </div>
//                     </div>

//                     {/* Enter Icon */}
//                     <CornerRightDown className="absolute right-3 top-3 w-4 h-4 transition-all dark:text-white" />
//                 </div>
//             </div>

//             {/* Search Results Display */}
//             {currentItem?.type === "search" && searchResults.length > 0 && (
//                 <div className="mt-6 max-w-2xl mx-auto space-y-4">
//                     <h3 className="text-lg font-semibold">Search Results:</h3>
//                     {searchResults.map((result, index) => (
//                         <div key={index} className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
//                             <div className="text-sm text-gray-500 dark:text-gray-400">
//                                 {result.pdf_name} - Page {result.page}
//                             </div>
//                             <p className="mt-2 text-gray-800 dark:text-gray-200">
//                                 {result.text}
//                             </p>
//                         </div>
//                     ))}
//                 </div>
//             )}

//             {/* Feature Selection Buttons */}
//             <div className="flex flex-wrap gap-1.5 mt-5 max-w-md mx-auto justify-start">
//                 {ITEMS.filter((item) => item.text !== selectedItem).map(({ text, icon: Icon, colors }) => (
//                     <button
//                         type="button"
//                         key={text}
//                         className="flex items-center gap-1.5 px-3 py-1 text-xs md:text-sm font-medium rounded-full border transition-all shrink-0"
//                         onClick={() => setSelectedItem(text)}
//                     >
//                         <Icon className={cn("h-4 w-4", colors.icon)} />
//                         <span className="text-black/70 dark:text-white/70 whitespace-nowrap">{text}</span>
//                     </button>
//                 ))}
//             </div>
//         </div>
//     );
// }
// "use client"
// import { useState, useEffect } from "react";

// export default function SearchComponent() {
//     const [query, setQuery] = useState("");
//     const [results, setResults] = useState([]);

//     useEffect(() => {
//         const ws = new WebSocket("ws://localhost:8765");

//         ws.onopen = () => console.log("Connected to WebSocket");
        
//         ws.onmessage = (event) => {
//             const data = JSON.parse(event.data);
//             console.log("Received:", data);
//             if (data.results) {
//                 setResults(data.results); // Update state with results
//             }
//         };

//         return () => ws.close();
//     }, []);

//     const sendQuery = () => {
//         const ws = new WebSocket("ws://localhost:8765");
//         ws.onopen = () => ws.send(query);
//     };

//     return (
//         <div>
//             <input 
//                 type="text" 
//                 value={query} 
//                 onChange={(e) => setQuery(e.target.value)} 
//                 placeholder="Enter search query"
//             />
//             <button onClick={sendQuery}>Search</button>

//             <h3>Results:</h3>
//             <ul>
//                 {results.map((result, index) => (
//                     <li key={index}>
//                         <strong>{result.pdf_name} - Page {result.page}</strong>
//                         <p>{result.text}</p>
//                     </li>
//                 ))}
//             </ul>
//         </div>
//     );
// }
"use client";
import { useState, useEffect, useRef } from "react";

export default function AIInput_03() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const ws = useRef(null); // Store WebSocket instance

    useEffect(() => {
        ws.current = new WebSocket("ws://localhost:8765");

        ws.current.onopen = () => console.log("Connected to WebSocket");

        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("Received:", data);
            if (data.results) {
                setResults(data.results);
            }
        };

        ws.current.onerror = (error) => console.error("WebSocket Error:", error);
        ws.current.onclose = () => console.log("WebSocket Closed");

        return () => {
            ws.current.close();
        };
    }, []);

    const sendQuery = () => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(query);
        } else {
            console.error("WebSocket not connected");
        }
    };

    return (
        <div className="p-6 max-w-lg mx-auto bg-white rounded-xl shadow-md space-y-4">
            <h1 className="text-xl font-bold">AI Search</h1>

            <div className="flex space-x-2">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Enter search query"
                    className="w-full p-2 border rounded"
                />
                <button 
                    onClick={sendQuery} 
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                    Search
                </button>
            </div>

            <h3 className="text-lg font-semibold">Results:</h3>
            <ul className="list-disc pl-5 space-y-2">
                {results.map((result, index) => (
                    <li key={index} className="border-b pb-2">
                        <strong className="block">{result.pdf_name} - Page {result.page}</strong>
                        <p className="text-gray-700">{result.text}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}
