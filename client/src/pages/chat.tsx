import Layout from "@/components/layout";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Sparkles } from "lucide-react";
import { CHAT_SUGGESTIONS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { chatbot } from "@/lib/ai/chatbotModel";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

import { useAuth } from "@/lib/auth";

import { ChatBackground3D } from "@/components/chat-background-3d";

export default function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (user && messages.length === 0) {
      setMessages([
        {
          id: "1",
          role: "assistant",
          content: `Hi ${user.username}! I'm Luna. How are you feeling today? I can help with symptom relief or answer questions about your cycle.`,
        },
      ]);
    }
  }, [user]);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if ((messages.length > 1 || isTyping) && scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;

    const newMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const intent = await chatbot.classify(text);
      const response = chatbot.getResponse(intent, text);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
      };

      setTimeout(() => {
        setMessages((prev) => [...prev, botMessage]);
        setIsTyping(false);
      }, 600);

    } catch (error) {
      console.error("Error getting chatbot response:", error);
      setIsTyping(false);
    }
  };

  return (
    <Layout>
      <ChatBackground3D />
      <div className="flex flex-col h-[calc(100vh-64px)] bg-white/70 backdrop-blur-sm relative z-10">

        {/* Header/}
        <div className="px-6 pt-8 pb-4 border-b border-border/40 bg-white/50 backdrop-blur-sm z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full">
              <Bot className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-serif text-foreground">Luna AI</h1>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-muted-foreground font-medium">Online & Private</span>
              </div>
            </div>
          </div>
        </div>

        {/* messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-6 max-w-2xl mx-auto pb-4">
            {messages.map((msg) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={msg.id}
                className={cn(
                  "flex gap-3",
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                  msg.role === "user" ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
                )}>
                  {msg.role === "user" ? <User size={14} /> : <Bot size={14} />}
                </div>
                <div className={cn(
                  "rounded-2xl px-5 py-3 max-w-[80%] text-sm leading-relaxed shadow-sm",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-none"
                    : "bg-white border border-border text-foreground rounded-bl-none"
                )}>
                  {msg.content}
                </div>
              </motion.div>
            ))}

            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Bot size={14} />
                </div>
                <div className="bg-white border border-border rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" />
                </div>
              </motion.div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {/* suggestions and input */}
        <div className="p-4 bg-white/30 backdrop-blur-sm border-t border-border/40 space-y-4">
          {messages.length < 3 && (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mask-fade-right">
              {CHAT_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="whitespace-nowrap px-4 py-2 bg-secondary/10 hover:bg-secondary/20 text-secondary-foreground rounded-full text-xs font-medium transition-colors border border-transparent hover:border-secondary/30"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="relative max-w-2xl mx-auto flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask Luna anything..."
              className="rounded-full pl-6 pr-12 h-12 border-muted shadow-sm focus-visible:ring-primary/20"
            />
            <Button
              size="icon"
              onClick={() => handleSend()}
              className="absolute right-1 top-1 h-10 w-10 rounded-full"
              disabled={!input.trim() || isTyping}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-[10px] text-center text-muted-foreground/60 max-w-xl mx-auto px-4">
            Disclaimer: AI responses are for informational purposes only and do not constitute medical advice. Please consult a healthcare professional for concerns.
          </p>
        </div>

      </div>
    </Layout>
  );
}