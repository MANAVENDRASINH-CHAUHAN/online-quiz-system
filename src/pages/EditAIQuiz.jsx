import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { Badge, Button, Card, Field, Input, Select } from "../components/ui";
import { fetchJson } from "../utils/api";

function EditAIQuiz() {
  const location = useLocation();
  const navigate = useNavigate();
  const quizId = location.state?.quiz_id;
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    if (!quizId) return;

    fetchJson(`get_questions.php?quiz_id=${quizId}`)
      .then((data) => setQuestions(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err));
  }, [quizId]);

  const updateField = (index, field, value) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const saveQuiz = async () => {
    await fetchJson("update_questions.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ questions }),
    });

    alert("Quiz Saved Successfully");
    navigate("/faculty-dashboard");
  };

  return (
    <DashboardLayout
      role="faculty"
      title="Edit Quiz"
      subtitle="Review generated questions and refine answer quality before publishing."
      actions={<Button onClick={saveQuiz}>Save Quiz</Button>}
    >
      <div className="space-y-5">
        {questions.map((question, index) => (
          <Card key={index}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">Question {index + 1}</p>
                <p className="mt-1 text-sm text-slate-400">
                  Edit the wording, options, and the correct answer.
                </p>
              </div>
              <Badge tone="blue">{question.correct_answer || "Choose answer"}</Badge>
            </div>

            <div className="mt-6 grid gap-5">
              <Field label="Question">
                <Input
                  value={question.question}
                  onChange={(e) => updateField(index, "question", e.target.value)}
                />
              </Field>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Option A">
                  <Input
                    value={question.option_a}
                    onChange={(e) => updateField(index, "option_a", e.target.value)}
                  />
                </Field>
                <Field label="Option B">
                  <Input
                    value={question.option_b}
                    onChange={(e) => updateField(index, "option_b", e.target.value)}
                  />
                </Field>
                <Field label="Option C">
                  <Input
                    value={question.option_c}
                    onChange={(e) => updateField(index, "option_c", e.target.value)}
                  />
                </Field>
                <Field label="Option D">
                  <Input
                    value={question.option_d}
                    onChange={(e) => updateField(index, "option_d", e.target.value)}
                  />
                </Field>
              </div>

              <Field label="Correct answer">
                <Select
                  value={question.correct_answer}
                  onChange={(e) => updateField(index, "correct_answer", e.target.value)}
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </Select>
              </Field>
            </div>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}

export default EditAIQuiz;
