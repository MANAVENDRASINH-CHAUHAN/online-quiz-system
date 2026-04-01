import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { Button, Card, Field, Input, Select } from "../components/ui";
import { fetchJson } from "../utils/api";

function AIQuiz() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(5);
  const [difficulty, setDifficulty] = useState("Easy");
  const [duration, setDuration] = useState(60);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateQuiz = async () => {
    if (isGenerating) {
      return;
    }

    if (!title || !topic) {
      alert("Please enter quiz title and topic");
      return;
    }

    setIsGenerating(true);

    try {
      const data = await fetchJson("generate_ai_quiz.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          duration,
          topic,
          count,
          difficulty,
        }),
      });

      if (data.status === "success") {
        alert("Quiz Generated Successfully!");
        navigate("/edit-ai-quiz", {
          state: {
            quiz_id: data.quiz_id,
          },
        });
      } else {
        alert(data.message || "Error generating quiz");
      }
    } catch (error) {
      console.error(error);
      alert("Server Error");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <DashboardLayout
      role="faculty"
      title="AI Quiz Generator"
      subtitle="Generate a first draft with AI, then review and refine every question."
    >
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <div className="grid gap-5">
            <Field label="Quiz title">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Quiz title"
                disabled={isGenerating}
              />
            </Field>

            <Field label="Quiz topic">
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Quiz topic"
                disabled={isGenerating}
              />
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Number of questions">
                <Input
                  type="number"
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                  placeholder="5"
                  disabled={isGenerating}
                />
              </Field>

              <Field label="Difficulty">
                <Select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  disabled={isGenerating}
                >
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </Select>
              </Field>
            </div>

            <Field label="Duration in minutes">
              <Input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="60"
                disabled={isGenerating}
              />
            </Field>

            <Button onClick={generateQuiz} disabled={isGenerating}>
              {isGenerating ? "Generating Quiz..." : "Generate Quiz"}
            </Button>

            {isGenerating ? (
              <div className="rounded-2xl border border-white/16 bg-white/10 px-4 py-3 text-sm font-medium text-white/90">
                Generating quiz. Please wait...
              </div>
            ) : null}
          </div>
        </Card>

        <Card className="hero-mesh text-white">
          <p className="text-sm font-semibold text-white">Generation workflow</p>
          <div className="mt-5 space-y-4 text-sm leading-6 text-white/90">
            <p>1. Submit a topic, count, difficulty, and duration.</p>
            <p>2. Review the generated question set in the quiz editor.</p>
            <p>3. Save the final version after refining wording and answers.</p>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default AIQuiz;
