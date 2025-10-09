import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "./queryClient";
import { useEffect } from "react";
import { wakeServer } from "./wakeServer";

interface ApiProviderProps {
  children: React.ReactNode;
  enableDevtools?: boolean;
}

export const ApiProvider: React.FC<ApiProviderProps> = ({
  children,
  enableDevtools = process.env.NODE_ENV === "development",
}) => {
  useEffect(() => {
    void wakeServer();
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {enableDevtools && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
};

export default ApiProvider;
