import { useNavigate } from "react-router-dom";
import { useTheme } from "./AppProviders";
import { ThemeToggle } from "./ui";

function Layout({ children, title, showBack = false, eyebrow, backTo }) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="app-shell-bg panel-grid min-h-screen px-4 py-6 lg:px-6 lg:py-10">
      <div className="bg-wave-accent" />
      <div className="mx-auto mb-6 flex max-w-6xl items-center justify-end gap-3">
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      </div>
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="hidden lg:block">
          <div className="max-w-xl">
            <p className="section-kicker">
              {eyebrow || "Online Quiz System"}
            </p>
            <h1 className="mt-5 text-5xl font-bold leading-tight text-white">
              Clean quiz workflows for students and faculty.
            </h1>
          </div>
        </section>

        <section className="glass-panel premium-outline mx-auto w-full max-w-xl rounded-[36px] p-6 sm:p-8 lg:mx-0 lg:p-10">
          <div className="flex items-center justify-between gap-4">
            <div>
              {title ? <h2 className="text-3xl font-bold text-white">{title}</h2> : null}
            </div>
            {showBack ? (
              <button
                onClick={() => navigate(backTo || -1)}
                className="button-press rounded-2xl border border-slate-600 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:border-pink-400 hover:bg-pink-400/10"
              >
                Back
              </button>
            ) : null}
          </div>

          <div className="mt-8">{children}</div>
        </section>
      </div>
    </div>
  );
}

export default Layout;
