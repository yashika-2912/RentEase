export function Logo({ className = '', size = 40 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="reGrad" x1="6" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2563eb" />
          <stop offset="1" stopColor="#10b981" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="36" height="36" rx="10" fill="url(#reGrad)" />
      <path
        d="M10 18L20 11l10 7v13H10V18z"
        stroke="white"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M15 22h10v9H15z" fill="white" fillOpacity="0.92" />
      <path d="M18 26h4v5h-4z" fill="#0f172a" fillOpacity="0.35" />
    </svg>
  );
}

export function LogoWordmark({ className = '' }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Logo size={36} />
      <div className="leading-tight">
        <div className="text-lg font-semibold tracking-tight text-slate-900">RentEase</div>
        <div className="text-[11px] font-medium uppercase tracking-wide text-brand-600">Platform</div>
      </div>
    </div>
  );
}
