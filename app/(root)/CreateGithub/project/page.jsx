// "use client";
// import { useSearchParams } from "next/navigation"; 
// import useProject from "@/hooks/use-project";
// import React from "react";
// import { ExternalLink, Github } from "lucide-react";
// import Link from "next/link";
// import CommitLog from "./commit-log";
// import AskQuestionCard from "./ask-question-card";

// const ProjectPage = () => {
//   const searchParams = useSearchParams();
//   const projectId = searchParams.get("id"); 
//   const { projects } = useProject();

//   // Find selected project from list
//   const project = projects?.find((p) => p.id === projectId);

//   if (!project) {
//     return <div className="text-center p-4">Project not found.</div>;
//   }

//   return (
//     <div>
//       <div className="flex items-center justify-between flex-wrap gap-y-4">
//         <div className="w-fit rounded-md px-4 py-3 ">
//             <div className="flex items-center">
//                 <Github className="size-5" />
//                 <div className="ml-2">
//                     <p className="text-sm font-medium">
//                         This Project is linked to {' '}
//                         <Link href={project?.githubUrl ?? ""} className="inline-flex items-center hover:underline">
//                             {project?.githubUrl}
//                             <ExternalLink className="ml-1 size-4" />
//                         </Link>
//                     </p>
//                 </div>
//             </div>
//         </div>
//         <div className="h-4"></div>

//         {/* <div className="flex items-center gap-4">
//             TeamMembers 
//             InviteButton
//             ArchiveButton
//         </div> */}
//       </div>

//       <div className="mt-4">
//         <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
//            < AskQuestionCard />
//         </div>
//       </div>

//       <div className="mt-8">
//         <CommitLog  projectId={projectId} />
//       </div>
//     </div>
//   );
// };

// export default ProjectPage;


"use client";
import { useSearchParams } from "next/navigation"; 
import useProject from "@/hooks/use-project";
import React from "react";
import { ExternalLink, Github } from "lucide-react";
import Link from "next/link";
import CommitLog from "./commit-log";
import AskQuestionCard from "./ask-question-card";

const ProjectPage = () => {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("id"); 
  const { projects } = useProject();

  const project = projects?.find((p) => p.id === projectId);

  if (!project) {
    return <div className="text-center p-4">Project not found.</div>;
  }

  return (
    <div className="p-4">
      {/* GitHub Link Section - Improved for mobile */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="w-full sm:w-auto rounded-md px-4 py-3">
          <div className="flex items-center">
            <Github className="size-5" />
            <div className="ml-2">
              <p className="text-sm font-medium break-all">
                Linked to{' '}
                <Link 
                  href={project?.githubUrl ?? ""} 
                  className="inline-flex items-center hover:underline break-words"
                  target="_blank"
                >
                  {project?.githubUrl.split('/').slice(-2).join('/')}
                  <ExternalLink className="ml-1 size-4" />
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Question Card - Full width on mobile */}
      <div className="mb-8">
        <AskQuestionCard />
      </div>

      {/* Commit Log - Full width on all screens */}
      <div className="w-full overflow-x-auto">
        <CommitLog projectId={projectId} />
      </div>
    </div>
  );
};

export default ProjectPage;