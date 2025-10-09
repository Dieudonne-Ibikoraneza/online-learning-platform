"use client";

import { useState, useEffect } from "react";
import { BookOpen, Clock, Star, TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { enrollmentsAPI, coursesAPI } from "@/lib/api";
import { Enrollment, Course } from "@/types";

export function StudentDashboard() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [enrollmentsResponse, coursesResponse] = await Promise.all([
        enrollmentsAPI.getMyEnrollments(),
        coursesAPI.getCourses({ limit: 4, sort: "-averageRating" }),
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
      icon: BookOpen,
      description: "Total courses you are taking",
    },
    {
      title: "Learning Hours",
      value: "12.5",
      icon: Clock,
      description: "Time spent learning this week",
    },
    {
      title: "Average Rating",
      value: "4.8",
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
        {/* Recent Courses */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Continue Learning</CardTitle>
            <CardDescription>
              Pick up where you left off in your courses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {enrollments.slice(0, 3).map((enrollment) => (
                <div
                  key={enrollment._id}
                  className="flex items-center space-x-4"
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
                  <Button size="sm">Continue</Button>
                </div>
              ))}
              {enrollments.length === 0 && (
                <div className="text-center py-8">
                  <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No courses yet</h3>
                  <p className="text-muted-foreground mt-2">
                    Start your learning journey by enrolling in a course.
                  </p>
                  <Button className="mt-4">Browse Courses</Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recommended Courses */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recommended Courses</CardTitle>
            <CardDescription>
              Based on your interests and trending courses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendedCourses.map((course) => (
                <div key={course._id} className="flex items-center space-x-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {course.title}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <span>{course.category}</span>
                      <span>•</span>
                      <span>{course.difficulty}</span>
                      <span>•</span>
                      <div className="flex items-center">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                        <span>{course.averageRating}</span>
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    View
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
