import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ModernModel from "@/components/modal/ModernModel";
import { X, Download, ExternalLink, FileText, Image, File } from "lucide-react";

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentUrl: string;
  documentName: string;
  documentType?: string;
}

export function DocumentPreviewModal({
  isOpen,
  onClose,
  documentUrl,
  documentName,
  documentType,
}: DocumentPreviewModalProps) {
  const getFileIcon = (url: string) => {
    const extension = url.split(".").pop()?.toLowerCase();

    if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension || "")) {
      return <Image className="h-8 w-8 text-blue-500" />;
    } else if (["pdf"].includes(extension || "")) {
      return <FileText className="h-8 w-8 text-red-500" />;
    } else {
      return <File className="h-8 w-8 text-gray-500" />;
    }
  };

  const getFileTypeBadge = (url: string) => {
    const extension = url.split(".").pop()?.toLowerCase();

    switch (extension) {
      case "pdf":
        return <Badge className="bg-red-100 text-red-600">PDF</Badge>;
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "webp":
        return <Badge className="bg-blue-100 text-blue-600">Image</Badge>;
      case "doc":
      case "docx":
        return <Badge className="bg-blue-100 text-blue-600">Word</Badge>;
      case "xls":
      case "xlsx":
        return <Badge className="bg-green-100 text-green-600">Excel</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-600">File</Badge>;
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = documentUrl;
    link.download = documentName;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenInNewTab = () => {
    window.open(documentUrl, "_blank");
  };

  return (
    <ModernModel
      isOpen={isOpen}
      onClose={onClose}
      title={`Preview: ${documentName}`}
      className="max-w-4xl"
    >
      <div className="space-y-4">
        {/* Document Info */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            {getFileIcon(documentUrl)}
            <div>
              <h3 className="font-medium text-gray-900">{documentName}</h3>
              <div className="flex items-center gap-2 mt-1">
                {getFileTypeBadge(documentUrl)}
                {documentType && (
                  <Badge variant="outline">{documentType}</Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" size="sm" onClick={handleOpenInNewTab}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Open
            </Button>
          </div>
        </div>

        {/* Document Preview */}
        <div className="border rounded-lg overflow-hidden">
          <div className="h-96 bg-gray-100 flex items-center justify-center">
            {documentUrl.toLowerCase().includes(".pdf") ? (
              <iframe
                src={documentUrl}
                className="w-full h-full"
                title={documentName}
              />
            ) : documentUrl
                .toLowerCase()
                .match(/\.(jpg|jpeg|png|gif|webp)$/) ? (
              <img
                src={documentUrl}
                alt={documentName}
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <div className="text-center">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  Preview not available for this file type
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Click "Open" to view the document
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>
      </div>
    </ModernModel>
  );
}
