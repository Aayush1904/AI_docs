"use client";

import { motion } from "framer-motion";
import Lottie from "lottie-react";
import aiBotAnimation from "../../public/Robot.json";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import NeuralDocsFeatures from "@/components/kokonutui/card-02";
import StepWithStickyColorVariant1 from "@/components/shared/HowItWorks";
import AILiveSearch from "@/components/shared/Demo";
import Faq02 from "@/components/kokonutui/faq-02";
import List06 from "@/components/kokonutui/list-06";

export default function Home() {
  return (
    <>
      <section className="relative py-5 md:py-10">
        <div className="max-w-7xl lg:mx-auto p-5 md:px-10 xl:px-0 w-full grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* Left Section: Heading & CTA */}
          <div className="flex flex-col justify-center gap-6">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="font-bold text-[40px] leading-[48px] lg:text-[48px] lg:leading-[60px] xl:text-[58px] xl:leading-[74px] text-gray-900"
            >
              AI-Powered Search Engine for <br />
              <span className="text-blue-500">Your Documents</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="text-lg md:text-xl text-gray-600 leading-[30px]"
            >
              Instantly find the right information across your documentation,
              Slack, Notion, and other internal sources.
              <span className="block mt-3 font-medium text-teal-600">
                No more manual searching—AI does it for you!
              </span>
            </motion.p>

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

          {/* Right Section: AI Bot Animation */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.2 }}
            className="flex justify-center"
          >
            {/* <Lottie
              animationData={aiBotAnimation}
              loop
              autoPlay
              className="w-full max-w-md md:max-w-lg"
            /> */}
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
    </>
  );
}
