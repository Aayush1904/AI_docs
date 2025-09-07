"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Mail, X } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "What makes NeuralDocs different from traditional search?",
    answer:
      "NeuralDocs goes beyond simple keyword matching by using AI-powered semantic search. It understands the intent behind queries, delivering accurate, context-aware results across multiple integrated sources.",
  },
  {
    question: "Which platforms does NeuralDocs integrate with?",
    answer:
      "NeuralDocs seamlessly connects with Notion, GitHub, JIRA, Google Drive, Confluence, and other internal documentation tools, making your knowledge base instantly accessible in one place.",
  },
  {
    question: "Is my data secure with NeuralDocs?",
    answer:
      "Absolutely! NeuralDocs leverages enterprise-grade security, including end-to-end encryption and access control policies. We ensure your data remains private and accessible only to authorized users.",
  },
  {
    question: "How can I get started with NeuralDocs?",
    answer:
      "You can sign up for a free trial and start using NeuralDocs instantly. Our guided onboarding process and AI-assisted recommendations make setup quick and easy.",
  },
  {
    question: "Does NeuralDocs support natural language queries?",
    answer:
      "Yes! Our AI-powered Q&A system allows you to ask questions in natural language and receive precise, relevant answers in real time.",
  },
  {
    question: "What kind of support do you offer?",
    answer:
      "We provide 24/7 live chat support, detailed documentation, video tutorials, and dedicated account managers for enterprise clients.",
  },
];

function FAQItem({ question, answer, index }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay: index * 0.15,
        ease: "easeOut",
      }}
      className={cn(
        "group rounded-lg border border-gray-200/50 dark:border-gray-800/50",
        "transition-all duration-200 ease-in-out",
        isOpen
          ? "bg-white dark:bg-gray-900"
          : "hover:bg-gray-50 dark:hover:bg-white/5"
      )}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between gap-4"
      >
        <h3
          className={cn(
            "text-base font-medium text-left transition-colors duration-200",
            "text-gray-700 dark:text-gray-300",
            isOpen && "text-gray-900 dark:text-white"
          )}
        >
          {question}
        </h3>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0, scale: isOpen ? 1.1 : 1 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="p-0.5 rounded-full text-gray-400 dark:text-gray-500"
        >
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: "auto",
              opacity: 1,
              transition: { height: { duration: 0.4 }, opacity: { duration: 0.25, delay: 0.1 } },
            }}
            exit={{
              height: 0,
              opacity: 0,
              transition: { height: { duration: 0.3 }, opacity: { duration: 0.25 } },
            }}
          >
            <div className="px-6 pb-4 pt-2">
              <motion.p
                initial={{ y: -8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -8, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed"
              >
                {answer}
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Faq02() {
  const [isModalOpen, setModalOpen] = useState(false);

  return (
    <section className="py-16 w-full bg-gray-50 dark:bg-gray-900">
      <div className="container px-4 mx-auto">
        {/* 🏆 FAQ Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto text-center mb-12"
        >
          <h2 className="text-3xl font-semibold text-gray-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
            Everything you need to know about NeuralDocs
          </p>
        </motion.div>

        {/* FAQ List */}
        <div className="max-w-2xl mx-auto space-y-2">
          {faqs.map((faq, index) => (
            <FAQItem key={index} {...faq} index={index} />
          ))}
        </div>

        {/* 📞 Contact Support Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="max-w-md mx-auto mt-12 p-6 rounded-lg text-center"
        >
          <div className="inline-flex items-center justify-center p-2 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
            <Mail className="h-6 w-6 text-blue-500" />
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            Still have questions?
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
            We're here to help.
          </p>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 text-sm rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors"
          >
            Contact Support
          </button>
        </motion.div>
      </div>

      {/* 💬 Contact Support Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md p-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg"
            >
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                onClick={() => setModalOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Contact Support
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Fill out the form and our team will get back to you shortly.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
