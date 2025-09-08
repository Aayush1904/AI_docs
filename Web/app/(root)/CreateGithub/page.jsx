"use client";

import dynamicImport from "next/dynamic";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Dynamically import Lottie with SSR disabled
const Lottie = dynamicImport(() => import("lottie-react"), { ssr: false });
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import aiBotAnimation from "../../../public/Github.json";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

const CreatePage = () => {
  const { register, handleSubmit, reset } = useForm();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Handle project creation
  async function onSubmit(data) {
    try {
      setLoading(true);
      await axios.post(api.backend.projects.create(), {
        name: data.projectName,
        githubUrl: data.repoUrl,
        githubToken: data.githubToken,
        userId: "temp-user-id", // Temporary placeholder
        emailAddress: "temp@example.com", // Temporary placeholder
        firstName: "",
        lastName: "",
        imageUrl: "",
      });
      toast.success("🎉 Project created successfully!");
      reset();
      setLoading(false);
      router.push(`/CreateGithub/project?id=temp-project-id`);
    } catch (error) {
      console.error("❌ Error:", error);
      toast.error("❌ Failed to create project");
    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="flex min-h-screen">
      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8">
        <div className="flex flex-col md:flex-row items-center gap-8 justify-center">
          {/* Lottie Animation */}
          <Lottie
            animationData={aiBotAnimation}
            loop
            autoPlay
            className="w-64 h-64 md:w-80 md:h-80"
          />

          <div className="w-full max-w-lg">
            <h1 className="font-semibold text-xl md:text-2xl text-center md:text-left">
              Link your GitHub Repository
            </h1>
            <p className="text-sm text-muted-foreground text-center md:text-left mt-2">
              Enter the URL of your repository to link it to NeuralDocs
            </p>

            {/* Create Project Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-3">
              <Input
                {...register("projectName", { required: true })}
                placeholder="Project Name"
                required
                className="w-full"
              />
              <Input
                {...register("repoUrl", { required: true })}
                placeholder="GitHub URL"
                type="url"
                required
                className="w-full"
              />
              <Input
                {...register("githubToken")}
                placeholder="GitHub Token (Optional)"
                className="w-full"
              />
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Creating..." : "Create Project"}
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreatePage;
