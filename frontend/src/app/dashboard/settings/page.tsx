// app/dashboard/settings/page.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Save,
  Bell,
  Shield,
  Eye,
  EyeOff,
  Laptop,
  Moon,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { authAPI } from "@/lib/api";
import { toast } from "sonner";

// Password change schema
const passwordSchema = z
    .object({
      currentPassword: z.string().min(1, "Current password is required"),
      newPassword: z.string().min(6, "Password must be at least 6 characters"),
      confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    });

// Notification settings schema
const notificationSchema = z.object({
  emailNotifications: z.boolean().default(true),
  courseUpdates: z.boolean().default(true),
  newMessages: z.boolean().default(true),
  promotionalEmails: z.boolean().default(false),
});

type PasswordFormValues = z.infer<typeof passwordSchema>;
type NotificationFormValues = z.infer<typeof notificationSchema>;

interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("account");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Password form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Notification form
  const notificationForm = useForm<NotificationFormValues>({
    defaultValues: {
      emailNotifications: true,
      courseUpdates: true,
      newMessages: true,
      promotionalEmails: false,
    },
  });

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    setIsLoading(true);
    try {
      await authAPI.updatePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      passwordForm.reset();
      toast.success("Password updated successfully!");
    } catch (error) {
      const apiError = error as ApiErrorResponse;
      toast.error(apiError.response?.data?.message || "Failed to update password");
    } finally {
      setIsLoading(false);
    }
  };

  const onNotificationSubmit = async (data: NotificationFormValues) => {
    setIsLoading(true);
    try {
      // In a real app, you would save these settings to your backend
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      toast.success("Notification settings updated successfully!");
    } catch (error) {
      toast.error("Failed to update notification settings");
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold">Settings</h2>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-2">
                  <Button
                      variant={activeTab === "account" ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setActiveTab("account")}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Account Security
                  </Button>
                  <Button
                      variant={activeTab === "notifications" ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setActiveTab("notifications")}
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications
                  </Button>
                  <Button
                      variant={activeTab === "appearance" ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setActiveTab("appearance")}
                  >
                    <Laptop className="h-4 w-4 mr-2" />
                    Appearance
                  </Button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Account Security Tab */}
            {activeTab === "account" && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Change Password</CardTitle>
                      <CardDescription>
                        Update your password to keep your account secure
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...passwordForm}>
                        <form
                            onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                            className="space-y-4"
                        >
                          <FormField
                              control={passwordForm.control}
                              name="currentPassword"
                              render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Current Password</FormLabel>
                                    <div className="relative">
                                      <FormControl>
                                        <Input
                                            type={
                                              showCurrentPassword ? "text" : "password"
                                            }
                                            placeholder="Enter current password"
                                            {...field}
                                        />
                                      </FormControl>
                                      <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                          onClick={() =>
                                              setShowCurrentPassword(!showCurrentPassword)
                                          }
                                      >
                                        {showCurrentPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                      </Button>
                                    </div>
                                    <FormMessage />
                                  </FormItem>
                              )}
                          />

                          <FormField
                              control={passwordForm.control}
                              name="newPassword"
                              render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>New Password</FormLabel>
                                    <div className="relative">
                                      <FormControl>
                                        <Input
                                            type={showNewPassword ? "text" : "password"}
                                            placeholder="Enter new password"
                                            {...field}
                                        />
                                      </FormControl>
                                      <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                          onClick={() =>
                                              setShowNewPassword(!showNewPassword)
                                          }
                                      >
                                        {showNewPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                      </Button>
                                    </div>
                                    <FormDescription>
                                      Password must be at least 6 characters long
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                              )}
                          />

                          <FormField
                              control={passwordForm.control}
                              name="confirmPassword"
                              render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Confirm New Password</FormLabel>
                                    <div className="relative">
                                      <FormControl>
                                        <Input
                                            type={
                                              showConfirmPassword ? "text" : "password"
                                            }
                                            placeholder="Confirm new password"
                                            {...field}
                                        />
                                      </FormControl>
                                      <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                          onClick={() =>
                                              setShowConfirmPassword(!showConfirmPassword)
                                          }
                                      >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                      </Button>
                                    </div>
                                    <FormMessage />
                                  </FormItem>
                              )}
                          />

                          <Button
                              type="submit"
                              disabled={isLoading}
                              className="flex items-center gap-2"
                          >
                            <Save className="h-4 w-4" />
                            {isLoading ? "Updating..." : "Update Password"}
                          </Button>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Account Information</CardTitle>
                      <CardDescription>Your basic account details</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Name</label>
                            <p className="text-sm text-muted-foreground">
                              {user?.name}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Email</label>
                            <p className="text-sm text-muted-foreground">
                              {user?.email}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Role</label>
                            <p className="text-sm text-muted-foreground capitalize">
                              {user?.role}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">
                              Member Since
                            </label>
                            <p className="text-sm text-muted-foreground">
                              {user
                                  ? new Date(user.createdAt).toLocaleDateString()
                                  : "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>
                      Choose how you want to be notified about platform activities
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...notificationForm}>
                      <form
                          onSubmit={notificationForm.handleSubmit(
                              onNotificationSubmit
                          )}
                          className="space-y-6"
                      >
                        <div className="space-y-4">
                          <FormField
                              control={notificationForm.control}
                              name="emailNotifications"
                              render={({ field }) => (
                                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                      <FormLabel className="text-base">
                                        Email Notifications
                                      </FormLabel>
                                      <FormDescription>
                                        Receive important updates via email
                                      </FormDescription>
                                    </div>
                                    <FormControl>
                                      <Switch
                                          checked={field.value}
                                          onCheckedChange={field.onChange}
                                      />
                                    </FormControl>
                                  </FormItem>
                              )}
                          />

                          <FormField
                              control={notificationForm.control}
                              name="courseUpdates"
                              render={({ field }) => (
                                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                      <FormLabel className="text-base">
                                        Course Updates
                                      </FormLabel>
                                      <FormDescription>
                                        Get notified about course updates and new
                                        content
                                      </FormDescription>
                                    </div>
                                    <FormControl>
                                      <Switch
                                          checked={field.value}
                                          onCheckedChange={field.onChange}
                                      />
                                    </FormControl>
                                  </FormItem>
                              )}
                          />

                          <FormField
                              control={notificationForm.control}
                              name="newMessages"
                              render={({ field }) => (
                                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                      <FormLabel className="text-base">
                                        New Messages
                                      </FormLabel>
                                      <FormDescription>
                                        Notify me about new messages from instructors
                                      </FormDescription>
                                    </div>
                                    <FormControl>
                                      <Switch
                                          checked={field.value}
                                          onCheckedChange={field.onChange}
                                      />
                                    </FormControl>
                                  </FormItem>
                              )}
                          />

                          <FormField
                              control={notificationForm.control}
                              name="promotionalEmails"
                              render={({ field }) => (
                                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                      <FormLabel className="text-base">
                                        Promotional Emails
                                      </FormLabel>
                                      <FormDescription>
                                        Receive offers, news, and promotional content
                                      </FormDescription>
                                    </div>
                                    <FormControl>
                                      <Switch
                                          checked={field.value}
                                          onCheckedChange={field.onChange}
                                      />
                                    </FormControl>
                                  </FormItem>
                              )}
                          />
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="flex items-center gap-2"
                        >
                          <Save className="h-4 w-4" />
                          {isLoading ? "Saving..." : "Save Preferences"}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
            )}

            {/* Appearance Tab */}
            {activeTab === "appearance" && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Theme Preferences</CardTitle>
                      <CardDescription>
                        Customize how the platform looks on your device
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Theme</h4>
                            <p className="text-sm text-muted-foreground">
                              Select your preferred interface theme
                            </p>
                          </div>
                          <Select defaultValue="system">
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Select theme" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="light">
                                <div className="flex items-center gap-2">
                                  <Sun className="h-4 w-4" />
                                  Light
                                </div>
                              </SelectItem>
                              <SelectItem value="dark">
                                <div className="flex items-center gap-2">
                                  <Moon className="h-4 w-4" />
                                  Dark
                                </div>
                              </SelectItem>
                              <SelectItem value="system">
                                <div className="flex items-center gap-2">
                                  <Laptop className="h-4 w-4" />
                                  System
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Font Size</h4>
                            <p className="text-sm text-muted-foreground">
                              Adjust the text size across the platform
                            </p>
                          </div>
                          <Select defaultValue="medium">
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Select size" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="small">Small</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="large">Large</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <Button className="flex items-center gap-2">
                        <Save className="h-4 w-4" />
                        Save Appearance Settings
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Language & Region</CardTitle>
                      <CardDescription>
                        Set your preferred language and regional settings
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Language
                          </label>
                          <Select defaultValue="english">
                            <SelectTrigger>
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="english">English</SelectItem>
                              <SelectItem value="spanish">Spanish</SelectItem>
                              <SelectItem value="french">French</SelectItem>
                              <SelectItem value="german">German</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Time Zone
                          </label>
                          <Select defaultValue="utc">
                            <SelectTrigger>
                              <SelectValue placeholder="Select timezone" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="utc">UTC</SelectItem>
                              <SelectItem value="est">EST</SelectItem>
                              <SelectItem value="pst">PST</SelectItem>
                              <SelectItem value="cet">CET</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button className="flex items-center gap-2">
                        <Save className="h-4 w-4" />
                        Save Language Settings
                      </Button>
                    </CardContent>
                  </Card>
                </div>
            )}
          </div>
        </div>
      </div>
  );
}