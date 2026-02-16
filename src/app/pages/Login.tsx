import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Car, Loader2, Mail, Lock, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { Logo } from '../components/Logo';

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
        toast.success('Welcome back!');
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
    <div className="min-h-screen bg-[#07070e] text-white relative overflow-hidden">
      <div className="absolute top-[-30%] right-[-20%] w-[500px] h-[500px] bg-[#00E5A0]/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] bg-[#8B5CF6]/6 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-md w-full mx-auto px-6 pt-12 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link to="/" className="inline-flex items-center gap-2.5 mb-12">
            <Logo size={40} />
            <span className="font-semibold text-lg tracking-tight">Mileage Tracker</span>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-2 mb-8"
        >
          <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-[#8888a4]">Sign in to continue tracking your trips</p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          onSubmit={handleLogin}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <label className="text-sm text-[#8888a4] font-medium">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#4a4a66]" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-13 pl-12 pr-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-[#4a4a66] focus:outline-none focus:border-[#00E5A0]/40 focus:bg-white/[0.06] transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm text-[#8888a4] font-medium">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#4a4a66]" />
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-13 pl-12 pr-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-[#4a4a66] focus:outline-none focus:border-[#00E5A0]/40 focus:bg-white/[0.06] transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full h-13 rounded-xl bg-gradient-to-r from-[#00E5A0] to-[#00CC8E] text-[#07070e] font-semibold text-base flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(0,229,160,0.25)] transition-all duration-300 active:scale-[0.98] disabled:opacity-50"
            disabled={loading}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign in'}
          </button>
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-6 space-y-4"
        >
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/[0.06]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#07070e] px-3 text-[#4a4a66]">Or</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleMagicLink}
            disabled={loading}
            className="w-full h-13 rounded-xl border border-white/[0.08] bg-white/[0.02] text-white font-medium flex items-center justify-center gap-2 hover:bg-white/[0.05] hover:border-white/[0.12] transition-all duration-300 active:scale-[0.98] disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
            Send magic link
          </button>

          <p className="text-center text-sm text-[#8888a4]">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#00E5A0] hover:underline font-medium">
              Create one
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}