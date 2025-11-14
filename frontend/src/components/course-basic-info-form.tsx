// components/course-basic-info-form.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Save } from "lucide-react";
import { toast } from "sonner";
import { coursesAPI } from "@/lib/api";
import {
    Course,
    COURSE_CATEGORIES,
    COURSE_DIFFICULTIES,
    COURSE_LANGUAGES,
} from "@/types";

// Fixed: Make all fields required to match usage
const basicInfoSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters"),
    description: z.string().min(50, "Description must be at least 50 characters"),
    shortDescription: z
        .string()
        .max(200, "Short description must be less than 200 characters")
        .optional(),
    category: z.string().min(1, "Please select a category"),
    subcategory: z.string().optional(),
    difficulty: z.enum(["beginner", "intermediate", "advanced"]),
    price: z.number().min(0, "Price cannot be negative"),
    language: z.string().min(1, "Please select a language"),
    requirements: z.array(z.string()),
    learningOutcomes: z.array(z.string()),
    tags: z.array(z.string()),
});

type BasicInfoFormValues = z.infer<typeof basicInfoSchema>;

interface CourseBasicInfoFormProps {
    course: Course;
    onCourseUpdate: (course: Course) => void;
}

export function CourseBasicInfoForm({
                                        course,
                                        onCourseUpdate,
                                    }: CourseBasicInfoFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [requirementInput, setRequirementInput] = useState("");
    const [outcomeInput, setOutcomeInput] = useState("");
    const [tagInput, setTagInput] = useState("");

    const form = useForm<BasicInfoFormValues>({
        resolver: zodResolver(basicInfoSchema),
        defaultValues: {
            title: course.title,
            description: course.description,
            shortDescription: course.shortDescription || "",
            category: course.category,
            subcategory: course.subcategory || "",
            difficulty: course.difficulty,
            price: course.price,
            language: course.language || "English",
            requirements: course.requirements || [],
            learningOutcomes: course.learningOutcomes || [],
            tags: course.tags || [],
        },
    });

    const onSubmit = async (data: BasicInfoFormValues) => {
        setIsLoading(true);
        try {
            const response = await coursesAPI.updateCourse(course._id, data);
            onCourseUpdate(response.data.data);
            toast.success("Course updated successfully!");
        } catch (error) {
            // Fixed: Proper error type assertion
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || "Failed to update course");
        } finally {
            setIsLoading(false);
        }
    };

    const addRequirement = () => {
        if (requirementInput.trim()) {
            const currentRequirements = form.getValues("requirements") || [];
            form.setValue("requirements", [
                ...currentRequirements,
                requirementInput.trim(),
            ]);
            setRequirementInput("");
        }
    };

    const removeRequirement = (index: number) => {
        const currentRequirements = form.getValues("requirements") || [];
        form.setValue(
            "requirements",
            currentRequirements.filter((_, i) => i !== index)
        );
    };

    const addOutcome = () => {
        if (outcomeInput.trim()) {
            const currentOutcomes = form.getValues("learningOutcomes") || [];
            form.setValue("learningOutcomes", [
                ...currentOutcomes,
                outcomeInput.trim(),
            ]);
            setOutcomeInput("");
        }
    };

    const removeOutcome = (index: number) => {
        const currentOutcomes = form.getValues("learningOutcomes") || [];
        form.setValue(
            "learningOutcomes",
            currentOutcomes.filter((_, i) => i !== index)
        );
    };

    const addTag = () => {
        if (tagInput.trim()) {
            const currentTags = form.getValues("tags") || [];
            form.setValue("tags", [...currentTags, tagInput.trim()]);
            setTagInput("");
        }
    };

    const removeTag = (index: number) => {
        const currentTags = form.getValues("tags") || [];
        form.setValue(
            "tags",
            currentTags.filter((_, i) => i !== index)
        );
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">Basic Information</h2>
                <p className="text-muted-foreground">
                    Update your course details, requirements, and learning outcomes.
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="space-y-6">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Course Title</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="e.g., Complete Web Development Bootcamp"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="shortDescription"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Short Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Brief overview of your course (max 200 characters)"
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        This will be displayed on course cards and search results
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Detailed description of what students will learn..."
                                            className="min-h-32"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {COURSE_CATEGORIES.map((category) => (
                                                    <SelectItem key={category} value={category}>
                                                        {category}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="subcategory"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Subcategory (Optional)</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="e.g., React, Python, UI/UX"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormField
                                control={form.control}
                                name="difficulty"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Difficulty Level</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select difficulty" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {COURSE_DIFFICULTIES.map((difficulty) => (
                                                    <SelectItem key={difficulty} value={difficulty}>
                                                        {difficulty.charAt(0).toUpperCase() +
                                                            difficulty.slice(1)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Price ($)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                placeholder="0.00"
                                                {...field}
                                                onChange={(e) =>
                                                    field.onChange(parseFloat(e.target.value) || 0)
                                                }
                                            />
                                        </FormControl>
                                        <FormDescription>Set to 0 for free course</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="language"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Language</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select language" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {COURSE_LANGUAGES.map((language) => (
                                                    <SelectItem key={language} value={language}>
                                                        {language}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    {/* Requirements */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Requirements</h3>
                        <FormField
                            control={form.control}
                            name="requirements"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        What should students know before taking this course?
                                    </FormLabel>
                                    <div className="space-y-3">
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="e.g., Basic programming knowledge"
                                                value={requirementInput}
                                                onChange={(e) => setRequirementInput(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        e.preventDefault();
                                                        addRequirement();
                                                    }
                                                }}
                                            />
                                            <Button
                                                type="button"
                                                onClick={addRequirement}
                                                variant="outline"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {field.value?.map((req, index) => (
                                                <Badge
                                                    key={index}
                                                    variant="secondary"
                                                    className="flex items-center gap-1"
                                                >
                                                    {req}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeRequirement(index)}
                                                        className="hover:text-destructive"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Learning Outcomes */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Learning Outcomes</h3>
                        <FormField
                            control={form.control}
                            name="learningOutcomes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        What will students learn in this course?
                                    </FormLabel>
                                    <div className="space-y-3">
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="e.g., Build full-stack web applications"
                                                value={outcomeInput}
                                                onChange={(e) => setOutcomeInput(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        e.preventDefault();
                                                        addOutcome();
                                                    }
                                                }}
                                            />
                                            <Button
                                                type="button"
                                                onClick={addOutcome}
                                                variant="outline"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {field.value?.map((outcome, index) => (
                                                <Badge
                                                    key={index}
                                                    variant="secondary"
                                                    className="flex items-center gap-1"
                                                >
                                                    {outcome}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeOutcome(index)}
                                                        className="hover:text-destructive"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Tags */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Tags</h3>
                        <FormField
                            control={form.control}
                            name="tags"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Course Tags</FormLabel>
                                    <div className="space-y-3">
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="e.g., javascript, react, web-development"
                                                value={tagInput}
                                                onChange={(e) => setTagInput(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        e.preventDefault();
                                                        addTag();
                                                    }
                                                }}
                                            />
                                            <Button type="button" onClick={addTag} variant="outline">
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {field.value?.map((tag, index) => (
                                                <Badge
                                                    key={index}
                                                    variant="outline"
                                                    className="flex items-center gap-1"
                                                >
                                                    {tag}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeTag(index)}
                                                        className="hover:text-destructive"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <FormDescription>
                                        Add relevant tags to help students discover your course
                                    </FormDescription>
                                    <FormMessage />
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
                        {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                </form>
            </Form>
        </div>
    );
}