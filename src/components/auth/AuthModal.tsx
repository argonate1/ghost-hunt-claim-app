import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSignUp?: boolean;
}

export function AuthModal({ isOpen, onClose, defaultSignUp = false }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(defaultSignUp);
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
        onClose();
      } else {
        toast({
          title: "Welcome back!",
          description: "You've successfully logged in.",
        });
        onClose();
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-sm border-border">
        <DialogHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-full flex items-center justify-center glow-primary p-2">
            <img src="/lovable-uploads/bd75dab4-c683-46eb-947e-050d35a0f536.png" alt="Ghostcoin Logo" className="w-full h-full object-contain" />
          </div>
          <DialogTitle className="text-2xl text-foreground">
            {isSignUp ? 'Join the Hunt' : 'Welcome Back'}
          </DialogTitle>
          <DialogDescription>
            {isSignUp 
              ? 'Create your account to start claiming ghost rewards'
              : 'Sign in to continue your ghost hunt'
            }
          </DialogDescription>
        </DialogHeader>

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

        <div className="text-center">
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
      </DialogContent>
    </Dialog>
  );
}