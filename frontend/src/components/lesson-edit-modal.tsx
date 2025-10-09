// components/lesson-edit-modal.tsx - Updated with scrolling
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Edit, Video, Upload } from "lucide-react";
import { toast } from "sonner";
import { coursesAPI } from "@/lib/api";
import { Lesson } from "@/types";

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
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update lesson");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVideoUpload = () => {
    toast.info(
      "Video upload functionality will be implemented with Cloudinary integration"
    );
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit Lesson
          </DialogTitle>
          <DialogDescription>
            Update your lesson details and content.
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable form content */}
        <div className="flex-1 overflow-y-auto pr-2 -mr-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
