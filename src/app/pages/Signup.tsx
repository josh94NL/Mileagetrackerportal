import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Car, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { apiRequest, supabase } from '../lib/supabase';
import { toast } from 'sonner';

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create user via server
      const signupResponse = await apiRequest('/signup', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });

      if (signupResponse.error) {
        toast.error(signupResponse.error);
        console.error('Signup error:', signupResponse.error);
        setLoading(false);
        return;
      }

      // Now sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        console.error('Sign in after signup error:', error);
      } else {
        toast.success('Account created successfully!');
        navigate('/app');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Signup failed';
      toast.error(errorMessage);
      console.error('Signup exception:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white flex flex-col p-4">
      <div className="max-w-md w-full mx-auto mt-8 space-y-8">
        <div className="space-y-4">
          <Link to="/" className="flex justify-center">
            <div className="bg-teal-600 p-3 rounded-full">
              <Car className="w-8 h-8 text-white" />
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 text-center">Create account</h1>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-12 text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="h-12 text-base"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-lg bg-teal-600 hover:bg-teal-700"
            disabled={loading}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create account'}
          </Button>
        </form>

        <div className="text-center">
          <Link to="/login" className="text-teal-600 hover:underline">
            Already have an account? Log in
          </Link>
        </div>
      </div>
    </div>
  );
}