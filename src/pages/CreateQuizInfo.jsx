import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { Badge, Button, Card, Field, Input } from "../components/ui";
import { fetchJson } from "../utils/api";
import { setLocalStorageItem } from "../utils/storage";

function CreateQuizInfo() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");

  const createQuiz = async () => {
    if (!title || !duration) {
      alert("Please enter quiz title and duration");
      return;
    }

    try {
      const data = await fetchJson("create_quiz.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          duration,
        }),
      });

      if (data.status === "success") {
        setLocalStorageItem("quiz_id", String(data.quiz_id));
        alert("Quiz Created Successfully");
        navigate("/create-quiz");
      } else {
        alert(data.message || "Quiz not created");
      }
    } catch (error) {
      console.error(error);
      alert("Server Error");
    }
  };

  return (
    <DashboardLayout
      role="faculty"
      title="Quiz Details"
      subtitle="Start by defining the title and duration before adding questions."
      actions={<Badge tone="blue">Step 1 of 2</Badge>}
    >
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <p className="text-sm font-semibold text-slate-900">Assessment Setup</p>
          <p className="mt-1 text-sm text-slate-500">
            Keep naming consistent so students can identify quizzes easily.
          </p>

          <div className="mt-6 grid gap-5">
            <Field label="Quiz title" hint="Visible to students">
              <Input
                type="text"
                placeholder="Introduction to React"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Field>

            <Field label="Duration in minutes" hint="Suggested: 20 to 60">
              <Input
                type="number"
                placeholder="30"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </Field>

            <div className="pt-2">
              <Button onClick={createQuiz}>Continue</Button>
            </div>
          </div>
        </Card>

        <Card className="hero-mesh text-white">
          <p className="text-sm font-semibold text-white">What happens next</p>
          <div className="mt-5 space-y-4 text-sm leading-6 text-white/90">
            <p>1. Save quiz metadata and generate a quiz ID.</p>
            <p>2. Open the question builder for manual entry.</p>
            <p>3. Save all questions and return to the faculty dashboard.</p>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default CreateQuizInfo;
