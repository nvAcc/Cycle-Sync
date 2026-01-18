import { Link, useLocation } from "wouter";
import { Moon, Calendar, MessageCircle, User, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkAndNotify } from "@/lib/notifications";
import { useLiveQuery } from "dexie-react-hooks";

const bgImage = "/assets/images/soft_fluid_gradient_background_with_coral_and_sage_tones.png";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user } = useAuth();
  const logs = useLiveQuery(() => db.periodLogs.toArray());

  useEffect(() => {
    if (user && logs) {
      checkAndNotify(user, logs);
    }
  }, [user, logs]);

  const shouldHideNav = location === "/login" || location.startsWith("/community/thread/");

  const navItems = [
    { icon: Moon, label: "Cycle", path: "/" },
    { icon: Calendar, label: "Calendar", path: "/calendar" },
    { icon: Users, label: "Community", path: "/community" },
    { icon: MessageCircle, label: "Luna AI", path: "/chat" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <div className="min-h-screen bg-background font-sans text-foreground relative overflow-hidden flex flex-col">
      {/* background image layer */}
      <div
        className="fixed inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* main content area */}
      <main className="flex-1 relative z-10 overflow-y-auto pb-24">
        {children}
      </main>

      {/* bottom navigation */}
      {!shouldHideNav && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-border z-50 pb-safe">
          <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2">
            {navItems.map((item) => {
              const isActive = location === item.path;
              return (
                <Link key={item.path} href={item.path}>
                  <a
                    className={cn(
                      "flex flex-col items-center justify-center space-y-1 min-w-[3.5rem] transition-colors duration-200 cursor-pointer",
                      isActive ? "text-primary" : "text-muted-foreground hover:text-primary/70"
                    )}
                    data-testid={`nav-${item.label.toLowerCase()}`}
                  >
                    <item.icon
                      className={cn(
                        "h-5 w-5 transition-transform duration-300",
                        isActive && "scale-110"
                      )}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    <span className="text-[10px] font-medium tracking-wide">
                      {item.label}
                    </span>
                  </a>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
