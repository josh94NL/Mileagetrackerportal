import { Link } from 'react-router';
import { Home } from 'lucide-react';
import { motion } from 'motion/react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#07070e] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[50%] -translate-x-1/2 w-[500px] h-[500px] bg-[#8B5CF6]/8 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-5 relative z-10"
      >
        <div className="text-8xl font-bold bg-gradient-to-b from-white/20 to-white/[0.03] bg-clip-text text-transparent">
          404
        </div>
        <h2 className="text-xl font-semibold text-white">Page not found</h2>
        <p className="text-[#8888a4] text-sm max-w-xs mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/">
          <button className="h-11 px-6 rounded-xl bg-gradient-to-r from-[#00E5A0] to-[#00CC8E] text-[#07070e] font-semibold text-sm flex items-center gap-2 mx-auto hover:shadow-[0_0_20px_rgba(0,229,160,0.25)] transition-all">
            <Home className="w-4 h-4" />
            Go Home
          </button>
        </Link>
      </motion.div>
    </div>
  );
}
