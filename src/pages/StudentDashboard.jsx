import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Skeleton,
  StatCard,
} from "../components/ui";
import { useUISound } from "../components/AppProviders";
import { startActiveQuizSession } from "../utils/quizSession";
import { fetchJson } from "../utils/api";
import { getLocalStorageItem, removeLocalStorageItem } from "../utils/storage";

function StudentDashboard() {
  const navigate = useNavigate();
  const { click } = useUISound();
  const [name] = useState(() => getLocalStorageItem("studentName", "Student"));
  const [greeting] = useState(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  });
  const [quizzes, setQuizzes] = useState([]);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const violation = getLocalStorageItem("quizViolation");

    if (violation) {
      alert(violation);
      removeLocalStorageItem("quizViolation");
    }
  }, []);

  useEffect(() => {
    let active = true;
    const studentId = getLocalStorageItem("studentId");
    const resultQuery = new URLSearchParams();

    if (studentId) {
      resultQuery.set("student_id", studentId);
    }

    if (name) {
      resultQuery.set("student", name);
    }

    Promise.all([
      fetchJson("get_quizzes.php"),
      fetchJson(`get_student_results.php?${resultQuery.toString()}`),
    ])
      .then(([quizData, scoreData]) => {
        if (!active) return;
        setQuizzes(Array.isArray(quizData) ? quizData : []);
        setScores(Array.isArray(scoreData) ? scoreData : []);
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [name]);

  const averageScore = scores.length
    ? Math.round(
      scores.reduce((sum, entry) => sum + Number(entry.score || 0), 0) / scores.length
    )
    : 0;

  const handleStartQuiz = (quiz) => {
    click();
    startActiveQuizSession({
      quizId: quiz.id,
      duration: quiz.duration,
      title: quiz.title,
    });
    navigate("/take-quiz");
  };

  if (loading) {
    return (
      <DashboardLayout role="student" title={`${greeting}, ${name}`}>
        <section className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
        </section>
        <section className="mt-6 grid gap-6 xl:grid-cols-[1.7fr_1fr]">
          <Skeleton className="h-[24rem]" />
          <Skeleton className="h-[24rem]" />
        </section>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student" title={`${greeting}, ${name}`}>
      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Available quizzes" value={quizzes.length} helper="Ready to start" accent="blue" />
        <StatCard label="Completed attempts" value={scores.length} helper="Tracked automatically" accent="teal" />
        <StatCard label="Average score" value={scores.length ? averageScore : 0} helper="Across submissions" accent="amber" />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-white">Available Quizzes</p>
            <Button variant="ghost" size="sm" onClick={() => navigate("/start-quiz")}>
              See all
            </Button>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {quizzes.slice(0, 4).map((quiz) => (
              <div
                key={quiz.id}
                className="floating-card glow-ring rounded-[20px] border border-white/16 bg-white/10 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-white">{quiz.title}</h3>
                    <p className="mt-2 text-sm text-white/70">
                      {quiz.total_questions} questions
                    </p>
                  </div>
                  <Badge tone="blue">{quiz.duration} min</Badge>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <span />
                  <Button
                    size="sm"
                    onClick={() => handleStartQuiz(quiz)}
                  >
                    Start
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {quizzes.length === 0 ? (
            <div className="mt-5">
              <EmptyState
                title="No quizzes available yet"
                description="Once faculty publishes quizzes, they will appear here."
              />
            </div>
          ) : null}
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-white">Recent Results</p>
            <Badge tone="amber">{scores.length}</Badge>
          </div>

          <div className="mt-5 space-y-3">
            {scores.slice(0, 5).map((score, index) => (
              <div
                key={`${score.title}-${index}`}
                className="rounded-[20px] border border-white/14 bg-white/10 px-4 py-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{score.title}</p>
                    <p className="mt-1 text-sm text-white/65">{score.submitted_at}</p>
                  </div>
                  <Badge tone="blue">Score {score.score}</Badge>
                </div>
              </div>
            ))}
          </div>

          {scores.length === 0 ? (
            <div className="mt-5">
              <EmptyState
                title="No quiz attempts yet"
                description="Start your first quiz to see results and progress here."
                action={
                  <Button size="sm" onClick={() => navigate("/start-quiz")}>
                    Quizzes
                  </Button>
                }
              />
            </div>
          ) : null}
        </Card>
      </section>
    </DashboardLayout>
  );
}

export default StudentDashboard;
