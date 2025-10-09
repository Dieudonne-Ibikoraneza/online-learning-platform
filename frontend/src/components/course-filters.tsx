// components/course-filters.tsx
"use client";

import { useState } from "react";
import { Search, Filter, X, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { COURSE_CATEGORIES, COURSE_DIFFICULTIES } from "@/types";

interface CourseFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  difficulty: string;
  setDifficulty: (value: string) => void;
  priceRange: string;
  setPriceRange: (value: string) => void;
  rating: string;
  setRating: (value: string) => void;
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
}

export function CourseFilters({
  searchTerm,
  setSearchTerm,
  category,
  setCategory,
  difficulty,
  setDifficulty,
  priceRange,
  setPriceRange,
  rating,
  setRating,
  viewMode,
  setViewMode,
}: CourseFiltersProps) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Check if any filters are active
  const hasActiveFilters = category !== "all" || 
                          difficulty !== "all" || 
                          priceRange !== "all" || 
                          rating !== "all";

  // Clear all filters
  const clearAllFilters = () => {
    setCategory("all");
    setDifficulty("all");
    setPriceRange("all");
    setRating("all");
    setSearchTerm("");
  };

  return (
    <div className="space-y-4">
      {/* Main Search and Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses by title, description, or instructor..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Basic Filters */}
        <div className="flex gap-2">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {COURSE_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat.toLowerCase()}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              {COURSE_DIFFICULTIES.map((diff) => (
                <SelectItem key={diff} value={diff}>
                  {diff.charAt(0).toUpperCase() + diff.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            More Filters
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="p-4 border rounded-lg bg-muted/50 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Advanced Filters</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvancedFilters(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Price Range Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Price</label>
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger>
                  <SelectValue placeholder="All Prices" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="free">Free Only</SelectItem>
                  <SelectItem value="paid">Paid Only</SelectItem>
                  <SelectItem value="under-50">Under $50</SelectItem>
                  <SelectItem value="50-100">$50 - $100</SelectItem>
                  <SelectItem value="over-100">Over $100</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Minimum Rating</label>
              <Select value={rating} onValueChange={setRating}>
                <SelectTrigger>
                  <SelectValue placeholder="Any Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Rating</SelectItem>
                  <SelectItem value="4.5">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      4.5+ Stars
                    </div>
                  </SelectItem>
                  <SelectItem value="4.0">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      4.0+ Stars
                    </div>
                  </SelectItem>
                  <SelectItem value="3.5">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      3.5+ Stars
                    </div>
                  </SelectItem>
                  <SelectItem value="3.0">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      3.0+ Stars
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Duration Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Duration</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Any Duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Duration</SelectItem>
                  <SelectItem value="short">Short (0-2 hours)</SelectItem>
                  <SelectItem value="medium">Medium (2-10 hours)</SelectItem>
                  <SelectItem value="long">Long (10+ hours)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Language Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Language</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="All Languages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="spanish">Spanish</SelectItem>
                  <SelectItem value="french">French</SelectItem>
                  <SelectItem value="german">German</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {category !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Category: {category}
                <button onClick={() => setCategory("all")}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {difficulty !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Level: {difficulty}
                <button onClick={() => setDifficulty("all")}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {priceRange !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Price: {priceRange}
                <button onClick={() => setPriceRange("all")}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {rating !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Rating: {rating}+
                <button onClick={() => setRating("all")}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            Clear All
          </Button>
        </div>
      )}
    </div>
  );
}