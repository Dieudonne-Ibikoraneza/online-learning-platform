"use client";

import { useState } from "react";
import { toast } from "sonner";

interface UploadOptions {
  resourceType: "image" | "video" | "raw";
  folder: string;
  onProgress?: (progress: number) => void;
}

export function useCloudinaryUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadToCloudinary = async (
    file: File,
    options: UploadOptions
  ): Promise<{ public_id: string; secure_url: string; duration?: number }> => {
    setIsUploading(true);
    setProgress(0);

    try {
      // Create form data
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "learnhub_uploads"); // You'll need to create this in Cloudinary
      formData.append("folder", options.folder);

      // Simulate upload progress (in a real app, you'd use XMLHttpRequest for actual progress)
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        setProgress(i);
        options.onProgress?.(i);
      }

      // Upload to your backend API which will handle Cloudinary upload
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();

      setProgress(100);
      toast.success("Upload completed successfully!");

      return result.data;
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload failed. Please try again.");
      throw error;
    } finally {
      setIsUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  return {
    uploadToCloudinary,
    isUploading,
    progress,
  };
}