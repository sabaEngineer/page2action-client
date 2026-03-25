import { useAuth } from '../context/auth';
import { Link } from 'react-router-dom';

const floatingIcons = [
  { emoji: '\u{1F4D6}', top: '6%',  left: '8%',  size: 'text-3xl', opacity: 'opacity-[0.07]', delay: '0s' },
  { emoji: '\u{1F4A1}', top: '14%', right: '10%', size: 'text-4xl', opacity: 'opacity-[0.06]', delay: '2s' },
  { emoji: '\u270F\uFE0F',  top: '30%', left: '5%',  size: 'text-2xl', opacity: 'opacity-[0.05]', delay: '4s' },
  { emoji: '\u{1F680}', top: '44%', right: '7%',  size: 'text-3xl', opacity: 'opacity-[0.06]', delay: '1s' },
  { emoji: '\u{1F4DA}', top: '58%', left: '9%',  size: 'text-4xl', opacity: 'opacity-[0.07]', delay: '3s' },
  { emoji: '\u2728',    top: '70%', right: '12%', size: 'text-2xl', opacity: 'opacity-[0.05]', delay: '5s' },
  { emoji: '\u{1F9E0}', top: '82%', left: '12%', size: 'text-3xl', opacity: 'opacity-[0.06]', delay: '2s' },
  { emoji: '\u{1F3AF}', top: '90%', right: '9%',  size: 'text-2xl', opacity: 'opacity-[0.05]', delay: '4s' },
];

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="relative min-h-screen bg-gray-950 text-gray-100 overflow-hidden">
      {/* ── Ambient background ── */}
      <div className="pointer-events-none select-none absolute inset-0" aria-hidden>
        <div className="absolute -top-32 -left-32 h-[480px] w-[480px] rounded-full bg-indigo-600/[0.07] blur-[120px]" />
        <div className="absolute -top-20 -right-40 h-[400px] w-[400px] rounded-full bg-violet-600/[0.06] blur-[100px]" />
        <div className="absolute top-[40%] -left-24 h-[360px] w-[360px] rounded-full bg-fuchsia-600/[0.04] blur-[100px]" />
        <div className="absolute top-[55%] -right-20 h-[300px] w-[300px] rounded-full bg-indigo-500/[0.05] blur-[90px]" />
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 h-[400px] w-[600px] rounded-full bg-violet-600/[0.05] blur-[120px]" />

        {floatingIcons.map((ic, i) => (
          <span
            key={i}
            className={`absolute ${ic.size} ${ic.opacity}`}
            style={{
              top: ic.top,
              left: ic.left,
              right: ic.right,
              animation: `landing-float 8s ease-in-out ${ic.delay} infinite`,
            }}
          >
            {ic.emoji}
          </span>
        ))}

        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
        {/* Navbar */}
        <nav className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-5">
          <span className="text-xl font-bold tracking-tight text-white">Page2Action</span>
          {user ? (
            <Link
              to="/books"
              className="text-sm font-medium px-5 py-2.5 bg-white text-gray-950 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Bookshelf
            </Link>
          ) : (
            <a
              href={`${import.meta.env.VITE_API_URL ?? ''}/auth/google`}
              className="inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 bg-white/10 text-white rounded-lg border border-white/10 hover:bg-white/15 transition-colors"
            >
              <GoogleIcon />
              Sign in with Google
            </a>
          )}
        </nav>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl xl:text-5xl font-bold tracking-tight leading-tight text-white text-center lg:whitespace-nowrap">
          Books don{'\u2019'}t change your life.{' '}
          <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            Actions do
          </span>
        </h1>

        <p className="mt-6 text-lg text-gray-400 text-center ">
          Read 30 books or read none {'\u2014'} if you don{'\u2019'}t use it.
          Take one idea and make it real today.
        </p>
        <p className=" text-lg text-gray-400 text-center ">
          We help you remember and use what you read {'\u2014'}{' '}
          <span className="underline decoration-indigo-400/60 underline-offset-4">at the right time</span>,{' '}
          <span className="underline decoration-violet-400/60 underline-offset-4">in the right moment</span>.
        </p>

      </div>

      <style>{`
        @keyframes landing-float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-18px) rotate(6deg); }
        }
      `}</style>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.01 24.01 0 0 0 0 21.56l7.98-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}
