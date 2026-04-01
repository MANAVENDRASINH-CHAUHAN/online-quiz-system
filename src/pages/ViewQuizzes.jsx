import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { Badge, Button, Card, EmptyState, Input } from "../components/ui";
import { fetchJson } from "../utils/api";

function ViewQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchJson("get_quizzes.php")
      .then((data) => setQuizzes(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err));
  }, []);

  const filtered = quizzes.filter((quiz) =>
    quiz.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <DashboardLayout
      role="faculty"
      title="All Quizzes"
      subtitle="Review your quiz library, filter by title, and open an editor."
    >
      <Card>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-sm font-semibold text-slate-900">Quiz Inventory</p>
          <div className="w-full md:max-w-sm">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search quizzes"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              title="No quizzes found"
              description="Create a quiz first or adjust your search criteria."
            />
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((quiz) => (
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

                <Button
                  className="mt-5"
                  size="sm"
                  onClick={() =>
                    navigate("/edit-ai-quiz", {
                      state: { quiz_id: quiz.id },
                    })
                  }
                >
                  Edit
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
}

export default ViewQuizzes;
