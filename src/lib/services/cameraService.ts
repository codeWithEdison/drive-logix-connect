import {
  Camera,
  CameraResultType,
  CameraSource,
  Photo,
} from "@capacitor/camera";
import { Capacitor } from "@capacitor/core";
import { offlineStorageService } from "./offlineStorage";
import axiosInstance from "../api/axios";

export interface CameraOptions {
  quality?: number; // 0-100
  allowEditing?: boolean;
  resultType?: CameraResultType;
  source?: CameraSource;
  width?: number;
  height?: number;
}

export interface ImageResult {
  dataUrl: string;
  blob?: Blob;
  format: string;
  width: number;
  height: number;
  size: number;
}

class CameraService {
  private defaultOptions: CameraOptions = {
    quality: 80,
    allowEditing: false,
    resultType: CameraResultType.DataUrl,
    source: CameraSource.Camera,
  };

  /**
   * Check if camera is available
   */
  async isAvailable(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      return (
        "mediaDevices" in navigator && "getUserMedia" in navigator.mediaDevices
      );
    }

    try {
      const permissions = await Camera.checkPermissions();
      return permissions.camera === "granted";
    } catch (error) {
      console.error("Camera availability check failed:", error);
      return false;
    }
  }

  /**
   * Request camera permissions
   */
  async requestPermissions(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        stream.getTracks().forEach((track) => track.stop());
        return true;
      } catch (error) {
        console.error("Camera permission denied:", error);
        return false;
      }
    }

    try {
      const permissions = await Camera.requestPermissions();
      return permissions.camera === "granted";
    } catch (error) {
      console.error("Camera permission request failed:", error);
      return false;
    }
  }

  /**
   * Take a picture with camera
   */
  async takePicture(
    options: Partial<CameraOptions> = {}
  ): Promise<ImageResult | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error("Camera permission not granted");
      }

      const finalOptions = { ...this.defaultOptions, ...options };

      if (Capacitor.isNativePlatform()) {
        return await this.takeNativePicture(finalOptions);
      } else {
        return await this.takeWebPicture(finalOptions);
      }
    } catch (error) {
      console.error("Take picture failed:", error);
      return null;
    }
  }

  /**
   * Select image from gallery
   */
  async selectFromGallery(
    options: Partial<CameraOptions> = {}
  ): Promise<ImageResult | null> {
    try {
      const finalOptions = {
        ...this.defaultOptions,
        ...options,
        source: CameraSource.Photos,
      };

      return await this.takePicture(finalOptions);
    } catch (error) {
      console.error("Select from gallery failed:", error);
      return null;
    }
  }

  /**
   * Take picture using native camera
   */
  private async takeNativePicture(
    options: CameraOptions
  ): Promise<ImageResult> {
    const photo = await Camera.getPhoto({
      quality: options.quality || 90,
      allowEditing: options.allowEditing || false,
      resultType: options.resultType || CameraResultType.DataUrl,
      source: options.source || CameraSource.Camera,
    });

    if (!photo.dataUrl) {
      throw new Error("No image data received");
    }

    // Convert to blob for better handling
    const blob = await this.dataUrlToBlob(photo.dataUrl);

    return {
      dataUrl: photo.dataUrl,
      blob,
      format: photo.format || "jpeg",
      width: 0, // Photo object doesn't have width/height properties
      height: 0, // Photo object doesn't have width/height properties
      size: blob?.size || 0,
    };
  }

  /**
   * Take picture using web camera
   */
  private async takeWebPicture(options: CameraOptions): Promise<ImageResult> {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Canvas context not available"));
        return;
      }

      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          video.srcObject = stream;
          video.play();

          video.onloadedmetadata = () => {
            canvas.width = options.width || video.videoWidth;
            canvas.height = options.height || video.videoHeight;

            // Draw video frame to canvas
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Stop video stream
            stream.getTracks().forEach((track) => track.stop());

            // Convert to blob
            canvas.toBlob(
              async (blob) => {
                if (!blob) {
                  reject(new Error("Failed to create image blob"));
                  return;
                }

                const dataUrl = canvas.toDataURL(
                  "image/jpeg",
                  options.quality ? options.quality / 100 : 0.8
                );

                resolve({
                  dataUrl,
                  blob,
                  format: "jpeg",
                  width: canvas.width,
                  height: canvas.height,
                  size: blob.size,
                });
              },
              "image/jpeg",
              options.quality ? options.quality / 100 : 0.8
            );
          };
        })
        .catch(reject);
    });
  }

  /**
   * Compress image
   */
  async compressImage(
    imageResult: ImageResult,
    maxWidth: number = 1920,
    maxHeight: number = 1080,
    quality: number = 0.8
  ): Promise<ImageResult> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          resolve(imageResult);
          return;
        }

        // Calculate new dimensions
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          async (blob) => {
            if (!blob) {
              resolve(imageResult);
              return;
            }

            const dataUrl = canvas.toDataURL("image/jpeg", quality);

            resolve({
              dataUrl,
              blob,
              format: "jpeg",
              width,
              height,
              size: blob.size,
            });
          },
          "image/jpeg",
          quality
        );
      };

      img.src = imageResult.dataUrl;
    });
  }

  /**
   * Store image locally for offline use
   */
  async storeImageLocally(
    key: string,
    imageResult: ImageResult
  ): Promise<void> {
    try {
      if (imageResult.blob) {
        await offlineStorageService.storeImage(key, imageResult.blob);
      }
    } catch (error) {
      console.error("Failed to store image locally:", error);
    }
  }

  /**
   * Get locally stored image
   */
  async getLocalImage(key: string): Promise<Blob | null> {
    try {
      return await offlineStorageService.getImage(key);
    } catch (error) {
      console.error("Failed to get local image:", error);
      return null;
    }
  }

  /**
   * Upload image to server
   */
  async uploadImage(
    imageResult: ImageResult,
    endpoint: string,
    fieldName: string = "image"
  ): Promise<boolean> {
    try {
      if (!imageResult.blob) {
        throw new Error("No image blob available");
      }

      const formData = new FormData();
      formData.append(
        fieldName,
        imageResult.blob,
        `image.${imageResult.format}`
      );

      // Upload using axios
      const response = await axiosInstance.post(endpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data.success;
    } catch (error) {
      console.error("Image upload failed:", error);
      return false;
    }
  }

  /**
   * Convert data URL to blob
   */
  private async dataUrlToBlob(dataUrl: string): Promise<Blob> {
    const response = await fetch(dataUrl);
    return response.blob();
  }

  /**
   * Scan document (optimized settings for documents)
   */
  async scanDocument(): Promise<ImageResult | null> {
    return await this.takePicture({
      quality: 90,
      allowEditing: true,
      source: CameraSource.Camera,
    });
  }

  /**
   * Take cargo photo (optimized for cargo documentation)
   */
  async takeCargoPhoto(): Promise<ImageResult | null> {
    const result = await this.takePicture({
      quality: 85,
      allowEditing: false,
      source: CameraSource.Camera,
    });

    if (result) {
      // Compress for cargo photos
      return await this.compressImage(result, 1920, 1080, 0.8);
    }

    return result;
  }

  /**
   * Get image info
   */
  getImageInfo(imageResult: ImageResult): {
    sizeKB: number;
    dimensions: string;
    aspectRatio: number;
    isLandscape: boolean;
  } {
    const sizeKB = Math.round(imageResult.size / 1024);
    const dimensions = `${imageResult.width}x${imageResult.height}`;
    const aspectRatio = imageResult.width / imageResult.height;
    const isLandscape = imageResult.width > imageResult.height;

    return {
      sizeKB,
      dimensions,
      aspectRatio,
      isLandscape,
    };
  }
}

export const cameraService = new CameraService();
export default cameraService;
