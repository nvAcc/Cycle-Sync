import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Search, Plus, MessageSquare, Heart, ShieldAlert, MoreHorizontal, Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { toast } from "@/hooks/use-toast";

export default function CommunityPage() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const { user } = useAuth();

  // Local DB Query
  const threads = useLiveQuery(() => {
    let collection = db.threads.orderBy("createdAt").reverse();
    if (filter !== "All") {
      collection = db.threads.where("category").equals(filter).reverse();
    }
    return collection.toArray();
  }, [filter]);

  // Filtering by search
  const filteredThreads = threads?.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="flex flex-col pt-8 px-6 space-y-6 pb-20">

        {/* header */}
        <div className="space-y-1">
          <h1 className="text-3xl font-serif text-foreground">Community</h1>
          <p className="text-muted-foreground text-sm">Safe space for questions & support.</p>
        </div>

        {/* search and action */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search topics..."
              className="pl-9 bg-white/50 border-muted-foreground/20 rounded-xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <NewThreadDialog user={user}>
            <Button size="icon" className="rounded-xl shrink-0 bg-secondary text-secondary-foreground hover:bg-secondary/80">
              <Plus className="w-5 h-5" />
            </Button>
          </NewThreadDialog>
        </div>

        {/* guidelines banner */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex gap-3 items-start">
          <div className="bg-white p-1.5 rounded-full shadow-sm shrink-0">
            <Heart className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-primary-foreground font-serif">Be Kind & Supportive</h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              This is a judgment-free zone. Please report any unkind behavior. We're here to help each other.
            </p>
          </div>
        </div>

        {/* filter tags */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mask-fade-right">
          {["All", "Remedies", "Wellness", "Advice", "Health", "PCOS"].map((tag, i) => (
            <Badge
              key={tag}
              variant={filter === tag ? "default" : "secondary"}
              className={filter === tag ? "bg-foreground text-background hover:bg-foreground/90 cursor-pointer" : "bg-white hover:bg-secondary/20 font-normal cursor-pointer"}
              onClick={() => setFilter(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>

        {/* threads list */}
        <div className="space-y-4">
          {filteredThreads && filteredThreads.length > 0 ? (
            filteredThreads.map((thread) => (
              <Link key={thread.id} href={`/community/thread/${thread.id}`}>
                <Card className="bg-white/60 hover:bg-white/90 transition-colors border-border/50 shadow-sm cursor-pointer mb-4">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-lg border border-white shadow-sm">
                          {thread.avatar || "🌸"}
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-xs font-medium text-foreground">{thread.author || "Anonymous"}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2">
                            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="text-destructive focus:text-destructive">
                            <ShieldAlert className="w-4 h-4 mr-2" /> Report User
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Filter className="w-4 h-4 mr-2" /> Block User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div>
                      <h3 className="font-medium text-base text-foreground leading-tight">{thread.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{thread.content}</p>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                      <span className="flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5" /> {thread.likes || 0}
                      </span>
                      <span className="bg-secondary/10 px-1.5 py-0.5 rounded text-[10px] text-secondary-foreground font-medium">
                        {thread.category}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No threads found. Start a conversation!</p>
            </div>
          )}
        </div>

      </div>
    </Layout>
  );
}

function NewThreadDialog({ children, user }: { children: React.ReactNode, user: any }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Wellness");
  const [content, setContent] = useState("");

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }

    try {
      await db.threads.add({
        title,
        content,
        category,
        author: user?.username || "Anonymous",
        avatar: user?.avatar || "🌸",
        likes: 0,
        timestamp: new Date().toISOString(),
        createdAt: new Date()
      });

      toast({ title: "Posted!", description: "Your thread has been created." });
      setOpen(false);
      setTitle("");
      setContent("");
    } catch (e) {
      toast({ title: "Error", description: "Failed to create thread", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Thread</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What's on your mind?" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {["Remedies", "Wellness", "Advice", "Health", "PCOS"].map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="content">Details</Label>
            <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Share more details..." className="h-32" />
          </div>
        </div>
        <Button onClick={handleSubmit} className="w-full">Post Thread</Button>
      </DialogContent>
    </Dialog>
  );
}
