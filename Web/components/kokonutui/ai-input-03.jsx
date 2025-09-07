"use client";
import { useState } from "react";
import { DialogTitle } from '@/components/ui/dialog';

export default function AIInput_03() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState("all");

  const sendQuery = async () => {
    if (!query.trim()) return;

    try {
      const response = await fetch("/api/semantic-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, filter }),
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

  return (
    <div className="p-6 max-w-5xl mx-auto bg-white rounded-xl shadow-md space-y-4 mt-6">
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
            <strong className="block">
              <a
                href={`https://privatebucketnodejs.s3.amazonaws.com/${result.pdf_name}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {result.pdf_name}
              </a>{" "}
              - Page {result.page}
            </strong>

            <p className="text-gray-700">{result.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
