import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import PostComposer from "./PostComposer";
import PostCard from "./PostCard";

const FB = "#1877f2";

export default function PostsFeed({ me }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!me?.id) return;
    setLoading(true);
    try {
      const page = await base44.entities.Post.filter(
        { author_id: me.id },
        { sort: "-created_date", limit: 50 }
      );
      setPosts(page.items);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (me?.id) load();
  }, [me?.id]);

  return (
    <div className="space-y-3">
      <PostComposer me={me} onPosted={load} />
      <h3 className="text-sm font-bold px-1" style={{ color: FB }}>
        POSTS
      </h3>
      {loading && <p className="text-sm text-gray-400 px-1">Loading…</p>}
      {!loading && posts.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
          <p className="text-sm text-gray-400">No posts yet. Share something above.</p>
        </div>
      )}
      {posts.map((p) => (
        <PostCard key={p.id} post={p} me={me} onDeleted={(d) => setPosts((prev) => prev.filter((x) => x.id !== d.id))} />
      ))}
    </div>
  );
}