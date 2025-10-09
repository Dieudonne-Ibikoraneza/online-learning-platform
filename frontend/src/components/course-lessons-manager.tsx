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
import { Course } from "@/types";

interface CourseLessonsManagerProps {
  course: Course;
  onCourseUpdate: (course: Course) => void;
}

export function CourseLessonsManager({
  course,
  onCourseUpdate,
}: CourseLessonsManagerProps) {
  const [isLoading, setIsLoading] = useState(false);

  const addNewLesson = () => {
    const newLesson = {
      title: "New Lesson",
      content: "Add your lesson content here...",
      duration: 0,
      order: course.lessons.length,
      isFree: false,
      isPublished: true,
    };

    // In a real implementation, you would call an API here
    toast.info(
      "Lesson creation functionality will be implemented with API integration"
    );
  };

  const deleteLesson = (lessonId: string) => {
    if (!confirm("Are you sure you want to delete this lesson?")) {
      return;
    }
    toast.info(
      "Lesson deletion functionality will be implemented with API integration"
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Course Lessons</h2>
          <p className="text-muted-foreground">
            Manage your course lessons and content
          </p>
        </div>
        <Button onClick={addNewLesson} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Lesson
        </Button>
      </div>

      {course.lessons.length > 0 ? (
        <div className="space-y-4">
          {course.lessons.map((lesson, index) => (
            <Card
              key={lesson._id}
              className="hover:shadow-md transition-shadow"
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
                          ? `${lesson.duration} minutes`
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
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 text-destructive"
                      onClick={() => deleteLesson(lesson._id)}
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
                      <span>Video: {lesson.video.duration}m</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <span>Resources: {lesson.resources.length}</span>
                  </div>
                </div>
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
            <Button onClick={addNewLesson} className="flex items-center gap-2">
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
    </div>
  );
}
