import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Bell, CloudOff, Download, Trash2, ChevronRight, FileText, LogOut } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { toast } from "@/hooks/use-toast";

export default function ProfilePage() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      toast({ title: "Logged out", description: "See you soon!" });
    } catch (error) {
      toast({ title: "Logout failed", variant: "destructive" });
    }
  };

  return (
    <Layout>
      <div className="flex flex-col pt-8 px-6 space-y-8 pb-10">

        <div className="space-y-1">
          <h1 className="text-3xl font-serif text-foreground">Profile</h1>
          <p className="text-muted-foreground text-sm">Manage your data and preferences.</p>
        </div>

        {/* avatar / user info */}
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-3xl">
            {user?.avatar || "🌸"}
          </div>
          <div>
            <h2 className="text-xl font-medium">{user?.username || "User"}</h2>
            <p className="text-sm text-muted-foreground">Premium Member</p>
          </div>
        </div>

        {/* privacy section */}
        <div className="space-y-4">
          <h3 className="text-lg font-serif font-medium flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" /> Privacy & Data
          </h3>
          <Card className="border-border/50 shadow-sm">
            <CardContent className="p-0 divide-y divide-border/50">
              <div className="p-4 flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">On-Device Processing</Label>
                  <p className="text-xs text-muted-foreground">Keep all AI analysis local on your phone</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="p-4 flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Anonymous Analytics</Label>
                  <p className="text-xs text-muted-foreground">Share usage data to help improve Luna</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* notifications */}
        <div className="space-y-4">
          <h3 className="text-lg font-serif font-medium flex items-center gap-2">
            <Bell className="w-4 h-4 text-secondary-foreground" /> Notifications
          </h3>
          <Card className="border-border/50 shadow-sm">
            <CardContent className="p-0 divide-y divide-border/50">
              <div className="p-4 flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Period Reminders</Label>
                  <p className="text-xs text-muted-foreground">Get notified 2 days before start</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="p-4 flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Daily Check-in</Label>
                  <p className="text-xs text-muted-foreground">Reminders to log your symptoms</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* app settings */}
        <div className="space-y-3">
          <Button variant="outline" className="w-full justify-between h-12 rounded-xl border-muted bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary-foreground">
            <span className="flex items-center gap-2 text-primary"><Download className="w-4 h-4" /> Install App</span>
            <ChevronRight className="w-4 h-4 text-primary/50" />
          </Button>
        </div>

        {/* data actions */}
        <div className="space-y-3">
          <Link href="/doctor-report">
            <Button variant="outline" className="w-full justify-between h-12 rounded-xl border-muted mb-3">
              <span className="flex items-center gap-2"><FileText className="w-4 h-4" /> Medical Report</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </Button>
          </Link>

          <Button variant="outline" className="w-full justify-between h-12 rounded-xl border-muted">
            <span className="flex items-center gap-2"><Download className="w-4 h-4" /> Export My Data</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Button>
          <Button variant="outline" className="w-full justify-between h-12 rounded-xl border-muted text-destructive hover:text-destructive hover:bg-destructive/5">
            <span className="flex items-center gap-2"><Trash2 className="w-4 h-4" /> Delete All Data</span>
          </Button>

          <Button onClick={handleLogout} variant="outline" className="w-full h-12 rounded-xl border-muted">
            <span className="flex items-center gap-2"><LogOut className="w-4 h-4" /> Sign Out</span>
          </Button>
        </div>

        <div className="text-center text-xs text-muted-foreground pt-4">
          <p>Luna v1.0.0 (Beta)</p>
          <p className="mt-1">Made with ❤️ for privacy to make your period journey easier.</p>
          <p className="mt-1">Please do consider starring the github repo to support the visionaries!</p>
        </div>

      </div>
    </Layout>
  );
}
