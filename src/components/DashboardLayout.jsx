import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button, ThemeToggle } from "./ui";
import { useTheme } from "./AppProviders";
import { clearActiveQuizSession } from "../utils/quizSession";
import { getLocalStorageItem, removeLocalStorageItem } from "../utils/storage";

function getNavItems(role) {
  if (role === "faculty") {
    return [
      { to: "/faculty-dashboard", label: "Overview" },
      { to: "/add-quiz", label: "Create Quiz" },
      { to: "/all-quizzes", label: "All Quizzes" },
      { to: "/student-results", label: "Results" },
    ];
  }

  return [
    { to: "/student-dashboard", label: "Dashboard" },
    { to: "/start-quiz", label: "Available Quizzes" },
    { to: "/my-scores", label: "My Scores" },
  ];
}

function Sidebar({ role }) {
  const location = useLocation();
  const navItems = getNavItems(role);

  return (
    <aside className="glass-panel hidden w-64 shrink-0 rounded-[28px] p-5 lg:flex lg:flex-col">
      <div className="border-b border-white/30 pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white">
          Online Quiz
        </p>
        <h1 className="mt-3 text-2xl font-bold text-white">
          {role === "faculty" ? "Faculty" : "Student"}
        </h1>
      </div>

      <nav className="mt-5 flex flex-1 flex-col gap-1.5">
        {navItems.map((item) => {
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={[
                "rounded-2xl px-4 py-3 text-sm font-semibold transition",
                active
                  ? "bg-gradient-to-r from-blue-400 to-pink-500 text-white shadow-[0_18px_36px_rgba(236,72,153,0.24)]"
                  : "text-white/80 hover:bg-white/10 hover:text-white",
              ].join(" ")}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

function Topbar({ role, title }) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const personName =
    role === "faculty"
      ? getLocalStorageItem("facultyName") || getLocalStorageItem("facultyId") || "Faculty"
      : getLocalStorageItem("studentName") || "Student";

  const handleLogout = () => {
    clearActiveQuizSession();

    if (role === "faculty") {
      removeLocalStorageItem("facultyName");
      removeLocalStorageItem("facultyId");
      navigate("/faculty-login", { replace: true });
      return;
    }

    removeLocalStorageItem("studentName");
    removeLocalStorageItem("studentId");
    navigate("/student-login", { replace: true });
  };

  return (
    <div className="glass-panel sticky top-4 z-20 flex flex-col gap-4 rounded-[24px] px-5 py-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="text-2xl font-bold text-white">{title}</h2>
      </div>

      <div className="flex items-center gap-3 self-start md:self-center">
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        <div className="flex items-center gap-3 rounded-2xl border border-slate-600 bg-white/10 px-3 py-2 shadow-[0_16px_32px_rgba(15,23,42,0.12)]">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-400 to-pink-500 font-bold text-white">
            {personName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{personName}</p>
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </div>
  );
}

export default function DashboardLayout({ role = "student", title, actions, children }) {
  return (
    <div className="app-shell-bg min-h-screen p-4 lg:p-6">
      <div className="bg-wave-accent" />
      <div className="mx-auto flex max-w-[1540px] gap-6">
        <Sidebar role={role} />

        <div className="min-w-0 flex-1">
          <Topbar role={role} title={title} />

          {actions ? (
            <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
              {actions}
            </div>
          ) : null}

          <main className="fade-up mt-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
