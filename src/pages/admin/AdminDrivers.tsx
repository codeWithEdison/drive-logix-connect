import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, AlertCircle, Upload, Download } from "lucide-react";
import { DriverTable, Driver } from "@/components/ui/DriverTable";
import { DriverDetailModal } from "@/components/ui/DriverDetailModal";
import { CreateDriverModal } from "@/components/ui/CreateDriverModal";
import { DocumentPreviewModal } from "@/components/ui/DocumentPreviewModal";
import DriverSyncModal, {
  DriverSyncRow,
} from "@/components/drivers/DriverSyncModal";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUserManagement, useUpdateUserStatus } from "@/lib/api/hooks";
import { useAdminDrivers } from "@/lib/api/hooks/adminHooks";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { customToast } from "@/lib/utils/toast";
import { AdminService } from "@/lib/api/services/adminService";
import { parseCSV, mapCSVToDriverFields } from "@/lib/utils/csvParser";
import { getErrorMessage } from "@/lib/utils/frontend";

const AdminDrivers = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [isDriverDetailModalOpen, setIsDriverDetailModalOpen] = useState(false);
  const [isCreateDriverModalOpen, setIsCreateDriverModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isDocumentPreviewOpen, setIsDocumentPreviewOpen] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<{
    url: string;
    name: string;
  } | null>(null);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [syncRows, setSyncRows] = useState<DriverSyncRow[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // API hooks
  const {
    data: driversData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useUserManagement({
    role: "driver",
    status: statusFilter === "all" ? undefined : statusFilter,
    limit: 100,
  });

  const updateUserStatusMutation = useUpdateUserStatus();

  // Fetch all drivers for validation
  const { data: allDriversData } = useAdminDrivers({ limit: 1000 });

  // Extract existing driver data for validation
  const existingDriversForValidation = React.useMemo(() => {
    if (!allDriversData || !Array.isArray(allDriversData)) return [];
    return allDriversData
      .map((driver: any) => {
        // Handle different data structures
        const user = driver.user || driver;
        const driverData = driver.driver || driver;

        return {
          email: user.email || driver.email || "",
          phone: user.phone || driver.phone || "",
          license_number:
            driverData.license_number || driver.license_number || "",
          code_number: driverData.code_number || driver.code_number || "",
        };
      })
      .filter(
        (d: any) => d.email || d.phone || d.license_number || d.code_number
      );
  }, [allDriversData]);

  // Transform API data
  // console.log("🔍 AdminDrivers Debug - driversData:", driversData);
  // console.log("🔍 AdminDrivers Debug - driversData structure:", {
  //   hasData: !!driversData,
  //   dataType: typeof driversData,
  //   isArray: Array.isArray(driversData),
  //   dataLength: Array.isArray(driversData) ? driversData.length : "not array",
  //   firstItem: Array.isArray(driversData) ? driversData[0] : "not array",
  // });

  const drivers: Driver[] =
    driversData?.map((user: any) => ({
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      license_number: user.driver?.license_number || "N/A",
      license_expiry: user.driver?.license_expiry || "N/A",
      license_type: user.driver?.license_type || "B",
      date_of_birth: user.driver?.date_of_birth || "N/A",
      emergency_contact: user.driver?.emergency_contact || "N/A",
      emergency_phone: user.driver?.emergency_phone || "N/A",
      blood_type: user.driver?.blood_type || "N/A",
      medical_certificate_expiry:
        user.driver?.medical_certificate_expiry || "N/A",
      status: user.driver?.status || "available",
      rating: user.driver?.rating || 0,
      total_deliveries: user.driver?.total_deliveries || 0,
      total_distance_km: user.driver?.total_distance_km || 0,
      driver_number: user.driver?.code_number || "N/A",
      registeredDate: user.created_at,
      lastActive: user.last_login || "Never",
      avatar_url: user.avatar_url,
      is_active: user.is_active,
      is_verified: user.is_verified,
      branch_name: user.branch?.name || user.driver?.branch?.name || "-",
    })) || [];

  console.log("🔍 AdminDrivers Debug - drivers:", drivers);

  // Pagination state (client-side)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const totalItems = drivers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const clampedPage = Math.min(currentPage, totalPages);
  const startIndex = (clampedPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const pagedDrivers = drivers.slice(startIndex, endIndex);

  const handleChangePage = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    setCurrentPage(nextPage);
  };

  const handleChangePageSize = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  // Driver handlers
  const handleViewDriverDetails = (driver: Driver) => {
    setSelectedDriver(driver);
    setIsDriverDetailModalOpen(true);
  };

  const handleEditDriver = (driver: Driver) => {
    // TODO: Implement driver edit functionality
    customToast.info("Driver edit functionality coming soon");
  };

  const handleDeleteDriver = async (driverId: string) => {
    try {
      await updateUserStatusMutation.mutateAsync({
        id: driverId,
        data: { is_active: false, reason: "Deleted by admin" },
      });
      customToast.success("Driver deactivated successfully");
      refetch();
    } catch (error) {
      customToast.error("Failed to deactivate driver");
    }
  };

  const handleApproveDriver = async (driverId: string) => {
    try {
      await updateUserStatusMutation.mutateAsync({
        id: driverId,
        data: { is_active: true, reason: "Approved by admin" },
      });
      customToast.success("Driver approved successfully");
      refetch();
    } catch (error) {
      customToast.error("Failed to approve driver");
    }
  };

  // General handlers
  const handleCreateNew = () => {
    setIsCreateDriverModalOpen(true);
  };

  const handleRefresh = async () => {
    await refetch();
    customToast.success("Data refreshed successfully");
  };

  const handleCallDriver = (phone: string) => {
    window.open(`tel:${phone}`, "_self");
  };

  const handleCreateDriverSuccess = () => {
    customToast.success("Driver created successfully");
    setIsCreateDriverModalOpen(false);
    refetch();
  };

  // File upload handler
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain",
    ];
    const allowedExtensions = [".csv", ".xlsx", ".xls"];

    const fileExtension = file.name
      .toLowerCase()
      .substring(file.name.lastIndexOf("."));
    const isValidType =
      allowedTypes.includes(file.type) ||
      allowedExtensions.includes(fileExtension);

    if (!isValidType) {
      customToast.error("Invalid file type. Please upload CSV or Excel files.");
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      customToast.error("File size must be less than 10MB");
      return;
    }

    try {
      // Read file content
      const fileContent = await readFileContent(file);

      // Parse CSV
      const csvRows = parseCSV(fileContent);

      if (csvRows.length === 0) {
        customToast.error("No data found in file");
        return;
      }

      // Map CSV rows to driver sync rows
      const rows: DriverSyncRow[] = csvRows.map((csvRow) => {
        const mapped = mapCSVToDriverFields(csvRow);
        const toCell = (v: any) => ({ value: v ?? "", error: null });

        return {
          full_name: toCell(mapped.full_name),
          email: toCell(mapped.email),
          phone: toCell(mapped.phone),
          password: toCell(mapped.password),
          preferred_language: toCell(mapped.preferred_language || "en"),
          license_number: toCell(mapped.license_number),
          license_type: toCell(mapped.license_type),
          license_expiry: toCell(mapped.license_expiry),
          code_number: toCell(mapped.code_number),
          date_of_birth: toCell(mapped.date_of_birth),
          emergency_contact: toCell(mapped.emergency_contact),
          emergency_phone: toCell(mapped.emergency_phone),
          blood_type: toCell(mapped.blood_type),
          medical_certificate_expiry: toCell(mapped.medical_certificate_expiry),
          branch_id: toCell(mapped.branch_id || user?.branch_id || ""),
        };
      });

      setSyncRows(rows);
      setIsSyncModalOpen(true);
      customToast.success(`Loaded ${rows.length} drivers from file`);
    } catch (error: any) {
      customToast.error(getErrorMessage(error, "Failed to parse file"));
    } finally {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Read file content helper
  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content);
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  // Download CSV template
  const handleDownloadTemplate = () => {
    const headers = [
      "full_name",
      "email",
      "phone",
      "password",
      "preferred_language",
      "license_number",
      "license_type",
      "code_number",
      "license_expiry",
      "date_of_birth",
      "emergency_contact",
      "emergency_phone",
      "blood_type",
      "medical_certificate_expiry",
      "branch_id",
    ];

    // Example rows with sample data
    const exampleRows = [
      [
        "John Doe",
        "john.doe@example.com",
        "+250788123456",
        "SecurePass123",
        "en",
        "DL001234",
        "B",
        "DRV001",
        "2028-12-31",
        "1990-01-15",
        "Jane Doe",
        "+250788123457",
        "O+",
        "2025-12-31",
        "",
      ],
      [
        "Jane Smith",
        "jane.smith@example.com",
        "+250788123458",
        "SecurePass456",
        "rw",
        "DL001235",
        "C",
        "DRV002",
        "2029-06-30",
        "1992-05-20",
        "John Smith",
        "+250788123459",
        "A+",
        "2026-06-30",
        "",
      ],
    ];

    // Create CSV content
    const csvContent = [
      headers.join(","),
      ...exampleRows.map((row) =>
        row
          .map((cell) => {
            // Escape commas and quotes in cells
            if (
              cell.includes(",") ||
              cell.includes('"') ||
              cell.includes("\n")
            ) {
              return `"${cell.replace(/"/g, '""')}"`;
            }
            return cell;
          })
          .join(",")
      ),
    ].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "driver_bulk_upload_template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    customToast.success("Template downloaded successfully");
  };

  // Handle bulk save
  const handleSyncSave = async (drivers: any[]) => {
    try {
      const response = await AdminService.bulkCreateDrivers({ drivers });
      const successCount = response.data?.success ?? 0;
      const failedCount = response.data?.failed ?? 0;
      const results = response.data?.results || [];

      if (successCount > 0) {
        customToast.success(`Successfully created ${successCount} driver(s)`);
      }

      if (failedCount > 0) {
        // Create error mapping - match errors to rows by email (handling malformed emails)
        const errorResults = results.filter((r: any) => !r.success && r.error);
        
        // Helper function to extract clean email from potentially malformed string
        const extractEmail = (emailStr: string): string => {
          if (!emailStr) return '';
          // Try to extract email before numbers (e.g., "jodsadhn.doe@example.com07882346484" -> "jodsadhn.doe@example.com")
          const emailMatch = emailStr.match(/^([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
          return emailMatch ? emailMatch[1].toLowerCase() : emailStr.toLowerCase();
        };

        // Update rows with server errors
        setSyncRows((prev) =>
          prev.map((row) => {
            const rowEmail = row.email?.value?.toString().toLowerCase().trim();
            const rowLicense = row.license_number?.value?.toString().trim();
            
            // Find matching error by email (exact or partial match for malformed emails)
            const matchingError = errorResults.find((result: any) => {
              if (!result.email) return false;
              
              const resultEmail = extractEmail(result.email);
              
              // Exact match
              if (rowEmail === resultEmail) return true;
              
              // Partial match (handles malformed emails like "email@domain.com123456")
              if (rowEmail && resultEmail.includes(rowEmail)) return true;
              if (rowEmail && result.email.toLowerCase().includes(rowEmail)) return true;
              
              // Match by license number if error is about license
              if (rowLicense && result.error?.toLowerCase().includes('license') &&
                  result.email && result.email.includes(rowLicense)) return true;
              
              return false;
            });

            if (matchingError) {
              const errorMsg = matchingError.error;
              const updatedRow: any = { ...row, hasErrors: true };
              
              // Determine which field the error is about and set error on that field
              const errorLower = errorMsg.toLowerCase();
              if (errorLower.includes('email') || errorLower.includes('user with this email')) {
                updatedRow.email = {
                  value: row.email?.value,
                  error: errorMsg,
                };
              } else if (errorLower.includes('license')) {
                updatedRow.license_number = {
                  value: row.license_number?.value,
                  error: errorMsg,
                };
              } else if (errorLower.includes('phone')) {
                updatedRow.phone = {
                  value: row.phone?.value,
                  error: errorMsg,
                };
              } else if (errorLower.includes('code number') || errorLower.includes('code_number')) {
                updatedRow.code_number = {
                  value: row.code_number?.value,
                  error: errorMsg,
                };
              } else {
                // Default to email field if we can't determine
                updatedRow.email = {
                  value: row.email?.value,
                  error: errorMsg,
                };
              }
              
              return updatedRow;
            }
            return row;
          })
        );

        // Build detailed error message for toast
        const errorMessages = errorResults.map((r: any) => r.error).filter(Boolean);
        const errorSummary = errorMessages.length > 0 
          ? errorMessages.map((msg: string, idx: number) => `${idx + 1}. ${msg}`).join('\n')
          : `${failedCount} driver(s) failed to create`;
        
        customToast.error(
          `${failedCount} driver(s) failed to create`,
          errorSummary
        );
      }

      await refetch();
      if (failedCount === 0) {
        setIsSyncModalOpen(false);
        setSyncRows([]);
      }
    } catch (error: any) {
      customToast.error(getErrorMessage(error, "Failed to create drivers"));
    }
  };

  const handlePreviewDocument = (documentUrl: string, documentName: string) => {
    setPreviewDocument({ url: documentUrl, name: documentName });
    setIsDocumentPreviewOpen(true);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Filters Skeleton */}
        <div className="flex gap-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Tabs Skeleton */}
        <Skeleton className="h-12 w-full" />

        {/* Table Skeleton */}
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Driver Management
            </h1>
            <p className="text-muted-foreground">
              Manage and monitor all drivers in the system
            </p>
          </div>
        </div>

        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div>
                <h3 className="font-semibold text-red-800">Error</h3>
                <p className="text-red-600 text-sm mt-1">
                  {error.message || "Failed to load drivers"}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  className="mt-2"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Driver Management
          </h1>
          <p className="text-muted-foreground">
            Manage and monitor all drivers in the system
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading || isFetching}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${
                isLoading || isFetching ? "animate-spin" : ""
              }`}
            />
            {isLoading || isFetching ? "Refreshing..." : "Refresh"}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
            id="driver-file-upload"
          />
          <Button
            variant="outline"
            onClick={handleDownloadTemplate}
            type="button"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.click();
              }
            }}
            type="button"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload CSV/Excel
          </Button>
          <Button onClick={handleCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Driver
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Status:</label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search drivers..."
            className="w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Driver Table */}
      <DriverTable
        drivers={pagedDrivers}
        title=""
        showSearch={false}
        showFilters={false}
        showPagination={false}
        onViewDetails={handleViewDriverDetails}
        onDeleteDriver={handleDeleteDriver}
        onActivateDriver={handleApproveDriver}
        onCallDriver={handleCallDriver}
      />

      {/* Pagination Controls */}
      <div className="flex items-center justify-between pt-2">
        <div className="text-sm text-muted-foreground">
          Showing {totalItems === 0 ? 0 : startIndex + 1}-{endIndex} of{" "}
          {totalItems}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleChangePage(clampedPage - 1)}
            disabled={clampedPage <= 1}
          >
            Previous
          </Button>
          <div className="text-sm">
            Page {clampedPage} / {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleChangePage(clampedPage + 1)}
            disabled={clampedPage >= totalPages}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Modals */}
      {selectedDriver && (
        <DriverDetailModal
          driver={selectedDriver}
          isOpen={isDriverDetailModalOpen}
          onClose={() => {
            setIsDriverDetailModalOpen(false);
            setSelectedDriver(null);
          }}
          onPreviewDocument={handlePreviewDocument}
        />
      )}

      {/* Document Preview Modal */}
      {previewDocument && (
        <DocumentPreviewModal
          isOpen={isDocumentPreviewOpen}
          onClose={() => {
            setIsDocumentPreviewOpen(false);
            setPreviewDocument(null);
          }}
          documentUrl={previewDocument.url}
          documentName={previewDocument.name}
        />
      )}

      {/* Create Driver Modal */}
      <CreateDriverModal
        isOpen={isCreateDriverModalOpen}
        onClose={() => setIsCreateDriverModalOpen(false)}
        onSuccess={handleCreateDriverSuccess}
      />

      {/* Driver Sync Modal */}
      <DriverSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => {
          setIsSyncModalOpen(false);
          setSyncRows([]);
        }}
        rows={syncRows}
        onSave={handleSyncSave}
        existingDrivers={existingDriversForValidation}
      />
    </div>
  );
};

export default AdminDrivers;
