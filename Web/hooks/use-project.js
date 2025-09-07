import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import axios from "axios";
import { api } from "@/lib/api";

const fetchProjects = async () => {
  const { data } = await axios.get(api.backend.projects.getAll());
  return data;
};

const useProject = () => {
  const { data: projects } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });
  const [projectId, setProjectId] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("selectedProjectId") || null;
    }
    return null;
  });

  useEffect(() => {
    if (projectId) {
      localStorage.setItem("selectedProjectId", projectId);
    }
  }, [projectId]);

  const project = projects?.find((p) => p.id === projectId);

  return {
    projects,
    project,
    projectId,
    setProjectId,
  };
};

export default useProject;
