// app/dashboard/courses/[id]/edit/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Save, Eye, EyeOff, Upload, Video, FileText, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { coursesAPI } from "@/lib/api";
import { Course } from "@/types";
import { CourseBasicInfoForm } from "@/components/course-basic-info-form";
import { CourseLessonsManager } from "@/components/course-lessons-manager";
import { CourseMediaManager } from "@/components/course-media-manager";

export default function CourseEditPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = params.id as string;

  // Get tab from URL query params, default to "basic"
  const tabFromUrl = searchParams.get("tab") || "basic";
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(tabFromUrl);

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  // Update active tab when URL parameter changes
  useEffect(() => {
    setActiveTab(tabFromUrl);
  }, [tabFromUrl]);

  const fetchCourse = async () => {
    try {
      const response = await coursesAPI.getCourse(courseId);
      setCourse(response.data.data);
    } catch (error) {
      toast.error("Failed to load course");
      router.push("/dashboard/courses");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePublish = async () => {
    if (!course) return;

    try {
      await coursesAPI.togglePublish(courseId);
      setCourse({ ...course, isPublished: !course.isPublished });
      toast.success(`Course ${course.isPublished ? "unpublished" : "published"} successfully`);
    } catch (error) {
      toast.error("Failed to update course status");
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Update URL without page reload
    router.push(`/dashboard/courses/${courseId}/edit?tab=${value}`, { scroll: false });
  };

  if (isLoading) {
    return (
        <div className="container mx-auto p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
    );
  }

  if (!course) {
    return null;
  }

  return (
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push(`/dashboard/courses/${courseId}`)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{course.title}</h1>
              <p className="text-muted-foreground">
                Manage your course content and settings
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
                variant="outline"
                onClick={togglePublish}
                className="flex items-center gap-2"
            >
              {course.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {course.isPublished ? "Unpublish" : "Publish"}
            </Button>
            <Button className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>

        {/* Status Bar */}
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="text-muted-foreground">Status:</span>
                <span className={`ml-2 font-medium ${
                    course.isPublished ? "text-green-600" : "text-yellow-600"
                }`}>
                {course.isPublished ? "Published" : "Draft"}
              </span>
              </div>
              <div>
                <span className="text-muted-foreground">Students:</span>
                <span className="ml-2 font-medium">{course.totalStudents}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Rating:</span>
                <span className="ml-2 font-medium">
                {course.averageRating || "No ratings yet"}
              </span>
              </div>
              <div>
                <span className="text-muted-foreground">Price:</span>
                <span className="ml-2 font-medium">
                {course.price === 0 ? "Free" : `$${course.price}`}
              </span>
              </div>
            </div>

            <Button variant="outline" size="sm" asChild>
              <a href={`/dashboard/courses/${courseId}`} target="_blank" rel="noopener noreferrer">
                View Live Course
              </a>
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="lessons" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              Lessons
            </TabsTrigger>
            <TabsTrigger value="media" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Media
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <CourseBasicInfoForm course={course} onCourseUpdate={setCourse} />
          </TabsContent>

          <TabsContent value="lessons">
            <CourseLessonsManager course={course} onCourseUpdate={setCourse} />
          </TabsContent>

          <TabsContent value="media">
            <CourseMediaManager course={course} onCourseUpdate={setCourse} />
          </TabsContent>

          <TabsContent value="analytics">
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">Analytics Coming Soon</h3>
              <p className="text-muted-foreground">
                Track your course performance, student engagement, and revenue analytics.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
  );
}