"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import useProject from "@/hooks/use-project";
import { cn } from "@/lib/utils";
import { Bot, LayoutDashboard, Plus, Presentation, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

const items = [
  { title: "Dashboard", url: "/CreateGithub", icon: LayoutDashboard },
  { title: "Q&A", url: "/CreateGithub/qa", icon: Bot },
];

const AppSidebar = () => {
  const pathname = usePathname();
  const { projects, projectId, setProjectId } = useProject();
  const {open} = useSidebar()
   const router = useRouter();

  // Mobile sidebar state
  const [showSidebar, setShowSidebar] = useState(false);

  const handleProjectSelect = (id) => {
    setProjectId(id);
    setShowSidebar(false); 
    router.push(`/CreateGithub/project?id=${id}`);
  };

  return (
    <>
      <Sidebar
        collapsible="icon"
        variant="floating"
        className={cn("h-[calc(100vh-4rem)] mt-18 md:block", showSidebar ? "fixed inset-0 z-50 bg-white shadow-lg" : "hidden")}
      >
        <SidebarHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image src="/GithubLogo.svg" alt="Github Logo" width={40} height={40} />
              {open && (<h1 className="text-xl font-bold hidden md:block">Github Access</h1>)}
              
            </div>

            {/* Close button for mobile */}
            {showSidebar && (
              <Button variant="ghost" onClick={() => setShowSidebar(false)}>
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>
        </SidebarHeader>

        <SidebarContent>
          {/* Application Section */}
          <SidebarGroup>
            <SidebarGroupLabel>Application</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link
                        href={item.url}
                        className={cn(
                          { "!bg-primary !text-white": pathname === item.url },
                          "list-none flex items-center gap-2 px-4 py-2 rounded-md"
                        )}
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Your Projects Section */}
          <SidebarGroup>
            <SidebarGroupLabel>Your Projects</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {projects?.length ? (
                  projects.map((proj) => (
                    <SidebarMenuItem key={proj.id}>
                      <SidebarMenuButton asChild>
                        <button
                          onClick={() => handleProjectSelect(proj.id)}
                          className={cn(
                            "flex items-center gap-3 w-full text-left px-4 py-2 rounded-md",
                            {
                              "bg-gray-200": proj.id === projectId,
                              "hover:bg-primary text-black": proj.id !== projectId,
                            }
                          )}
                        >
                          <div
                            className={cn(
                              "rounded-sm border size-6 flex items-center justify-center text-sm bg-white text-primary",
                              { "bg-primary text-white": proj.id === projectId }
                            )}
                          >
                            {proj.name[0]}
                          </div>
                          <span>{proj.name}</span>
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))
                ) : (
                  <p className="text-gray-500 px-4">No projects available</p>
                )}
                <div className="h-2"></div>

                {/* Create New Project Button */}
                <SidebarMenuItem>
                  <Link href="/CreateGithub">
                    <Button variant="outline" className="w-fit flex items-center gap-2">
                      <Plus className="w-4 h-4" /> Create Project
                    </Button>
                  </Link>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </>
  );
};

export default AppSidebar;
