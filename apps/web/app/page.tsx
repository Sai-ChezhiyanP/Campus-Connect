import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle,
  GraduationCap,
  Layers,
  Lock,
  Megaphone,
  QrCode,
  Shield,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Users,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-950 text-slate-100 relative overflow-hidden selection:bg-sky-500 selection:text-slate-950">
      {/* Cosmic Glow Mesh */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-slate-950/60 backdrop-blur-xl px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center font-bold text-slate-950 shadow-lg shadow-sky-500/25">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-white">Campus Connect</span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 font-bold border border-sky-500/25 uppercase tracking-wider">
                SRMIST Ramapuram
              </span>
            </div>
            <p className="text-xs text-slate-400">Integrated Android Application & Management Platform</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-sky-500/25 cursor-pointer"
          >
            <Lock className="h-4 w-4" />
            <span>Sign In to Portal</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-16 flex-1 flex flex-col items-center justify-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/25 text-sky-400 text-xs font-bold uppercase tracking-wider mb-6 backdrop-blur-md">
          <ShieldCheck className="h-4 w-4" /> Official Digital Campus Ecosystem
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight max-w-4xl leading-tight">
          Unified Campus Communication for{' '}
          <span className="bg-gradient-to-r from-sky-400 via-indigo-300 to-amber-300 bg-clip-text text-transparent">
            SRMIST Ramapuram
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed">
          Real-time synchronized events, verified faculty bulletins, smart personalized feeds, and concurrency-safe registration passes powering thousands of students and faculty.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/login"
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-extrabold text-sm transition-all shadow-xl shadow-sky-500/30 flex items-center gap-2 cursor-pointer"
          >
            <Lock className="h-4 w-4" />
            <span>Access Single Login Gateway</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#architecture"
            className="px-6 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-200 font-bold text-sm transition-all flex items-center gap-2 backdrop-blur-md"
          >
            <Smartphone className="h-4 w-4 text-sky-400" />
            <span>Mobile App Architecture</span>
          </a>
        </div>

        {/* Role Routing Showcase Glass Cards */}
        <div className="mt-16 w-full max-w-4xl backdrop-blur-2xl bg-slate-900/40 border border-white/10 rounded-3xl p-6 text-left shadow-2xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" /> Unified Single Login with Smart Redirection
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                One sign-in page dynamically authorizes and routes each institutional role to their dedicated hub
              </p>
            </div>
            <Link href="/login" className="text-xs font-bold text-sky-400 hover:underline">
              Test Sign-In →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-red-500/20">
              <div className="h-8 w-8 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 text-xs font-bold mb-3">
                <Shield className="h-4 w-4" />
              </div>
              <h4 className="text-xs font-extrabold text-white">Administrator</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Routes directly to the <strong className="text-slate-200">Approval Queue</strong>, audit logs, and user directory.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-emerald-500/20">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xs font-bold mb-3">
                <Megaphone className="h-4 w-4" />
              </div>
              <h4 className="text-xs font-extrabold text-white">Faculty Member</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Routes directly to the <strong className="text-slate-200">Bulletin Hub</strong> for targeting departmental notices.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-purple-500/20">
              <div className="h-8 w-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 text-xs font-bold mb-3">
                <Calendar className="h-4 w-4" />
              </div>
              <h4 className="text-xs font-extrabold text-white">Club Coordinator</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Routes directly to <strong className="text-slate-200">Event Submissions</strong> with real-time capacity guards.
              </p>
            </div>
          </div>
        </div>

        {/* Core Pillars Grid */}
        <div id="architecture" className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-sky-500/30 transition-all backdrop-blur-md">
            <div className="h-12 w-12 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-4 border border-sky-500/20">
              <Megaphone className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-base text-white mb-2">Faculty Bulletin Hub</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Targeted academic broadcasting scoped to campus, specific engineering departments, 18 B.Tech programmes, batches, or sections with audit logs.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-indigo-500/30 transition-all backdrop-blur-md">
            <div className="h-12 w-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4 border border-indigo-500/20">
              <Calendar className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-base text-white mb-2">Events & Concurrency Registration</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Full lifecycle management from draft submission to admin approval. Concurrency-safe slot booking with cryptographic QR passes and .ics calendar exports.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-amber-500/30 transition-all backdrop-blur-md">
            <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4 border border-amber-500/20">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-base text-white mb-2">Personalized Smart Feed</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Three customizable modes (Smart, Custom, Hybrid) scoring content based on student programme, year, followed clubs, and approaching deadlines.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-slate-950/80 px-8 py-6 text-center text-xs text-slate-500">
        <p>© 2026 SRM Institute of Science and Technology, Ramapuram Campus • Campus Connect Engineering</p>
      </footer>
    </div>
  );
}
