// components/course-lessons-manager.tsx
"use client";

import { useState } from "react";
import {
  Plus,
  Video,
  FileText,
  Edit,
  Trash2,
  GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { coursesAPI } from "@/lib/api";
import { Course, Lesson } from "@/types";
import { LessonCreationModal } from "./lesson-creation-modal";
import { LessonEditModal } from "./lesson-edit-modal";

interface CourseLessonsManagerProps {
  course: Course;
  onCourseUpdate: (course: Course) => void;
}

export function CourseLessonsManager({
                                       course,
                                       onCourseUpdate,
                                     }: CourseLessonsManagerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [draggedLessonId, setDraggedLessonId] = useState<string | null>(null);

  const fetchCourse = async () => {
    try {
      const response = await coursesAPI.getCourse(course._id);
      onCourseUpdate(response.data.data);
    } catch (error) {
      toast.error("Failed to refresh course data");
    }
  };

  const deleteLesson = async (lessonId: string) => {
    if (
        !confirm(
            "Are you sure you want to delete this lesson? This action cannot be undone."
        )
    ) {
      return;
    }

    setIsLoading(true);
    try {
      await coursesAPI.deleteLesson(course._id, lessonId);
      toast.success("Lesson deleted successfully!");
      await fetchCourse();
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to delete lesson");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLessonPublish = async (
      lessonId: string,
      currentStatus: boolean
  ) => {
    setIsLoading(true);
    try {
      // Find the lesson to update
      const lesson = course.lessons.find((l) => l._id === lessonId);
      if (!lesson) return;

      await coursesAPI.updateLesson(course._id, lessonId, {
        ...lesson,
        isPublished: !currentStatus,
      });

      toast.success(
          `Lesson ${currentStatus ? "unpublished" : "published"} successfully!`
      );
      await fetchCourse();
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to update lesson");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragStart = (lessonId: string) => {
    setDraggedLessonId(lessonId);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = async (
      e: React.DragEvent<HTMLDivElement>,
      targetLessonId: string
  ) => {
    e.preventDefault();

    if (!draggedLessonId || draggedLessonId === targetLessonId) {
      setDraggedLessonId(null);
      return;
    }

    const sortedLessons = [...course.lessons].sort((a, b) => a.order - b.order);
    const draggedIndex = sortedLessons.findIndex(
        (l) => l._id === draggedLessonId
    );
    const targetIndex = sortedLessons.findIndex(
        (l) => l._id === targetLessonId
    );

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedLessonId(null);
      return;
    }

    // Reorder lessons
    const newLessons = [...sortedLessons];
    const [removed] = newLessons.splice(draggedIndex, 1);
    newLessons.splice(targetIndex, 0, removed);

    // Update order property for all lessons
    const updatedLessons = newLessons.map((lesson, index) => ({
      ...lesson,
      order: index + 1,
    }));

    setIsLoading(true);
    try {
      // Update the entire course with the new lessons array
      await coursesAPI.updateCourse(course._id, {
        lessons: updatedLessons, // Send the entire reordered lessons array
      });

      toast.success("Lesson order updated successfully!");
      await fetchCourse();
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
          err.response?.data?.message || "Failed to update lesson order"
      );
    } finally {
      setIsLoading(false);
      setDraggedLessonId(null);
    }
  };

  const handleDragEnd = () => {
    setDraggedLessonId(null);
  };

  const sortedLessons = [...course.lessons].sort((a, b) => a.order - b.order);

  return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Course Lessons</h2>
            <p className="text-muted-foreground">
              Manage your course lessons and content. Drag to reorder.
            </p>
          </div>
          <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2"
              disabled={isLoading}
          >
            <Plus className="h-4 w-4" />
            Add Lesson
          </Button>
        </div>

        {sortedLessons.length > 0 ? (
            <div className="space-y-4">
              {sortedLessons.map((lesson, index) => (
                  <Card
                      key={lesson._id}
                      draggable={!isLoading}
                      onDragStart={() => handleDragStart(lesson._id)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, lesson._id)}
                      onDragEnd={handleDragEnd}
                      className={`hover:shadow-md transition-all ${
                          draggedLessonId === lesson._id
                              ? "opacity-50 scale-95"
                              : "opacity-100"
                      } ${
                          draggedLessonId && draggedLessonId !== lesson._id
                              ? "border-primary/50"
                              : ""
                      }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="flex items-center gap-2 mt-1">
                            <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                            <Badge variant="outline" className="text-xs">
                              {index + 1}
                            </Badge>
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-lg">{lesson.title}</CardTitle>
                            <CardDescription className="mt-1">
                              {lesson.duration > 0
                                  ? `${lesson.duration} second${lesson.duration === 1 ? "" : "s"}`
                                  : "No duration set"}
                              {lesson.isFree && (
                                  <Badge variant="secondary" className="ml-2">
                                    Free
                                  </Badge>
                              )}
                              {!lesson.isPublished && (
                                  <Badge variant="outline" className="ml-2">
                                    Draft
                                  </Badge>
                              )}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2"
                              onClick={() => setEditingLesson(lesson)}
                              disabled={isLoading}
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2"
                              onClick={() =>
                                  toggleLessonPublish(lesson._id, lesson.isPublished)
                              }
                              disabled={isLoading}
                          >
                            {lesson.isPublished ? "Unpublish" : "Publish"}
                          </Button>
                          <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2 text-destructive"
                              onClick={() => deleteLesson(lesson._id)}
                              disabled={isLoading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          <span>
                      Content:{" "}
                            {lesson.content.length > 100 ? "Detailed" : "Basic"}
                    </span>
                        </div>
                        {lesson.video && (
                            <div className="flex items-center gap-1">
                              <Video className="h-4 w-4" />
                              <span>Video: {lesson.video.duration}s</span>
                            </div>
                        )}
                        <div className="flex items-center gap-1">
                          <span>Resources: {lesson.resources.length}</span>
                        </div>
                      </div>

                      {lesson.content && (
                          <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                            <p className="text-sm line-clamp-2">{lesson.content}</p>
                          </div>
                      )}
                    </CardContent>
                  </Card>
              ))}
            </div>
        ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No lessons yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Start building your course by adding lessons. Each lesson can
                  include video content, text, and resources.
                </p>
                <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2"
                    disabled={isLoading}
                >
                  <Plus className="h-4 w-4" />
                  Create Your First Lesson
                </Button>
              </CardContent>
            </Card>
        )}

        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-semibold mb-2">Course Statistics</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Total Lessons</div>
              <div className="font-semibold">{course.lessons.length}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Total Duration</div>
              <div className="font-semibold">{course.totalDuration} minutes</div>
            </div>
            <div>
              <div className="text-muted-foreground">Published Lessons</div>
              <div className="font-semibold">
                {course.lessons.filter((lesson) => lesson.isPublished).length}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Free Lessons</div>
              <div className="font-semibold">
                {course.lessons.filter((lesson) => lesson.isFree).length}
              </div>
            </div>
          </div>
        </div>

        {/* Lesson Creation Modal */}
        <LessonCreationModal
            courseId={course._id}
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onLessonCreated={fetchCourse}
            nextOrder={course.lessons.length + 1}
        />

        {/* Lesson Edit Modal */}
        {editingLesson && (
            <LessonEditModal
                courseId={course._id}
                lesson={editingLesson}
                isOpen={!!editingLesson}
                onClose={() => setEditingLesson(null)}
                onLessonUpdated={fetchCourse}
            />
        )}
      </div>
  );
}