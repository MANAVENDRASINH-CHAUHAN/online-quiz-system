import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { Card, Icon, Skeleton, StatCard } from "../components/ui";
import { useUISound } from "../components/AppProviders";
import { fetchJson } from "../utils/api";
import { getLocalStorageItem } from "../utils/storage";

function FacultyDashboard() {
  const navigate = useNavigate();
  const { click } = useUISound();
  const [name] = useState(
    () => getLocalStorageItem("facultyName") || getLocalStorageItem("facultyId") || "Faculty"
  );
  const [quizzes, setQuizzes] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    Promise.all([
      fetchJson("get_quizzes.php"),
      fetchJson("get_all_results.php"),
    ])
      .then(([quizData, resultData]) => {
        if (!active) return;
        setQuizzes(Array.isArray(quizData) ? quizData : []);
        setResults(Array.isArray(resultData) ? resultData : []);
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const averageScore = results.length
    ? Math.round(results.reduce((sum, item) => sum + Number(item.score || 0), 0) / results.length)
    : 0;
  const activeStudents = new Set(results.map((entry) => entry.student).filter(Boolean)).size;

  if (loading) {
    return (
      <DashboardLayout role="faculty" title={`Welcome, ${name}`}>
        <section className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
        </section>
        <section className="mt-6 grid gap-6 xl:grid-cols-[1.45fr_1fr]">
          <Skeleton className="h-[24rem]" />
          <Skeleton className="h-[24rem]" />
        </section>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="faculty" title={`Welcome, ${name}`}>
      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Published quizzes" value={quizzes.length} helper="Active assessment library" accent="blue" />
        <StatCard label="Recorded attempts" value={results.length} helper="Student submissions across quizzes" accent="teal" />
        <StatCard label="Average score" value={averageScore} helper={`${activeStudents} active students`} accent="amber" />
      </section>

      <section className="mt-6">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-white">Quick Actions</p>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Add Quiz",
                description: "Create a manual or AI-assisted assessment.",
                icon: "quiz",
                action: () => navigate("/add-quiz"),
              },
              {
                title: "View Quizzes",
                description: "Review and edit the current quiz library.",
                icon: "home",
                action: () => navigate("/all-quizzes"),
              },
              {
                title: "Student Results",
                description: "Check quiz-wise attempts and outcomes.",
                icon: "chart",
                action: () => navigate("/student-results"),
              },
            ].map((item) => (
              <button
                key={item.title}
                onClick={() => {
                  click();
                  item.action();
                }}
                className="card-hover glow-ring rounded-[24px] border border-white/14 bg-white/10 p-5 text-left"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white">
                  <Icon name={item.icon} />
                </div>
                <p className="mt-4 text-lg font-bold text-white">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-white/72">{item.description}</p>
              </button>
            ))}
          </div>
        </Card>
      </section>
    </DashboardLayout>
  );
}

export default FacultyDashboard;
