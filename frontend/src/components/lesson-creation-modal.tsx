// components/lesson-creation-modal.tsx
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
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { coursesAPI } from "@/lib/api";

const lessonSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  duration: z.number().min(1, "Duration must be at least 1 minute"),
  order: z.number().min(1, "Order must be at least 1"),
  isFree: z.boolean(),
  isPublished: z.boolean(),
});

type LessonFormValues = z.infer<typeof lessonSchema>;

interface LessonCreationModalProps {
  courseId: string;
  isOpen: boolean;
  onClose: () => void;
  onLessonCreated: () => void;
  nextOrder: number;
}

export function LessonCreationModal({
  courseId,
  isOpen,
  onClose,
  onLessonCreated,
  nextOrder,
}: LessonCreationModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LessonFormValues>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      title: "",
      content: "",
      duration: 10,
      order: nextOrder,
      isFree: false,
      isPublished: true,
    },
  });

  const onSubmit = async (data: LessonFormValues) => {
    setIsLoading(true);
    try {
      console.log('Creating lesson with data:', data);
      console.log('Course ID:', courseId);

      const response = await coursesAPI.addLesson(courseId, data);
      console.log('Lesson creation response:', response);

      toast.success("Lesson created successfully!");
      form.reset();
      onLessonCreated();
      onClose();
    } catch (error) {
      console.error('Lesson creation error:', error);

      // Handle axios errors specifically
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const axiosError = error as {
          response?: {
            data?: { message?: string };
            status?: number;
          };
        };
        toast.error(axiosError.response?.data?.message || `Failed to create lesson: ${axiosError.response?.status}`);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to create lesson");
      }
    } finally {
      setIsLoading(false);
    }
  }

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Lesson
          </DialogTitle>
          <DialogDescription>
            Add a new lesson to your course. You can add video content and resources later.
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
                        className="min-h-24 resize-vertical"
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
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
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
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
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
                    {isLoading ? "Creating..." : "Create Lesson"}
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