"use client";

import { useQueryClient } from "@tanstack/react-query";

const useRefresh = () => {
  const queryClient = useQueryClient();

  // Returns a function that triggers a refetch of all active queries
  const refresh = async () => {
    await queryClient.refetchQueries({ type: "active" });
  };

  return refresh;
};

export default useRefresh;
