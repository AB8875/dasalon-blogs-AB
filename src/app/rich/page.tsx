"use client";

import Tiptap from "@/components/rich-text-editor/page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function RichEditorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <Card className="shadow-md border border-gray-200 rounded-2xl bg-white">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-gray-800">
              ✍️ Rich Text Editor
            </CardTitle>
            <p className="text-gray-500 text-sm">
              Create and format your blog content beautifully.
            </p>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            <Tiptap />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
