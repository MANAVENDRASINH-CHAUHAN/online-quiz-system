import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { Badge, Card, CircularProgress, EmptyState, Skeleton, StatCard } from "../components/ui";
import { fetchJson } from "../utils/api";

function FacultyAnalytics() {
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

  const averageScore = useMemo(() => {
    if (!results.length) return 0;
    const total = results.reduce((sum, result) => sum + Number(result.score || 0), 0);
    return Math.round(total / results.length);
  }, [results]);

  const byQuiz = useMemo(() => {
    const map = new Map();

    results.forEach((result) => {
      const key = result.quiz_title || "Untitled Quiz";
      const existing = map.get(key) || { title: key, attempts: 0, totalScore: 0 };
      existing.attempts += 1;
      existing.totalScore += Number(result.score || 0);
      map.set(key, existing);
    });

    return Array.from(map.values())
      .map((entry) => ({
        ...entry,
        average: entry.attempts ? Math.round(entry.totalScore / entry.attempts) : 0,
      }))
      .sort((a, b) => b.attempts - a.attempts);
  }, [results]);

  const topStudents = useMemo(() => {
    const map = new Map();

    results.forEach((result) => {
      const key = result.student || "Unknown";
      const existing = map.get(key) || { student: key, attempts: 0, totalScore: 0 };
      existing.attempts += 1;
      existing.totalScore += Number(result.score || 0);
      map.set(key, existing);
    });

    return Array.from(map.values())
      .map((entry) => ({
        ...entry,
        average: entry.attempts ? Math.round(entry.totalScore / entry.attempts) : 0,
      }))
      .sort((a, b) => b.average - a.average)
      .slice(0, 5);
  }, [results]);

  if (loading) {
    return (
      <DashboardLayout role="faculty" title="Analytics">
        <section className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
        </section>
        <section className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <Skeleton className="h-[28rem]" />
          <Skeleton className="h-[28rem]" />
        </section>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="faculty" title="Analytics">
      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Quizzes" value={quizzes.length} helper="Published assessments" accent="blue" />
        <StatCard
          label="Attempts"
          value={results.length}
          helper="All recorded submissions"
          accent="teal"
        />
        <StatCard
          label="Average score"
          value={results.length ? averageScore : "--"}
          helper="Across all attempts"
          accent="amber"
        />
      </section>

      {results.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No analytics yet"
            description="Once students attempt quizzes, this page will summarize trends and performance."
          />
        </div>
      ) : (
        <section className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <Card>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">Quiz Performance</p>
                <p className="mt-1 text-sm text-white/70">
                  Attempts and average scores by quiz.
                </p>
              </div>
              <Badge tone="blue">{byQuiz.length} quizzes</Badge>
            </div>

            <div className="mt-6 space-y-4">
              {byQuiz.map((quiz) => (
                <div
                  key={quiz.title}
                  className="rounded-[24px] border border-white/14 bg-white/10 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">{quiz.title}</p>
                      <p className="mt-1 text-sm text-white/70">{quiz.attempts} attempts</p>
                    </div>
                    <Badge tone="teal">Average {quiz.average}</Badge>
                  </div>

                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/12">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-sky-400 to-fuchsia-500 transition-[width] duration-700"
                      style={{ width: `${Math.min(quiz.average * 10, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <p className="text-sm font-semibold text-white">Top Students</p>
            <p className="mt-1 text-sm text-white/70">Highest average scores across attempts.</p>

            <div className="mt-6 flex justify-center">
              <CircularProgress
                value={averageScore}
                label="Average"
                sublabel="All attempts"
              />
            </div>

            <div className="mt-6 space-y-3">
              {topStudents.map((student, index) => (
                <div
                  key={student.student}
                  className="flex items-center justify-between rounded-[22px] border border-white/14 bg-white/10 px-4 py-4"
                >
                  <div>
                    <p className="font-semibold text-white">
                      {index + 1}. {student.student}
                    </p>
                    <p className="mt-1 text-sm text-white/70">
                      {student.attempts} attempts
                    </p>
                  </div>
                  <Badge tone="blue">Avg {student.average}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </section>
      )}
    </DashboardLayout>
  );
}

export default FacultyAnalytics;
