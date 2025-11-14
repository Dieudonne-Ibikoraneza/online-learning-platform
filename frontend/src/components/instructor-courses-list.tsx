// components/instructor-courses-list.tsx - Updated with better error handling
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Edit,
  MoreHorizontal,
  Plus,
  BookOpen,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { coursesAPI } from "@/lib/api";
import { Course } from "@/types";
import { useAuth } from "@/context/AuthContext";

export function InstructorCoursesList() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("Fetching instructor courses...");
      
      const response = await coursesAPI.getInstructorCourses();
      console.log("Instructor courses response:", response);
      
      if (response.data && response.data.success) {
        const instructorCourses = response.data.data || [];
        console.log("Instructor courses:", instructorCourses);
        setCourses(instructorCourses);
      } else {
        throw new Error(response.data?.message || "Failed to fetch courses");
      }
    } catch (error) {
      console.log("Error fetching instructor courses:", error);
      toast.error("Failed to load courses");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePublish = async (courseId: string, currentStatus: boolean) => {
    try {
      await coursesAPI.togglePublish(courseId);
      setCourses(
        courses.map((course) =>
          course._id === courseId
            ? { ...course, isPublished: !currentStatus }
            : course
        )
      );
      toast.success(
        `Course ${currentStatus ? "unpublished" : "published"} successfully`
      );
    } catch (_) {
      toast.error("Failed to update course status");
    }
  };

  const deleteCourse = async (courseId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this course? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await coursesAPI.deleteCourse(courseId);
      setCourses(courses.filter((course) => course._id !== courseId));
      toast.success("Course deleted successfully");
    } catch (_) {
      toast.error("Failed to delete the course");    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">My Courses</h2>
          <p className="text-muted-foreground">
            Manage and track your published courses
          </p>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
        <Button onClick={fetchCourses} className="flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">My Courses</h2>
          <p className="text-muted-foreground">
            Manage and track your published courses
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="p-0">
                <Skeleton className="aspect-video w-full rounded-t-lg" />
              </CardHeader>
              <CardContent className="p-4">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">My Courses</h2>
          <p className="text-muted-foreground">
            Manage and track your published courses ({courses.length} total)
          </p>
        </div>
        <Button asChild>
          <Link
            href="/dashboard/create-course"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Course
          </Link>
        </Button>
      </div>

      {/* Courses Grid */}
      {courses.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card
              key={course._id}
              className="group hover:shadow-lg transition-shadow"
            >
              <CardHeader className="p-0 relative">
                <div className="aspect-video relative overflow-hidden rounded-t-lg">
                  {course.thumbnail?.url ? (
                    <img
                      src={course.thumbnail.url}
                      alt={course.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                      <BookOpen className="h-12 w-12 text-blue-300" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <Badge
                      variant={course.isPublished ? "default" : "secondary"}
                      className={
                        course.isPublished ? "bg-green-100 text-green-800" : ""
                      }
                    >
                      {course.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/dashboard/courses/${course._id}/edit`}
                            className="flex items-center gap-2"
                          >
                            <Edit className="h-4 w-4" />
                            Edit Course
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            togglePublish(course._id, course.isPublished)
                          }
                          className="flex items-center gap-2"
                        >
                          {course.isPublished ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                          {course.isPublished ? "Unpublish" : "Publish"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => deleteCourse(course._id)}
                          className="text-destructive flex items-center gap-2"
                        >
                          Delete Course
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-4">
                <CardTitle className="text-lg mb-2 line-clamp-2">
                  {course.title}
                </CardTitle>
                <CardDescription className="line-clamp-2 mb-4">
                  {course.shortDescription || course.description}
                </CardDescription>

                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <div className="space-y-1">
                    <div>{course.totalStudents} students</div>
                    <div>{course.totalLessons} lessons</div>
                  </div>
                  <div className="space-y-1 text-right">
                    <div>Rating: {course.averageRating || "No ratings"}</div>
                    <div className="font-semibold text-foreground">
                      {course.price === 0 ? "Free" : `$${course.price}`}
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="p-4 pt-0">
                <Button asChild className="w-full">
                  <Link href={`/dashboard/courses/${course._id}/edit`}>
                    Manage Course
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first course to start teaching and sharing your
              knowledge.
            </p>
            <Button asChild>
              <Link
                href="/dashboard/create-course"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Your First Course
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}