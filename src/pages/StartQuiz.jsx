import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { Badge, Button, Card, EmptyState, Input } from "../components/ui";
import { startActiveQuizSession } from "../utils/quizSession";
import { fetchJson } from "../utils/api";

function StartQuiz() {
  const [quizzes, setQuizzes] = useState([]);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchJson("get_quizzes.php")
      .then((data) => setQuizzes(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err));
  }, []);

  const filteredQuizzes = quizzes.filter((quiz) =>
    quiz.title.toLowerCase().includes(query.toLowerCase())
  );

  const handleStartQuiz = (quiz) => {
    startActiveQuizSession({
      quizId: quiz.id,
      duration: quiz.duration,
      title: quiz.title,
    });
    navigate("/take-quiz");
  };

  return (
    <DashboardLayout
      role="student"
      title="Available Quizzes"
      subtitle="Start a quiz from the current library. Search helps when the list grows."
    >
      <Card>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-sm font-semibold text-slate-900">Quiz Library</p>
          <div className="w-full md:max-w-sm">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search quiz title"
            />
          </div>
        </div>

        {filteredQuizzes.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              title="No quizzes matched"
              description="Try a different search or come back once new quizzes are published."
            />
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredQuizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="card-hover rounded-[24px] border border-blue-100 bg-white/90 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{quiz.title}</h3>
                    <p className="mt-2 text-sm text-slate-500">
                      {quiz.total_questions} questions
                    </p>
                  </div>
                  <Badge tone="blue">{quiz.duration} min</Badge>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <Badge tone="slate">Ready</Badge>
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
        )}
      </Card>
    </DashboardLayout>
  );
}

export default StartQuiz;
