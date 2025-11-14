// app/dashboard/favorites/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Heart, Trash2, Play, BookOpen, Clock, Star } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { favoritesAPI, enrollmentsAPI } from "@/lib/api";
import { Course } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import Link from "next/link";

interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

interface EnrollmentResponse {
  course: {
    _id: string;
  };
}

export default function FavoritesPage() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState<Set<string>>(
      new Set()
  );

  useEffect(() => {
    if (user) {
      fetchFavorites();
      fetchEnrollments();
    }
  }, [user]);

  const fetchFavorites = async () => {
    try {
      const response = await favoritesAPI.getFavorites();
      setFavorites(response.data.data || []);
    } catch (error) {
      toast.error("Failed to load favorites");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEnrollments = async () => {
    try {
      const response = await enrollmentsAPI.getMyEnrollments();
      const enrolledIds = new Set(
          response.data.data.map(
              (enrollment: EnrollmentResponse) => enrollment.course._id
          )
      );
      setEnrolledCourses(enrolledIds);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
    }
  };

  const removeFavorite = async (courseId: string) => {
    try {
      await favoritesAPI.removeFavorite(courseId);
      setFavorites(favorites.filter((course) => course._id !== courseId));
      toast.success("Course removed from favorites");
    } catch (error) {
      const apiError = error as ApiErrorResponse;
      toast.error(
          apiError.response?.data?.message || "Failed to remove from favorites"
      );
    }
  };

  const clearAllFavorites = async () => {
    if (favorites.length === 0) return;

    if (
        !confirm("Are you sure you want to remove all courses from favorites?")
    ) {
      return;
    }

    try {
      await favoritesAPI.clearFavorites();
      setFavorites([]);
      toast.success("All favorites cleared");
    } catch (error) {
      const apiError = error as ApiErrorResponse;
      toast.error(
          apiError.response?.data?.message || "Failed to clear favorites"
      );
    }
  };

  const handleEnroll = async (courseId: string) => {
    try {
      await enrollmentsAPI.enroll(courseId);
      setEnrolledCourses((prev) => new Set([...prev, courseId]));
      toast.success("Successfully enrolled in the course!");
    } catch (error) {
      const apiError = error as ApiErrorResponse;
      toast.error(
          apiError.response?.data?.message || "Failed to enroll in course"
      );
    }
  };

  if (isLoading) {
    return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold">My Favorites</h2>
            <p className="text-muted-foreground">
              Courses you&apos;ve saved for later
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="aspect-video bg-muted rounded-t-lg"></div>
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Heart className="h-6 w-6 text-red-500" />
              My Favorites
            </h2>
            <p className="text-muted-foreground">
              Courses you&apos;ve saved for later ({favorites.length})
            </p>
          </div>

          {favorites.length > 0 && (
              <Button
                  variant="outline"
                  onClick={clearAllFavorites}
                  className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
          )}
        </div>

        {/* Favorites Grid */}
        {favorites.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {favorites.map((course) => {
                const isEnrolled = enrolledCourses.has(course._id);

                return (
                    <Card
                        key={course._id}
                        className="group hover:shadow-lg transition-shadow overflow-hidden"
                    >
                      {/* Thumbnail */}
                      <div className="aspect-video relative overflow-hidden">
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

                        {/* Favorite Button */}
                        <Button
                            variant="secondary"
                            size="icon"
                            className="absolute top-3 right-3 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
                            onClick={() => removeFavorite(course._id)}
                        >
                          <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                        </Button>

                        {/* Price Badge */}
                        <div className="absolute top-3 left-3">
                          <Badge
                              variant={course.price === 0 ? "secondary" : "default"}
                              className={
                                course.price === 0
                                    ? "bg-green-100 text-green-800"
                                    : "bg-blue-100 text-blue-800"
                              }
                          >
                            {course.price === 0 ? "Free" : `$${course.price}`}
                          </Badge>
                        </div>
                      </div>

                      <CardContent className="p-4">
                        {/* Course Title */}
                        <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                          {course.title}
                        </h3>

                        {/* Instructor */}
                        <p className="text-sm text-muted-foreground mb-3">
                          by {course.instructor.name}
                        </p>

                        {/* Course Stats */}
                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{course.totalDuration}m</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            <span>{course.totalLessons} lessons</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span>{course.averageRating || "N/A"}</span>
                          </div>
                        </div>

                        {/* Category */}
                        <div className="mb-3">
                          <Badge variant="outline" className="text-xs">
                            {course.category}
                          </Badge>
                        </div>
                      </CardContent>

                      <CardFooter className="p-4 pt-0">
                        {isEnrolled ? (
                            <Button asChild className="w-full">
                              <Link href={`/dashboard/courses/${course._id}`}>
                                <Play className="h-4 w-4 mr-2" />
                                Continue Learning
                              </Link>
                            </Button>
                        ) : (
                            <Button
                                className="w-full"
                                onClick={() => handleEnroll(course._id)}
                            >
                              Enroll Now
                            </Button>
                        )}
                      </CardFooter>
                    </Card>
                );
              })}
            </div>
        ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Heart className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No favorites yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Start building your learning wishlist by saving courses
                  you&apos;re interested in.
                </p>
                <Button asChild>
                  <Link href="/courses">Browse Courses</Link>
                </Button>
              </CardContent>
            </Card>
        )}

        {/* Quick Stats */}
        {favorites.length > 0 && (
            <div className="bg-muted/50 rounded-lg p-6">
              <h4 className="font-semibold mb-4">Favorites Summary</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Total Courses</div>
                  <div className="font-semibold text-lg">{favorites.length}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Free Courses</div>
                  <div className="font-semibold text-lg">
                    {favorites.filter((course) => course.price === 0).length}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Paid Courses</div>
                  <div className="font-semibold text-lg">
                    {favorites.filter((course) => course.price > 0).length}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Already Enrolled</div>
                  <div className="font-semibold text-lg">
                    {
                      favorites.filter((course) => enrolledCourses.has(course._id))
                          .length
                    }
                  </div>
                </div>
              </div>
            </div>
        )}
      </div>
  );
}