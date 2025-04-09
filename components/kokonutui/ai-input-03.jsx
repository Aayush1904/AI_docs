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
//         text: "Summary",
//         icon: Text,
//         colors: {
//             icon: "text-orange-600",
//             border: "border-orange-500",
//             bg: "bg-orange-100",
//         },
//         prompt: "Summarize the following text concisely:",
//     },
//     {
//         text: "Fix Spelling and Grammar",
//         icon: CheckCheck,
//         colors: {
//             icon: "text-emerald-600",
//             border: "border-emerald-500",
//             bg: "bg-emerald-100",
//         },
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
//         prompt: "Make the following text shorter while keeping the meaning:",
//     },
// ];

// export default function AIInput_03() {
//     const [inputValue, setInputValue] = useState("");
//     const [selectedItem, setSelectedItem] = useState(ITEMS[2].text);
//     const [loading, setLoading] = useState(false);

//     const { textareaRef, adjustHeight } = useAutoResizeTextarea({
//         minHeight: 52,
//         maxHeight: 250,
//     });

//     const currentItem = ITEMS.find((item) => item.text === selectedItem);

//     const handleSubmit = async () => {
//         if (!inputValue.trim()) return;

//         setLoading(true);

//         try {
//             const response = await fetch("/api/ai-process", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({ prompt: `${currentItem.prompt} ${inputValue}` }),
//             });

//             const data = await response.json();
//             setInputValue(data.result || inputValue); // Directly update the input field
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

// "use client";
// import { useState, useEffect, useRef } from "react";

// export default function AIInput_03() {
//     const [query, setQuery] = useState("");
//     const [results, setResults] = useState([]);

//     const sendQuery = async () => {
//         if (!query.trim()) return;

//         try {
//             const response = await fetch("http://127.0.0.1:5000/generate", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({ query }),
//             });

//             if (response.ok) {
//                 const data = await response.json();
//                 setResults(data.results || []);
//             } else {
//                 console.error("Error:", response.statusText);
//             }
//         } catch (error) {
//             console.error("Error:", error);
//         }
//     };


//     return (
//         <div className="p-6 max-w-5xl mx-auto bg-white rounded-xl shadow-md space-y-4 mt-6">
//             <h1 className="text-xl font-bold">AI Search</h1>

//             <div className="flex space-x-2">
//                 <input
//                     type="text"
//                     value={query}
//                     onChange={(e) => setQuery(e.target.value)}
//                     placeholder="Enter search query"
//                     className="w-full p-2 border rounded"
//                 />
//                 <button 
//                     onClick={sendQuery} 
//                     className="bg-blue-500 text-white px-4 py-2 rounded"
//                 >
//                     Search
//                 </button>
//             </div>

//             <h3 className="text-lg font-semibold">Results:</h3>
//             <ul className="list-disc pl-5 space-y-2">
//                 {results.map((result, index) => (
//                     <li key={index} className="border-b pb-2">
//                         <strong className="block">{result.pdf_name} - Page {result.page}</strong>
//                         <p className="text-gray-700">{result.text}</p>
//                     </li>
//                 ))}
//             </ul>
//         </div>
//     );
// }
"use client";
import { useState } from "react";

export default function AIInput_03() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [uploading, setUploading] = useState(false);

    const sendQuery = async () => {
        if (!query.trim()) return;

        try {
            const response = await fetch("http://127.0.0.1:5000/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query }),
            });

            if (response.ok) {
                const data = await response.json();
                setResults(data.results || []);
            } else {
                console.error("Error:", response.statusText);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const handlePDFUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        setUploading(true);
        try {
            const response = await fetch("http://127.0.0.1:5000/upload", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                alert(`✅ ${data.message}`);
            } else {
                alert(`❌ Upload failed: ${data.error}`);
            }
        } catch (error) {
            console.error("Upload Error:", error);
            alert("❌ An error occurred during upload.");
        }
        setUploading(false);
    };

    return (
        <div className="p-6 max-w-5xl mx-auto bg-white rounded-xl shadow-md space-y-4 mt-6">
            <h1 className="text-xl font-bold">AI Search</h1>

            <div className="space-y-2">
                <input
                    type="file"
                    accept=".pdf"
                    onChange={handlePDFUpload}
                    className="w-full p-2 border rounded"
                />
                {uploading && <p className="text-sm text-gray-500">Uploading...</p>}
            </div>

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
