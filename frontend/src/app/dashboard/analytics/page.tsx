// app/dashboard/analytics/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  Users,
  DollarSign,
  BookOpen,
  Star,
  Clock,
  Eye,
  Download,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { coursesAPI } from "@/lib/api";
import { Course } from "@/types";

export default function InstructorAnalyticsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");

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

  // Calculate analytics data
  const analytics = {
    totalCourses: courses.length,
    totalStudents: courses.reduce(
      (sum, course) => sum + course.totalStudents,
      0
    ),
    totalRevenue: courses.reduce(
      (sum, course) => sum + course.price * course.totalStudents,
      0
    ),
    averageRating:
      courses.length > 0
        ? courses.reduce((sum, course) => sum + course.averageRating, 0) /
          courses.length
        : 0,
    totalEnrollments: courses.reduce(
      (sum, course) => sum + course.totalEnrollments,
      0
    ),
    publishedCourses: courses.filter((course) => course.isPublished).length,
  };

  // Mock data for charts (in real app, you'd use a charting library)
  const enrollmentData = [
    { month: "Jan", enrollments: 45 },
    { month: "Feb", enrollments: 52 },
    { month: "Mar", enrollments: 48 },
    { month: "Apr", enrollments: 60 },
    { month: "May", enrollments: 75 },
    { month: "Jun", enrollments: 82 },
  ];

  const revenueData = [
    { month: "Jan", revenue: 1200 },
    { month: "Feb", revenue: 1800 },
    { month: "Mar", revenue: 1500 },
    { month: "Apr", revenue: 2200 },
    { month: "May", revenue: 2800 },
    { month: "Jun", revenue: 3200 },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Analytics</h2>
          <p className="text-muted-foreground">
            Track your course performance and student engagement
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6" />
            Analytics
          </h2>
          <p className="text-muted-foreground">
            Track your course performance and student engagement
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${analytics.totalRevenue.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  +12% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Students
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.totalStudents}
                </div>
                <p className="text-xs text-muted-foreground">
                  +8% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Average Rating
                </CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.averageRating.toFixed(1)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all courses
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Published Courses
                </CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.publishedCourses}
                </div>
                <p className="text-xs text-muted-foreground">
                  of {analytics.totalCourses} total
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Enrollment Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Enrollment Trends</CardTitle>
                <CardDescription>
                  Student enrollments over the last 6 months
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {enrollmentData.map((item, index) => (
                    <div
                      key={item.month}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-20 text-sm font-medium">
                          {item.month}
                        </div>
                        <div className="flex-1">
                          <div
                            className="h-2 bg-blue-500 rounded-full"
                            style={{
                              width: `${(item.enrollments / 100) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-sm font-medium">
                        {item.enrollments}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>
                  Monthly revenue from course sales
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {revenueData.map((item, index) => (
                    <div
                      key={item.month}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-20 text-sm font-medium">
                          {item.month}
                        </div>
                        <div className="flex-1">
                          <div
                            className="h-2 bg-green-500 rounded-full"
                            style={{ width: `${(item.revenue / 4000) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-sm font-medium">${item.revenue}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Performing Courses */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Courses</CardTitle>
              <CardDescription>
                Your courses with the highest engagement and revenue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {courses
                  .sort((a, b) => b.totalStudents - a.totalStudents)
                  .slice(0, 5)
                  .map((course) => (
                    <div
                      key={course._id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        {course.thumbnail?.url ? (
                          <img
                            src={course.thumbnail.url}
                            alt={course.title}
                            className="w-16 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-16 h-12 bg-muted rounded flex items-center justify-center">
                            <BookOpen className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <h4 className="font-semibold">{course.title}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              <span>{course.totalStudents} students</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span>{course.averageRating || "N/A"}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              <span>
                                $
                                {(
                                  course.price * course.totalStudents
                                ).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant={course.isPublished ? "default" : "secondary"}
                      >
                        {course.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Performance</CardTitle>
              <CardDescription>
                Detailed analytics for each of your courses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {courses.map((course) => (
                  <div key={course._id} className="border rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        {course.thumbnail?.url ? (
                          <img
                            src={course.thumbnail.url}
                            alt={course.title}
                            className="w-20 h-16 object-cover rounded"
                          />
                        ) : (
                          <div className="w-20 h-16 bg-muted rounded flex items-center justify-center">
                            <BookOpen className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-lg mb-1">
                            {course.title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{course.totalDuration} minutes</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              <span>{course.totalLessons} lessons</span>
                            </div>
                            <div>
                              <Badge
                                variant={
                                  course.isPublished ? "default" : "secondary"
                                }
                              >
                                {course.isPublished ? "Published" : "Draft"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          $
                          {(
                            course.price * course.totalStudents
                          ).toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Total Revenue
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="font-semibold text-lg">
                          {course.totalStudents}
                        </div>
                        <div className="text-muted-foreground">Students</div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="font-semibold text-lg">
                          {course.totalEnrollments}
                        </div>
                        <div className="text-muted-foreground">Enrollments</div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="font-semibold text-lg">
                          {course.averageRating || "N/A"}
                        </div>
                        <div className="text-muted-foreground">Rating</div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="font-semibold text-lg">
                          {course.totalRatings || 0}
                        </div>
                        <div className="text-muted-foreground">Reviews</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analytics</CardTitle>
              <CardDescription>
                Detailed breakdown of your earnings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Revenue Summary */}
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-6 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      ${analytics.totalRevenue.toLocaleString()}
                    </div>
                    <div className="text-muted-foreground">Total Revenue</div>
                  </div>
                  <div className="text-center p-6 border rounded-lg">
                    <div className="text-2xl font-bold">
                      {courses.reduce(
                        (sum, course) =>
                          sum + (course.price > 0 ? course.totalStudents : 0),
                        0
                      )}
                    </div>
                    <div className="text-muted-foreground">
                      Paid Enrollments
                    </div>
                  </div>
                  <div className="text-center p-6 border rounded-lg">
                    <div className="text-2xl font-bold">
                      {courses.filter((course) => course.price > 0).length}
                    </div>
                    <div className="text-muted-foreground">Paid Courses</div>
                  </div>
                </div>

                {/* Course Revenue Breakdown */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Revenue by Course
                  </h3>
                  <div className="space-y-3">
                    {courses
                      .filter((course) => course.price > 0)
                      .sort(
                        (a, b) =>
                          b.price * b.totalStudents - a.price * a.totalStudents
                      )
                      .map((course) => {
                        const revenue = course.price * course.totalStudents;
                        const percentage =
                          (revenue / analytics.totalRevenue) * 100;

                        return (
                          <div
                            key={course._id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              {course.thumbnail?.url ? (
                                <img
                                  src={course.thumbnail.url}
                                  alt={course.title}
                                  className="w-12 h-9 object-cover rounded"
                                />
                              ) : (
                                <div className="w-12 h-9 bg-muted rounded flex items-center justify-center">
                                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                                </div>
                              )}
                              <div>
                                <div className="font-medium">
                                  {course.title}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {course.totalStudents} students • $
                                  {course.price}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">
                                ${revenue.toLocaleString()}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {percentage.toFixed(1)}% of total
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Student Analytics</CardTitle>
              <CardDescription>
                Insights about your student base and engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Student Demographics */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold">
                      {analytics.totalStudents}
                    </div>
                    <div className="text-muted-foreground">Total Students</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold">
                      {Math.round(
                        analytics.totalStudents / Math.max(courses.length, 1)
                      )}
                    </div>
                    <div className="text-muted-foreground">Avg per Course</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold">
                      {courses.reduce(
                        (max, course) => Math.max(max, course.totalStudents),
                        0
                      )}
                    </div>
                    <div className="text-muted-foreground">Most Popular</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold">
                      {new Set(courses.flatMap((course) => [course._id])).size}
                    </div>
                    <div className="text-muted-foreground">Unique Students</div>
                  </div>
                </div>

                {/* Enrollment Funnel */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Enrollment Funnel
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Eye className="h-5 w-5 text-blue-500" />
                        <div>
                          <div className="font-medium">Course Views</div>
                          <div className="text-sm text-muted-foreground">
                            Total course page visits
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">1,248</div>
                        <div className="text-sm text-muted-foreground">
                          100%
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-green-500" />
                        <div>
                          <div className="font-medium">Enrollments</div>
                          <div className="text-sm text-muted-foreground">
                            Students who enrolled
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {analytics.totalEnrollments}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {((analytics.totalEnrollments / 1248) * 100).toFixed(
                            1
                          )}
                          %
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Star className="h-5 w-5 text-yellow-500" />
                        <div>
                          <div className="font-medium">Completed</div>
                          <div className="text-sm text-muted-foreground">
                            Students who finished
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">342</div>
                        <div className="text-sm text-muted-foreground">
                          {((342 / analytics.totalEnrollments) * 100).toFixed(
                            1
                          )}
                          %
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
