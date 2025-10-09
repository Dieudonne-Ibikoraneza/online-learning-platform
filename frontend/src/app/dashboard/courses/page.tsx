// app/courses/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Grid3X3, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { coursesAPI } from "@/lib/api";
import { Course } from "@/types";
import Link from "next/link";

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    fetchCourses();
  }, [searchTerm, category, difficulty]);

  const fetchCourses = async () => {
    try {
      const params = {
        search: searchTerm || undefined,
        category: category || undefined,
        difficulty: difficulty || undefined,
        limit: 12,
      };
      const response = await coursesAPI.getCourses(params);
      setCourses(response.data.data || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Explore Courses</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Discover thousands of courses from expert instructors. Learn new
          skills and advance your career.
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="development">Development</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
              </SelectContent>
            </Select>

            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>

            {/* View Toggle */}
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Courses Grid/List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }
        >
          {courses.map((course) => (
            <CourseCard key={course._id} course={course} viewMode={viewMode} />
          ))}
        </div>
      )}

      {!isLoading && courses.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">No courses found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search criteria or browse all courses.
          </p>
        </div>
      )}
    </div>
  );
}

function CourseCard({
  course,
  viewMode,
}: {
  course: Course;
  viewMode: "grid" | "list";
}) {
  if (viewMode === "list") {
    return (
      <Card className="flex flex-row">
        <div className="w-48 h-32 flex-shrink-0">
          {course.thumbnail?.url ? (
            <img
              src={course.thumbnail.url}
              alt={course.title}
              className="w-full h-full object-cover rounded-l-lg"
            />
          ) : (
            <div className="w-full h-full bg-muted rounded-l-lg flex items-center justify-center">
              <span className="text-muted-foreground">No image</span>
            </div>
          )}
        </div>
        <CardContent className="flex-1 p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
              <p className="text-muted-foreground text-sm mb-2 line-clamp-2">
                {course.shortDescription || course.description}
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{course.instructor.name}</span>
                <span>•</span>
                <span>{course.totalStudents} students</span>
                <span>•</span>
                <span>{course.totalLessons} lessons</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold mb-2">
                {course.price === 0 ? "Free" : `$${course.price}`}
              </div>
              <Button asChild>
                <Link href={`/dashboard/courses/${course._id}`}>View Course</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid view
  return (
    <Card className="group hover:shadow-lg transition-shadow">
      <Link href={`/dashboard/courses/${course._id}`}>
        <div className="aspect-video relative overflow-hidden rounded-t-lg">
          {course.thumbnail?.url ? (
            <img
              src={course.thumbnail.url}
              alt={course.title}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground">No image</span>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">
            {course.title}
          </h3>
          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
            {course.shortDescription || course.description}
          </p>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">
              {course.instructor.name}
            </span>
            <span className="font-bold">
              {course.price === 0 ? "Free" : `$${course.price}`}
            </span>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
