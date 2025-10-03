import api from "../axios";

export const getLogFiles = () => api.get("/logs/files");
export const viewLogFile = (filename: string, lines = 100, level?: string) =>
  api.get("/logs/view/" + filename, { params: { lines, level } });
export const downloadLogFile = (filename: string) =>
  api.get("/logs/download/" + filename, { responseType: "blob" });
export const searchLogs = (query: string, filename: string, limit = 50) =>
  api.get("/logs/search", { params: { query, filename, limit } });
export const clearLogFile = (filename?: string) =>
  api.post("/logs/clear", filename ? { filename } : {});
export const getLogStats = () => api.get("/logs/stats");
export const getSystemLogs = (params: any) =>
  api.get("/admin/logs", { params });
