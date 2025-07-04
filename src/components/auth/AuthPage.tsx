import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signUp, signIn } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = isSignUp 
        ? await signUp(email, password)
        : await signIn(email, password);

      if (error) {
        toast({
          title: "Authentication Error",
          description: error.message,
          variant: "destructive"
        });
      } else if (isSignUp) {
        toast({
          title: "Check your email",
          description: "We've sent you a verification link to complete your registration.",
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "You've successfully logged in.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-ghost">
      <div className="w-full max-w-md space-y-8">
        {/* Ghost Logo */}
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-primary rounded-full flex items-center justify-center glow-primary ghost-float">
            <span className="text-3xl">👻</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Ghostcoin
          </h1>
          <p className="text-muted-foreground mt-2">
            Hunt for rewards in the real world
          </p>
        </div>

        <Card className="bg-card/80 backdrop-blur-sm border-border glow-ethereal">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-foreground">
              {isSignUp ? 'Join the Hunt' : 'Welcome Back'}
            </CardTitle>
            <CardDescription>
              {isSignUp 
                ? 'Create your account to start claiming ghost rewards'
                : 'Sign in to continue your ghost hunt'
              }
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-input/50 border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-input/50 border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                variant="cosmic"
                size="mobile"
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Sign In')}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Button
                variant="ghost"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-primary hover:text-primary-glow"
              >
                {isSignUp 
                  ? 'Already have an account? Sign in'
                  : "Don't have an account? Sign up"
                }
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}