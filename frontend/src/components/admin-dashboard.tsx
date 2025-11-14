'use client';

import { useState, useEffect } from 'react';
import { Users, GalleryVerticalEnd, TrendingUp, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { adminAPI } from '@/lib/api';

// Define proper types for admin stats
interface AdminStats {
  overview: {
    totalUsers: number;
    totalCourses: number;
    totalEnrollments: number;
  };
  userStats: {
    byRole: Record<string, number>;
  };
  courseStats: {
    byStatus: Record<string, number>;
    byCategory: Array<{
      _id: string;
      count: number;
    }>;
  };
  recentActivity: {
    enrollments: Array<{
      student: {
        name: string;
      };
      course: {
        title: string;
      };
    }>;
  };
}

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const response = await adminAPI.getDashboardStats();
      setStats(response.data.data as AdminStats);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const adminStats = [
    {
      title: 'Total Users',
      value: stats?.overview?.totalUsers?.toString() || '0',
      icon: Users,
      description: 'Registered users on platform',
    },
    {
      title: 'Total Courses',
      value: stats?.overview?.totalCourses?.toString() || '0',
      icon: GalleryVerticalEnd,
      description: 'Courses created on platform',
    },
    {
      title: 'Total Enrollments',
      value: stats?.overview?.totalEnrollments?.toString() || '0',
      icon: TrendingUp,
      description: 'Course enrollments',
    },
    {
      title: 'Pending Actions',
      value: '3',
      icon: AlertCircle,
      description: 'Items requiring attention',
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
          {adminStats.map((stat, index) => {
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
          {/* User Statistics */}
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Platform Overview</CardTitle>
              <CardDescription>
                User distribution and platform statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {stats?.userStats?.byRole && Object.entries(stats.userStats.byRole).map(([role, count]) => (
                    <div key={role} className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Badge variant="outline">
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </Badge>
                        <div className="flex-1">
                          <div className="w-full bg-secondary rounded-full h-2">
                            <div
                                className="bg-primary h-2 rounded-full"
                                style={{
                                  width: `${(count / stats.overview.totalUsers) * 100}%`
                                }}
                            />
                          </div>
                        </div>
                      </div>
                      <span className="text-sm font-medium">{count} users</span>
                    </div>
                ))}

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Course Status</h4>
                    {stats?.courseStats?.byStatus && Object.entries(stats.courseStats.byStatus).map(([status, count]) => (
                        <div key={status} className="flex justify-between text-sm">
                          <span className="capitalize">{status}</span>
                          <span className="font-medium">{count}</span>
                        </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Top Categories</h4>
                    {stats?.courseStats?.byCategory?.slice(0, 3).map((category) => (
                        <div key={category._id} className="flex justify-between text-sm">
                          <span>{category._id}</span>
                          <span className="font-medium">{category.count}</span>
                        </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Admin Actions</CardTitle>
              <CardDescription>
                Quick access to admin features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button className="w-full justify-start" variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Users
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <GalleryVerticalEnd className="mr-2 h-4 w-4" />
                  Manage Courses
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  View Analytics
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  System Settings
                </Button>
              </div>

              {/* Recent Activity */}
              <div className="mt-8">
                <h4 className="font-semibold mb-4">Recent Activity</h4>
                <div className="space-y-3">
                  {stats?.recentActivity?.enrollments?.slice(0, 3).map((enrollment, index) => (
                      <div key={index} className="flex items-center space-x-3 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="flex-1">
                          <span className="font-medium">{enrollment.student.name}</span>
                          <span className="text-muted-foreground"> enrolled in </span>
                          <span className="font-medium">{enrollment.course.title}</span>
                        </div>
                      </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
  );
}