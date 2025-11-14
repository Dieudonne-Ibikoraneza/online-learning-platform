// app/learn/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Play,
  Pause,
  CheckCircle,
  BookOpen,
  Clock,
  ChevronLeft,
  Menu,
  X,
  File,
  Download, Image
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { coursesAPI, enrollmentsAPI } from "@/lib/api";
import { Course, Lesson } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import VideoPlayer from "@/components/video-player"
import PDFViewer from "@/components/pdf-viewer"

// Add interfaces for missing types
interface CompletedLesson {
  lessonId?: string;
  _id?: string;
  id?: string;
}

interface Enrollment {
  _id: string;
  completedLessons?: (string | CompletedLesson)[];
}

interface Resource {
  _id: string;
  name: string;
  type: string;
  url: string;
  size?: number;
  duration?: number;
}

export default function LearnPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Helper function to format duration
  const formatDuration = (seconds?: number) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (courseId && user) {
      fetchCourseData();
    }
  }, [courseId, user]);

  const fetchCourseData = async () => {
    try {
      setIsLoading(true);
      const [courseResponse, enrollmentResponse] = await Promise.all([
        coursesAPI.getCourse(courseId),
        enrollmentsAPI.getEnrollmentStatus(courseId),
      ]);

      const courseData = courseResponse.data?.data;
      const enrollmentData = enrollmentResponse.data?.data;

      if (!courseData) {
        throw new Error("Course not found");
      }

      setCourse(courseData);
      setEnrollment(enrollmentData?.enrollment || null);

      if (enrollmentData?.enrollment) {
        // Update the mapping function
        // Update the mapping function:
        const completedSet = new Set(
            (enrollmentData.enrollment.completedLessons || []).map((item: string | CompletedLesson) => {
              // Handle different possible structures with proper type checking
              if (typeof item === 'string') {
                return item;
              }
              if (item && typeof item === 'object') {
                return (item.lessonId || item._id || item.id || '').toString();
              }
              return ''; // Return empty string for unexpected types
            }).filter((id): id is string => !!id) // Remove empty strings
        );
        setCompletedLessons(completedSet);

        const sortedLessons = [...courseData.lessons].sort((a, b) => a.order - b.order);
        const firstIncomplete = sortedLessons.find(
            (lesson) => !completedSet.has(lesson._id)
        );
        setCurrentLesson(firstIncomplete || sortedLessons[0] || null);
      } else {
        const sortedLessons = [...courseData.lessons].sort((a, b) => a.order - b.order);
        setCurrentLesson(sortedLessons[0] || null);
      }
    } catch (error) {
      console.error("Error fetching course data:", error);
      toast.error("Failed to load course content");
    } finally {
      setIsLoading(false);
    }
  };

  const markLessonComplete = async (lessonId: string) => {
    if (!enrollment) return;

    try {
      const newCompletedLessons = new Set(completedLessons);
      newCompletedLessons.add(lessonId);
      setCompletedLessons(newCompletedLessons);

      toast.success("Lesson marked as complete!");

      if (course) {
        const sortedLessons = [...course.lessons].sort((a, b) => a.order - b.order);
        const currentIndex = sortedLessons.findIndex((lesson) => lesson._id === lessonId);
        if (currentIndex < sortedLessons.length - 1) {
          setCurrentLesson(sortedLessons[currentIndex + 1]);
        }
      }
    } catch (error) {
      toast.error("Failed to mark lesson as complete");
    }
  };

  const navigateToLesson = (lesson: Lesson) => {
    setCurrentLesson(lesson);
    setSidebarOpen(false);
  };

  const getLessonStatusIcon = (lesson: Lesson) => {
    if (completedLessons.has(lesson._id)) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else if (currentLesson?._id === lesson._id) {
      return <Pause className="h-5 w-5 text-blue-500" />;
    } else {
      return <Play className="h-5 w-5 text-gray-400" />;
    }
  };

  const handleDownload = async (resource: Resource) => {
    try {
      toast.info(`Starting download: ${resource.name}`);

      const link = document.createElement("a");
      link.href = resource.url;
      link.download = resource.name || `resource-${resource._id}`;
      link.target = "_blank";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Download started: ${resource.name}`);
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Download failed. Please try again.");
    }
  };

  if (isLoading) {
    return (
        <div className="min-h-screen bg-background">
          <div className="animate-pulse">
            <div className="h-16 bg-muted"></div>
            <div className="flex">
              <div className="w-80 h-screen bg-muted/50"></div>
              <div className="flex-1 p-8 space-y-4">
                <div className="h-8 bg-muted rounded w-3/4"></div>
                <div className="aspect-video bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
    );
  }

  if (!course) {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
            <p className="text-muted-foreground mb-6">
              You need to enroll in this course to access the learning content.
            </p>
            <Button onClick={() => router.push("/dashboard/courses")}>
              Back to Courses
            </Button>
          </div>
        </div>
    );
  }

  const sortedLessons = [...course.lessons].sort((a, b) => a.order - b.order);
  const progress = Math.round((completedLessons.size / sortedLessons.length) * 100);

  return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex-shrink-0">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="font-semibold">{course.title}</h1>
                <p className="text-sm text-muted-foreground">by {course.instructor.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Progress</span>
                <Progress value={progress} className="w-24 h-2" />
                <span className="text-sm font-medium">{progress}%</span>
              </div>

              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-80 bg-background border-r transform transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
            <div className="flex flex-col h-full">
              <div className="p-4 border-b flex-shrink-0">
                <h2 className="font-semibold mb-2">Course Content</h2>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{completedLessons.size} of {sortedLessons.length} lessons</span>
                  <span>{progress}% complete</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                <nav className="p-4">
                  <ul className="space-y-1">
                    {sortedLessons.map((lesson) => (
                        <li key={lesson._id}>
                          <button
                              onClick={() => navigateToLesson(lesson)}
                              className={`w-full text-left p-3 rounded-lg transition-colors flex items-center gap-3 ${
                                  currentLesson?._id === lesson._id
                                      ? "bg-primary text-primary-foreground"
                                      : "hover:bg-muted"
                              }`}
                          >
                            {getLessonStatusIcon(lesson)}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">{lesson.title}</div>
                              <div className="flex items-center gap-2 text-xs opacity-75">
                                <Clock className="h-3 w-3" />
                                <span>{lesson.duration || 0} min</span>
                                {lesson.isFree && <Badge variant="secondary" className="text-xs">Free</Badge>}
                              </div>
                            </div>
                          </button>
                        </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </div>
          </aside>

          {sidebarOpen && (
              <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
          )}

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            {currentLesson ? (
                <div className="p-6 max-w-4xl mx-auto">
                  {/* Lesson Header */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <span>Lesson {sortedLessons.findIndex((l) => l._id === currentLesson._id) + 1} of {sortedLessons.length}</span>
                      <span>•</span>
                      <span>{currentLesson.duration || 0} minutes</span>
                      {currentLesson.isFree && (
                          <>
                            <span>•</span>
                            <Badge variant="secondary">Free Preview</Badge>
                          </>
                      )}
                    </div>
                    <h1 className="text-3xl font-bold mb-4">{currentLesson.title}</h1>
                  </div>

                  {/* Video Player */}
                  {currentLesson.video?.url && (
                      <div className="mb-8">
                        <VideoPlayer
                            src={currentLesson.video.url}
                            duration={formatDuration(currentLesson.video.duration)}
                        />
                      </div>
                  )}

                  {/* Lesson Content */}
                  <div className="prose max-w-none mb-8">
                    <div className="whitespace-pre-line text-lg leading-relaxed">
                      {currentLesson.content}
                    </div>
                  </div>

                  {/* Resources */}
                  {currentLesson.resources && currentLesson.resources.length > 0 && (
                      <div className="mb-8">
                        <h3 className="text-xl font-semibold mb-4">Lesson Resources</h3>
                        <div className="flex flex-col gap-4">
                          {currentLesson.resources.map((resource, index) => (
                              <div key={resource._id || index} className="border rounded-lg overflow-hidden">
                                {/* Resource Info */}
                                <div className="flex p-4 items-center justify-between">
                                  <div className="flex items-start gap-3">
                                    {resource.type === 'pdf' ? (
                                        <File className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                                    ) : resource.type === 'video' ? (
                                        <Play className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                    ) : resource.type === 'image' ? (
                                        <Image className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                    ) : (
                                        <BookOpen className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium text-sm truncate">{resource.name}</div>
                                      <div className="text-xs text-muted-foreground mt-1">
                                        {resource.type.toUpperCase()} •{" "}
                                        {resource.size ? `${(resource.size / 1024 / 1024).toFixed(1)} MB` : "N/A"}
                                      </div>
                                    </div>
                                  </div>

                                  <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDownload(resource as Resource)}
                                      className="flex items-center justify-center gap-2"
                                  >
                                    <Download className="h-4 w-4" />
                                    Download
                                  </Button>
                                </div>

                                {/* Resource Preview based on type */}
                                {resource.type === 'pdf' && (
                                    <div className="border-t">
                                      <PDFViewer
                                          src={resource.url}
                                          fileName={resource.name}
                                      />
                                    </div>
                                )}

                                {resource.type === 'image' && (
                                    <div className="border-t">
                                      <div className="p-4">
                                        <h4 className="font-medium mb-3">Image Preview</h4>
                                        <div className="flex justify-center">
                                          <img
                                              src={resource.url}
                                              alt={resource.name}
                                              className="max-w-full h-auto max-h-96 object-contain rounded-lg shadow-sm border"
                                              loading="lazy"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                )}

                                {resource.type === 'video' && (
                                    <div className="border-t">
                                      <div className="p-4">
                                        <h4 className="font-medium mb-3">Video Preview</h4>
                                        <VideoPlayer
                                            src={resource.url}
                                            duration={formatDuration(resource.duration)}
                                        />
                                      </div>
                                    </div>
                                )}

                                {/* For other file types, you can add more previews as needed */}
                                {!['pdf', 'image', 'video'].includes(resource.type) && (
                                    <div className="border-t">
                                      <div className="p-4">
                                        <h4 className="font-medium mb-3">File Preview</h4>
                                        <div className="text-center py-8 text-muted-foreground">
                                          <File className="h-12 w-12 mx-auto mb-2" />
                                          <p>Preview not available for {resource.type} files</p>
                                          <p className="text-sm">Download the file to view its contents</p>
                                        </div>
                                      </div>
                                    </div>
                                )}
                              </div>
                          ))}
                        </div>
                      </div>
                  )}

                  {/* Lesson Navigation */}
                  <div className="flex justify-between items-center pt-8 border-t">
                    <div className="flex items-center gap-3">
                      {!completedLessons.has(currentLesson._id) ? (
                          <Button onClick={() => markLessonComplete(currentLesson._id)} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Mark Complete
                          </Button>
                      ) : (
                          <Badge variant="secondary" className="text-sm">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Completed
                          </Badge>
                      )}
                    </div>
                  </div>
                </div>
            ) : (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Lessons Available</h3>
                    <p className="text-muted-foreground">This course doesn&apos;t have any lessons yet.</p>
                  </div>
                </div>
            )}
          </main>
        </div>
      </div>
  );
}