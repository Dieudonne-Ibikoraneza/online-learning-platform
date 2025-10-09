// components/course-media-manager.tsx
"use client";

import { useState } from "react";
import { Upload, Image, Video, File, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Course } from "@/types";

interface CourseMediaManagerProps {
  course: Course;
  onCourseUpdate: (course: Course) => void;
}

export function CourseMediaManager({
  course,
  onCourseUpdate,
}: CourseMediaManagerProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleThumbnailUpload = () => {
    toast.info(
      "Thumbnail upload functionality will be implemented with Cloudinary integration"
    );
  };

  const handlePromoVideoUpload = () => {
    toast.info(
      "Promo video upload functionality will be implemented with Cloudinary integration"
    );
  };

  const deleteThumbnail = () => {
    if (!confirm("Are you sure you want to delete the thumbnail?")) {
      return;
    }
    toast.info(
      "Thumbnail deletion functionality will be implemented with API integration"
    );
  };

  const deletePromoVideo = () => {
    if (!confirm("Are you sure you want to delete the promo video?")) {
      return;
    }
    toast.info(
      "Promo video deletion functionality will be implemented with API integration"
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Course Media</h2>
        <p className="text-muted-foreground">
          Upload and manage your course thumbnail and promotional video
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Thumbnail Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Course Thumbnail
            </CardTitle>
            <CardDescription>
              Upload a compelling thumbnail image for your course (Recommended:
              800x450px)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {course.thumbnail?.url ? (
              <div className="space-y-4">
                <div className="aspect-video rounded-lg border overflow-hidden">
                  <img
                    src={course.thumbnail.url}
                    alt="Course thumbnail"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={course.thumbnail.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleThumbnailUpload}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Replace
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={deleteThumbnail}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <Image className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  No thumbnail uploaded
                </p>
                <Button
                  onClick={handleThumbnailUpload}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload Thumbnail
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Promo Video Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Promotional Video
            </CardTitle>
            <CardDescription>
              Upload a promotional video to showcase your course (Optional)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {course.promoVideo?.url ? (
              <div className="space-y-4">
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <Video className="h-12 w-12 text-muted-foreground" />
                </div>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span>{course.promoVideo.duration} seconds</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={course.promoVideo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePromoVideoUpload}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Replace
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={deletePromoVideo}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  No promotional video uploaded
                </p>
                <Button
                  onClick={handlePromoVideoUpload}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload Video
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lesson Media Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <File className="h-5 w-5" />
            Lesson Media Summary
          </CardTitle>
          <CardDescription>
            Overview of media files across all lessons
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Video className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <div className="font-semibold">
                {course.lessons.filter((lesson) => lesson.video).length}
              </div>
              <div className="text-muted-foreground">Videos</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <File className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="font-semibold">
                {course.lessons.reduce(
                  (total, lesson) => total + lesson.resources.length,
                  0
                )}
              </div>
              <div className="text-muted-foreground">Resources</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Image className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <div className="font-semibold">
                {course.lessons.reduce(
                  (total, lesson) =>
                    total +
                    lesson.resources.filter((res) => res.type === "image")
                      .length,
                  0
                )}
              </div>
              <div className="text-muted-foreground">Images</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <File className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <div className="font-semibold">
                {course.lessons.reduce(
                  (total, lesson) =>
                    total +
                    lesson.resources.filter((res) => res.type === "pdf").length,
                  0
                )}
              </div>
              <div className="text-muted-foreground">PDFs</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
