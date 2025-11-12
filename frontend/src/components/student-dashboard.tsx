// components/student-dashboard.tsx - Update to show Browse Courses
"use client";

import { useState, useEffect } from "react";
import { GalleryVerticalEnd, Clock, Star, TrendingUp, Search } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { enrollmentsAPI, coursesAPI } from "@/lib/api";
import { Enrollment, Course } from "@/types";
import Link from "next/link";

export function StudentDashboard() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [enrollmentsResponse, coursesResponse] = await Promise.all([
        enrollmentsAPI.getMyEnrollments(),
        coursesAPI.getCourses({ limit: 6, sort: "-averageRating" }),
      ]);

      setEnrollments(enrollmentsResponse.data.data || []);
      setRecommendedCourses(coursesResponse.data.data || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = [
    {
      title: "Courses Enrolled",
      value: enrollments.length.toString(),
      icon: GalleryVerticalEnd,
      description: "Total courses you are taking",
    },
    {
      title: "Learning Hours",
      value: "46",
      icon: Clock,
      description: "Time spent learning this week",
    },
    {
      title: "Average Rating",
      value: "5",
      icon: Star,
      description: "Your course ratings",
    },
    {
      title: "Progress",
      value: "65%",
      icon: TrendingUp,
      description: "Overall completion rate",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-8 w-8 bg-muted rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Continue Learning Section */}
        <Card className="col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Continue Learning</CardTitle>
              <CardDescription>
                Pick up where you left off in your courses
              </CardDescription>
            </div>
            <Button asChild variant="outline">
              <Link href="/dashboard/enrolled">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {enrollments.slice(0, 3).map((enrollment) => (
                <div
                  key={enrollment._id}
                  className="flex items-center space-x-4 p-4 border rounded-lg"
                >
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {enrollment.course.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {enrollment.course.instructor.name}
                    </p>
                    <Progress value={enrollment.progress} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {enrollment.progress}% complete
                    </p>
                  </div>
                  <Button size="sm" asChild>
                    <Link href={`/learn/${enrollment.course._id}`}>
                      Continue
                    </Link>
                  </Button>
                </div>
              ))}
              {enrollments.length === 0 && (
                <div className="text-center py-8">
                  <GalleryVerticalEnd className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No courses yet</h3>
                  <p className="text-muted-foreground mt-2">
                    Start your learning journey by enrolling in courses.
                  </p>
                  <Button asChild className="mt-4">
                    <Link href="/dashboard/courses">Browse Courses</Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions & Browse Courses */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Access learning resources quickly</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full justify-start">
              <Link href="/dashboard/courses" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Browse Courses
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/dashboard/enrolled" className="flex items-center gap-2">
                <GalleryVerticalEnd className="h-4 w-4" />
                My Enrolled Courses
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/dashboard/favorites" className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                My Favorites
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/dashboard/progress" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Learning Progress
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recommended Courses */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended Courses</CardTitle>
          <CardDescription>
            Based on your interests and trending courses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recommendedCourses.map((course) => (
              <Card key={course._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                      {course.thumbnail?.url ? (
                        <img
                          src={course.thumbnail.url}
                          alt={course.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <GalleryVerticalEnd className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-1 line-clamp-2">
                        {course.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mb-2">
                        by {course.instructor.name}
                      </p>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{course.averageRating || "N/A"}</span>
                        </div>
                        <span className="font-semibold">
                          {course.price === 0 ? "Free" : `$${course.price}`}
                        </span>
                      </div>
                    </div>
                    <Button asChild size="sm" className="w-full">
                      <Link href={`/dashboard/courses/${course._id}`}>
                        View Course
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}