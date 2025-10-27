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
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Lazy-load TipTap editor
const RichTextEditor = dynamic(
  () => import("@/components/admin/RichTextEditor"),
  { ssr: false }
);

interface BlogPost {
  title: string;
  category: string;
  subCategory?: string;
  author: string;
  email: string;
  date: Date;
  time: string;
  status: string;
  tags: string[];
  type: string;
  content: string;
  images: string[];
}

// ------------------ Hardcoded categories & subcategories ------------------
const categories = [
  {
    name: "BEAUTY",
    slug: "beauty",
    subCategories: [
      "beauty tips",
      "hair",
      "facial",
      "skin",
      "grooming",
      "makeup",
      "nail",
    ],
  },
  {
    name: "TRENDS",
    slug: "trends",
    subCategories: ["influencers", "beauty trends", "celebrities"],
  },
  {
    name: "CAREER",
    slug: "career",
    subCategories: ["hiring talent", "career tips"],
  },
  { name: "FEATURES", slug: "features", subCategories: ["interview stories"] },
  { name: "PRODUCT", slug: "product", subCategories: ["product", "equipment"] },
  { name: "LOCATION", slug: "location", subCategories: ["india", "singapore"] },
];

export default function CreateBlogPage() {
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [blogType, setBlogType] = useState("free");

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [author, setAuthor] = useState("");
  const [email, setEmail] = useState("");
  const [time, setTime] = useState("");
  const [status, setStatus] = useState("");
  const [content, setContent] = useState("");

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [previewPost, setPreviewPost] = useState<BlogPost | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) =>
    setTags(tags.filter((t) => t !== tag));

  const handlePostBlog = () => {
    const newPost: BlogPost = {
      title,
      category,
      subCategory,
      author,
      email,
      date: date || new Date(),
      time,
      status,
      tags,
      type: blogType,
      content,
      images,
    };
    setPosts([newPost, ...posts]);
    resetForm();
  };
  // Handle image selection
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImages((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setTitle("");
    setCategory("");
    setSubCategory("");
    setAuthor("");
    setEmail("");
    setTime("");
    setStatus("");
    setTags([]);
    setTagInput("");
    setBlogType("free");
    setContent("");
    setImages([]);
  };

  const selectedCategory = categories.find((c) => c.name === category);

  return (
    <div className="py-2 sm:py-4 flex flex-col lg:flex-row gap-6">
      {/* Main Form */}
      <div className="flex-1">
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
                <Input
                  placeholder="Enter blog title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div>
                <Label>Blog Category</Label>
                <Select
                  value={category}
                  onValueChange={(val) => {
                    setCategory(val);
                    setSubCategory("");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.slug} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Subcategory */}
            {selectedCategory?.subCategories?.length && (
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Subcategory</Label>
                  <Select value={subCategory} onValueChange={setSubCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedCategory.subCategories.map((sub) => (
                        <SelectItem key={sub} value={sub}>
                          {sub}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Author & Email */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Author</Label>
                <Input
                  placeholder="Enter author name"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  placeholder="Enter author email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
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
                        className="w-fit mt-2 justify-center font-normal"
                      >
                        {date ? format(date, "dd/MM/yy") : "Pick a date"}
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
                  <Input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
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

            {/* Image Upload Section */}
            <div>
              <Label>Upload Images</Label>
              <div className="mt-2">
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-purple-400 rounded-lg cursor-pointer hover:border-purple-600 hover:bg-purple-50 transition-all"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Plus className="w-6 h-6 text-purple-500 mb-2" />
                    <p className="mb-2 text-sm text-gray-500">
                      Click or drag images here to upload
                    </p>
                    <p className="text-xs text-gray-400">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>

                {/* Preview Grid */}
                {images.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    {images.map((img, index) => (
                      <div
                        key={index}
                        className="relative w-full h-24 rounded-lg overflow-hidden border hover:shadow-lg transition-shadow"
                      >
                        <img
                          src={img}
                          alt={`blog-img-${index}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 text-white bg-red-500 rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Blog Content */}
            <div>
              <Label>Blog Content</Label>
              <div className="mt-2 border rounded-md min-h-[300px]">
                <RichTextEditor content={content} onChange={setContent} />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" className="h-10">
                Save as Draft
              </Button>

              <Button
                variant="outline"
                className="h-10"
                onClick={() => {
                  setPreviewPost({
                    title,
                    category,
                    subCategory,
                    author,
                    email,
                    date: date || new Date(),
                    time,
                    status,
                    tags,
                    type: blogType,
                    content,
                    images,
                  });
                  setIsPreviewOpen(true);
                }}
              >
                Preview
              </Button>

              <Button
                className="h-10 bg-purple-600 hover:bg-purple-700 text-white"
                onClick={handlePostBlog}
              >
                Post Blog
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Posts List */}
      <div className="w-full lg:w-80">
        <Card className="shadow-sm border">
          <CardHeader>
            <CardTitle>Created Posts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
            {posts.length === 0 && (
              <p className="text-gray-400">No posts yet</p>
            )}
            {posts.map((post, index) => (
              <div
                key={index}
                className="border p-2 rounded-md hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  setPreviewPost(post); // ✅ Set clicked post as preview
                  setIsPreviewOpen(true); // ✅ Open the modal
                }}
              >
                <p className="font-semibold">{post.title}</p>
                <p className="text-sm text-gray-500">
                  {post.category}
                  {post.subCategory ? ` > ${post.subCategory}` : ""}
                </p>
                <p className="text-xs text-gray-400">
                  {format(post.date, "PPP")} {post.time} - {post.status}
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Image Preview */}
                {post.images?.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {post.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`post-img-${idx}`}
                        className="w-full h-20 object-cover rounded-md border"
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Preview Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Blog Preview</DialogTitle>
          </DialogHeader>
          {previewPost && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">{previewPost.title}</h2>
              <p className="text-sm text-gray-500">
                {previewPost.category}
                {previewPost.subCategory
                  ? ` > ${previewPost.subCategory}`
                  : ""}{" "}
                | {format(previewPost.date, "PPP")} {previewPost.time} |{" "}
                {previewPost.status}
              </p>
              <p className="text-gray-700">
                <strong>Author:</strong> {previewPost.author} (
                {previewPost.email})
              </p>
              <div className="flex flex-wrap gap-2">
                {previewPost.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Content */}
              <div className="border rounded p-3 mt-2 min-h-[200px]">
                <RichTextEditor
                  content={previewPost.content}
                  editable={false}
                />
              </div>

              {/* Images Preview */}
              {previewPost.images?.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {previewPost.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`preview-img-${idx}`}
                      className="w-full h-28 object-cover rounded-md border"
                    />
                  ))}
                </div>
              )}

              <div className="flex justify-end mt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsPreviewOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
