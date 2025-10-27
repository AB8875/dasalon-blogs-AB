"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { format } from "date-fns";
import { Plus } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// Lazy-load TipTap editor to avoid SSR issues
const RichTextEditor = dynamic(
  () => import("@/components/admin/RichTextEditor"),
  {
    ssr: false,
  }
);

export default function CreateBlogPage() {
  const [tags, setTags] = useState<string[]>(["Landscape", "Top Blog"]);
  const [tagInput, setTagInput] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [blogType, setBlogType] = useState("free");

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  return (
    <div className="p-2 sm:p-6">
      <Card className="shadow-sm border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <div className="w-1.5 h-6 bg-purple-500 rounded-full" />
            New Blog
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Blog Title & Category */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Blog Title</Label>
              <Input placeholder="Enter blog title" />
            </div>
            <div>
              <Label>Blog Category</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beauty">Beauty</SelectItem>
                  <SelectItem value="trends">Trends</SelectItem>
                  <SelectItem value="fashion">Fashion</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Author & Email */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Author</Label>
              <Input placeholder="Enter author name" />
            </div>
            <div>
              <Label>Email</Label>
              <Input placeholder="Enter author email" type="email" />
            </div>
          </div>

          {/* Date, Time, Status, Tags */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Publish Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full mt-2 justify-start text-left font-normal"
                    >
                      {date ? format(date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>Publish Time</Label>
                <Input type="time" />
              </div>
            </div>

            <div>
              <Label>Status</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>

              <Label className="mt-4 block">Tags</Label>
              <div className="flex flex-wrap items-center gap-2 border mt-2 rounded-md p-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="text-xs hover:text-red-500"
                    >
                      ✕
                    </button>
                  </Badge>
                ))}
                <input
                  className="flex-1 min-w-[100px] outline-none text-sm bg-transparent"
                  placeholder="Add tag"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                />
              </div>
            </div>
          </div>

          {/* Blog Content */}
          <div>
            <Label>Blog Content</Label>
            <div className="mt-2 border rounded-md min-h-[300px]">
              <RichTextEditor />
            </div>
          </div>

          {/* Blog Images */}
          <div>
            <Label>Upload Images</Label>
            <div className="border border-dashed rounded-lg p-6 text-center text-gray-500 cursor-pointer hover:bg-gray-50">
              Drag & Drop your files or{" "}
              <span className="text-purple-600 cursor-pointer">Browse</span>
            </div>
          </div>

          {/* Blog Type */}
          <div>
            <Label>Blog Type</Label>
            <RadioGroup
              defaultValue={blogType}
              onValueChange={setBlogType}
              className="flex gap-6 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="free" id="free" />
                <Label htmlFor="free">Free</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="paid" id="paid" />
                <Label htmlFor="paid">Paid</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" className="h-10">
              Save as Draft
            </Button>
            <Button className="h-10 bg-purple-600 hover:bg-purple-700 text-white">
              Post Blog
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
