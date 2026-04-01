import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { Button, Card } from "../components/ui";

function AddQuiz() {
  const navigate = useNavigate();

  return (
    <DashboardLayout
      role="faculty"
      title="Create a New Quiz"
      subtitle="Choose the creation workflow that fits your process."
    >
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="card-hover">
          <p className="section-kicker">
            Manual Builder
          </p>
          <h3 className="mt-3 text-2xl font-bold text-white">Create quiz step by step</h3>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Define metadata, add questions manually, and save the final assessment.
          </p>
          <Button className="mt-6" onClick={() => navigate("/create-quiz-info")}>
            Manual
          </Button>
        </Card>

        <Card className="card-hover">
          <p className="text-sm font-semibold uppercase tracking-wide text-white">
            AI Generator
          </p>
          <h3 className="mt-3 text-2xl font-bold text-white">Generate and refine with AI</h3>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Start from a topic, choose difficulty, then review generated questions before saving.
          </p>
          <Button variant="secondary" className="mt-6" onClick={() => navigate("/ai-quiz")}>
            AI Quiz
          </Button>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default AddQuiz;
