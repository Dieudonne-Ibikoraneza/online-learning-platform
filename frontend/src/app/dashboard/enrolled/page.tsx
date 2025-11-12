// app/dashboard/enrolled/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Play, Clock, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { enrollmentsAPI } from "@/lib/api";
import { Enrollment } from "@/types";
import Link from "next/link";

export default function EnrolledCoursesPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const response = await enrollmentsAPI.getMyEnrollments();
      setEnrollments(response.data.data || []);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">My Courses</h2>
          <p className="text-muted-foreground">Courses you are currently enrolled in</p>
        </div>
        <div className="grid gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="w-32 h-20 bg-muted rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                    <div className="h-2 bg-muted rounded"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">My Courses</h2>
        <p className="text-muted-foreground">Courses you are currently enrolled in</p>
      </div>

      {enrollments.length > 0 ? (
        <div className="space-y-4">
          {enrollments.map((enrollment) => (
            <Card key={enrollment._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Thumbnail */}
                  <div className="w-full md:w-48 h-32 flex-shrink-0">
                    {enrollment.course.thumbnail?.url ? (
                      <img
                        src={enrollment.course.thumbnail.url}
                        alt={enrollment.course.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
                        <BookOpen className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Course Info */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">
                          {enrollment.course.title}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-2">
                          by {enrollment.course.instructor.name}
                        </p>
                      </div>
                      <Button asChild>
                        <Link href={`/learn/${enrollment.course._id}`}>
                          <Play className="h-4 w-4 mr-2" />
                          Continue Learning
                        </Link>
                      </Button>
                    </div>

                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{enrollment.progress}% complete</span>
                      </div>
                      <Progress value={enrollment.progress} className="h-2" />
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{enrollment.course.totalDuration} minutes</span>
                      </div>
                      <span>•</span>
                      <span>{enrollment.course.totalLessons} lessons</span>
                      <span>•</span>
                      <span>Last accessed: {new Date(enrollment.lastAccessedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No enrolled courses</h3>
            <p className="text-muted-foreground text-center mb-4">
              You haven&apos;t enrolled in any courses yet. Start your learning journey today!
            </p>
            <Button asChild>
              <Link href="/dashboard/courses">Browse Courses</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}