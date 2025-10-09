// app/dashboard/progress/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  Clock,
  Award,
  Target,
  Calendar,
  BookOpen,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { enrollmentsAPI } from "@/lib/api";
import { Enrollment } from "@/types";

export default function ProgressPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      const response = await enrollmentsAPI.getMyEnrollments();
      setEnrollments(response.data.data || []);
    } catch (error) {
      console.error("Error fetching progress data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate overall progress statistics
  const overallStats = {
    totalCourses: enrollments.length,
    completedCourses: enrollments.filter((e) => e.progress === 100).length,
    inProgressCourses: enrollments.filter(
      (e) => e.progress > 0 && e.progress < 100
    ).length,
    totalLearningTime: enrollments.reduce((total, enrollment) => {
      return total + (enrollment.course.totalDuration || 0);
    }, 0),
    averageProgress:
      enrollments.length > 0
        ? Math.round(
            enrollments.reduce((sum, e) => sum + e.progress, 0) /
              enrollments.length
          )
        : 0,
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Learning Progress</h2>
          <p className="text-muted-foreground">
            Track your learning journey and achievements
          </p>
        </div>
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
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="h-6 w-6" />
          Learning Progress
        </h2>
        <p className="text-muted-foreground">
          Track your learning journey and achievements
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Courses
                </CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {overallStats.totalCourses}
                </div>
                <p className="text-xs text-muted-foreground">
                  Enrolled in total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {overallStats.completedCourses}
                </div>
                <p className="text-xs text-muted-foreground">
                  Courses finished
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  In Progress
                </CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {overallStats.inProgressCourses}
                </div>
                <p className="text-xs text-muted-foreground">
                  Currently learning
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Learning Time
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {overallStats.totalLearningTime}m
                </div>
                <p className="text-xs text-muted-foreground">
                  Total course duration
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Overall Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Overall Learning Progress</CardTitle>
              <CardDescription>
                Your progress across all enrolled courses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    Average Completion
                  </span>
                  <span className="text-sm font-bold">
                    {overallStats.averageProgress}%
                  </span>
                </div>
                <Progress
                  value={overallStats.averageProgress}
                  className="h-3"
                />
                <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground">
                  <div>
                    Not Started:{" "}
                    {enrollments.filter((e) => e.progress === 0).length}
                  </div>
                  <div>In Progress: {overallStats.inProgressCourses}</div>
                  <div>Completed: {overallStats.completedCourses}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your recent learning sessions and progress updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              {enrollments.length > 0 ? (
                <div className="space-y-4">
                  {enrollments
                    .sort(
                      (a, b) =>
                        new Date(b.lastAccessedAt).getTime() -
                        new Date(a.lastAccessedAt).getTime()
                    )
                    .slice(0, 5)
                    .map((enrollment) => (
                      <div
                        key={enrollment._id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm">
                            <BookOpen className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-medium text-sm">
                              {enrollment.course.title}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Last accessed:{" "}
                              {new Date(
                                enrollment.lastAccessedAt
                              ).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <Badge
                          variant={
                            enrollment.progress === 100
                              ? "default"
                              : "secondary"
                          }
                        >
                          {enrollment.progress}%
                        </Badge>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4" />
                  <p>No learning activity yet. Start your first course!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Progress</CardTitle>
              <CardDescription>
                Detailed progress for each enrolled course
              </CardDescription>
            </CardHeader>
            <CardContent>
              {enrollments.length > 0 ? (
                <div className="space-y-6">
                  {enrollments.map((enrollment) => (
                    <div key={enrollment._id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg mb-1">
                            {enrollment.course.title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              <span>
                                {enrollment.course.totalLessons} lessons
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>
                                {enrollment.course.totalDuration} minutes
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>
                                Enrolled:{" "}
                                {new Date(
                                  enrollment.enrolledAt
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Badge
                          variant={
                            enrollment.progress === 100
                              ? "default"
                              : enrollment.progress > 0
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {enrollment.progress === 100
                            ? "Completed"
                            : enrollment.progress > 0
                            ? "In Progress"
                            : "Not Started"}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{enrollment.progress}% complete</span>
                        </div>
                        <Progress value={enrollment.progress} className="h-2" />
                      </div>

                      {enrollment.completedLessons.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium mb-2">
                            Completed Lessons
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {enrollment.completedLessons
                              .slice(0, 5)
                              .map((completed, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  Lesson {index + 1}
                                </Badge>
                              ))}
                            {enrollment.completedLessons.length > 5 && (
                              <Badge variant="outline" className="text-xs">
                                +{enrollment.completedLessons.length - 5} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No courses enrolled
                  </h3>
                  <p>Start your learning journey by enrolling in courses.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Learning Achievements</CardTitle>
              <CardDescription>
                Milestones and accomplishments in your learning journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Achievement Cards */}
                <div
                  className={`border rounded-lg p-4 text-center ${
                    overallStats.completedCourses >= 1
                      ? "bg-green-50 border-green-200"
                      : "bg-muted/50"
                  }`}
                >
                  <Award
                    className={`h-8 w-8 mx-auto mb-2 ${
                      overallStats.completedCourses >= 1
                        ? "text-green-600"
                        : "text-muted-foreground"
                    }`}
                  />
                  <h4 className="font-semibold">First Course</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Complete your first course
                  </p>
                  <Badge
                    variant={
                      overallStats.completedCourses >= 1 ? "default" : "outline"
                    }
                  >
                    {overallStats.completedCourses >= 1 ? "Unlocked" : "Locked"}
                  </Badge>
                </div>

                <div
                  className={`border rounded-lg p-4 text-center ${
                    overallStats.totalLearningTime >= 60
                      ? "bg-blue-50 border-blue-200"
                      : "bg-muted/50"
                  }`}
                >
                  <Clock
                    className={`h-8 w-8 mx-auto mb-2 ${
                      overallStats.totalLearningTime >= 60
                        ? "text-blue-600"
                        : "text-muted-foreground"
                    }`}
                  />
                  <h4 className="font-semibold">Dedicated Learner</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Spend 1+ hour learning
                  </p>
                  <Badge
                    variant={
                      overallStats.totalLearningTime >= 60
                        ? "default"
                        : "outline"
                    }
                  >
                    {overallStats.totalLearningTime >= 60
                      ? "Unlocked"
                      : "Locked"}
                  </Badge>
                </div>

                <div
                  className={`border rounded-lg p-4 text-center ${
                    overallStats.completedCourses >= 3
                      ? "bg-purple-50 border-purple-200"
                      : "bg-muted/50"
                  }`}
                >
                  <Target
                    className={`h-8 w-8 mx-auto mb-2 ${
                      overallStats.completedCourses >= 3
                        ? "text-purple-600"
                        : "text-muted-foreground"
                    }`}
                  />
                  <h4 className="font-semibold">Course Collector</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Complete 3+ courses
                  </p>
                  <Badge
                    variant={
                      overallStats.completedCourses >= 3 ? "default" : "outline"
                    }
                  >
                    {overallStats.completedCourses >= 3
                      ? "Unlocked"
                      : `${overallStats.completedCourses}/3`}
                  </Badge>
                </div>

                <div
                  className={`border rounded-lg p-4 text-center ${
                    enrollments.length >= 5
                      ? "bg-orange-50 border-orange-200"
                      : "bg-muted/50"
                  }`}
                >
                  <BookOpen
                    className={`h-8 w-8 mx-auto mb-2 ${
                      enrollments.length >= 5
                        ? "text-orange-600"
                        : "text-muted-foreground"
                    }`}
                  />
                  <h4 className="font-semibold">Avid Learner</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Enroll in 5+ courses
                  </p>
                  <Badge
                    variant={enrollments.length >= 5 ? "default" : "outline"}
                  >
                    {enrollments.length >= 5
                      ? "Unlocked"
                      : `${enrollments.length}/5`}
                  </Badge>
                </div>

                <div
                  className={`border rounded-lg p-4 text-center ${
                    overallStats.averageProgress >= 75
                      ? "bg-yellow-50 border-yellow-200"
                      : "bg-muted/50"
                  }`}
                >
                  <TrendingUp
                    className={`h-8 w-8 mx-auto mb-2 ${
                      overallStats.averageProgress >= 75
                        ? "text-yellow-600"
                        : "text-muted-foreground"
                    }`}
                  />
                  <h4 className="font-semibold">Consistent Progress</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    75%+ average completion
                  </p>
                  <Badge
                    variant={
                      overallStats.averageProgress >= 75 ? "default" : "outline"
                    }
                  >
                    {overallStats.averageProgress >= 75
                      ? "Unlocked"
                      : `${overallStats.averageProgress}%`}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
