import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
const bgImage = "/assets/images/soft_fluid_gradient_background_with_coral_and_sage_tones.png";
import { ShieldCheck } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { toast } from "@/hooks/use-toast";

export default function LoginPage() {
  const { loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [registerData, setRegisterData] = useState({ username: "", password: "", confirmPassword: "", email: "" });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await loginMutation.mutateAsync(loginData);
      setLocation("/");
    } catch (error: any) {
      // Toast is handled by mutation onError
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirmPassword) {
      toast({ title: "Passwords don't match", description: "Please make sure your passwords match.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      await registerMutation.mutateAsync({
        username: registerData.username,
        password: registerData.password,
        email: registerData.email
      });
      setLocation("/");
    } catch (error: any) {
      // Toast is handled by mutation onError
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-background">
      <div
        className="fixed inset-0 z-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="z-10 w-full max-w-md px-6"
      >
        <div className="text-center mb-8">
          <h1 className="text-5xl font-serif text-primary mb-2">Luna</h1>
          <p className="text-muted-foreground font-medium">Your private, intelligent companion.</p>
        </div>

        <Card className="bg-white/80 backdrop-blur-xl border-white/50 shadow-xl">
          <Tabs defaultValue="login" className="w-full">
            <CardHeader>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="register">Sign Up</TabsTrigger>
              </TabsList>
            </CardHeader>

            <TabsContent value="login">
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-username">Username or Email</Label>
                    <Input
                      id="login-username"
                      placeholder="sarah@example.com"
                      value={loginData.username}
                      onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                      className="bg-white/50 border-muted-foreground/20 focus-visible:ring-primary"
                      required
                      data-testid="input-username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      className="bg-white/50 border-muted-foreground/20 focus-visible:ring-primary"
                      required
                      data-testid="input-password"
                    />
                  </div>
                  <Button type="submit" className="w-full h-12 text-lg rounded-xl mt-4" disabled={isLoading} data-testid="button-login">
                    {isLoading ? "Signing In..." : "Sign In"}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>

            <TabsContent value="register">
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="sarah@example.com"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      className="bg-white/50 border-muted-foreground/20 focus-visible:ring-primary"
                      required
                      data-testid="input-register-email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-username">Username</Label>
                    <Input
                      id="register-username"
                      placeholder="sarah_m"
                      value={registerData.username}
                      onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                      className="bg-white/50 border-muted-foreground/20 focus-visible:ring-primary"
                      required
                      data-testid="input-register-username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="••••••••"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      className="bg-white/50 border-muted-foreground/20 focus-visible:ring-primary"
                      required
                      data-testid="input-register-password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="••••••••"
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                      className="bg-white/50 border-muted-foreground/20 focus-visible:ring-primary"
                      required
                      data-testid="input-confirm-password"
                    />
                  </div>
                  <Button type="submit" className="w-full h-12 text-lg rounded-xl mt-4" disabled={isLoading} data-testid="button-register">
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>

            <CardFooter className="flex flex-col gap-4 text-center">
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground bg-secondary/10 px-3 py-1.5 rounded-full">
                <ShieldCheck className="w-3 h-3 text-secondary-foreground" />
                <span>End-to-end encrypted & On-device processing</span>
              </div>
            </CardFooter>
          </Tabs>
        </Card>
      </motion.div>
    </div>
  );
}
