"use client"; // Enables client-side rendering in Next.js
import { ReactNode } from "react"; // Importing React types for better type safety
import { cn } from "../../lib/utils"; // Utility function for handling classNames dynamically

// 🛠 Step Data Array - Defines each step in the process
const dataSteps = [
  {
    title: "Connect Your Docs", // Step title
    code: "OAuth with Notion, Slack, GitHub", // Short description
  },
  {
    title: "AI Indexes & Understands Content",
    code: "AI-powered vector search using FAISS/Pinecone",
  },
  {
    title: "Ask Questions, Get Instant Answers",
    code: "Semantic search retrieves relevant results",
  },
];

// 🎨 Main Component: Wraps everything and centers the content
export const StepWithStickyColorVariant1 = () => {
  return (
    <div className="max-w-4xl mx-auto mt-12">
      {/* 🔥 Catchy Tagline at the Top */}
      <h2 className="text-center text-2xl font-bold text-neutral-800 dark:text-neutral-100 mb-8">
        From Docs to Answers – AI-Powered Search in 3 Simple Steps!
      </h2>

      {/* 📌 Step-by-Step Container */}
      <div className="w-[90%] ml-2 max-w-lg">
        {dataSteps.map((step, index) => (
          <StaticStep key={step.title} step={index + 1} title={step.title}>
            <CodeContainer>{step.code}</CodeContainer>
          </StaticStep>
        ))}
      </div>
    </div>
  );
};

// 🎯 StaticStep Component - Renders each step with number, title, and content
const StaticStep = ({
  step, // Step number
  title, // Step title
  children, // Step description (code)
}) => {
  return (
    <div className="flex gap-6">
      {/* 🔢 Step Number with a Circular Background */}
      <div className="flex flex-col items-center">
        <p className="flex size-8 flex-none select-none items-center justify-center rounded-full border border-neutral-400/20 bg-neutral-100 font-medium text-neutral-700 text-sm dark:border-neutral-400/10 dark:bg-neutral-800 dark:text-neutral-50">
          {step}
        </p>
        
        {/* 🔗 Vertical Line Connecting the Steps */}
        <div className="relative my-2 h-full w-px rounded-full bg-neutral-200 dark:bg-neutral-700" />
      </div>

      {/* 📌 Step Content - Title & Description */}
      <div className="mb-4 w-full">
        <h6 className="mb-2 ml-1 font-medium text-lg text-neutral-700 tracking-tight dark:text-neutral-50">
          {title}
        </h6>
        {children}
      </div>
    </div>
  );
};

// 📦 CodeContainer - Styles the step description like a code snippet
const CodeContainer = ({ children }) => {
  return (
    <div className="h-fit w-full rounded-lg border border-neutral-400/20 bg-neutral-100 px-5 py-3 transition-colors duration-300 dark:border-neutral-400/10 dark:bg-neutral-800 dark:hover:bg-neutral-800/80">
      <code
        className={cn(
          "whitespace-pre-wrap text-neutral-500 text-sm dark:text-neutral-300"
        )}
      >
        {children}
      </code>
    </div>
  );
};

// 🏁 Export the component for use in other parts of the application
export default StepWithStickyColorVariant1;
