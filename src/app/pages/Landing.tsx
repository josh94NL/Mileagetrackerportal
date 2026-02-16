import { Link } from 'react-router';
import { Car, Zap, Shield, Smartphone, ArrowRight, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Logo } from '../components/Logo';

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#07070e] text-white overflow-hidden relative">
      {/* Ambient glow effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#00E5A0]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#8B5CF6]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-lg mx-auto min-h-screen flex flex-col px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="pt-8 flex items-center gap-2.5"
        >
          <Logo size={36} />
          <span className="font-semibold text-lg tracking-tight">Mileage Tracker</span>
        </motion.div>

        {/* Hero */}
        <div className="flex-1 flex flex-col justify-center py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00E5A0]/10 border border-[#00E5A0]/20 text-[#00E5A0] text-sm font-medium">
              <Zap className="w-3.5 h-3.5" />
              Log trips in under 10 seconds
            </div>

            <h1 className="text-4xl md:text-5xl font-bold leading-[1.1] tracking-tight">
              Track every
              <br />
              <span className="bg-gradient-to-r from-[#00E5A0] to-[#06D6A0] bg-clip-text text-transparent">
                kilometre
              </span>
              <br />
              effortlessly.
            </h1>

            <p className="text-[#8888a4] text-lg leading-relaxed max-w-sm">
              The fastest way to log business and private trips. Smart defaults, one-tap actions, instant reports.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 space-y-3"
          >
            <Link to="/signup" className="block">
              <button className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#00E5A0] to-[#00CC8E] text-[#07070e] font-semibold text-lg flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(0,229,160,0.3)] transition-all duration-300 active:scale-[0.98]">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            <Link to="/login" className="block">
              <button className="w-full h-14 rounded-2xl border border-white/10 bg-white/[0.03] text-white font-medium text-lg hover:bg-white/[0.06] hover:border-white/15 transition-all duration-300 active:scale-[0.98]">
                Sign in
              </button>
            </Link>
          </motion.div>

          {/* Features pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-12 grid grid-cols-3 gap-3"
          >
            {[
              { icon: Zap, label: 'Lightning Fast' },
              { icon: Shield, label: 'Secure' },
              { icon: Smartphone, label: 'Mobile First' },
            ].map((item) => (
              <div
                key={item.label}
                className="flex flex-col items-center gap-2 py-4 px-2 rounded-2xl bg-white/[0.03] border border-white/[0.06]"
              >
                <item.icon className="w-5 h-5 text-[#00E5A0]" />
                <span className="text-xs text-[#8888a4] font-medium text-center">{item.label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="pb-8 text-center text-xs text-[#4a4a66]"
        >
          Built for speed. Designed for simplicity.
        </motion.div>
      </div>
    </div>
  );
}