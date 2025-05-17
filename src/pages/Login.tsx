
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const Login = () => {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { loginWithUsername } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) {
      toast.error('Please enter your username');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await loginWithUsername(username);
      if (!success) {
        setIsLoading(false);
      }
      // If successful, the page will reload via the login function
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An unexpected error occurred');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle className="text-2xl">Phone Sales Manager</CardTitle>
          <CardDescription>
            Enter your username to access the application
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </CardFooter>
        </form>
        
        <div className="px-6 pb-4 text-center text-xs text-gray-500">
          <p className="mt-2">Note: Make sure usernames exist in your profiles table</p>
        </div>
      </Card>
    </div>
  );
};

export default Login;
