import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Car, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        console.error('Login error:', error);
      } else if (data.session) {
        toast.success('Logged in successfully');
        // Auth context will handle profile creation/loading
        navigate('/app');
      }
    } catch (error) {
      toast.error('Login failed');
      console.error('Login exception:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Magic link sent! Check your email');
      }
    } catch (error) {
      toast.error('Failed to send magic link');
      console.error('Magic link error:', error);
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
          <h1 className="text-3xl font-bold text-gray-900 text-center">Log in</h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
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
              className="h-12 text-base"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-lg bg-teal-600 hover:bg-teal-700"
            disabled={loading}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Log in'}
          </Button>
        </form>

        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full h-12 text-base"
            onClick={handleMagicLink}
            disabled={loading}
          >
            Send magic link
          </Button>

          <div className="text-center">
            <Link to="/signup" className="text-teal-600 hover:underline">
              Don't have an account? Create one
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}