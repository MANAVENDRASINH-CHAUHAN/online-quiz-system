import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { Badge, Button, Card, Field, Input, Select } from "../components/ui";
import { fetchJson } from "../utils/api";
import { getLocalStorageItem } from "../utils/storage";

function CreateQuiz() {
  const navigate = useNavigate();
  const quizId = getLocalStorageItem("quiz_id");
  const [question, setQuestion] = useState("");
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [c, setC] = useState("");
  const [d, setD] = useState("");
  const [correct, setCorrect] = useState("");
  const [questions, setQuestions] = useState([]);

  const questionCountLabel = useMemo(() => `${questions.length} added`, [questions.length]);

  const addQuestion = () => {
    if (!question || !a || !b || !c || !d || !correct) {
      alert("Please fill all fields");
      return;
    }

    const newQuestion = { question, a, b, c, d, correct };
    setQuestions((prev) => [...prev, newQuestion]);
    alert("Question Added");
    setQuestion("");
    setA("");
    setB("");
    setC("");
    setD("");
    setCorrect("");
  };

  const saveQuiz = async () => {
    if (questions.length === 0) {
      alert("Add at least 1 question");
      return;
    }

    try {
      const data = await fetchJson("create_question.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quiz_id: quizId,
          questions,
        }),
      });

      if (data.status === "success") {
        alert("Quiz Saved Successfully");
        navigate("/faculty-dashboard");
      } else {
        alert(data.message || "Error Saving Quiz");
      }
    } catch (error) {
      console.error(error);
      alert("Server Error");
    }
  };

  return (
    <DashboardLayout
      role="faculty"
      title="Question Builder"
      subtitle="Add each question with four options, then save the full quiz."
      actions={<Badge tone="blue">Step 2 of 2</Badge>}
    >
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">Compose Question</p>
              <p className="mt-1 text-sm text-slate-500">
                Structure each item clearly so students can respond quickly.
              </p>
            </div>
            <Badge tone="teal">{questionCountLabel}</Badge>
          </div>

          <div className="mt-6 grid gap-5">
            <Field label="Question">
              <Input
                type="text"
                placeholder="Enter the question statement"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Option A">
                <Input value={a} onChange={(e) => setA(e.target.value)} placeholder="Option A" />
              </Field>
              <Field label="Option B">
                <Input value={b} onChange={(e) => setB(e.target.value)} placeholder="Option B" />
              </Field>
              <Field label="Option C">
                <Input value={c} onChange={(e) => setC(e.target.value)} placeholder="Option C" />
              </Field>
              <Field label="Option D">
                <Input value={d} onChange={(e) => setD(e.target.value)} placeholder="Option D" />
              </Field>
            </div>

            <Field label="Correct answer">
              <Select value={correct} onChange={(e) => setCorrect(e.target.value)}>
                <option value="">Choose answer</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </Select>
            </Field>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button onClick={addQuestion}>Add Question</Button>
              <Button variant="secondary" onClick={saveQuiz}>
                Save Quiz
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          <p className="text-sm font-semibold text-slate-900">Question Preview</p>
          <p className="mt-1 text-sm text-slate-500">A running list of items already added.</p>

          <div className="mt-5 space-y-4">
            {questions.map((item, index) => (
              <div
                key={`${item.question}-${index}`}
                className="rounded-[22px] border border-blue-100 bg-white/88 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-slate-900">Question {index + 1}</p>
                  <Badge tone="blue">Correct {item.correct}</Badge>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.question}</p>
              </div>
            ))}

            {questions.length === 0 ? (
              <div className="rounded-[22px] border border-dashed border-blue-100 bg-white/80 p-5 text-sm text-slate-500">
                Added questions will appear here so you can review structure before saving.
              </div>
            ) : null}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default CreateQuiz;
