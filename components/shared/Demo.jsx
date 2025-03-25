"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Typewriter } from "react-simple-typewriter";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

const aiSuggestions = [
  "How to deploy on Kubernetes?",
  "What is the best CI/CD tool?",
  "How does vector search work?",
  "Explain semantic search in AI.",
];

export default function AILiveSearch() {
  const [query, setQuery] = useState("");

  return (
    <div className="flex flex-col items-center justify-center mt-12">
      {/* 🏆 Title */}
      <h2 className="text-3xl font-bold text-center text-zinc-900 dark:text-zinc-100 mb-6">
        🔍 AI-Powered Interactive Search  
      </h2>

      {/* 💡 AI Suggestions */}
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
        Try searching:{" "}
        <span className="font-semibold text-blue-500">
          <Typewriter words={aiSuggestions} loop cursor cursorStyle="|" />
        </span>
      </p>

      {/* 🏗️ Floating Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative w-full max-w-3xl"
      >
        <input
          type="text"
          placeholder="Type your query here..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={cn(
            "w-full rounded-full border border-gray-300 dark:border-gray-600",
            "bg-white/30 dark:bg-zinc-900/50 backdrop-blur-md shadow-lg",
            "px-5 py-3 text-lg text-gray-700 dark:text-white",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          )}
        />
        <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-300" />
      </motion.div>

      {/* 🔄 Simulated AI Response */}
      {query && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="mt-6 w-full max-w-xl rounded-lg border border-gray-200 dark:border-gray-700 bg-white/40 dark:bg-zinc-900/60 backdrop-blur-md p-4 shadow-md"
        >
          <p className="text-gray-700 dark:text-gray-300">
            🤖 AI Suggests:  
            <span className="font-semibold text-blue-500">
              "{query} is a trending search! Here's what we found..."
            </span>
          </p>
        </motion.div>
      )}
    </div>
  );
}
