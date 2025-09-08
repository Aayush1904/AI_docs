"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="text-center space-y-8 p-8">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
          NeuralDocs
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          AI-Powered Search Engine for Your Documents
        </p>
        <div className="space-y-4">
          <Button
            size="lg"
            asChild
            className="rounded-full h-[54px] text-lg font-medium w-full sm:w-fit
              bg-gradient-to-r from-teal-600 to-blue-500 hover:from-teal-700 hover:to-blue-600
              transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <Link href="/search">🔍 Try AI Search Now</Link>
          </Button>
        </div>
        <p className="text-sm text-gray-500">
          Trusted by 12,000+ professionals worldwide
        </p>
      </div>
    </div>
  );
}
