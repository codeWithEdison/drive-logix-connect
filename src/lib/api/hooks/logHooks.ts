import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
  UseMutationResult,
} from "@tanstack/react-query";
import * as logService from "../services/logService";

// --- Types ---
export interface LogFileMeta {
  name: string;
  size: number;
  lastModified: string;
}

export interface LogLine {
  line: string;
  level?: string;
  timestamp?: string;
}

export interface LogSearchResult {
  matches: string[];
  total: number;
}

export interface LogStats {
  file: string;
  size: number;
  entries: number;
}

export interface SystemLogEntry {
  id: string;
  timestamp: string;
  user?: string;
  action?: string;
  entity_type?: string;
  entity_id?: string;
  description?: string;
  severity?: string;
  [key: string]: any;
}

export interface PaginatedSystemLogs {
  data: SystemLogEntry[];
  total: number;
  page: number;
  limit: number;
}

// --- Hooks ---
export const useLogFiles = (): UseQueryResult<LogFileMeta[], unknown> =>
  useQuery<LogFileMeta[]>({
    queryKey: ["logFiles"],
    queryFn: async () => {
      const res = await logService.getLogFiles();
      // If API returns { data: [...] }
      return res.data?.data || res.data;
    },
  });

export const useViewLogFile = (
  filename: string,
  lines = 100,
  level?: string
): UseQueryResult<LogLine[], unknown> =>
  useQuery<LogLine[]>({
    queryKey: ["viewLogFile", filename, lines, level],
    queryFn: async () => {
      const res = await logService.viewLogFile(filename, lines, level);
      return res.data?.lines || res.data;
    },
    enabled: !!filename,
  });

export const useDownloadLogFile = (): UseMutationResult<
  Blob,
  unknown,
  string
> =>
  useMutation<Blob, unknown, string>({
    mutationFn: (filename: string) =>
      logService.downloadLogFile(filename).then((res) => res.data),
  });

export const useSearchLogs = (
  query: string,
  filename: string,
  limit = 50
): UseQueryResult<LogSearchResult, unknown> =>
  useQuery<LogSearchResult>({
    queryKey: ["searchLogs", query, filename, limit],
    queryFn: async () => {
      const res = await logService.searchLogs(query, filename, limit);
      return res.data;
    },
    enabled: !!query && !!filename,
  });

export const useClearLogFile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (filename?: string) => logService.clearLogFile(filename),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["logFiles"] }),
  });
};

export const useLogStats = (): UseQueryResult<LogStats[], unknown> =>
  useQuery<LogStats[]>({
    queryKey: ["logStats"],
    queryFn: async () => {
      const res = await logService.getLogStats();
      return res.data?.stats || res.data;
    },
  });

export const useSystemLogs = (
  params: Record<string, any>
): UseQueryResult<PaginatedSystemLogs, unknown> =>
  useQuery<PaginatedSystemLogs>({
    queryKey: ["systemLogs", params],
    queryFn: async () => {
      const res = await logService.getSystemLogs(params);
      return res.data;
    },
  });
