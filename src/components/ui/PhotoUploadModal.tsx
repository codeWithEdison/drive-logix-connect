import React, { useState, useRef } from "react";
import ModernModel from "@/components/modal/ModernModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Camera,
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
  FileText,
  Package,
  Receipt,
} from "lucide-react";

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  cargoId: string;
  cargoNumber?: string;
  uploadType: "loading" | "delivery" | "receipt" | "signature";
  onUpload: (data: {
    photos: File[];
    notes: string;
    type: string;
    cargoId: string;
  }) => void;
  submitButtonText?: string;
}

export function PhotoUploadModal({
  isOpen,
  onClose,
  cargoId,
  cargoNumber,
  uploadType,
  onUpload,
  submitButtonText,
}: PhotoUploadModalProps) {
  const [photos, setPhotos] = useState<File[]>([]);
  const [notes, setNotes] = useState("");
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const uploadTypeConfig = {
    loading: {
      title: "Cargo Loading Photos",
      description: "Take photos of cargo being loaded into the truck",
      icon: Package,
      color: "bg-blue-100 text-blue-600",
      required: true,
    },
    delivery: {
      title: "Delivery Confirmation",
      description: "Take photos of delivered cargo and get customer signature",
      icon: CheckCircle,
      color: "bg-green-100 text-green-600",
      required: true,
    },
    receipt: {
      title: "Receipt/EBM Photos",
      description: "Upload photos of receipts and EBM documents",
      icon: Receipt,
      color: "bg-orange-100 text-orange-600",
      required: true,
    },
    signature: {
      title: "Customer Signature",
      description: "Capture customer signature for delivery confirmation",
      icon: FileText,
      color: "bg-purple-100 text-purple-600",
      required: true,
    },
  };

  const config = uploadTypeConfig[uploadType];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    setPhotos((prev) => [...prev, ...imageFiles]);
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      setStream(mediaStream);
      setShowCamera(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast({
        title: "Camera Access Failed",
        description: "Unable to access camera. Please use file upload instead.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setShowCamera(false);
    setCapturedImage(null);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const file = new File([blob], `photo_${Date.now()}.jpg`, {
                type: "image/jpeg",
              });
              setPhotos((prev) => [...prev, file]);
              setCapturedImage(canvas.toDataURL("image/jpeg"));
              stopCamera();
            }
          },
          "image/jpeg",
          0.8
        );
      }
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (photos.length === 0 && config.required) {
      toast({
        title: "No Photos Selected",
        description: `Please add at least one ${uploadType} photo`,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      // Generate default notes if not provided
      const finalNotes = notes.trim() || "Cargo picked up now";

      await onUpload({
        photos,
        notes: finalNotes,
        type: uploadType,
        cargoId,
      });

      // Reset form
      setPhotos([]);
      setNotes("");
      setCapturedImage(null);
      onClose();
    } catch (error: any) {
      console.error("Upload failed:", error);

      // Show detailed error message
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        "Upload failed. Please try again.";

      toast({
        title: "Upload Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    stopCamera();
    setPhotos([]);
    setNotes("");
    setCapturedImage(null);
    onClose();
  };

  return (
    <ModernModel isOpen={isOpen} onClose={handleClose} title={config.title}>
      <div className="space-y-6">
        {/* Header Info */}
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
          <div className={`p-2 rounded-lg ${config.color}`}>
            <config.icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{config.title}</h3>
            <p className="text-sm text-gray-600">{config.description}</p>
            <p className="text-xs text-gray-500">
              {cargoNumber ? `Cargo: ${cargoNumber}` : `Cargo ID: ${cargoId}`}
            </p>
          </div>
        </div>

        {/* Camera/Upload Section */}
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Camera View */}
              {showCamera && (
                <div className="space-y-4">
                  <div className="relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2 bg-white"
                      onClick={stopCamera}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={capturePhoto} className="flex-1">
                      <Camera className="h-4 w-4 mr-2" />
                      Capture Photo
                    </Button>
                    <Button variant="outline" onClick={stopCamera}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Captured Image Preview */}
              {capturedImage && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">
                    Captured Photo:
                  </p>
                  <div className="relative">
                    <img
                      src={capturedImage}
                      alt="Captured"
                      className="w-full h-auto object-cover rounded-lg"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2 bg-white"
                      onClick={() => setCapturedImage(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Upload Buttons */}
              {!showCamera && (
                <div className="space-y-3">
                  <Button
                    onClick={startCamera}
                    className="w-full"
                    variant="outline"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Take Photo with Camera
                  </Button>

                  <div className="relative">
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                      variant="outline"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload from Gallery
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Selected Photos */}
        {photos.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium text-gray-900 mb-3">
                Selected Photos ({photos.length})
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {photos.map((photo, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(photo)}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-1 right-1 bg-white p-1 h-6 w-6"
                      onClick={() => removePhoto(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notes Section */}
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium text-gray-900 mb-3">
              Additional Notes (Optional)
            </h4>
            <Textarea
              placeholder="Add any additional notes or observations (optional)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-2">
              If no notes provided, system will generate: "Cargo picked up now"
            </p>
          </CardContent>
        </Card>

        {/* Upload Button */}
        <div className="flex gap-3">
          <Button
            onClick={handleUpload}
            disabled={isUploading || (config.required && photos.length === 0)}
            className="flex-1"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                {submitButtonText ||
                  `Upload ${
                    uploadType === "signature" ? "Signature" : "Photos"
                  }`}
              </>
            )}
          </Button>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
        </div>

        {/* Requirements Info */}
        {config.required && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <p className="text-sm text-blue-800">
              {uploadType === "signature"
                ? "Customer signature is required for delivery confirmation"
                : `${config.title} are required for this cargo`}
            </p>
          </div>
        )}
      </div>
    </ModernModel>
  );
}
