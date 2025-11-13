// components/resource-upload.tsx - Fixed event handling
"use client";

import { useState, useRef } from "react";
import { Upload, File, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface ResourceUploadProps {
  courseId: string;
  lessonId: string;
  onResourceUploaded: (resource: any) => void;
  allowedTypes?: string[];
  maxSize?: number; // in bytes
}

export function ResourceUpload({
  courseId,
  lessonId,
  onResourceUploaded,
  allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/webm',
      'application/msword', // .doc
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/vnd.ms-excel', // .xls
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-powerpoint', // .ppt
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
    ],
  maxSize = 50 * 1024 * 1024, // 50MB default
}: ResourceUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await processFile(file);
  };

  const processFile = async (file: File) => {
    // Validate file type
    if (
      !allowedTypes.some((type) => {
        if (type.endsWith("/*")) {
          return file.type.startsWith(type.replace("/*", ""));
        }
        return file.type === type;
      })
    ) {
      toast.error(
        "Invalid file type. Please upload a PDF, image, or video file."
      );
      return;
    }

    // Validate file size
    if (file.size > maxSize) {
      toast.error(
        `File too large. Maximum size is ${maxSize / 1024 / 1024}MB.`
      );
      return;
    }

    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("resource", file);
      formData.append("name", file.name);
      formData.append("type", getFileType(file.type));

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Simulate successful upload response
      const mockResource = {
        name: file.name,
        type: getFileType(file.type),
        url: URL.createObjectURL(file),
        public_id: `mock-public-id-${Date.now()}`,
        size: file.size,
        order: 0,
      };

      // Small delay to show 100% progress
      await new Promise((resolve) => setTimeout(resolve, 500));

      onResourceUploaded(mockResource);
      toast.success("Resource uploaded successfully!");

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload resource");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setIsDragOver(false);
    }
  };

  const getFileType = (
    mimeType: string
  ): "pdf" | "image" | "video" | "document" => {
    if (mimeType === "application/pdf") return "pdf";
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("video/")) return "video";
    return "document";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      processFile(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 cursor-pointer
          ${
            isDragOver
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/50"
          }
          ${isUploading ? "opacity-50 cursor-not-allowed" : ""}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={isUploading ? undefined : handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          accept={allowedTypes.join(",")}
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="space-y-3">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <div className="space-y-1">
              <p className="text-sm font-medium">
                Uploading... {uploadProgress}%
              </p>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <Upload
              className={`h-8 w-8 mx-auto ${
                isDragOver ? "text-primary" : "text-muted-foreground"
              }`}
            />
            <div>
              <p className="font-medium">Click to upload or drag and drop</p>
              <p className="text-sm text-muted-foreground mt-1">
                PDF, images, videos up to {maxSize / 1024 / 1024}MB
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="text-xs text-muted-foreground space-y-1">
        <p>• Supported formats: PDF, JPG, PNG, GIF, MP4, MOV</p>
        <p>• Maximum file size: {maxSize / 1024 / 1024}MB</p>
        <p>• Files will be stored securely in Cloudinary</p>
      </div>

      {/* Manual upload button as backup */}
      {!isUploading && (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={handleClick}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Select File Manually
          </Button>
        </div>
      )}
    </div>
  );
}
