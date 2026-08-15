// Subtle background decoration for the homepage hero — medals, a plane,
// a globe, a compass — evoking both academic competition (olympiad
// medals) and the exchange-program side of the site (travel). Purely
// decorative: absolutely positioned, low-opacity, pointer-events-none,
// so it never competes with the actual headline/CTA for attention.

function Medal({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="7" />
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
    </svg>
  );
}

function Plane({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
    </svg>
  );
}

function Globe({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function Compass({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}

export default function HeroDecorations() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden text-white">
      <Medal className="absolute -left-4 top-10 h-16 w-16 -rotate-12 opacity-20 sm:left-6 sm:top-16" />
      <Plane className="absolute right-4 top-12 h-10 w-10 rotate-45 opacity-25 sm:right-16 sm:top-20" />
      <Globe className="absolute -left-6 bottom-8 h-20 w-20 opacity-[0.12] sm:left-10 sm:bottom-10" />
      <Compass className="absolute right-2 bottom-12 h-14 w-14 rotate-12 opacity-20 sm:right-20 sm:bottom-16" />
      <Medal className="absolute right-8 top-1/2 hidden h-8 w-8 rotate-6 opacity-[0.15] md:block" />
      <Plane className="absolute left-1/3 bottom-4 hidden h-6 w-6 -rotate-[20deg] opacity-[0.15] md:block" />
    </div>
  );
}
