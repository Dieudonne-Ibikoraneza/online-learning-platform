// app/dashboard/courses/page.tsx - Updated with enhanced filters
"use client";

import { useState, useEffect } from "react";
import { Grid3X3, List } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { coursesAPI } from "@/lib/api";
import { Course } from "@/types";
import Link from "next/link";
import { CourseFilters } from "@/components/course-filters";

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [rating, setRating] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    fetchCourses();
  }, [searchTerm, category, difficulty, priceRange, rating]);

  const fetchCourses = async () => {
    try {
      // Build query params based on filters
      const params: {
        limit: number;
        sort: string;
        search?: string;
        category?: string;
        difficulty?: string;
        price?: string;
        minPrice?: string;
        maxPrice?: string;
        minRating?: string;
      } = {
        limit: 12,
        sort: "-averageRating",
      };

      if (searchTerm) params.search = searchTerm;
      if (category !== "all") params.category = category;
      if (difficulty !== "all") params.difficulty = difficulty;

      // Handle price range filter
      if (priceRange !== "all") {
        switch (priceRange) {
          case "free":
            params.price = "0";
            break;
          case "paid":
            params.minPrice = "0.01";
            break;
          case "under-50":
            params.maxPrice = "49.99";
            break;
          case "50-100":
            params.minPrice = "50";
            params.maxPrice = "100";
            break;
          case "over-100":
            params.minPrice = "100.01";
            break;
        }
      }

      // Handle rating filter
      if (rating !== "all") {
        params.minRating = rating;
      }

      const response = await coursesAPI.getCourses(params);
      setCourses(response.data.data || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const CourseCard = ({
    course,
    viewMode,
  }: {
    course: Course;
    viewMode: "grid" | "list";
  }) => {
    if (viewMode === "list") {
      return (
        <Card className="flex flex-row hover:shadow-md transition-shadow">
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
            <div className="flex justify-between items-start h-full">
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
                <p className="text-muted-foreground text-sm mb-2 line-clamp-2">
                  {course.shortDescription || course.description}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>by {course.instructor.name}</span>
                  <span>•</span>
                  <span>{course.totalStudents} students</span>
                  <span>•</span>
                  <span>{course.totalLessons} lessons</span>
                  {course.averageRating > 0 && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <span>⭐ {course.averageRating}</span>
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="text-right min-w-[120px]">
                <div className="text-lg font-bold mb-2">
                  {course.price === 0 ? "Free" : `$${course.price}`}
                </div>
                <Button asChild>
                  <Link href={`/dashboard/courses/${course._id}`}>
                    View Course
                  </Link>
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
            {/* Price Badge */}
            <div className="absolute top-3 right-3">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  course.price === 0
                    ? "bg-green-100 text-green-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {course.price === 0 ? "Free" : `$${course.price}`}
              </span>
            </div>
            {/* Rating Badge */}
            {course.averageRating > 0 && (
              <div className="absolute top-3 left-3">
                <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium flex items-center gap-1">
                  ⭐ {course.averageRating}
                </span>
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
                by {course.instructor.name}
              </span>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span>{course.totalStudents} students</span>
                <span>•</span>
                <span>{course.totalLessons} lessons</span>
              </div>
            </div>
          </CardContent>
        </Link>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Browse Courses</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Discover thousands of courses from expert instructors. Learn new
          skills and advance your career.
        </p>
      </div>

      {/* Enhanced Filters */}
      <Card className="p-6">
        <CourseFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          category={category}
          setCategory={setCategory}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          rating={rating}
          setRating={setRating}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
      </Card>

      {/* View Toggle */}
      <div className="flex justify-end">
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

      {/* Courses Grid/List */}
      {isLoading ? (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }
        >
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
        <>
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            {courses.map((course) => (
              <CourseCard
                key={course._id}
                course={course}
                viewMode={viewMode}
              />
            ))}
          </div>

          {courses.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">No courses found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria or browse all courses.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
