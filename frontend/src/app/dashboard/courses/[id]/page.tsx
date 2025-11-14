// app/dashboard/courses/[id]/page.tsx - Updated with instructor logic
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Star,
  Users,
  Clock,
  Play,
  Heart,
  Share2,
  BookOpen,
  CheckCircle,
  FileText,
  Video,
  Download,
  ArrowLeft,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  coursesAPI,
  enrollmentsAPI,
  ratingsAPI,
  favoritesAPI,
} from "@/lib/api";
import { Course, Rating } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function CourseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Check if current user is the instructor of this course
  const isCourseInstructor = user && course && course.instructor._id === user._id;

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
    }
  }, [courseId, user]);

  const fetchCourseData = async () => {
    try {
      const [courseResponse, ratingsResponse] = await Promise.all([
        coursesAPI.getCourse(courseId),
        ratingsAPI.getRatings(courseId),
      ]);

      setCourse(courseResponse.data.data);
      setRatings(ratingsResponse.data.data || []);

      // Check enrollment status if user is logged in and not the instructor
      if (user && courseResponse.data.data.instructor._id !== user._id) {
        const enrollmentResponse = await enrollmentsAPI.getEnrollmentStatus(
            courseId
        );
        setIsEnrolled(enrollmentResponse.data.data.isEnrolled);

        const favoriteResponse = await favoritesAPI.getFavoriteStatus(courseId);
        setIsFavorite(favoriteResponse.data.data.isFavorite);
      }
    } catch (error) {
      console.error("Error fetching course data:", error);
      toast.error("Failed to load course details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    try {
      await enrollmentsAPI.enroll(courseId);
      setIsEnrolled(true);
      toast.success("Successfully enrolled in the course!");
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
          err.response?.data?.message || "Failed to enroll in course"
      );
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    try {
      await favoritesAPI.toggleFavorite(courseId);
      setIsFavorite(!isFavorite);
      toast.success(
          isFavorite ? "Removed from favorites" : "Added to favorites"
      );
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
          err.response?.data?.message || "Failed to update favorites"
      );
    }
  };

  const startLearning = () => {
    if (isEnrolled) {
      router.push(`/learn/${courseId}`);
    } else {
      handleEnroll();
    }
  };

  const handleEditCourse = () => {
    router.push(`/dashboard/courses/${courseId}/edit`);
  };

  const handleManageLessons = () => {
    router.push(`/dashboard/courses/${courseId}/edit?tab=lessons`);
  };

  if (isLoading) {
    return (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="h-8 bg-muted rounded w-3/4"></div>
          </div>
          <div className="animate-pulse space-y-6">
            <div className="aspect-video bg-muted rounded"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </div>
              <div className="space-y-4">
                <div className="h-32 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </div>
    );
  }

  if (!course) {
    return (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Course Not Found</h1>
              <p className="text-muted-foreground">
                The course you&apos;re looking for doesn&apos;t exist or has been removed.
              </p>
            </div>
          </div>
          <Button onClick={() => router.push("/dashboard/courses")}>
            Browse All Courses
          </Button>
        </div>
    );
  }

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Course Details</h1>
            <p className="text-muted-foreground">
              {isCourseInstructor ? "Manage your course" : "View course information"}
            </p>
          </div>
        </div>

        {/* Course Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Thumbnail */}
            {course.thumbnail?.url && (
                <div className="aspect-video rounded-lg overflow-hidden">
                  <img
                      src={course.thumbnail.url}
                      alt={course.title}
                      className="w-full h-full object-cover"
                  />
                </div>
            )}

            {/* Course Title and Basic Info */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">
                    {course.category}
                  </Badge>
                  {isCourseInstructor && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        Your Course
                      </Badge>
                  )}
                  <Badge variant={course.isPublished ? "default" : "secondary"}>
                    {course.isPublished ? "Published" : "Draft"}
                  </Badge>
                </div>
                <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
                <p className="text-lg text-muted-foreground">
                  {course.description}
                </p>
              </div>

              {/* Course Stats */}
              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{course.averageRating || "No ratings"}</span>
                  <span className="text-muted-foreground">
                  ({course.totalRatings || 0} ratings)
                </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{course.totalStudents} students</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{course.totalDuration} minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>{course.totalLessons} lessons</span>
                </div>
              </div>

              {/* Instructor Info */}
              <div className="flex items-center gap-4 p-4 border rounded-lg">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={course.instructor.avatar?.url} />
                  <AvatarFallback>
                    {course.instructor.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">
                    Created by {course.instructor.name}
                  </p>
                  <p className="text-sm text-muted-foreground">Instructor</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="space-y-6"
            >
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="instructor">Instructor</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* What You'll Learn */}
                {course.learningOutcomes &&
                    course.learningOutcomes.length > 0 && (
                        <div className="space-y-4">
                          <h3 className="text-xl font-semibold">What you&apos;ll learn</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {course.learningOutcomes.map((outcome, index) => (
                                <div key={index} className="flex items-center gap-2">
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                  <span className="text-sm">{outcome}</span>
                                </div>
                            ))}
                          </div>
                        </div>
                    )}

                {/* Requirements */}
                {course.requirements && course.requirements.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">Requirements</h3>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {course.requirements.map((requirement, index) => (
                            <li key={index}>{requirement}</li>
                        ))}
                      </ul>
                    </div>
                )}

                {/* Description */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Description</h3>
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-line">{course.description}</p>
                  </div>
                </div>
              </TabsContent>

              {/* Curriculum Tab */}
              <TabsContent value="curriculum" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold">
                    Course Content • {course.totalLessons} lessons •{" "}
                    {course.totalDuration} minutes
                  </h3>
                  {isCourseInstructor && (
                      <Button size="sm" onClick={handleManageLessons}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Lessons
                      </Button>
                  )}
                </div>

                {course.lessons && course.lessons.length > 0 ? (
                    <div className="border rounded-lg divide-y">
                      {course.lessons
                          .sort((a, b) => a.order - b.order)
                          .map((lesson, index) => (
                              <div
                                  key={lesson._id}
                                  className="p-4 hover:bg-muted/50 transition-colors"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                                      {index + 1}
                                    </div>
                                    <div>
                                      <h4 className="font-medium">{lesson.title}</h4>
                                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        {lesson.duration > 0 && (
                                            <>
                                              <Clock className="h-3 w-3" />
                                              <span>{lesson.duration} minutes</span>
                                            </>
                                        )}
                                        {lesson.isFree && (
                                            <Badge variant="outline" className="text-xs">
                                              Free
                                            </Badge>
                                        )}
                                        {!lesson.isPublished && (
                                            <Badge variant="secondary" className="text-xs">
                                              Draft
                                            </Badge>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  {isEnrolled ? (
                                      <Button variant="ghost" size="sm">
                                        <Play className="h-4 w-4 mr-2" />
                                        Start
                                      </Button>
                                  ) : (
                                      <Badge variant="secondary">Preview</Badge>
                                  )}
                                </div>
                              </div>
                          ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      {isCourseInstructor ? (
                          <div className="space-y-4">
                            <p>No lessons available yet.</p>
                            <Button onClick={handleManageLessons}>
                              <Edit className="h-4 w-4 mr-2" />
                              Add Your First Lesson
                            </Button>
                          </div>
                      ) : (
                          "No lessons available yet."
                      )}
                    </div>
                )}
              </TabsContent>

              {/* Reviews Tab */}
              <TabsContent value="reviews" className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-semibold">Student Reviews</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">
                      {course.averageRating || "0"}
                    </span>
                      <span className="text-muted-foreground">
                      • {course.totalRatings || 0} ratings
                    </span>
                    </div>
                  </div>

                  {isEnrolled && !isCourseInstructor && <Button>Write a Review</Button>}
                </div>

                {ratings.length > 0 ? (
                    <div className="space-y-4">
                      {ratings.map((rating) => (
                          <div key={rating._id} className="border rounded-lg p-6">
                            <div className="flex items-start gap-4">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={rating.user.avatar?.url} />
                                <AvatarFallback>
                                  {rating.user.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-semibold">
                                    {rating.user.name}
                                  </h4>
                                  <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`h-4 w-4 ${
                                                i < rating.rating
                                                    ? "fill-yellow-400 text-yellow-400"
                                                    : "text-gray-300"
                                            }`}
                                        />
                                    ))}
                                  </div>
                                </div>
                                <p className="text-muted-foreground mb-2">
                                  {rating.comment}
                                </p>
                                <div className="text-sm text-muted-foreground">
                                  {new Date(rating.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </div>
                      ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      {isCourseInstructor ? (
                          "No reviews yet for your course."
                      ) : (
                          "No reviews yet. Be the first to review this course!"
                      )}
                    </div>
                )}
              </TabsContent>

              {/* Instructor Tab */}
              <TabsContent value="instructor" className="space-y-6">
                <div className="border rounded-lg p-6">
                  <div className="flex items-start gap-6">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={course.instructor.avatar?.url} />
                      <AvatarFallback className="text-lg">
                        {course.instructor.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">
                        {course.instructor.name}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {course.instructor.bio || "No bio available"}
                      </p>
                      <div className="flex items-center gap-6 text-sm">
                        <div>
                          <div className="font-semibold">Total Students</div>
                          <div className="text-muted-foreground">{course.totalStudents}</div>
                        </div>
                        <div>
                          <div className="font-semibold">Courses</div>
                          <div className="text-muted-foreground">1</div>
                        </div>
                        <div>
                          <div className="font-semibold">Reviews</div>
                          <div className="text-muted-foreground">{course.averageRating || "N/A"}/5</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar - Action Card */}
          <div className="space-y-4">
            <div className="border rounded-lg bg-background p-6 shadow-sm sticky top-6">
              {/* Price */}
              <div className="text-3xl font-bold mb-4">
                {course.price === 0 ? "Free" : `$${course.price}`}
              </div>

              {/* Action Buttons - Different for instructors vs students */}
              <div className="space-y-3">
                {isCourseInstructor ? (
                    // Instructor Actions
                    <>
                      <Button
                          className="w-full"
                          size="lg"
                          onClick={handleEditCourse}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Course
                      </Button>
                      <Button
                          variant="outline"
                          className="w-full"
                          onClick={handleManageLessons}
                      >
                        Manage Lessons
                      </Button>
                    </>
                ) : (
                    // Student Actions
                    <>
                      <Button className="w-full" size="lg" onClick={startLearning}>
                        <Play className="h-4 w-4 mr-2" />
                        {isEnrolled ? "Continue Learning" : "Enroll Now"}
                      </Button>

                      <div className="flex gap-2">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={toggleFavorite}
                        >
                          <Heart
                              className={`h-4 w-4 mr-2 ${
                                  isFavorite ? "fill-red-500 text-red-500" : ""
                              }`}
                          />
                          {isFavorite ? "Favorited" : "Favorite"}
                        </Button>
                        <Button variant="outline" size="icon">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                )}
              </div>

              {/* Course Features */}
              <div className="mt-6 space-y-3 text-sm">
                <h4 className="font-semibold mb-2">This course includes:</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Video className="h-4 w-4 text-blue-500" />
                    <span>{course.totalDuration} minutes of video content</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-green-500" />
                    <span>{course.totalLessons} lessons</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Download className="h-4 w-4 text-purple-500" />
                    <span>Downloadable resources</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span>Lifetime access</span>
                  </div>
                </div>
              </div>

              {/* Guarantee - Only show for students */}
              {!isCourseInstructor && (
                  <div className="text-xs text-muted-foreground text-center mt-4">
                    30-day money-back guarantee
                  </div>
              )}
            </div>

            {/* Instructor Quick Stats */}
            {isCourseInstructor && (
                <div className="border rounded-lg bg-blue-50 p-4">
                  <h4 className="font-semibold mb-3 text-blue-900">Your Course Stats</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-700">Students:</span>
                      <span className="font-semibold">{course.totalStudents}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Rating:</span>
                      <span className="font-semibold">{course.averageRating || "N/A"}/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Reviews:</span>
                      <span className="font-semibold">{course.totalRatings || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Status:</span>
                      <Badge variant={course.isPublished ? "default" : "secondary"}>
                        {course.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </div>
                  </div>
                </div>
            )}
          </div>
        </div>
      </div>
  );
}