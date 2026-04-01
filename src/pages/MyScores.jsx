import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { Badge, Card, CircularProgress, EmptyState, Skeleton, StatCard } from "../components/ui";
import { fetchJson } from "../utils/api";
import { getLocalStorageItem } from "../utils/storage";

function MyScores() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const studentName = getLocalStorageItem("studentName");
    const studentId = getLocalStorageItem("studentId");
    const resultQuery = new URLSearchParams();

    if (studentId) {
      resultQuery.set("student_id", studentId);
    }

    if (studentName) {
      resultQuery.set("student", studentName);
    }

    fetchJson(`get_student_results.php?${resultQuery.toString()}`)
      .then((data) => setScores(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const totalScore = scores.reduce((sum, entry) => sum + Number(entry.score || 0), 0);
  const averageScore = scores.length ? Math.round(totalScore / scores.length) : 0;
  const bestScore = scores.length
    ? Math.max(...scores.map((entry) => Number(entry.score || 0)))
    : 0;

  if (loading) {
    return (
      <DashboardLayout role="student" title="My Scores">
        <section className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
        </section>
        <Skeleton className="mt-6 h-[28rem]" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student" title="My Scores">
      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Attempts" value={scores.length} helper="Completed quizzes" accent="blue" />
        <StatCard
          label="Average score"
          value={scores.length ? averageScore : "--"}
          helper="Across all attempts"
          accent="teal"
        />
        <StatCard
          label="Best score"
          value={scores.length ? bestScore : "--"}
          helper="Highest recorded result"
          accent="amber"
        />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_1.4fr]">
        <Card className="glow-ring">
          <p className="text-sm font-semibold text-white">Performance Ring</p>
          <div className="mt-6 flex justify-center">
            <CircularProgress
              value={scores.length ? averageScore * 10 : 0}
              label="Average"
              sublabel={scores.length ? `${averageScore}/10 equivalent` : "Start a quiz"}
            />
          </div>
          <div className="mt-6 grid gap-3">
            <div className="rounded-[20px] border border-white/14 bg-white/10 px-4 py-3 text-sm text-white/80">
              Best score: <span className="font-semibold text-white">{bestScore}</span>
            </div>
            <div className="rounded-[20px] border border-white/14 bg-white/10 px-4 py-3 text-sm text-white/80">
              Recent momentum: <span className="font-semibold text-white">{scores.length >= 3 ? "On track" : "Build streak"}</span>
            </div>
          </div>
        </Card>

        <Card className="mt-0">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white">Result History</p>
              <p className="mt-1 text-sm text-white/70">
                Each entry shows the quiz title, score, and submission time.
              </p>
            </div>
            <Badge tone="blue">{scores.length} entries</Badge>
          </div>

          {scores.length === 0 ? (
            <div className="mt-6">
              <EmptyState
                title="No quiz attempts yet"
                description="Once you complete a quiz, the result history will appear here."
              />
            </div>
          ) : (
            <div className="mt-6 overflow-hidden rounded-[24px] border border-white/14">
              <div className="grid grid-cols-[1.5fr_0.6fr_1fr] bg-white/10 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-white/65">
                <span>Quiz</span>
                <span>Score</span>
                <span>Submitted</span>
              </div>

              {scores.map((score, index) => (
                <div
                  key={`${score.title}-${index}`}
                  className="grid grid-cols-[1.5fr_0.6fr_1fr] items-center border-t border-white/10 px-5 py-4 text-sm"
                >
                  <span className="font-semibold text-white">{score.title}</span>
                  <span className="font-semibold text-cyan-200">{score.score}</span>
                  <span className="text-white/70">{score.submitted_at || "--"}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </section>

    </DashboardLayout>
  );
}

export default MyScores;
