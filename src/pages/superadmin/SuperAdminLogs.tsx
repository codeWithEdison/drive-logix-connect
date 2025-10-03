import React, { useState } from "react";
import ModernModel from "@/components/modal/ModernModel";
import { CustomTabs } from "@/components/ui/CustomTabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Download,
  Search,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Server,
  FileText,
  Trash2,
} from "lucide-react";
import {
  useLogFiles,
  useViewLogFile,
  useDownloadLogFile,
  useSearchLogs,
  useClearLogFile,
  useSystemLogs,
} from "@/lib/api/hooks/logHooks";
import { useQueryClient } from "@tanstack/react-query";
import { RotateCw } from "lucide-react";

export default function SuperAdminLogs() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>("system");
  // System logs state
  const [systemLogParams, setSystemLogParams] = useState({
    user_id: "",
    action: "",
    entity_type: "",
    entity_id: "",
    date_from: "",
    date_to: "",
    page: 1,
    limit: 50,
  });
  // Log files state
  const [selectedLogFile, setSelectedLogFile] = useState<string>("");
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [logLinesCount, setLogLinesCount] = useState<number>(100);
  const [logLevel, setLogLevel] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  // Pagination state for log file lines
  const [logPage, setLogPage] = useState(1);
  const LOGS_PER_PAGE = 50;
  // API hooks
  const { data: logFilesData, isLoading: logFilesLoading } = useLogFiles();
  // Only pass logLevel if it is a valid value
  const validLogLevels = ["error", "warn", "info", "debug"];
  const logLevelParam = validLogLevels.includes(logLevel)
    ? logLevel
    : undefined;
  const { data: viewLogData, isLoading: viewLogLoading } = useViewLogFile(
    selectedLogFile,
    logLinesCount,
    logLevelParam
  );
  const downloadLogFile = useDownloadLogFile();
  const { data: searchLogsData, isLoading: searchLogsLoading } = useSearchLogs(
    searchTerm,
    selectedLogFile
  );
  const clearLogFile = useClearLogFile();
  // Only send non-empty params for system logs
  const filteredSystemLogParams = Object.fromEntries(
    Object.entries(systemLogParams).filter(
      ([key, value]) => value !== undefined && value !== null && value !== ""
    )
  );
  const { data: systemLogsData, isLoading: systemLogsLoading } = useSystemLogs(
    filteredSystemLogParams
  );

  // Utility functions
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "error":
        return "bg-red-100 text-red-600";
      case "warning":
        return "bg-yellow-100 text-yellow-600";
      case "info":
        return "bg-blue-100 text-blue-600";
      case "success":
        return "bg-green-100 text-green-600";
      case "high":
        return "bg-red-100 text-red-600";
      case "medium":
        return "bg-orange-100 text-orange-600";
      case "low":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "error":
      case "high":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "warning":
      case "medium":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "info":
      case "low":
        return <Info className="h-4 w-4 text-blue-500" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  // Tabs config
  const tabs = [
    { value: "system", label: "System Logs" },
    { value: "files", label: "Log Files" },
  ];

  // Download log file handler
  const handleDownload = (filename: string) => {
    downloadLogFile.mutate(filename, {
      onSuccess: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
      },
    });
  };

  // Clear log file handler
  const handleClear = (filename: string) => {
    clearLogFile.mutate(filename);
  };

  // Refresh handler
  const handleRefresh = () => {
    if (activeTab === "system") {
      queryClient.invalidateQueries({ queryKey: ["systemLogs"] });
    } else if (activeTab === "files") {
      queryClient.invalidateQueries({ queryKey: ["logFiles"] });
      if (selectedLogFile) {
        queryClient.invalidateQueries({
          queryKey: [
            "viewLogFile",
            selectedLogFile,
            logLinesCount,
            logLevelParam,
          ],
        });
      }
    } else if (activeTab === "search") {
      queryClient.invalidateQueries({ queryKey: ["logFiles"] });
      if (selectedLogFile && searchTerm) {
        queryClient.invalidateQueries({
          queryKey: ["searchLogs", searchTerm, selectedLogFile],
        });
      }
    }
  };

  // Render
  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-heading">
            System Logs
          </h1>
          <p className="text-muted-foreground">
            Monitor and manage system logs
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          className="flex items-center gap-2"
        >
          <RotateCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      <CustomTabs value={activeTab} onValueChange={setActiveTab} tabs={tabs} />

      {/* System Logs Tab */}
      {activeTab === "system" && (
        <div className="mt-6">
          <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                System Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                {systemLogsLoading ? (
                  <div className="p-4 text-center text-muted-foreground">
                    Loading...
                  </div>
                ) : !systemLogsData?.data?.length ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No system logs found.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Entity</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Severity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {systemLogsData.data.map((log: any, idx: number) => (
                        <TableRow key={log.id}>
                          <TableCell>{idx + 1}</TableCell>
                          <TableCell>{log.timestamp}</TableCell>
                          <TableCell>
                            {typeof log.user === "object" && log.user !== null
                              ? log.user.full_name ||
                                log.user.email ||
                                log.user.id
                              : log.user}
                          </TableCell>
                          <TableCell>{log.action}</TableCell>
                          <TableCell>
                            {log.entity_type} {log.entity_id}
                          </TableCell>
                          <TableCell>{log.description}</TableCell>
                          <TableCell>
                            <Badge className={getSeverityColor(log.severity)}>
                              {getSeverityIcon(log.severity)}
                              <span className="ml-1">{log.severity}</span>
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Log Files Tab */}
      {activeTab === "files" && (
        <div className="mt-6">
          <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Log Files
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {logFilesLoading ? (
                  <span>Loading log files...</span>
                ) : logFilesData?.length ? (
                  logFilesData.map((file) => {
                    const isActive =
                      selectedLogFile === file.name && logModalOpen;
                    return (
                      <Card
                        key={file.name}
                        onClick={() => {
                          setSelectedLogFile(file.name);
                          setLogModalOpen(true);
                        }}
                        className={`cursor-pointer group transition-all duration-200 border-2 ${
                          isActive
                            ? "border-primary shadow-lg bg-primary/10"
                            : "border-gray-200 hover:border-primary/60 hover:shadow-md bg-white"
                        }`}
                      >
                        <CardContent className="flex flex-col items-start gap-2 p-4">
                          <div className="flex items-center gap-3 w-full">
                            <div
                              className={`rounded-full p-2 ${
                                isActive
                                  ? "bg-primary/20"
                                  : "bg-gray-100 group-hover:bg-primary/10"
                              }`}
                            >
                              <FileText
                                className={`h-7 w-7 ${
                                  isActive
                                    ? "text-primary"
                                    : "text-gray-500 group-hover:text-primary"
                                }`}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div
                                className={`truncate font-semibold text-base ${
                                  isActive
                                    ? "text-primary"
                                    : "text-gray-900 group-hover:text-primary"
                                }`}
                              >
                                {file.name}
                              </div>
                              <div className="text-xs text-gray-400 truncate">
                                {file.size} bytes
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-2 w-full">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedLogFile(file.name);
                                setLogModalOpen(true);
                              }}
                            >
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="flex-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(file.name);
                              }}
                            >
                              <Download className="h-4 w-4 mr-1" /> Download
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                ) : (
                  <span>No log files found.</span>
                )}
              </div>
              <ModernModel
                isOpen={logModalOpen}
                onClose={() => {
                  setLogModalOpen(false);
                  setSelectedLogFile("");
                  setLogLinesCount(100);
                  setLogLevel("");
                  setSearchTerm("");
                  setLogPage(1);
                }}
                title={
                  selectedLogFile ? `Log File: ${selectedLogFile}` : "Log File"
                }
                loading={viewLogLoading}
              >
                {selectedLogFile && (
                  <>
                    <div className="mb-2 flex gap-2 items-center">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setLogLinesCount(100);
                          setLogLevel("");
                          setSearchTerm("");
                          setLogPage(1);
                        }}
                      >
                        Clear Filters
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(selectedLogFile)}
                      >
                        <Download className="h-4 w-4 mr-1" /> Download
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleClear(selectedLogFile)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Clear
                      </Button>
                      <Input
                        type="number"
                        min={1}
                        value={logLinesCount}
                        onChange={(e) =>
                          setLogLinesCount(Number(e.target.value))
                        }
                        className="w-24"
                        placeholder="Lines"
                      />
                      <Select value={logLevel} onValueChange={setLogLevel}>
                        <SelectTrigger className="w-24">
                          <SelectValue placeholder="Level (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="error">error</SelectItem>
                          <SelectItem value="warn">warn</SelectItem>
                          <SelectItem value="info">info</SelectItem>
                          <SelectItem value="debug">debug</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-64"
                        placeholder="Search in file..."
                      />
                    </div>
                    <div
                      className="border rounded bg-gray-50 p-2 mt-2 overflow-x-auto"
                      style={{ maxWidth: "100%", minHeight: 120 }}
                    >
                      {viewLogLoading ? (
                        <span>Loading log file...</span>
                      ) : (
                        (() => {
                          // Support both object (with .data.lines) and array (raw lines) responses
                          let lines: any[] = [];
                          if (Array.isArray(viewLogData)) {
                            lines = viewLogData;
                          } else if (
                            viewLogData &&
                            typeof viewLogData === "object" &&
                            "data" in viewLogData &&
                            Array.isArray((viewLogData as any).data?.lines)
                          ) {
                            lines = (viewLogData as any).data.lines;
                          }
                          if (!lines.length) return <span>No log data.</span>;
                          // Try to parse all lines as JSON
                          let parsedLines = lines.map((line: any) => {
                            try {
                              return typeof line === "string"
                                ? JSON.parse(line)
                                : line;
                            } catch {
                              return null;
                            }
                          });
                          // Filter by search term if present
                          if (searchTerm) {
                            const lower = searchTerm.toLowerCase();
                            parsedLines = parsedLines.filter((l) =>
                              l && typeof l === "object"
                                ? Object.values(l).some((v) =>
                                    String(v).toLowerCase().includes(lower)
                                  )
                                : l && String(l).toLowerCase().includes(lower)
                            );
                          }
                          // Pagination logic
                          const totalLines = parsedLines.length;
                          const totalPages =
                            Math.ceil(totalLines / LOGS_PER_PAGE) || 1;
                          const currentPage = Math.min(logPage, totalPages);
                          const startIdx = (currentPage - 1) * LOGS_PER_PAGE;
                          const endIdx = startIdx + LOGS_PER_PAGE;
                          const pagedLines = parsedLines.slice(
                            startIdx,
                            endIdx
                          );
                          const validLines = pagedLines.filter(
                            (l) => l && typeof l === "object"
                          );
                          if (validLines.length > 0) {
                            // Collect all unique keys for columns
                            const allKeys = Array.from(
                              new Set(validLines.flatMap((l) => Object.keys(l)))
                            ).filter((k) => typeof k === "string");
                            return (
                              <>
                                <Table className="min-w-[900px]">
                                  <TableHeader>
                                    <TableRow>
                                      {allKeys.map((key: string) => (
                                        <TableHead key={key}>{key}</TableHead>
                                      ))}
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {validLines.map((log, idx) => (
                                      <TableRow key={idx}>
                                        {allKeys.map((key: string) => (
                                          <TableCell key={key}>
                                            {typeof log[key] === "object"
                                              ? JSON.stringify(log[key])
                                              : String(log[key])}
                                          </TableCell>
                                        ))}
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                                <div className="flex justify-end items-center gap-2 mt-2">
                                  <span className="text-xs text-muted-foreground">
                                    Page {currentPage} of {totalPages}
                                  </span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={currentPage === 1}
                                    onClick={() =>
                                      setLogPage((p) => Math.max(1, p - 1))
                                    }
                                  >
                                    Prev
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={currentPage === totalPages}
                                    onClick={() =>
                                      setLogPage((p) =>
                                        Math.min(totalPages, p + 1)
                                      )
                                    }
                                  >
                                    Next
                                  </Button>
                                </div>
                              </>
                            );
                          } else {
                            // Fallback: show as plain text
                            const pagedRawLines = parsedLines.slice(
                              startIdx,
                              endIdx
                            );
                            return (
                              <>
                                <pre className="text-xs whitespace-pre-wrap">
                                  {pagedRawLines
                                    .map((line: any) =>
                                      typeof line === "string"
                                        ? line
                                        : line?.line
                                    )
                                    .join("\n")}
                                </pre>
                                <div className="flex justify-end items-center gap-2 mt-2">
                                  <span className="text-xs text-muted-foreground">
                                    Page {currentPage} of {totalPages}
                                  </span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={currentPage === 1}
                                    onClick={() =>
                                      setLogPage((p) => Math.max(1, p - 1))
                                    }
                                  >
                                    Prev
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={currentPage === totalPages}
                                    onClick={() =>
                                      setLogPage((p) =>
                                        Math.min(totalPages, p + 1)
                                      )
                                    }
                                  >
                                    Next
                                  </Button>
                                </div>
                              </>
                            );
                          }
                        })()
                      )}
                    </div>
                  </>
                )}
              </ModernModel>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
