import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import ModernModel from "@/components/modal/ModernModel";
import {
  User,
  FileText,
  Upload,
  X,
  Check,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { useCreateAdminDriver } from "@/lib/api/hooks/adminHooks";
import { useUploadDriverDocument } from "@/lib/api/hooks/driverHooks";
import { useBranches } from "@/lib/api/hooks/branchHooks";
import { FileService } from "@/lib/api/services/utilityService";
import axiosInstance from "@/lib/api/axios";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Driver } from "./DriverTable";

interface CreateDriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  editingDriver?: Driver | null;
}

interface DriverFormData {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  preferred_language: "en" | "rw" | "fr";
  license_number: string;
  license_expiry: string;
  license_type: "A" | "B" | "C" | "D" | "E";
  code_number: string;
  date_of_birth: string;
  emergency_contact: string;
  emergency_phone: string;
  blood_type: string;
  medical_certificate_expiry: string;
  branch_id: string;
}

interface DocumentFile {
  id: string;
  file: File;
  document_type:
    | "license"
    | "medical_cert"
    | "insurance"
    | "vehicle_registration"
    | "other";
  document_number: string;
  expiry_date: string;
  preview: string;
  cloudinary_url?: string;
  isUploaded?: boolean;
}

export function CreateDriverModal({
  isOpen,
  onClose,
  onSuccess,
  editingDriver,
}: CreateDriverModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingDocuments, setIsUploadingDocuments] = useState(false);
  const [createdDriverId, setCreatedDriverId] = useState<string | null>(null);
  const [uploadedDocuments, setUploadedDocuments] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  const createDriverMutation = useCreateAdminDriver();
  const uploadDocumentMutation = useUploadDriverDocument();
  const { data: branchesData } = useBranches({ limit: 100 });

  const [formData, setFormData] = useState<DriverFormData>({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    preferred_language: "en",
    license_number: "",
    license_expiry: "",
    license_type: "A",
    code_number: "",
    date_of_birth: "",
    emergency_contact: "",
    emergency_phone: "",
    blood_type: "",
    medical_certificate_expiry: "",
    branch_id: user?.branch_id || "",
  });

  const [documents, setDocuments] = useState<DocumentFile[]>([]);

  const toDateInput = (value: string | undefined | null): string => {
    if (!value) return "";
    if (value === "N/A") return "";
    // Already in YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const date = new Date(value);
    return isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
  };

  // Populate form when editing driver
  useEffect(() => {
    if (editingDriver) {
      setFormData({
        full_name: editingDriver.full_name || "",
        email: editingDriver.email || "",
        phone: editingDriver.phone || "",
        password: "", // Don't populate password for security
        preferred_language: "en", // Default value since not in Driver interface
        license_number: editingDriver.license_number || "",
        license_expiry: toDateInput(editingDriver.license_expiry),
        license_type: editingDriver.license_type || "B",
        code_number:
          (editingDriver as any).code_number ||
          ((editingDriver as any).driver_number &&
            (editingDriver as any).driver_number !== "N/A")
            ? (editingDriver as any).driver_number
            : "",
        date_of_birth: toDateInput(editingDriver.date_of_birth),
        emergency_contact: editingDriver.emergency_contact || "",
        emergency_phone: editingDriver.emergency_phone || "",
        blood_type: editingDriver.blood_type || "",
        medical_certificate_expiry: toDateInput(
          editingDriver.medical_certificate_expiry
        ),
        branch_id: user?.branch_id || "",
      });
      setCreatedDriverId(editingDriver.id);
    } else {
      // Reset form for new driver
      setFormData({
        full_name: "",
        email: "",
        phone: "",
        password: "",
        preferred_language: "en",
        license_number: "",
        license_expiry: "",
        license_type: "B",
        code_number: "",
        date_of_birth: "",
        emergency_contact: "",
        emergency_phone: "",
        blood_type: "",
        medical_certificate_expiry: "",
        branch_id: user?.branch_id || "",
      });
      setCreatedDriverId(null);
    }
  }, [editingDriver, user?.branch_id]);

  const handleInputChange = (field: keyof DriverFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    documentType: DocumentFile["document_type"]
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "File size must be less than 10MB",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description:
          "Please upload JPEG, PNG, GIF, WebP, PDF, DOC, or DOCX files",
        variant: "destructive",
      });
      return;
    }

    const newDocument: DocumentFile = {
      id: Math.random().toString(36).substr(2, 9),
      file,
      document_type: documentType,
      document_number: "",
      expiry_date: "",
      preview: URL.createObjectURL(file),
    };

    setDocuments((prev) => [...prev, newDocument]);
  };

  const removeDocument = (id: string) => {
    setDocuments((prev) => {
      const doc = prev.find((d) => d.id === id);
      if (doc) {
        URL.revokeObjectURL(doc.preview);
      }
      return prev.filter((d) => d.id !== id);
    });
  };

  const updateDocument = (
    id: string,
    field: keyof Pick<DocumentFile, "document_number" | "expiry_date">,
    value: string
  ) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, [field]: value } : doc))
    );
  };

  const validateStep1 = () => {
    const required = [
      "full_name",
      "email",
      "phone",
      "license_number",
      "license_type",
      "code_number",
    ];

    // Only require password when creating a new driver
    if (!editingDriver) {
      required.push("password");
    }

    // Add branch_id validation for super_admin
    if (user?.role === "super_admin") {
      required.push("branch_id");
    }

    for (const field of required) {
      if (!formData[field as keyof DriverFormData]) {
        toast({
          title: "Validation Error",
          description: `Please fill in the ${field.replace("_", " ")} field`,
          variant: "destructive",
        });
        return false;
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return false;
    }

    // Password validation
    if (!editingDriver) {
      if (formData.password.length < 6) {
        toast({
          title: "Weak Password",
          description: "Password must be at least 6 characters long",
          variant: "destructive",
        });
        return false;
      }
    } else if (formData.password) {
      // If editing, only validate when a new password is provided
      if (formData.password.length < 6) {
        toast({
          title: "Weak Password",
          description: "Password must be at least 6 characters long",
          variant: "destructive",
        });
        return false;
      }
    }

    return true;
  };

  const handleNext = async () => {
    if (!validateStep1()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // If editing, update driver via PUT (exclude password), then proceed to documents
      if (editingDriver) {
        const updatePayload: any = {
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          preferred_language: formData.preferred_language,
          license_number: formData.license_number,
          license_expiry: formData.license_expiry || undefined,
          license_type: formData.license_type,
          code_number: formData.code_number,
          date_of_birth: formData.date_of_birth || undefined,
          emergency_contact: formData.emergency_contact || undefined,
          emergency_phone: formData.emergency_phone || undefined,
          blood_type: formData.blood_type || undefined,
          medical_certificate_expiry:
            formData.medical_certificate_expiry || undefined,
          branch_id: formData.branch_id || undefined,
        };

        await axiosInstance.put(
          `/admin/drivers/${editingDriver.id}`,
          updatePayload
        );

        setCreatedDriverId(editingDriver.id);
        toast({
          title: "Success",
          description:
            "Driver updated successfully! Now you can upload documents.",
        });
        setCurrentStep(2);
        return;
      }

      // Step 1 (create): Create driver first (password included on create only)
      const createPayload = { ...formData };
      const driverResponse = await createDriverMutation.mutateAsync(
        createPayload
      );
      const driverId = driverResponse.data.driver.id;
      setCreatedDriverId(driverId);

      toast({
        title: "Success",
        description:
          "Driver created successfully! Now you can upload documents.",
      });

      // Move to step 2 for document upload
      setCurrentStep(2);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        (editingDriver ? "Failed to update driver" : "Failed to create driver");
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
    setError(null);
  };

  const handleUploadDocuments = async () => {
    if (documents.length === 0) {
      toast({
        title: "No documents to upload",
        description: "Please add documents or skip this step",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingDocuments(true);
    setError(null);

    try {
      // Step 1: Upload files to Cloudinary using FileService (same as cargo images)
      const cloudinaryUploadPromises = documents.map(async (doc) => {
        const uploadResponse = await FileService.uploadFile(
          doc.file,
          "document",
          doc.document_type
        );
        const cloudinaryUrl = uploadResponse.data!.file_url;
        return { ...doc, cloudinary_url: cloudinaryUrl, isUploaded: true };
      });

      const uploadedDocs = await Promise.all(cloudinaryUploadPromises);
      setDocuments(uploadedDocs);

      // Step 2: Send document metadata to API
      const apiUploadPromises = uploadedDocs.map(async (doc) => {
        const documentData: any = {
          document_type: doc.document_type,
          document_url: doc.cloudinary_url!,
        };

        // Only include document_number if it's not empty
        if (doc.document_number && doc.document_number.trim()) {
          documentData.document_number = doc.document_number;
        }

        // Only include expiry_date if it's not empty
        if (doc.expiry_date) {
          documentData.expiry_date = doc.expiry_date;
        }

        const response = await axiosInstance.post(
          `/admin/drivers/${createdDriverId}/documents`,
          documentData
        );
        return response.data;
      });

      await Promise.all(apiUploadPromises);

      toast({
        title: "Success",
        description: "All documents uploaded and saved successfully!",
      });

      onSuccess?.();
      handleClose();
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to upload documents";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUploadingDocuments(false);
    }
  };

  const handleSkipDocuments = () => {
    toast({
      title: "Success",
      description:
        "Driver created successfully without documents. You can add documents later.",
    });
    onSuccess?.();
    handleClose();
  };

  const handleClose = () => {
    // Clean up file URLs
    documents.forEach((doc) => {
      URL.revokeObjectURL(doc.preview);
    });

    // Reset form
    setCurrentStep(1);
    setFormData({
      full_name: "",
      email: "",
      phone: "",
      password: "",
      preferred_language: "en",
      license_number: "",
      license_expiry: "",
      license_type: "A",
      code_number: "",
      date_of_birth: "",
      emergency_contact: "",
      emergency_phone: "",
      blood_type: "",
      medical_certificate_expiry: "",
      branch_id: user?.branch_id || "",
    });
    setDocuments([]);
    setCreatedDriverId(null);
    setUploadedDocuments([]);
    setError(null);
    setIsSubmitting(false);
    setIsUploadingDocuments(false);
    onClose();
  };

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case "license":
        return "Driver's License";
      case "medical_cert":
        return "Medical Certificate";
      case "insurance":
        return "Insurance Document";
      case "vehicle_registration":
        return "Vehicle Registration";
      case "other":
        return "Other Document";
      default:
        return type;
    }
  };

  return (
    <ModernModel
      isOpen={isOpen}
      onClose={handleClose}
      title={editingDriver ? "Edit Driver" : "Create New Driver"}
      //   size="lg"
    >
      <div className="space-y-6">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center space-x-4">
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full ${
              currentStep >= 1
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            <User className="h-4 w-4" />
          </div>
          <div
            className={`h-1 w-16 ${
              currentStep >= 2 ? "bg-blue-600" : "bg-gray-200"
            }`}
          />
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full ${
              currentStep >= 2
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            <FileText className="h-4 w-4" />
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <div>
                  <h4 className="font-semibold text-red-800">Error</h4>
                  <p className="text-red-600 text-sm mt-1">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 1: Driver Information */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Driver Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) =>
                        handleInputChange("full_name", e.target.value)
                      }
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      placeholder="Enter phone number"
                    />
                  </div>
                  {!editingDriver && (
                    <div>
                      <Label htmlFor="password">Password *</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                          handleInputChange("password", e.target.value)
                        }
                        placeholder="Enter password (min 8 chars)"
                      />
                    </div>
                  )}
                  <div>
                    <Label htmlFor="preferred_language">
                      Preferred Language
                    </Label>
                    <Select
                      value={formData.preferred_language}
                      onValueChange={(value: "en" | "rw" | "fr") =>
                        handleInputChange("preferred_language", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="rw">Kinyarwanda</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) =>
                        handleInputChange("date_of_birth", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="license_number">License Number *</Label>
                    <Input
                      id="license_number"
                      value={formData.license_number}
                      onChange={(e) =>
                        handleInputChange("license_number", e.target.value)
                      }
                      placeholder="Enter license number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="code_number">Driver Code Number *</Label>
                    <Input
                      id="code_number"
                      value={formData.code_number}
                      onChange={(e) =>
                        handleInputChange("code_number", e.target.value)
                      }
                      placeholder="Enter driver code (e.g., DRV001)"
                    />
                  </div>
                  <div>
                    <Label htmlFor="license_type">License Type *</Label>
                    <Select
                      value={formData.license_type}
                      onValueChange={(value: "A" | "B" | "C" | "D" | "E") =>
                        handleInputChange("license_type", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">Type A</SelectItem>
                        <SelectItem value="B">Type B</SelectItem>
                        <SelectItem value="C">Type C</SelectItem>
                        <SelectItem value="D">Type D</SelectItem>
                        <SelectItem value="E">Type E</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="license_expiry">License Expiry</Label>
                    <Input
                      id="license_expiry"
                      type="date"
                      value={formData.license_expiry}
                      onChange={(e) =>
                        handleInputChange("license_expiry", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="medical_certificate_expiry">
                      Medical Certificate Expiry
                    </Label>
                    <Input
                      id="medical_certificate_expiry"
                      type="date"
                      value={formData.medical_certificate_expiry}
                      onChange={(e) =>
                        handleInputChange(
                          "medical_certificate_expiry",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="emergency_contact">Emergency Contact</Label>
                    <Input
                      id="emergency_contact"
                      value={formData.emergency_contact}
                      onChange={(e) =>
                        handleInputChange("emergency_contact", e.target.value)
                      }
                      placeholder="Enter emergency contact name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergency_phone">Emergency Phone</Label>
                    <Input
                      id="emergency_phone"
                      value={formData.emergency_phone}
                      onChange={(e) =>
                        handleInputChange("emergency_phone", e.target.value)
                      }
                      placeholder="Enter emergency phone number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="blood_type">Blood Type</Label>
                    <Select
                      value={formData.blood_type}
                      onValueChange={(value) =>
                        handleInputChange("blood_type", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select blood type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {user?.role === "super_admin" && (
                    <div>
                      <Label htmlFor="branch_id">Branch *</Label>
                      <Select
                        value={formData.branch_id}
                        onValueChange={(value) =>
                          handleInputChange("branch_id", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select branch" />
                        </SelectTrigger>
                        <SelectContent>
                          {branchesData?.branches?.map((branch: any) => (
                            <SelectItem key={branch.id} value={branch.id}>
                              {branch.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 2: Documents */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Driver Documents (Optional)
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Upload driver documents. You can skip this step and add
                  documents later.
                </p>
                {createdDriverId && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-800">
                      ✅ Driver created successfully! ID: {createdDriverId}
                    </p>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Document Upload Areas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { type: "license", label: "Driver's License" },
                    { type: "medical_cert", label: "Medical Certificate" },
                    { type: "insurance", label: "Insurance Document" },
                    {
                      type: "vehicle_registration",
                      label: "Vehicle Registration",
                    },
                  ].map(({ type, label }) => (
                    <div key={type} className="space-y-2">
                      <Label>{label}</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                        <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600 mb-2">
                          Click to upload
                        </p>
                        <Input
                          type="file"
                          accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx"
                          onChange={(e) =>
                            handleFileUpload(
                              e,
                              type as DocumentFile["document_type"]
                            )
                          }
                          className="hidden"
                          id={`upload-${type}`}
                        />
                        <Label
                          htmlFor={`upload-${type}`}
                          className="cursor-pointer text-blue-600 hover:text-blue-700"
                        >
                          Choose File
                        </Label>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Uploaded Documents */}
                {documents.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium">Documents to Upload</h4>
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className={`flex items-center justify-between p-3 border rounded-lg ${
                          doc.isUploaded ? "bg-green-50 border-green-200" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            {doc.file.type.startsWith("image/") ? (
                              <img
                                src={doc.preview}
                                alt="Preview"
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <FileText className="h-6 w-6 text-gray-500" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">
                              {getDocumentTypeLabel(doc.document_type)}
                            </p>
                            <p className="text-sm text-gray-500">
                              {doc.file.name}
                            </p>
                            {doc.isUploaded && (
                              <p className="text-xs text-green-600 font-medium">
                                ✅ Uploaded to Cloudinary
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {!doc.isUploaded && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeDocument(doc.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Other Documents Upload */}
                <div className="space-y-2">
                  <Label>Other Documents</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                    <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      Upload additional documents
                    </p>
                    <Input
                      type="file"
                      accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx"
                      onChange={(e) => handleFileUpload(e, "other")}
                      className="hidden"
                      id="upload-other"
                    />
                    <Label
                      htmlFor="upload-other"
                      className="cursor-pointer text-blue-600 hover:text-blue-700"
                    >
                      Choose File
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between">
          <div>
            {currentStep === 2 && (
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            {currentStep === 1 ? (
              <Button onClick={handleNext} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    {editingDriver
                      ? "Updating Driver..."
                      : "Creating Driver..."}
                  </>
                ) : (
                  <>
                    {editingDriver ? "Update Driver" : "Create Driver"}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleSkipDocuments}>
                  Skip Documents
                </Button>
                <Button
                  onClick={handleUploadDocuments}
                  disabled={isUploadingDocuments || documents.length === 0}
                >
                  {isUploadingDocuments ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Upload Documents
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </ModernModel>
  );
}
