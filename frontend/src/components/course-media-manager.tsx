"use client";

import React, { useState, useRef } from "react";
import { Upload, Image, Video, File, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Course } from "@/types";
import { coursesAPI } from "@/lib/api";
import VideoPlayer from "@/components/video-player"

interface CourseMediaManagerProps {
  course: Course;
  onCourseUpdate: (course: Course) => void;
}

export function CourseMediaManager({
                                     course,
                                     onCourseUpdate,
                                   }: CourseMediaManagerProps) {
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const getVideoDuration = (file: File) : Promise<number> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.preload = "metadata";

      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(video.duration);
      }

      video.onerror= () => {
        window.URL.revokeObjectURL(video.src);
        reject("Error loading video metadata");
      }

      video.src = URL.createObjectURL(file);
    })
  }

  const handleFileUpload = async (
      file: File,
      type: "thumbnail" | "promoVideo"
  ) => {
    if (!file) return;

    setIsUploading(type);
    setUploadProgress(0);

    // Validate file type and size
    if (type === "thumbnail") {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        setIsUploading(null);
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB
        toast.error("Image size must be less than 10MB");
        setIsUploading(null);
        return;
      }
    } else {
      if (!file.type.startsWith("video/")) {
        toast.error("Please select a video file");
        setIsUploading(null);
        return;
      }
      if (file.size > 500 * 1024 * 1024) { // 500MB
        toast.error("Video size must be less than 500MB");
        setIsUploading(null);
        return;
      }
    }

    try {
      let duration : number | undefined;

      if (type === "promoVideo") {
        try {
          duration = await getVideoDuration(file);
          console.log("Video duration: ", duration, "seconds")
        } catch (err) {
          console.warn("Could not retrieve video duration", err)
        }
      }

      const formData = new FormData();
      formData.append(type === "thumbnail" ? "thumbnail" : "video", file);

      if(duration) formData.append("duration", Math.round(duration).toString());
      // Use your existing API endpoints
      const apiCall = type === "thumbnail"
          ? coursesAPI.uploadThumbnail(course._id, formData)
          : coursesAPI.uploadPromoVideo(course._id, formData);

      // Simulate progress (in a real app, you'd use axios interceptors for actual progress)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await apiCall;

      clearInterval(progressInterval);
      setUploadProgress(100);

      onCourseUpdate(response.data.data);
      toast.success(`${type === "thumbnail" ? "Thumbnail" : "Promo video"} uploaded successfully!`);

      // Reset after success
      setTimeout(() => {
        setIsUploading(null);
        setUploadProgress(0);
      }, 1000);

    } catch (error) {
      // Fixed: Proper error type assertion
      const err = error as { response?: { data?: { message?: string } } };
      console.error("Upload failed:", error);
      toast.error(err.response?.data?.message || `Failed to upload ${type}`);
      setIsUploading(null);
      setUploadProgress(0);
    }
  };

  const handleFileSelect = async (
      event: React.ChangeEvent<HTMLInputElement>,
      type: "thumbnail" | "promoVideo"
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await handleFileUpload(file, type);

    // Reset file input
    if (event.target) event.target.value = "";
  };

  const deleteMedia = async (type: "thumbnail" | "promoVideo") => {
    if (!confirm(`Are you sure you want to delete the ${type}?`)) {
      return;
    }

    try {
      // Fixed: Use proper type assertion - Partial<Course> allows undefined but not null
      // So we need to either delete the field or use the API's delete endpoints
      // Since the API has delete endpoints, let's create them or use update with empty object

      if (type === "thumbnail") {
        // If you have a delete endpoint, use it. Otherwise, we can't set to null
        // For now, we'll need to add a deletePromoVideo endpoint to the API
        // Or update the Course type to allow null values
        toast.error("Delete functionality needs to be implemented in the API");
        return;
      } else {
        // Use the deletePromoVideo endpoint if it exists
        // Otherwise, similar to thumbnail
        toast.error("Delete functionality needs to be implemented in the API");
        return;
      }

    } catch (error) {
      // Fixed: Proper error type assertion
      const err = error as { response?: { data?: { message?: string } } };
      console.error("Delete failed:", error);
      toast.error(err.response?.data?.message || `Failed to delete ${type}`);
    }
  };

  const triggerFileInput = (type: "thumbnail" | "promoVideo") => {
    if (type === "thumbnail") {
      thumbnailInputRef.current?.click();
    } else {
      videoInputRef.current?.click();
    }
  };

  // Hidden file inputs
  const renderFileInputs = () => (
      <>
        <input
            type="file"
            ref={thumbnailInputRef}
            onChange={(e) => handleFileSelect(e, "thumbnail")}
            accept="image/*"
            className="hidden"
        />
        <input
            type="file"
            ref={videoInputRef}
            onChange={(e) => handleFileSelect(e, "promoVideo")}
            accept="video/*"
            className="hidden"
        />
      </>
  );

  const formatDuration = (seconds: number) =>{
    if(!seconds) return "0:00"

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatMinutes = (seconds:number) => {
    if(!seconds) return "0 minutes";

    const minutes = Math.round(seconds / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`
  }

  return (
      <div className="space-y-6">
        {renderFileInputs()}

        <div>
          <h2 className="text-2xl font-bold">Course Media</h2>
          <p className="text-muted-foreground">
            Upload and manage your course thumbnail and promotional video
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Thumbnail Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Course Thumbnail
              </CardTitle>
              <CardDescription>
                Upload a compelling thumbnail image for your course (Recommended: 800x450px)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isUploading === "thumbnail" && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading thumbnail...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
              )}

              {course.thumbnail?.url ? (
                  <div className="space-y-4">
                    <div className="aspect-video rounded-lg border overflow-hidden">
                      <img
                          src={course.thumbnail.url}
                          alt="Course thumbnail"
                          className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Button variant="outline" size="sm" asChild>
                        <a
                            href={course.thumbnail.url}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </a>
                      </Button>
                      <Button
                          variant="outline"
                          size="sm"
                          onClick={() => triggerFileInput("thumbnail")}
                          disabled={!!isUploading}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Replace
                      </Button>
                      <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteMedia("thumbnail")}
                          className="text-destructive"
                          disabled={!!isUploading}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
              ) : (
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                    <Image className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      No thumbnail uploaded
                    </p>
                    <Button
                        onClick={() => triggerFileInput("thumbnail")}
                        className="flex items-center gap-2"
                        disabled={!!isUploading}
                    >
                      <Upload className="h-4 w-4" />
                      Upload Thumbnail
                    </Button>
                  </div>
              )}
            </CardContent>
          </Card>

          {/* Promo Video Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Promotional Video
              </CardTitle>
              <CardDescription>
                Upload a promotional video to showcase your course (Optional)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isUploading === "promoVideo" && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading video...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
              )}

              {course.promoVideo?.url ? (
                  <div className="space-y-4">
                    <div className="aspect-video bg-black rounded-lg flex items-center justify-center relative">
                      <VideoPlayer
                          src={course.promoVideo.url}
                          duration={course.promoVideo.duration ? formatDuration(course.promoVideo.duration) : undefined}
                      />
                    </div>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span>
                      {course.promoVideo.duration ?
                          `${formatDuration(course.promoVideo.duration)}`
                          : "Duration not available"
                      }
                    </span>
                      </div>
                      {course.promoVideo.duration && (
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Format: </span>
                            <span>{course.promoVideo.url.split('.').pop()?.toUpperCase()}</span>
                          </div>
                      )}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Button variant="outline" size="sm" asChild>
                        <a
                            href={course.promoVideo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </a>
                      </Button>
                      <Button
                          variant="outline"
                          size="sm"
                          onClick={() => triggerFileInput("promoVideo")}
                          disabled={!!isUploading}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Replace
                      </Button>
                      <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteMedia("promoVideo")}
                          className="text-destructive"
                          disabled={!!isUploading}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
              ) : (
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                    <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      No promotional video uploaded
                    </p>
                    <Button
                        onClick={() => triggerFileInput("promoVideo")}
                        className="flex items-center gap-2"
                        disabled={!!isUploading}
                    >
                      <Upload className="h-4 w-4" />
                      Upload Video
                    </Button>
                  </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Lesson Media Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <File className="h-5 w-5" />
              Lesson Media Summary
            </CardTitle>
            <CardDescription>
              Overview of media files across all lessons
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Video className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <div className="font-semibold">
                  {course.lessons.filter((lesson) => lesson.video).length}
                </div>
                <div className="text-muted-foreground">Videos</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <File className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <div className="font-semibold">
                  {course.lessons.reduce(
                      (total, lesson) => total + lesson.resources.length,
                      0
                  )}
                </div>
                <div className="text-muted-foreground">Resources</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Image className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <div className="font-semibold">
                  {course.lessons.reduce(
                      (total, lesson) =>
                          total +
                          lesson.resources.filter((res) => res.type === "image")
                              .length,
                      0
                  )}
                </div>
                <div className="text-muted-foreground">Images</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <File className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                <div className="font-semibold">
                  {course.lessons.reduce(
                      (total, lesson) =>
                          total +
                          lesson.resources.filter((res) => res.type === "pdf").length,
                      0
                  )}
                </div>
                <div className="text-muted-foreground">PDFs</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}