import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Car, Loader2, Mail, Lock, User } from 'lucide-react';
import { apiRequest, supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { Logo } from '../components/Logo';

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

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        console.error('Sign in after signup error:', error);
      } else if (data.session) {
        toast.success('Account created!');
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
    <div className="min-h-screen bg-[#07070e] text-white relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-15%] w-[500px] h-[500px] bg-[#8B5CF6]/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-[#00E5A0]/6 rounded-full blur-[100px] pointer-events-none" />

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
          <h1 className="text-3xl font-bold tracking-tight">Create account</h1>
          <p className="text-[#8888a4]">Start tracking your mileage in seconds</p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          onSubmit={handleSignup}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <label className="text-sm text-[#8888a4] font-medium">Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#4a4a66]" />
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full h-13 pl-12 pr-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-[#4a4a66] focus:outline-none focus:border-[#00E5A0]/40 focus:bg-white/[0.06] transition-all"
              />
            </div>
          </div>

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
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full h-13 pl-12 pr-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-[#4a4a66] focus:outline-none focus:border-[#00E5A0]/40 focus:bg-white/[0.06] transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full h-13 rounded-xl bg-gradient-to-r from-[#00E5A0] to-[#00CC8E] text-[#07070e] font-semibold text-base flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(0,229,160,0.25)] transition-all duration-300 active:scale-[0.98] disabled:opacity-50"
            disabled={loading}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create account'}
          </button>
        </motion.form>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center text-sm text-[#8888a4] mt-6"
        >
          Already have an account?{' '}
          <Link to="/login" className="text-[#00E5A0] hover:underline font-medium">
            Sign in
          </Link>
        </motion.p>
      </div>
    </div>
  );
}