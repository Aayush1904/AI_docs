import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, MoreHorizontal } from "lucide-react";
export default function List06() {
    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-6"
            >
                <h2 className="text-2xl font-semibold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
                    🚀 See Why Teams Love NeuralDocs
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Real stories from teams who supercharged their workflow with AI-powered search.
                </p>
            </motion.div>

        <div
                className={cn(
                    "w-[90%] max-w-xl mx-auto",
                    "bg-white dark:bg-zinc-900",
                    "border border-zinc-200 dark:border-zinc-800",
                    "rounded-2xl shadow-xs overflow-hidden"
                )}>
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-2">
                            <img
                                src="https://ferf1mheo22r9ira.public.blob.vercel-storage.com/avatar-01-n0x8HFv8EUetf9z6ht0wScJKoTHqf8.png"
                                alt="Author"
                                className="w-8 h-8 rounded-full ring-1 ring-zinc-100 dark:ring-zinc-800" />
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                        Sarah Chen
                                    </h3>
                                    <span className="text-xs text-zinc-500">·</span>
                                    <span className="text-xs text-zinc-500">
                                        2h
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button
                            type="button"
                            className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                            <MoreHorizontal className="w-4 h-4 text-zinc-400" />
                        </button>
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-normal">
                        NeuralDocs has completely transformed the way we manage internal knowledge. The AI-powered search saves us hours every week! 🚀
                    </p>
                </div>
                <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    <div className="p-4">
                        <div className="flex gap-3">
                            <img
                                src="https://ferf1mheo22r9ira.public.blob.vercel-storage.com/avatar-04-uuYHWIRvVPi01gEt6NwnGyjqLeeZhz.png"
                                alt="Responder"
                                className="w-7 h-7 rounded-full ring-1 ring-zinc-100 dark:ring-zinc-800 flex-none" />
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                        Alex Rivera
                                    </span>
                                    <span className="text-xs text-zinc-500">·</span>
                                    <span className="text-xs text-zinc-500">
                                        45m
                                    </span>
                                </div>
                                <p className="text-sm text-zinc-600 dark:text-zinc-300">
                                    The ability to integrate with Slack and Notion seamlessly has made collaboration effortless. Highly recommended!
                                </p>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        className="group flex items-center gap-1 text-xs text-zinc-500 hover:text-rose-500 transition-colors">
                                        <Heart className="w-3.5 h-3.5" />
                                        <span>18</span>
                                    </button>
                                    <button
                                        type="button"
                                        className="group flex items-center gap-1 text-xs text-zinc-500 hover:text-blue-500 transition-colors">
                                        <MessageCircle className="w-3.5 h-3.5" />
                                        <span>Reply</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 pl-12">
                        <div className="flex gap-3">
                            <img
                                src="https://ferf1mheo22r9ira.public.blob.vercel-storage.com/avatar-01-n0x8HFv8EUetf9z6ht0wScJKoTHqf8.png"
                                alt="Responder"
                                className="w-7 h-7 rounded-full ring-1 ring-zinc-100 dark:ring-zinc-800 flex-none" />
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                        Maya Patel
                                    </span>
                                    <span className="text-xs text-zinc-500">·</span>
                                    <span className="text-xs text-zinc-500">
                                        12m
                                    </span>
                                </div>
                                <p className="text-sm text-zinc-600 dark:text-zinc-300">
                                    Our support team loves the AI-powered Q&A! It drastically reduces the time spent searching for information.
                                </p>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        className="group flex items-center gap-1 text-xs text-zinc-500 hover:text-rose-500 transition-colors">
                                        <Heart className="w-3.5 h-3.5" />
                                        <span>8</span>
                                    </button>
                                    <button
                                        type="button"
                                        className="group flex items-center gap-1 text-xs text-zinc-500 hover:text-blue-500 transition-colors">
                                        <MessageCircle className="w-3.5 h-3.5" />
                                        <span>Reply</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-3">
                        <div className="flex items-center gap-2">
                            <img
                                src="https://ferf1mheo22r9ira.public.blob.vercel-storage.com/avatar-03-JateJIUhtd3PXynaMG9TDWQ55j5AVP.png"
                                alt="Your avatar"
                                className="w-7 h-7 rounded-full ring-1 ring-zinc-100 dark:ring-zinc-800" />
                            <input
                                type="text"
                                placeholder="Share your thoughts..."
                                className="flex-1 text-sm bg-transparent text-zinc-900 dark:text-zinc-100 
                                    placeholder:text-zinc-400 focus:outline-hidden" />
                        </div>
                    </div>
                </div>
            </div>
        </>
       
    );
}
