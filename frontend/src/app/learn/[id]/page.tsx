// app/learn/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Play,
  Pause,
  CheckCircle,
  Circle,
  BookOpen,
  Clock,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { coursesAPI, enrollmentsAPI } from "@/lib/api";
import { Course, Lesson } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function LearnPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(
    new Set()
  );
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);

  useEffect(() => {
    if (courseId && user) {
      fetchCourseData();
    }
  }, [courseId, user]);

  const fetchCourseData = async () => {
    try {
      const [courseResponse, enrollmentResponse] = await Promise.all([
        coursesAPI.getCourse(courseId),
        enrollmentsAPI.getEnrollmentStatus(courseId),
      ]);

      const courseData = courseResponse.data.data;
      const enrollmentData = enrollmentResponse.data.data;

      setCourse(courseData);
      setEnrollment(enrollmentData.enrollment);

      if (enrollmentData.enrollment) {
        const completedSet = new Set(
          enrollmentData.enrollment.completedLessons.map((lesson: any) =>
            lesson.lessonId.toString()
          )
        );
        setCompletedLessons(completedSet);

        // Set current lesson - either first incomplete lesson or first lesson
        const sortedLessons = [...courseData.lessons].sort(
          (a, b) => a.order - b.order
        );
        const firstIncomplete = sortedLessons.find(
          (lesson) => !completedSet.has(lesson._id)
        );
        setCurrentLesson(firstIncomplete || sortedLessons[0] || null);
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
      // In a real implementation, you would call an API to mark lesson as complete
      // For now, we'll simulate it locally
      const newCompletedLessons = new Set(completedLessons);
      newCompletedLessons.add(lessonId);
      setCompletedLessons(newCompletedLessons);

      // Update progress
      const totalLessons = course?.lessons.length || 1;
      const progress = Math.round(
        (newCompletedLessons.size / totalLessons) * 100
      );

      toast.success("Lesson marked as complete!");

      // Auto-advance to next lesson if available
      if (course) {
        const sortedLessons = [...course.lessons].sort(
          (a, b) => a.order - b.order
        );
        const currentIndex = sortedLessons.findIndex(
          (lesson) => lesson._id === lessonId
        );
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

  const getNextLesson = () => {
    if (!course || !currentLesson) return null;
    const sortedLessons = [...course.lessons].sort((a, b) => a.order - b.order);
    const currentIndex = sortedLessons.findIndex(
      (lesson) => lesson._id === currentLesson._id
    );
    return currentIndex < sortedLessons.length - 1
      ? sortedLessons[currentIndex + 1]
      : null;
  };

  const getPreviousLesson = () => {
    if (!course || !currentLesson) return null;
    const sortedLessons = [...course.lessons].sort((a, b) => a.order - b.order);
    const currentIndex = sortedLessons.findIndex(
      (lesson) => lesson._id === currentLesson._id
    );
    return currentIndex > 0 ? sortedLessons[currentIndex - 1] : null;
  };

  const goToNextLesson = () => {
    const nextLesson = getNextLesson();
    if (nextLesson) {
      setCurrentLesson(nextLesson);
    }
  };

  const goToPreviousLesson = () => {
    const previousLesson = getPreviousLesson();
    if (previousLesson) {
      setCurrentLesson(previousLesson);
    }
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

  if (!course || !enrollment) {
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
  const progress = Math.round(
    (completedLessons.size / sortedLessons.length) * 100
  );
  const nextLesson = getNextLesson();
  const previousLesson = getPreviousLesson();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/dashboard")}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-semibold">{course.title}</h1>
              <p className="text-sm text-muted-foreground">
                by {course.instructor.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Progress */}
            <div className="hidden md:flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Progress</span>
              <Progress value={progress} className="w-24 h-2" />
              <span className="text-sm font-medium">{progress}%</span>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
          fixed lg:static inset-y-0 left-0 z-50 w-80 bg-background border-r transform transition-transform duration-300 ease-in-out lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        >
          <div className="flex flex-col h-full">
            {/* Course Info */}
            <div className="p-4 border-b">
              <h2 className="font-semibold mb-2">Course Content</h2>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {completedLessons.size} of {sortedLessons.length} lessons
                </span>
                <span>{progress}% complete</span>
              </div>
            </div>

            {/* Lessons List */}
            <div className="flex-1 overflow-y-auto">
              <nav className="p-4">
                <ul className="space-y-1">
                  {sortedLessons.map((lesson) => (
                    <li key={lesson._id}>
                      <button
                        onClick={() => navigateToLesson(lesson)}
                        className={`
                          w-full text-left p-3 rounded-lg transition-colors flex items-center gap-3
                          ${
                            currentLesson?._id === lesson._id
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-muted"
                          }
                        `}
                      >
                        {getLessonStatusIcon(lesson)}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {lesson.title}
                          </div>
                          <div className="flex items-center gap-2 text-xs opacity-75">
                            <Clock className="h-3 w-3" />
                            <span>{lesson.duration || 0} min</span>
                            {lesson.isFree && (
                              <Badge variant="secondary" className="text-xs">
                                Free
                              </Badge>
                            )}
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

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {currentLesson ? (
            <div className="p-6 max-w-4xl mx-auto">
              {/* Lesson Header */}
              <div className="mb-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <span>
                    Lesson{" "}
                    {sortedLessons.findIndex(
                      (l) => l._id === currentLesson._id
                    ) + 1}{" "}
                    of {sortedLessons.length}
                  </span>
                  <span>•</span>
                  <span>{currentLesson.duration || 0} minutes</span>
                  {currentLesson.isFree && (
                    <>
                      <span>•</span>
                      <Badge variant="secondary">Free Preview</Badge>
                    </>
                  )}
                </div>
                <h1 className="text-3xl font-bold mb-4">
                  {currentLesson.title}
                </h1>
              </div>

              {/* Video Player */}
              {currentLesson.video?.url && (
                <div className="mb-8">
                  <div className="aspect-video bg-black rounded-lg relative">
                    {/* Placeholder for video player */}
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-white text-lg mb-4">
                          Video Player
                        </div>
                        <Button
                          size="lg"
                          onClick={() => setVideoPlaying(!videoPlaying)}
                          className="flex items-center gap-2"
                        >
                          {videoPlaying ? (
                            <Pause className="h-5 w-5" />
                          ) : (
                            <Play className="h-5 w-5" />
                          )}
                          {videoPlaying ? "Pause" : "Play"} Video
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Lesson Content */}
              <div className="prose max-w-none mb-8">
                <div className="whitespace-pre-line text-lg leading-relaxed">
                  {currentLesson.content}
                </div>
              </div>

              {/* Resources */}
              {currentLesson.resources &&
                currentLesson.resources.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold mb-4">
                      Lesson Resources
                    </h3>
                    <div className="grid gap-3">
                      {currentLesson.resources.map((resource, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <BookOpen className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{resource.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {resource.type.toUpperCase()} •{" "}
                                {resource.size
                                  ? `${(resource.size / 1024 / 1024).toFixed(
                                      1
                                    )} MB`
                                  : "N/A"}
                              </div>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Lesson Navigation */}
              <div className="flex justify-between items-center pt-8 border-t">
                <Button
                  variant="outline"
                  onClick={goToPreviousLesson}
                  disabled={!previousLesson}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous Lesson
                </Button>

                <div className="flex items-center gap-3">
                  {!completedLessons.has(currentLesson._id) ? (
                    <Button
                      onClick={() => markLessonComplete(currentLesson._id)}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Mark Complete
                    </Button>
                  ) : (
                    <Badge variant="secondary" className="text-sm">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                  )}

                  {nextLesson && (
                    <Button
                      onClick={goToNextLesson}
                      className="flex items-center gap-2"
                    >
                      Next Lesson
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No Lessons Available
                </h3>
                <p className="text-muted-foreground">
                  This course doesn't have any lessons yet.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
