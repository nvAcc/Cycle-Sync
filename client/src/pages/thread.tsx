import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRoute } from "wouter";
import { ArrowLeft, Heart, MessageSquare, Send, ShieldAlert, MoreVertical, Trash2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { formatDistanceToNow } from "date-fns";
import { toast } from "@/hooks/use-toast";

export default function ThreadPage() {
  const [, params] = useRoute("/community/thread/:id");
  const [, setLocation] = useLocation();
  const threadId = parseInt(params?.id || "0");
  const { user } = useAuth();
  const [commentInput, setCommentInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const thread = useLiveQuery(() => db.threads.get(threadId), [threadId]);
  const comments = useLiveQuery(() => db.comments.where("threadId").equals(threadId).toArray(), [threadId]);

  const handleLike = () => {
    if (thread) {
      db.threads.update(threadId, { likes: (thread.likes || 0) + 1 });
    }
  };

  const handleSend = async () => {
    if (!commentInput.trim() || !thread) return;

    try {
      await db.comments.add({
        threadId,
        content: commentInput,
        author: user?.username || "Anonymous",
        avatar: user?.avatar || "🌸",
        timestamp: new Date().toISOString(),
        createdAt: new Date()
      });
      setCommentInput("");
      // scroll to bottom handled by effect or manual scroll
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (e) {
      toast({ title: "Error", description: "Failed to post comment", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this thread?")) {
      await db.threads.delete(threadId);
      await db.comments.where("threadId").equals(threadId).delete();
      toast({ title: "Deleted", description: "Thread deleted." });
      setLocation("/community");
    }
  };

  if (!thread) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <p className="text-muted-foreground">Thread not found or loading...</p>
          <Link href="/community">
            <Button variant="link">Back to Community</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-64px)] bg-background">

        {/* header */}
        <div className="px-4 pt-6 pb-2 border-b border-border/40 bg-white/50 backdrop-blur-sm sticky top-0 z-10 flex items-center gap-3">
          <Link href="/community">
            <Button variant="ghost" size="icon" className="-ml-2">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </Button>
          </Link>
          <h1 className="text-lg font-serif text-foreground truncate max-w-[200px]">{thread.title}</h1>
        </div>

        <div className="flex-1 overflow-y-auto pb-20 scrollbar-hide">
          {/* main post */}
          <div className="p-4 bg-white/40 border-b border-border/40 space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-xl border border-white shadow-sm">
                  {thread.avatar}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{thread.author}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {user?.username === thread.author && (
                    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={handleDelete}>
                      <Trash2 className="w-4 h-4 mr-2" /> Delete Thread
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem className="text-muted-foreground">
                    <ShieldAlert className="w-4 h-4 mr-2" /> Report
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-serif font-medium leading-snug">{thread.title}</h2>
              <p className="text-base text-foreground/80 leading-relaxed whitespace-pre-wrap">{thread.content}</p>
            </div>

            <div className="flex gap-4 pt-2">
              <Button variant="ghost" size="sm" onClick={handleLike} className="h-8 px-2 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors">
                <Heart className="w-4 h-4 mr-1.5" /> {thread.likes}
              </Button>
              <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground">
                <MessageSquare className="w-4 h-4 mr-1.5" /> {comments?.length || 0}
              </Button>
            </div>
          </div>

          {/* comments */}
          <div className="p-4 space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider pl-1">Discussion ({comments?.length})</h3>

            {comments && comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-sm border border-white shadow-sm shrink-0 mt-1">
                    {comment.avatar}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-border/50 shadow-sm">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="text-xs font-bold text-foreground">{comment.author}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/90 leading-relaxed">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-muted-foreground py-4">No comments yet.</p>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* input area */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-lg border-t border-border z-20 pb-safe">
          <div className="max-w-md mx-auto relative flex gap-2">
            <Input
              placeholder="Add to the discussion..."
              className="rounded-full pl-5 pr-12 h-12 bg-background border-muted shadow-sm focus-visible:ring-primary/20"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
            />
            <Button
              size="icon"
              className="absolute right-1 top-1 h-10 w-10 rounded-full"
              onClick={handleSend}
              disabled={!commentInput.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>

      </div>
    </Layout>
  );
}
