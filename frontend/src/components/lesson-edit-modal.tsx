"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import VideoPlayer from "@/components/video-player";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Edit,
  Video,
  Upload,
  FileText,
  Image,
  Trash2,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { coursesAPI } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

// Types
interface LessonFormValues {
  title: string;
  content: string;
  duration: number;
  order: number;
  isFree: boolean;
  isPublished: boolean;
}

interface Resource {
  _id: string;
  name: string;
  type: string;
  url: string;
  size?: number;
}

interface VideoData {
  url: string;
  duration?: number;
}

interface Lesson {
  _id: string;
  title: string;
  content: string;
  duration: number;
  order: number;
  isFree: boolean;
  isPublished: boolean;
  resources?: Resource[];
  video?: VideoData;
}

// Fixed: Make all fields required in schema to match interface
const lessonSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  duration: z.number().min(1, "Duration must be at least 1 minute"),
  order: z.number().min(1, "Order must be at least 1"),
  isFree: z.boolean(),
  isPublished: z.boolean(),
});

interface LessonEditModalProps {
  courseId: string;
  lesson: Lesson;
  isOpen: boolean;
  onClose: () => void;
  onLessonUpdated: () => void;
}

export function LessonEditModal({
                                  courseId,
                                  lesson,
                                  isOpen,
                                  onClose,
                                  onLessonUpdated,
                                }: LessonEditModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [resources, setResources] = useState<Resource[]>(
      lesson.resources || []
  );
  const [lessonVideo, setLessonVideo] = useState(lesson.video);
  const [isUploadingResource, setIsUploadingResource] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentUploadFile, setCurrentUploadFile] = useState<string>("");

  const videoInputRef = useRef<HTMLInputElement>(null);
  const resourceInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<LessonFormValues>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      title: lesson.title,
      content: lesson.content,
      duration: lesson.duration,
      order: lesson.order,
      isFree: lesson.isFree,
      isPublished: lesson.isPublished,
    },
  });

  const onSubmit = async (data: LessonFormValues) => {
    setIsLoading(true);
    try {
      await coursesAPI.updateLesson(courseId, lesson._id, data);
      toast.success("Lesson updated successfully!");
      onLessonUpdated();
      onClose();
    } catch (error) {
      // Fixed: Proper type assertion for error
      const err = error as { response?: { data?: { message?: string } } };
      console.error("Lesson update error:", error);
      toast.error(err.response?.data?.message || "Failed to update lesson");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle video upload
  const handleVideoUpload = async (
      event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("video/")) {
      toast.error("Please select a valid video file");
      return;
    }

    // Validate file size (max 500MB for videos)
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      toast.error("Video file size must be less than 500MB");
      return;
    }

    setIsUploadingVideo(true);
    setUploadProgress(0);
    setCurrentUploadFile(file.name);

    try {
      const formData = new FormData();
      formData.append("video", file);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      const response = await coursesAPI.uploadLessonVideo(
          courseId,
          lesson._id,
          formData
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Update local state with new video
      const updatedLesson = response.data.data.lessons.find(
          (l: Lesson) => l._id === lesson._id
      );
      if (updatedLesson?.video) {
        setLessonVideo(updatedLesson.video);

        // Update duration if video has duration
        if (updatedLesson.video.duration) {
          form.setValue("duration", updatedLesson.video.duration);
        }
      }

      toast.success("Video uploaded successfully!");

      // Reset file input
      if (event.target) event.target.value = "";
    } catch (error) {
      // Fixed: Proper type assertion for error
      const err = error as { response?: { data?: { message?: string } } };
      console.error("Video upload failed:", error);
      toast.error(err.response?.data?.message || "Failed to upload video");
    } finally {
      setTimeout(() => {
        setIsUploadingVideo(false);
        setUploadProgress(0);
        setCurrentUploadFile("");
      }, 1000);
    }
  };

  // Handle resource upload (PDF, images, documents)
  const handleResourceUpload = async (
      event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      toast.error("File size must be less than 100MB");
      return;
    }

    setIsUploadingResource(true);
    setUploadProgress(0);
    setCurrentUploadFile(file.name);

    try {
      const formData = new FormData();

      // Determine resource type based on file type
      let resourceType: "pdf" | "image" | "document" = "document";
      if (file.type.startsWith("image/")) {
        resourceType = "image";
      } else if (file.type === "application/pdf") {
        resourceType = "pdf";
      }

      // Append the file with consistent field name 'file' (matches backend multer config)
      formData.append("file", file);
      formData.append("name", file.name);
      formData.append("type", resourceType);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      const response = await coursesAPI.uploadResource(
          courseId,
          lesson._id,
          formData
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Fixed: Access lessons directly from response.data.data
      const updatedLesson = response.data.data.lessons.find(
          (l: Lesson) => l._id === lesson._id
      );
      if (updatedLesson?.resources) {
        setResources(updatedLesson.resources);
      }

      toast.success("Resource uploaded successfully!");

      // Reset file input
      if (event.target) event.target.value = "";
    } catch (error) {
      // Fixed: Proper type assertion for error
      const err = error as { response?: { data?: { message?: string } } };
      console.error("Resource upload failed:", error);
      toast.error(err.response?.data?.message || "Failed to upload resource");
    } finally {
      setTimeout(() => {
        setIsUploadingResource(false);
        setUploadProgress(0);
        setCurrentUploadFile("");
      }, 1000);
    }
  };

  const handleDeleteResource = async (
      resourceId: string,
      e: React.MouseEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm("Are you sure you want to delete this resource?")) return;

    try {
      await coursesAPI.deleteResource(courseId, lesson._id, resourceId);

      // Remove from local state
      setResources((prev) => prev.filter((res) => res._id !== resourceId));

      toast.success("Resource deleted successfully!");
    } catch (error) {
      // Fixed: Proper type assertion for error
      const err = error as { response?: { data?: { message?: string } } };
      console.error("Resource deletion failed:", error);
      toast.error(err.response?.data?.message || "Failed to delete resource");
    }
  };

  const handleDeleteVideo = async () => {
    if (!confirm("Are you sure you want to delete this video?")) return;

    try {
      await coursesAPI.deleteLessonVideo(courseId, lesson._id);
      setLessonVideo(undefined);
      toast.success("Video deleted successfully!");
    } catch (error) {
      // Fixed: Proper type assertion for error
      const err = error as { response?: { data?: { message?: string } } };
      console.error("Video deletion failed:", error);
      toast.error(err.response?.data?.message || "Failed to delete video");
    }
  };

  const handleDownloadResource = (resource: Resource, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const link = document.createElement("a");
    link.href = resource.url;
    link.download = resource.name;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="h-4 w-4" />;
      case "image":
        return <Image className="h-4 w-4" />;
      case "video":
        return <Video className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit Lesson
            </DialogTitle>
            <DialogDescription>
              Update your lesson details, content, video, and resources.
            </DialogDescription>
          </DialogHeader>

          {/* Hidden file inputs */}
          <input
              type="file"
              ref={videoInputRef}
              onChange={handleVideoUpload}
              accept="video/*"
              className="hidden"
              disabled={isUploadingVideo}
          />
          <input
              type="file"
              ref={resourceInputRef}
              onChange={handleResourceUpload}
              accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
              className="hidden"
              disabled={isUploadingResource}
          />

          {/* Scrollable form content */}
          <div className="flex-1 overflow-y-auto pr-2 -mr-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Basic Information</h3>

                  <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                          <FormItem>
                            <FormLabel>Lesson Title</FormLabel>
                            <FormControl>
                              <Input
                                  placeholder="e.g., Introduction to React Components"
                                  {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                      )}
                  />

                  <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                          <FormItem>
                            <FormLabel>Lesson Content</FormLabel>
                            <FormControl>
                              <Textarea
                                  placeholder="Detailed content for this lesson..."
                                  className="min-h-32 resize-vertical"
                                  {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              You can use markdown formatting for rich content.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                      )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="duration"
                        render={({ field }) => (
                            <FormItem>
                              <FormLabel>Duration (minutes)</FormLabel>
                              <FormControl>
                                <Input
                                    type="number"
                                    min="1"
                                    placeholder="10"
                                    {...field}
                                    onChange={(e) =>
                                        field.onChange(parseInt(e.target.value) || 1)
                                    }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="order"
                        render={({ field }) => (
                            <FormItem>
                              <FormLabel>Order</FormLabel>
                              <FormControl>
                                <Input
                                    type="number"
                                    min="1"
                                    {...field}
                                    onChange={(e) =>
                                        field.onChange(parseInt(e.target.value) || 1)
                                    }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                        )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="isFree"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel>Free Lesson</FormLabel>
                                <FormDescription>
                                  Make this lesson available for free
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="isPublished"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel>Published</FormLabel>
                                <FormDescription>
                                  Make lesson visible to students
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                        )}
                    />
                  </div>
                </div>

                {/* Video Section */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      Lesson Video
                    </h4>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => videoInputRef.current?.click()}
                        disabled={isUploadingVideo}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {lessonVideo ? "Replace Video" : "Upload Video"}
                    </Button>
                  </div>

                  {isUploadingVideo && (
                      <div className="mb-4 p-4 bg-muted/50 rounded-lg">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                        <span className="truncate mr-2">
                          Uploading {currentUploadFile}...
                        </span>
                            <span className="font-semibold">{uploadProgress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                  )}

                  {lessonVideo ? (
                      <div className="space-y-3">
                        <VideoPlayer
                            src={lessonVideo.url}
                            duration={formatDuration(lessonVideo.duration)}
                        />
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="text-sm font-medium">Current Video</p>
                            <p className="text-xs text-muted-foreground">
                              Duration: {formatDuration(lessonVideo.duration)}
                            </p>
                          </div>
                          <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={handleDeleteVideo}
                              className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                  ) : (
                      <div className="text-center py-8 px-4 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                        <Video className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground mb-2">
                          No video uploaded yet
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Upload a video to enhance your lesson
                        </p>
                      </div>
                  )}
                </div>

                {/* Resources Section */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Lesson Resources ({resources.length})
                    </h4>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => resourceInputRef.current?.click()}
                        disabled={isUploadingResource}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {isUploadingResource ? "Uploading..." : "Add Resource"}
                    </Button>
                  </div>

                  {isUploadingResource && (
                      <div className="mb-4 p-4 bg-muted/50 rounded-lg">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                        <span className="truncate mr-2">
                          Uploading {currentUploadFile}...
                        </span>
                            <span className="font-semibold">{uploadProgress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                  )}

                  {resources.length > 0 ? (
                      <div className="space-y-2">
                        {resources.map((resource) => (
                            <div
                                key={resource._id}
                                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="text-muted-foreground flex-shrink-0">
                                  {getResourceIcon(resource.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">
                                    {resource.name}
                                  </p>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                                    <Badge variant="outline" className="text-xs">
                                      {resource.type.toUpperCase()}
                                    </Badge>
                                    {resource.size && (
                                        <span>{formatFileSize(resource.size)}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => handleDownloadResource(resource, e)}
                                    title="Download resource"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) =>
                                        handleDeleteResource(resource._id, e)
                                    }
                                    className="text-destructive hover:text-destructive"
                                    title="Delete resource"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                        ))}
                      </div>
                  ) : (
                      <div className="text-center py-8 px-4 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground mb-2">
                          No resources added yet
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Add PDFs, images, or other files to enhance your lesson
                        </p>
                      </div>
                  )}
                </div>

                {/* Fixed footer outside scrollable area */}
                <div className="pt-4 border-t">
                  <DialogFooter className="flex-shrink-0">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading || isUploadingResource || isUploadingVideo}
                    >
                      Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isLoading || isUploadingResource || isUploadingVideo}
                    >
                      {isLoading ? "Updating..." : "Update Lesson"}
                    </Button>
                  </DialogFooter>
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
  );
}