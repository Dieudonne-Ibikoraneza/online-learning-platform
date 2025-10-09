// components/lesson-edit-modal.tsx - Fix resource ID issue
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
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
import { Edit, Video, Upload, FileText, Image, Trash2, Download } from "lucide-react";
import { toast } from "sonner";
import { coursesAPI } from "@/lib/api";
import { Lesson, Resource } from "@/types";
import { ResourceUpload } from "./resource-upload";
import { Badge } from "@/components/ui/badge";

const lessonSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  duration: z.number().min(1, "Duration must be at least 1 minute"),
  order: z.number().min(1, "Order must be at least 1"),
  isFree: z.boolean().default(false),
  isPublished: z.boolean().default(true),
});

type LessonFormValues = z.infer<typeof lessonSchema>;

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
  const [resources, setResources] = useState<Resource[]>(lesson.resources || []);
  const [showResourceUpload, setShowResourceUpload] = useState(false);

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
      console.log('Updating lesson with data:', data);
      console.log('Current resources:', resources);
      
      // Prepare resources for backend - remove _id field for new resources
      const resourcesForBackend = resources.map(resource => {
        // If it's a mock resource (starts with 'resource-'), remove the _id field
        // so MongoDB can generate a proper ObjectId
        if (resource._id && resource._id.startsWith('resource-')) {
          const { _id, ...resourceWithoutId } = resource;
          return resourceWithoutId;
        }
        return resource;
      });
      
      // Include resources in the update data
      const updateData = {
        ...data,
        resources: resourcesForBackend, // Send cleaned resources to backend
      };
      
      console.log('Sending to backend:', updateData);
      
      const response = await coursesAPI.updateLesson(courseId, lesson._id, updateData);
      console.log('Lesson update response:', response);
      
      toast.success("Lesson updated successfully!");
      onLessonUpdated();
      onClose();
    } catch (error: any) {
      console.error('Lesson update error:', error);
      console.error('Error details:', error.response?.data);
      toast.error(error.response?.data?.message || "Failed to update lesson");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVideoUpload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toast.info("Video upload functionality will be implemented with Cloudinary integration");
  };

  const handleResourceUploaded = async (resource: Resource) => {
    try {
      // Add the resource to local state
      const newResources = [...resources, resource];
      setResources(newResources);
      setShowResourceUpload(false);
      toast.success("Resource added successfully! Don't forget to save the lesson.");
    } catch (error) {
      toast.error("Failed to add resource");
    }
  };

  const handleDeleteResource = async (resourceId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm("Are you sure you want to delete this resource?")) return;
    
    try {
      // Remove from local state
      const newResources = resources.filter(res => res._id !== resourceId);
      setResources(newResources);
      
      toast.success("Resource deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete resource");
    }
  };

  const handleToggleResourceUpload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowResourceUpload(!showResourceUpload);
  };

  const handleDownloadResource = (resource: Resource, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const link = document.createElement('a');
    link.href = resource.url;
    link.download = resource.name;
    link.target = '_blank';
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

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit Lesson
          </DialogTitle>
          <DialogDescription>
            Update your lesson details, content, and resources. Resources will be saved when you click "Update Lesson".
          </DialogDescription>
        </DialogHeader>

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
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    Lesson Video
                  </h4>
                  {lesson.video ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {lesson.video.duration}m uploaded
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleVideoUpload}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Replace
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleVideoUpload}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Video
                    </Button>
                  )}
                </div>
                {!lesson.video && (
                  <p className="text-sm text-muted-foreground">
                    No video uploaded yet. Add a video to enhance your lesson.
                  </p>
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
                    onClick={handleToggleResourceUpload}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {showResourceUpload ? "Cancel" : "Add Resource"}
                  </Button>
                </div>

                {showResourceUpload && (
                  <div className="mb-4 p-4 bg-muted/50 rounded-lg">
                    <ResourceUpload
                      courseId={courseId}
                      lessonId={lesson._id}
                      onResourceUploaded={handleResourceUploaded}
                    />
                  </div>
                )}

                {resources.length > 0 ? (
                  <div className="space-y-2">
                    {resources.map((resource) => (
                      <div
                        key={resource._id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="text-muted-foreground">
                            {getResourceIcon(resource.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {resource.name}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Badge variant="outline" className="text-xs">
                                {resource.type.toUpperCase()}
                              </Badge>
                              {resource.size && (
                                <span>{formatFileSize(resource.size)}</span>
                              )}
                              {resource._id && resource._id.startsWith('resource-') && (
                                <Badge variant="secondary" className="text-xs">
                                  Unsaved
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleDownloadResource(resource, e)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleDeleteResource(resource._id, e)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No resources added yet. Add PDFs, images, or other files to enhance your lesson.
                  </p>
                )}

                {resources.length > 0 && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      💡 <strong>Remember:</strong> Resources will be saved to the lesson when you click "Update Lesson" below.
                      {resources.some(r => r._id && r._id.startsWith('resource-')) && 
                        " Unsaved resources will be properly saved to the database."
                      }
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
                    onClick={handleClose}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
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