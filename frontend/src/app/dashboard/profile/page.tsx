// app/dashboard/profile/page.tsx
"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Camera, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { usersAPI } from "@/lib/api";
import { toast } from "sonner";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      bio: user?.bio || "",
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    setIsLoading(true);
    try {
      const response = await usersAPI.updateProfile(data);
      updateUser(response.data.data);
      toast.success("Profile updated successfully!");
    } catch (error) {
      const apiError = error as ApiErrorResponse;
      toast.error(apiError.response?.data?.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (
      event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB");
      return;
    }

    setAvatarLoading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await usersAPI.uploadAvatar(formData);
      updateUser(response.data.data);
      toast.success("Avatar updated successfully!");
    } catch (error) {
      const apiError = error as ApiErrorResponse;
      toast.error(apiError.response?.data?.message || "Failed to upload avatar");
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      await usersAPI.deleteAvatar();
      if (user) {
        updateUser({ ...user, avatar: undefined });
      }
      toast.success("Avatar removed successfully!");
    } catch (error) {
      const apiError = error as ApiErrorResponse;
      toast.error(apiError.response?.data?.message || "Failed to remove avatar");
    }
  };

  if (!user) return null;

  return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Profile Settings</h2>
          <p className="text-muted-foreground">
            Manage your account settings and profile information
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Avatar Section */}
          <div className="space-y-4">
            <Card className="p-6">
              <div className="space-y-4">
                <div className="text-center">
                  <div className="relative inline-block">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={user.avatar?.url} alt={user.name} />
                      <AvatarFallback className="text-lg">
                        {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <label
                        htmlFor="avatar-upload"
                        className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90"
                    >
                      <Camera className="h-4 w-4" />
                      <input
                          id="avatar-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarUpload}
                          disabled={avatarLoading}
                      />
                    </label>
                  </div>
                  <div className="mt-4">
                    <h3 className="font-semibold">{user.name}</h3>
                    <p className="text-sm text-muted-foreground capitalize">
                      {user.role}
                    </p>
                  </div>
                </div>

                {user.avatar && (
                    <Button
                        variant="outline"
                        onClick={handleRemoveAvatar}
                        disabled={avatarLoading}
                        className="w-full"
                    >
                      Remove Avatar
                    </Button>
                )}

                <div className="text-xs text-muted-foreground text-center">
                  <p>Click the camera icon to upload a new avatar</p>
                  <p>JPG, PNG, GIF up to 5MB</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Profile Form */}
          <div className="md:col-span-2">
            <Card className="p-6">
              <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Your full name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input
                                    type="email"
                                    placeholder="your@email.com"
                                    {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                        )}
                    />
                  </div>

                  <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bio</FormLabel>
                            <FormControl>
                              <Textarea
                                  placeholder="Tell us a little about yourself..."
                                  className="min-h-24 resize-vertical"
                                  {...field}
                              />
                            </FormControl>
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
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </Form>
            </Card>
          </div>
        </div>
      </div>
  );
}