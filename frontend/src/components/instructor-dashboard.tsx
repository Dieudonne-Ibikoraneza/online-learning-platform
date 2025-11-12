"use client";

import { useState, useEffect } from "react";
import {
  Users,
  GalleryVerticalEnd,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { coursesAPI } from "@/lib/api";
import { Course } from "@/types";
import Link from "next/link";

export function InstructorDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInstructorData();
  }, []);

  const fetchInstructorData = async () => {
    try {
      const response = await coursesAPI.getInstructorCourses();
      setCourses(response.data.data || []);
    } catch (error) {
      console.error("Error fetching instructor data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = [
    {
      title: "Total Courses",
      value: courses.length.toString(),
      icon: GalleryVerticalEnd,
      description: "Courses you have created",
    },
    {
      title: "Total Students",
      value: courses
        .reduce((sum, course) => sum + course.totalStudents, 0)
        .toString(),
      icon: Users,
      description: "Students enrolled in your courses",
    },
    {
      title: "Total Revenue",
      value: "$2,540",
      icon: DollarSign,
      description: "Estimated total earnings",
    },
    {
      title: "Average Rating",
      value:
        courses.length > 0
          ? (
              courses.reduce((sum, course) => sum + course.averageRating, 0) /
              courses.length
            ).toFixed(1)
          : "0.0",
      icon: TrendingUp,
      description: "Average course rating",
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
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Your Courses</CardTitle>
              <CardDescription>
                Manage and track your published courses
              </CardDescription>
            </div>
            <Button>
              <Link href="/dashboard/create-course">Create course</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {courses.slice(0, 5).map((course) => (
                <div
                  key={course._id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold">{course.title}</h4>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                      <span>{course.isPublished ? "Published" : "Draft"}</span>
                      <span>•</span>
                      <span>{course.totalStudents} students</span>
                      <span>•</span>
                      <span>Rating: {course.averageRating}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                    <Button size="sm">View</Button>
                  </div>
                </div>
              ))}
              {courses.length === 0 && (
                <div className="text-center py-8">
                  <GalleryVerticalEnd className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No courses yet</h3>
                  <p className="text-muted-foreground mt-2">
                    Create your first course to start teaching.
                  </p>
                  <Button className="mt-4">Create Course</Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your instructor account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button className="w-full justify-start" variant="outline">
                <GalleryVerticalEnd className="mr-2 h-4 w-4" />
                Create New Course
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Users className="mr-2 h-4 w-4" />
                View Students
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <TrendingUp className="mr-2 h-4 w-4" />
                View Analytics
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <DollarSign className="mr-2 h-4 w-4" />
                Earnings Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
