import { useNavigate } from "react-router-dom";
import { Button, Card, CircularProgress, ThemeToggle } from "./ui";
import { useTheme } from "./AppProviders";

export function ExamHeader({
  title,
  progress,
  answeredCount,
  totalQuestions,
  cameraReady,
  modelLoaded,
  timeLeft,
  securityStatus,
}) {
  return (
    <Card className="rounded-[28px] p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="section-kicker">
            Active Quiz
          </p>
          <h1 className="font-question mt-2 text-2xl font-bold text-white">{title}</h1>
          <p className="font-instruction mt-2 text-sm text-white/70">
            Answer carefully. Navigation is kept minimal to reduce distraction.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[auto_1fr_1fr]">
          <div className="rounded-[24px] border border-white/16 bg-white/10 px-4 py-3">
            <CircularProgress value={progress} label="Progress" sublabel={`${answeredCount}/${totalQuestions}`} />
          </div>
          <div className="rounded-2xl border border-white/16 bg-white/10 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/55">
              Timer
            </p>
            <p className="mt-1 text-lg font-bold text-white">{timeLeft}</p>
          </div>
          <div className="rounded-2xl border border-red-400/45 bg-red-500/12 px-4 py-3 shadow-[0_0_0_1px_rgba(248,113,113,0.14),0_16px_36px_rgba(127,29,29,0.18)]">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#ff6b78] drop-shadow-[0_0_10px_rgba(255,77,95,0.18)]">
              Security
            </p>
            <p className="mt-1 text-sm font-bold text-[#ff4d5f] drop-shadow-[0_0_10px_rgba(255,77,95,0.16)]">
              {securityStatus || (cameraReady && modelLoaded ? "Monitoring active" : "Initializing")}
            </p>
            <p className="font-instruction mt-1 text-xs text-[#ff8692]">
              Face detection, tab watch, and copy lock are enabled.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function ExamLayout({ header, camera, children, onBack }) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="app-shell-bg min-h-screen px-4 py-5 lg:px-6">
      <div className="bg-wave-accent" />
      
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button variant="secondary" size="sm" onClick={() => (onBack ? onBack() : navigate(-1))}>
              Back
            </Button>
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          </div>
          {camera ? <div className="sticky top-4 z-30">{camera}</div> : null}
        </div>

        {header}

        <main className="mt-6">{children}</main>
      </div>
    </div>
  );
}
