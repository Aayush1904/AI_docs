import Lottie from "lottie-react";
import Search from "../../public/Search.json";
import MultiSource from "../../public/MultiSource.json"
import QA from "../../public/Q&A.json"
import secure from "../../public/Secure.json"
import { cn } from "../../lib/utils";

// 🎯 Feature Details
const features = [
  {
    icon: (
      <Lottie
        animationData={Search}
        loop
        autoPlay
        className="w-20 h-20 md:w-35 md:h-35"
      />
    ),
    title: "Semantic Search",
    description:
      "Goes beyond simple keyword matching to understand the intent behind queries, delivering more accurate and relevant results.",
  },
  {
    icon: (
      <Lottie
        animationData={MultiSource}
        loop
        autoPlay
        className="w-20 h-20 md:w-35 md:h-35"
      />
    ),
    title: "Multi-Source Integration",
    description:
      "Seamlessly connects with tools like Slack, GitHub, JIRA, Notion, and Confluence, making all your company knowledge instantly accessible.",
  },
  {
    icon: (
      <Lottie
        animationData={QA}
        loop
        autoPlay
        className="w-20 h-20 md:w-35 md:h-35"
      />
    ),
    title: "AI-powered Q&A",
    description:
      "Leverages advanced NLP to allow users to ask questions naturally and receive precise, context-aware responses in real time.",
  },
  {
    icon: (
      <Lottie
        animationData={secure}
        loop
        autoPlay
        className="w-20 h-20 md:w-35 md:h-35"
      />
    ),
    title: "Fast & Secure",
    description:
      "Built on vector search technology (FAISS/Pinecone) to ensure lightning-fast retrieval while keeping your data secure and private.",
  },
];

export default function NeuralDocsFeatures() {
  return (
    <div className="max-w-7xl mx-auto px-6">
      {/* 🏆 Tagline */}
      <h2 className="text-2xl font-bold text-center text-zinc-900 dark:text-zinc-100 mb-8">
        🚀 NeuralDocs: Smarter Search, Faster Answers, Seamless Integration!✨
      </h2>

      {/* 🛠 Features Section - 4 Cards in a Row on Desktop */}
      <div className="flex flex-wrap justify-between gap-6">
        {features.map(({ icon, title, description }) => (
          <div
            key={title}
            className={cn(
              "w-full md:w-[23%]", // Ensures 4 cards in a row while maintaining spacing
              "group rounded-2xl border border-neutral-500/10 p-6 dark:border-white/10",
              "dark:shadow-[2px_4px_16px_0px_rgba(248,248,248,0.06)_inset]",
              "transform-gpu transition-transform hover:scale-[1.02]",
              "bg-gray-50 dark:bg-neutral-800/80"
            )}
          >
            <div className="flex flex-col items-center text-center">
              {icon}
              <h6 className="mt-4 mb-2 font-semibold text-gray-700 text-lg tracking-tight dark:text-gray-200">
                {title}
              </h6>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
