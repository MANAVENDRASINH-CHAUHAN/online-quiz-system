import { useEffect, useState } from "react";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

const iconPaths = {
  home: "M3 11.5 12 4l9 7.5v8.5a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
  chart:
    "M5 19V9m7 10V5m7 14v-7M4 21h16",
  quiz:
    "M8 6h8M8 12h8M8 18h5M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",
  trophy:
    "M8 21h8M12 17v4M7 4h10v3a5 5 0 0 1-10 0zM17 6h3a2 2 0 0 1-2 2h-1M7 6H4a2 2 0 0 0 2 2h1",
  sparkles:
    "M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8zM5 17l.9 2.1L8 20l-2.1.9L5 23l-.9-2.1L2 20l2.1-.9zM19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9z",
  search: "M21 21l-4.35-4.35M18 10.5A7.5 7.5 0 1 1 3 10.5a7.5 7.5 0 0 1 15 0z",
  moon: "M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z",
  sun:
    "M12 4V2m0 20v-2m8-8h2M2 12h2m13.66 5.66 1.42 1.42M2.92 4.92l1.42 1.42m12.4-1.42-1.42 1.42M4.34 17.66l-1.42 1.42M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10z",
  command: "M7 7h4v4H7zm6 0h4v4h-4zm-6 6h4v4H7zm6 6h4v4h-4z",
};

export function Icon({ name, className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cx("h-5 w-5", className)}
      aria-hidden="true"
    >
      <path d={iconPaths[name] || iconPaths.sparkles} />
    </svg>
  );
}

export function Button({
  as = "button",
  className = "",
  variant = "primary",
  size = "md",
  ...props
}) {
  const Component = as;
  const variants = {
    primary:
      "bg-gradient-to-r from-cyan-300 via-sky-400 to-fuchsia-500 text-white hover:from-cyan-200 hover:via-sky-300 hover:to-pink-400 shadow-[0_22px_44px_rgba(236,72,153,0.34)]",
    secondary:
      "border border-white/30 bg-white/12 text-white shadow-[0_16px_34px_rgba(15,23,42,0.12)] hover:border-cyan-300 hover:bg-white/18 hover:text-white",
    ghost:
      "bg-transparent text-white/80 hover:bg-white/10 hover:text-white",
    success:
      "bg-gradient-to-r from-emerald-300 via-cyan-300 to-sky-400 text-slate-950 hover:from-emerald-200 hover:via-cyan-200 hover:to-sky-300 shadow-[0_20px_40px_rgba(56,189,248,0.24)]",
    danger:
      "bg-gradient-to-r from-rose-400 to-red-400 text-slate-950 hover:from-rose-300 hover:to-red-300 shadow-[0_18px_34px_rgba(251,113,133,0.2)]",
  };

  const sizes = {
    sm: "h-10 px-4 text-sm rounded-xl",
    md: "h-11 px-5 text-sm rounded-2xl",
    lg: "h-12 px-6 text-sm rounded-2xl",
  };

  return (
    <Component
      className={cx(
        "button-press font-button inline-flex items-center justify-center gap-2 font-semibold",
        "focus:outline-none focus:ring-4 focus:ring-pink-300/50 disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        sizes[size],
        "relative overflow-hidden",
        className
      )}
      {...props}
    />
  );
}

export function Input({ className = "", ...props }) {
  return (
    <input
      className={cx(
        "h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none",
        "border-slate-600 bg-white/10 text-white placeholder:text-white/55 shadow-[0_14px_28px_rgba(15,23,42,0.08)] transition focus:border-pink-400 focus:ring-4 focus:ring-pink-300/20",
        className
      )}
      {...props}
    />
  );
}

export function Select({ className = "", ...props }) {
  return (
    <select
      className={cx(
        "h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none",
        "border-slate-600 bg-white/10 text-white shadow-[0_14px_28px_rgba(15,23,42,0.08)] transition focus:border-pink-400 focus:ring-4 focus:ring-pink-300/20",
        className
      )}
      {...props}
    />
  );
}

export function Card({ className = "", children, ...props }) {
  return (
    <div
      className={cx("surface-card premium-outline floating-card rounded-[28px] p-6", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function Badge({ children, tone = "blue", className = "" }) {
  const tones = {
    blue: "bg-blue-400/20 text-white",
    teal: "bg-cyan-400/20 text-white",
    green: "bg-pink-400/20 text-white",
    amber: "bg-violet-400/20 text-white",
    slate: "bg-white/12 text-white border border-slate-600",
    red: "bg-rose-400/14 text-rose-200",
  };

  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function Field({ label, hint, children }) {
  return (
    <label className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-white">{label}</span>
        {hint ? <span className="font-instruction text-xs text-white/65">{hint}</span> : null}
      </div>
      {children}
    </label>
  );
}

export function Skeleton({ className = "" }) {
  return <div className={cx("skeleton-block rounded-2xl", className)} aria-hidden="true" />;
}

export function AnimatedNumber({ value, suffix = "", duration = 700, className = "" }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const numericValue = Number(value) || 0;
    let frame = 0;
    const totalFrames = Math.max(Math.round(duration / 16), 1);

    const timer = window.setInterval(() => {
      frame += 1;
      const progress = frame / totalFrames;
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(numericValue * eased));
      if (frame >= totalFrames) {
        window.clearInterval(timer);
        setDisplay(numericValue);
      }
    }, 16);

    return () => window.clearInterval(timer);
  }, [duration, value]);

  return <span className={className}>{display}{suffix}</span>;
}

export function CircularProgress({ value = 0, size = 108, stroke = 10, label, sublabel }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(Math.max(value, 0), 100) / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.16)"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#progress-gradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          fill="none"
        />
        <defs>
          <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8CF6E6" />
            <stop offset="55%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-bold text-white">{value}%</span>
        {label ? <span className="text-[11px] uppercase tracking-[0.24em] text-white/60">{label}</span> : null}
        {sublabel ? <span className="font-instruction mt-1 text-xs text-white/60">{sublabel}</span> : null}
      </div>
    </div>
  );
}

export function StatCard({ label, value, helper, accent = "blue" }) {
  const accents = {
    blue: "bg-gradient-to-br from-sky-400/88 to-fuchsia-500/88",
    teal: "bg-gradient-to-br from-emerald-300/88 to-cyan-400/88",
    amber: "bg-gradient-to-br from-violet-400/88 to-pink-500/88",
  };

  return (
    <Card className="card-hover stat-card-glow rounded-[24px] p-0 shadow-sm">
      <div className={cx("px-6 py-5", accents[accent])}>
        <p className="text-sm font-medium text-white/80">{label}</p>
        <p className="mt-3 text-3xl font-bold text-white">
          {typeof value === "number" ? <AnimatedNumber value={value} /> : value}
        </p>
        {helper ? <p className="font-instruction mt-2 text-sm text-white/75">{helper}</p> : null}
      </div>
    </Card>
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <Card className="border-dashed border-slate-600 text-center">
      <div className="mx-auto flex max-w-sm flex-col items-center gap-3 py-6">
        <div className="soft-ring flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-400 to-pink-500 text-lg font-bold text-white">
          <Icon name="sparkles" />
        </div>
        <h3 className="text-lg font-bold text-white">{title}</h3>
        <p className="font-instruction text-sm leading-6 text-white/75">{description}</p>
        {action}
      </div>
    </Card>
  );
}

export function ThemeToggle({ theme, toggleTheme, className = "" }) {
  return (
    <button
      onClick={toggleTheme}
        className={cx(
        "button-press font-button inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white/85 hover:bg-white/16",
        className
      )}
    >
      <Icon name={theme === "dark" ? "sun" : "moon"} className="h-4 w-4" />
      <span>{theme === "dark" ? "Light" : "Dark"}</span>
    </button>
  );
}
