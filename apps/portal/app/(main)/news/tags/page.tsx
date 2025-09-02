"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ArrowLeft, Loader, Tag as TagIcon } from "lucide-react";
import apiClient from "@/lib/api-client";
import { toast } from "sonner";

interface TagItem {
  id: number;
  name: string;
}

export default function NewsTagsPage() {
  const router = useRouter();
  const [tags, setTags] = useState<TagItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [creating, setCreating] = useState<boolean>(false);
  const [newTag, setNewTag] = useState<string>("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadTags = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/news/tags");
      if (Array.isArray(res.data?.tags)) {
        setTags(res.data.tags);
      } else if (Array.isArray(res.data)) {
        setTags(res.data);
      } else {
        setTags([]);
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to load tags");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTags();
  }, []);

  const handleCreate = async () => {
    if (!newTag.trim()) {
      toast.error("Tag name is required");
      return;
    }
    try {
      setCreating(true);
      const res = await apiClient.post("/news/tags", { name: newTag.trim() });
      const created = res.data;
      setTags(prev => [...prev, created]);
      setNewTag("");
      toast.success("Tag created");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to create tag");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this tag?")) return;
    try {
      setDeletingId(id);
      await apiClient.delete(`/news/tags/${id}`);
      setTags(prev => prev.filter(t => t.id !== id));
      toast.success("Tag deleted");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to delete tag");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center mb-6">
        <Link href="/news" className="mr-4 p-2 bg-gray-100 rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">News Tags</h1>
          <p className="text-gray-600">Create and manage tags for news articles</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="New tag name"
            className="flex-1 p-2.5 border border-gray-300 rounded-md"
          />
          <button
            type="button"
            onClick={handleCreate}
            disabled={creating}
            className="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 flex items-center"
          >
            {creating ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" /> Creating
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" /> Add Tag
              </>
            )}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="font-semibold">All Tags</h2>
        </div>

        {loading ? (
          <div className="p-6 flex items-center">
            <Loader className="w-5 h-5 mr-2 animate-spin" />
            <span>Loading tags...</span>
          </div>
        ) : (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {tags.length === 0 ? (
              <p className="text-gray-500">No tags yet.</p>
            ) : (
              tags.map(tag => (
                <div key={tag.id} className="flex items-center justify-between border rounded-md p-3">
                  <div className="flex items-center gap-2">
                    <TagIcon className="w-4 h-4 text-gray-500" />
                    <span>{tag.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(tag.id)}
                    disabled={deletingId === tag.id}
                    className="text-red-600 hover:text-red-700 flex items-center"
                  >
                    {deletingId === tag.id ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}


