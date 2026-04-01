import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { Badge, Card, EmptyState, Select } from "../components/ui";
import { fetchJson } from "../utils/api";

function ViewStudentResults() {
  const [quizzes, setQuizzes] = useState([]);
  const [results, setResults] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchJson("get_quiz_list.php")
      .then((data) => setQuizzes(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err));
  }, []);

  const loadResults = (quizTitle) => {
    setSelectedQuiz(quizTitle);
    setResults([]);

    if (!quizTitle) {
      return;
    }

    setLoading(true);

    fetchJson(`get_quiz_results.php?quiz_title=${encodeURIComponent(quizTitle)}`)
      .then((data) => {
        setResults(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const averageScore = useMemo(() => {
    if (!results.length) return 0;
    const sum = results.reduce((acc, entry) => acc + Number(entry.score || 0), 0);
    return Math.round(sum / results.length);
  }, [results]);

  return (
    <DashboardLayout
      role="faculty"
      title="Student Results"
      subtitle="Filter by quiz title to review attempts, submission times, and outcomes."
    >
      <Card>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="w-full max-w-md">
            <p className="mb-2 text-sm font-semibold text-slate-900">Select quiz</p>
            <Select value={selectedQuiz} onChange={(e) => loadResults(e.target.value)}>
              <option value="">Choose a quiz</option>
              {quizzes.map((quiz) => (
                <option key={quiz.id} value={quiz.title}>
                  {quiz.title}
                </option>
              ))}
            </Select>
          </div>

          {selectedQuiz ? (
            <div className="flex flex-wrap gap-3">
              <Badge tone="blue">{results.length} attempts</Badge>
              <Badge tone="teal">Average {averageScore}</Badge>
            </div>
          ) : null}
        </div>

        {loading ? (
          <p className="mt-6 text-sm text-slate-500">Loading results...</p>
        ) : null}

        {!loading && selectedQuiz && results.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              title="No attempts for this quiz"
              description="Choose another quiz or wait until students submit attempts."
            />
          </div>
        ) : null}

        {!loading && results.length > 0 ? (
          <div className="mt-6 overflow-hidden rounded-[24px] border border-blue-100">
            <div className="grid grid-cols-[1.1fr_1.4fr_0.6fr_1fr] bg-blue-50/80 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <span>Student</span>
              <span>Quiz</span>
              <span>Score</span>
              <span>Submitted</span>
            </div>

            {results.map((result, index) => (
              <div
                key={`${result.student}-${index}`}
                className="grid grid-cols-[1.1fr_1.4fr_0.6fr_1fr] items-center border-t border-blue-50 px-5 py-4 text-sm"
              >
                <span className="font-semibold text-slate-900">{result.student}</span>
                <span className="text-slate-600">{result.quiz_title}</span>
                <span className="font-semibold text-blue-700">{result.score}</span>
                <span className="text-slate-500">{result.submitted_at || "--"}</span>
              </div>
            ))}
          </div>
        ) : null}
      </Card>
    </DashboardLayout>
  );
}

export default ViewStudentResults;
