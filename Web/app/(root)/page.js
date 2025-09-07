"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
// Dynamic imports to prevent SSR issues
const AnimatedText = dynamic(() => import("@/components/core/animated-text"), {
  ssr: false,
});
const HexagonBackground = dynamic(
  () =>
    import("@/components/core/hexagon-background").then((mod) => ({
      default: mod.HexagonBackground,
    })),
  { ssr: false }
);
const CountingNumber = dynamic(
  () =>
    import("@/components/core/counting-number").then((mod) => ({
      default: mod.CountingNumber,
    })),
  { ssr: false }
);
const Parallax = dynamic(
  () => import("react-parallax").then((mod) => ({ default: mod.Parallax })),
  { ssr: false }
);
import { Button } from "@/components/ui/button";
import Link from "next/link";
import ClientOnly from "@/components/ClientOnly";
// Dynamic imports for other components
const NeuralDocsFeatures = dynamic(
  () => import("@/components/kokonutui/card-02"),
  { ssr: false }
);
const StepWithStickyColorVariant1 = dynamic(
  () => import("@/components/shared/HowItWorks"),
  { ssr: false }
);
const AILiveSearch = dynamic(() => import("@/components/shared/Demo"), {
  ssr: false,
});
const Faq02 = dynamic(() => import("@/components/kokonutui/faq-02"), {
  ssr: false,
});
const List06 = dynamic(() => import("@/components/kokonutui/list-06"), {
  ssr: false,
});

export default function Home() {
  return (
    <ClientOnly
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <section className="relative py-5 md:py-10 bg-gradient-to-br from-blue-50 to-indigo-50">
        <HexagonBackground
          className="absolute inset-0 opacity-70"
          hexagonSize={80}
          hexagonMargin={4}
          hexagonProps={{
            className:
              "opacity-40 hover:opacity-80 transition-opacity duration-300 bg-blue-100 border border-blue-200",
          }}
        />
        <div className="relative max-w-7xl lg:mx-auto p-5 md:px-10 xl:px-0 w-full grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* Left Section: Heading & CTA */}
          <div className="flex flex-col justify-center gap-6">
            <div className="space-y-4">
              <AnimatedText
                text="AI-Powered Search Engine"
                className="font-bold text-[38px] leading-[48px] lg:text-[48px] lg:leading-[60px] xl:text-[58px] xl:leading-[74px] text-gray-900"
                animationType="letters"
                staggerDelay={0.08}
                duration={0.6}
                delay={0.2}
              />
              <AnimatedText
                text="for Your Documents"
                className="font-bold text-[40px] leading-[48px] lg:text-[48px] lg:leading-[60px] xl:text-[58px] xl:leading-[74px] text-blue-500"
                animationType="letters"
                staggerDelay={0.08}
                duration={0.6}
                delay={0.8}
              />
            </div>

            <div className="space-y-3">
              <AnimatedText
                text="Instantly find the right information across your documentation, Slack, Notion, and other internal sources."
                className="text-lg md:text-xl text-gray-600 leading-[30px]"
                animationType="words"
                staggerDelay={0.1}
                duration={0.8}
                delay={1.2}
              />
              <AnimatedText
                text="No more manual searching—AI does it for you!"
                className="block mt-3 font-medium text-teal-600 text-lg md:text-xl"
                animationType="words"
                staggerDelay={0.08}
                duration={0.6}
                delay={1.8}
              />
            </div>

            {/* Call to Action (CTA) */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.2 }}
              className="flex flex-col gap-4 sm:flex-row sm:items-center"
            >
              <Button
                size="lg"
                asChild
                className="rounded-full h-[54px] text-lg font-medium w-full sm:w-fit
                  bg-gradient-to-r from-teal-600 to-blue-500 hover:from-teal-700 hover:to-blue-600
                  transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Link href="/search">🔍 Try AI Search Now</Link>
              </Button>

              <div className="flex items-center gap-2 text-sm text-slate-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-teal-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Trusted by 12,000+ professionals worldwide</span>
              </div>
            </motion.div>
          </div>

          {/* Right Section: Enhanced Visual Design */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.2 }}
            className="flex flex-col items-center justify-center space-y-6"
          >
            {/* Feature Cards with Parallax */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
              <Parallax speed={-5} className="transform-gpu">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-blue-50 to-indigo-100 p-4 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-500 p-2 rounded-lg">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Smart Search
                      </h3>
                      <p className="text-sm text-gray-600">
                        AI-powered semantic search
                      </p>
                    </div>
                  </div>
                </motion.div>
              </Parallax>

              <Parallax speed={-3} className="transform-gpu">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gradient-to-br from-teal-50 to-emerald-100 p-4 rounded-xl border border-teal-200 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-teal-500 p-2 rounded-lg">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Instant Results
                      </h3>
                      <p className="text-sm text-gray-600">
                        Real-time document insights
                      </p>
                    </div>
                  </div>
                </motion.div>
              </Parallax>

              <Parallax speed={-7} className="transform-gpu">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gradient-to-br from-purple-50 to-violet-100 p-4 rounded-xl border border-purple-200 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-purple-500 p-2 rounded-lg">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Lightning Fast
                      </h3>
                      <p className="text-sm text-gray-600">
                        Millisecond response times
                      </p>
                    </div>
                  </div>
                </motion.div>
              </Parallax>

              <Parallax speed={-4} className="transform-gpu">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="bg-gradient-to-br from-orange-50 to-amber-100 p-4 rounded-xl border border-orange-200 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-orange-500 p-2 rounded-lg">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Secure</h3>
                      <p className="text-sm text-gray-600">
                        Enterprise-grade security
                      </p>
                    </div>
                  </div>
                </motion.div>
              </Parallax>
            </div>

            {/* Animated Stats Section */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center justify-center space-x-8 text-center"
            >
              <div className="flex flex-col items-center">
                <div className="text-2xl font-bold text-blue-600">
                  <CountingNumber
                    number={12000}
                    inView={true}
                    className="text-2xl font-bold text-blue-600"
                  />
                  <span className="text-blue-600">+</span>
                </div>
                <div className="text-sm text-gray-600">Active Users</div>
              </div>
              <div className="w-px h-8 bg-gray-300"></div>
              <div className="flex flex-col items-center">
                <div className="text-2xl font-bold text-teal-600">
                  <CountingNumber
                    number={99.9}
                    decimalPlaces={1}
                    inView={true}
                    className="text-2xl font-bold text-teal-600"
                  />
                  <span className="text-teal-600">%</span>
                </div>
                <div className="text-sm text-gray-600">Uptime</div>
              </div>
              <div className="w-px h-8 bg-gray-300"></div>
              <div className="flex flex-col items-center">
                <div className="text-2xl font-bold text-purple-600">
                  <CountingNumber
                    number={50000000}
                    inView={true}
                    className="text-2xl font-bold text-purple-600"
                  />
                  <span className="text-purple-600">+</span>
                </div>
                <div className="text-sm text-gray-600">Documents Indexed</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
      <section className="mt-20">
        <NeuralDocsFeatures />
      </section>
      <section className="mt-20">
        <StepWithStickyColorVariant1 />
      </section>
      <section className="mt-20">
        <AILiveSearch />
      </section>
      <section className="mt-20">
        <List06 />
      </section>
      <section className="mt-20">
        <Faq02 />
      </section>
    </ClientOnly>
  );
}
