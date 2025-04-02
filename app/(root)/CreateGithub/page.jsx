// 'use client'
// import Lottie from 'lottie-react'
// import React, { useEffect, useState } from 'react'
// import { useForm } from 'react-hook-form'
// import aiBotAnimation from "../../../public/Github.json";
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
// import axios from 'axios'; 
// import { toast } from 'react-hot-toast'; 
// import { useAuth } from '@clerk/nextjs';

// const CreatePage = () => {
//     const { register, handleSubmit, reset } = useForm();
//     const { userId, isLoaded } = useAuth(); 
//     const [loading, setLoading] = useState(false);

//     async function onSubmit(data) {
//         if (!isLoaded) {
//             toast.error("❌ Authentication not loaded. Please try again.");
//             return;
//         }
//         if (!userId) {
//             toast.error("❌ User ID is missing. Please log in.");
//             return;
//         }

//         const requestData = {
//             name: data.projectName,
//             githubUrl: data.repoUrl,
//             githubToken: data.githubToken,
//             userId: userId, 
//         };
        
//         try {
//             setLoading(true);
//             const response = await axios.post("http://localhost:5001/api/projects/create", requestData);
//             toast.success("🎉 Project created successfully!");
//             reset();
//         } catch (error) {
//             console.error("❌ Error:", error);
//             toast.error("❌ Failed to create project");
//         } finally {
//             setLoading(false);
//         }
//     }

//     return (
//         <div className='flex items-center gap-12 h-full justify-center'>
//             <Lottie
//                 animationData={aiBotAnimation}
//                 loop
//                 autoPlay
//                 className="w-auto h-56 max-w-md md:max-w-lg"
//             />
//             <div>
//                 <h1 className='font-semibold text-2xl'>Link your GitHub Repository</h1>
//                 <div className='h-4'></div>
//                 <p className='text-sm text-muted-foreground'>Enter the URL of your repository to link it to NeuralDocs</p>
//                 <div className='h-4'></div>
//                 <form onSubmit={handleSubmit(onSubmit)}>
//                     <Input {...register('projectName', { required: true })} placeholder='Project Name' required />
//                     <div className='h-2'></div>
//                     <Input {...register('repoUrl', { required: true })} placeholder='GitHub URL' type='url' required />
//                     <div className='h-2'></div>
//                     <Input {...register('githubToken')} placeholder='GitHub Token (Optional)' />
//                     <div className='h-2'></div>
//                     <Button type='submit' disabled={loading}>
//                         {loading ? "Creating..." : "Create Project"}
//                     </Button>
//                 </form>
//             </div>
//         </div>
//     );
// }

// export default CreatePage;

"use client";

import Lottie from "lottie-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import aiBotAnimation from "../../../public/Github.json";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useAuth } from "@clerk/nextjs";
import useProject from "@/hooks/use-project";
import useRefresh from "@/hooks/use-refresh"; 
import { useRouter } from "next/navigation";

const CreatePage = () => {
  const { register, handleSubmit, reset } = useForm();
  const { userId, isLoaded } = useAuth();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const {projectId} = useProject();
  // Refresh hook
  const refresh = useRefresh();

  // Handle project creation
  async function onSubmit(data) {
    if (!isLoaded) {
      toast.error("❌ Authentication not loaded. Please try again.");
      return;
    }
    if (!userId) {
      toast.error("❌ User ID is missing. Please log in.");
      return;
    }

    try {
      setLoading(true);
      await axios.post("http://localhost:5001/api/projects/create", {
        name: data.projectName,
        githubUrl: data.repoUrl,
        githubToken: data.githubToken,
        userId,
      });
      toast.success("🎉 Project created successfully!");
      reset();
      await refresh();
      setLoading(false); 
      router.push(`/CreateGithub/project?id=${projectId}`);
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
