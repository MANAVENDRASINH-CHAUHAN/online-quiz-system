import { Navigate } from "react-router-dom";
import { getActiveQuizSession } from "../utils/quizSession";

export default function ProtectedQuizRoute({ children }) {
  const activeQuizSession = getActiveQuizSession();

  if (!activeQuizSession) {
    return <Navigate to="/student-dashboard" replace />;
  }

  return children;
}
