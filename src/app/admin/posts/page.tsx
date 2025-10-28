"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { format } from "date-fns";
import { Plus, Grid, List } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

// Lazy load RichTextEditor
const RichTextEditor = dynamic(
  () => import("@/components/admin/RichTextEditor"),
  { ssr: false }
);

// -------------------- Types --------------------
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

interface Category {
  name: string;
  slug: string;
  subCategories: string[];
}

// -------------------- Sample Data --------------------
const categories: Category[] = [
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

const samplePosts: BlogPost[] = [
  {
    title: "10 Beauty Hacks That Actually Work",
    category: "BEAUTY",
    subCategory: "beauty tips",
    author: "Aarushi Mehta",
    email: "aarushi@example.com",
    date: new Date("2025-10-20"),
    time: "10:30",
    status: "published",
    tags: ["makeup", "skincare", "daily tips"],
    type: "free",
    content:
      "Learn the top 10 simple beauty hacks to upgrade your daily routine.",
    images: [],
  },
  {
    title: "Top Trends in Hair Styling for 2025",
    category: "TRENDS",
    subCategory: "beauty trends",
    author: "Kavita Sharma",
    email: "kavita@example.com",
    date: new Date("2025-10-24"),
    time: "09:00",
    status: "draft",
    tags: ["hairstyle", "fashion", "celebrity"],
    type: "free",
    content:
      "Discover this year’s most trending hairstyles and how to get the look.",
    images: [],
  },
];

// -------------------- Components --------------------

// Post card for list/grid
const PostCard = ({
  post,
  onClick,
}: {
  post: BlogPost;
  onClick: () => void;
}) => (
  <Card className="cursor-pointer hover:shadow-md" onClick={onClick}>
    <CardContent className="space-y-1">
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
    </CardContent>
  </Card>
);

// Grid view
const PostsGrid = ({
  posts,
  onPostClick,
}: {
  posts: BlogPost[];
  onPostClick: (post: BlogPost) => void;
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {posts.map((post, i) => (
      <PostCard key={i} post={post} onClick={() => onPostClick(post)} />
    ))}
  </div>
);

// List view
const PostsList = ({
  posts,
  onPostClick,
}: {
  posts: BlogPost[];
  onPostClick: (post: BlogPost) => void;
}) => (
  <div className="flex flex-col gap-3">
    {posts.map((post, i) => (
      <PostCard key={i} post={post} onClick={() => onPostClick(post)} />
    ))}
  </div>
);

// -------------------- Create Post Modal --------------------
interface CreatePostModalProps {
  open: boolean;
  onClose: () => void;
  addPost: (post: BlogPost) => void;
}

const CreatePostModal = ({ open, onClose, addPost }: CreatePostModalProps) => {
  // Form States
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [author, setAuthor] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState("");
  const [status, setStatus] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [blogType, setBlogType] = useState("free");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);

  const selectedCategory = categories.find((c) => c.name === category);

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      e.key === "Enter" &&
      tagInput.trim() &&
      !tags.includes(tagInput.trim())
    ) {
      e.preventDefault();
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) =>
    setTags(tags.filter((t) => t !== tag));

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result)
          if (event.target && event.target.result) {
            setImages((prev) => [...prev, event.target?.result as string]);
          }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) =>
    setImages(images.filter((_, i) => i !== index));

  const resetForm = () => {
    setTitle("");
    setCategory("");
    setSubCategory("");
    setAuthor("");
    setEmail("");
    setDate(new Date());
    setTime("");
    setStatus("");
    setTags([]);
    setTagInput("");
    setBlogType("free");
    setContent("");
    setImages([]);
  };

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
    addPost(newPost);
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-full sm:max-w-xl md:max-w-3xl lg:max-w-4xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            Create New Post
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Blog Title</Label>
              <Input
                placeholder="Enter title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <Label>Category</Label>
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
          {(selectedCategory?.subCategories ?? []).length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Subcategory</Label>
                <Select value={subCategory} onValueChange={setSubCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedCategory?.subCategories.map((sub) => (
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Author</Label>
              <Input
                placeholder="Author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Publish Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Publish Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-center font-normal mt-2"
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

          {/* Status & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    {tag}{" "}
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
            <Label>Content</Label>
            <div className="mt-2 border rounded-md min-h-[150px] sm:min-h-[200px]">
              <RichTextEditor content={content} onChange={setContent} />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={resetForm}>
              Reset
            </Button>
            <Button
              className="bg-purple-600 text-white hover:bg-purple-700"
              onClick={handlePostBlog}
            >
              Post Blog
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// -------------------- Main Admin Posts Page --------------------
export default function AdminPostsPage() {
  const [posts, setPosts] = useState<BlogPost[]>(samplePosts);
  const [isGridView, setIsGridView] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [previewPost, setPreviewPost] = useState<BlogPost | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handlePostClick = (post: BlogPost) => {
    setPreviewPost(post);
    setIsPreviewOpen(true);
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header with Create Post and View Toggle */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Your Posts</h1>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1"
          >
            <Plus /> Create Post
          </Button>
          <Button variant="outline" onClick={() => setIsGridView(!isGridView)}>
            {isGridView ? <List /> : <Grid />}
          </Button>
        </div>
      </div>

      {/* Posts Display */}
      {posts.length === 0 ? (
        <p className="text-gray-500">No posts created yet.</p>
      ) : isGridView ? (
        <PostsGrid posts={posts} onPostClick={handlePostClick} />
      ) : (
        <PostsList posts={posts} onPostClick={handlePostClick} />
      )}

      {/* Create Post Modal */}
      <CreatePostModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        addPost={(post) => setPosts([post, ...posts])}
      />

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Post Preview</DialogTitle>
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
              <div className="border rounded p-3 mt-2 min-h-[200px]">
                <RichTextEditor
                  content={previewPost.content}
                  editable={false}
                />
              </div>
              {previewPost.images?.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {previewPost.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`img-${idx}`}
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
