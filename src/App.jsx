import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";

import Home from "./pages/Home";
import StudentLogin from "./pages/StudentLogin";
import StudentRegister from "./pages/StudentRegister";
import FacultyLogin from "./pages/FacultyLogin";
import StudentDashboard from "./pages/StudentDashboard";
import FacultyDashboard from "./pages/FacultyDashboard";
import AddQuiz from "./pages/AddQuiz";
import CreateQuiz from "./pages/CreateQuiz";
import CreateQuizInfo from "./pages/CreateQuizInfo";
import AIQuiz from "./pages/AIQuiz";
import EditAIQuiz from "./pages/EditAIQuiz";
import ViewQuizzes from "./pages/ViewQuizzes";

/* Student Quiz Pages */
import StartQuiz from "./pages/StartQuiz";
import TakeQuiz from "./pages/TakeQuiz";
import MyScores from "./pages/MyScores";

/* NEW PAGE */
import ViewStudentResults from "./pages/ViewStudentResults";
import FacultyAnalytics from "./pages/FacultyAnalytics";
import { AppProviders } from "./components/AppProviders";
import ProtectedQuizRoute from "./components/ProtectedQuizRoute";
import { getLocalStorageItem } from "./utils/storage";

function StudentProtectedRoute({ children }) {
  const isAuthenticated = Boolean(getLocalStorageItem("studentName"));
  return isAuthenticated ? children : <Navigate to="/student-login" replace />;
}

function FacultyProtectedRoute({ children }) {
  const isAuthenticated = Boolean(
    getLocalStorageItem("facultyName") || getLocalStorageItem("facultyId")
  );
  return isAuthenticated ? children : <Navigate to="/faculty-login" replace />;
}

function AppRoutes() {
  const location = useLocation();

  return (
    <div key={location.pathname} className="page-transition">
      <Routes>

        {/* Home */}
        <Route path="/" element={<Home />} />

        {/* Student */}
        <Route
          path="/student-login"
          element={<StudentLogin />}
        />
        <Route
          path="/student-register"
          element={<StudentRegister />}
        />
        <Route
          path="/student-dashboard"
          element={
            <StudentProtectedRoute>
              <StudentDashboard />
            </StudentProtectedRoute>
          }
        />

        {/* Faculty */}
        <Route
          path="/faculty-login"
          element={<FacultyLogin />}
        />
        <Route
          path="/faculty-dashboard"
          element={
            <FacultyProtectedRoute>
              <FacultyDashboard />
            </FacultyProtectedRoute>
          }
        />

        {/* Quiz Creation */}
        <Route
          path="/add-quiz"
          element={
            <FacultyProtectedRoute>
              <AddQuiz />
            </FacultyProtectedRoute>
          }
        />
        <Route
          path="/create-quiz-info"
          element={
            <FacultyProtectedRoute>
              <CreateQuizInfo />
            </FacultyProtectedRoute>
          }
        />
        <Route
          path="/create-quiz"
          element={
            <FacultyProtectedRoute>
              <CreateQuiz />
            </FacultyProtectedRoute>
          }
        />
        <Route
          path="/ai-quiz"
          element={
            <FacultyProtectedRoute>
              <AIQuiz />
            </FacultyProtectedRoute>
          }
        />
        <Route
          path="/edit-ai-quiz"
          element={
            <FacultyProtectedRoute>
              <EditAIQuiz />
            </FacultyProtectedRoute>
          }
        />

        {/* View Quizzes */}
        <Route
          path="/all-quizzes"
          element={
            <FacultyProtectedRoute>
              <ViewQuizzes />
            </FacultyProtectedRoute>
          }
        />

        {/* Student Quiz System */}
        <Route
          path="/start-quiz"
          element={
            <StudentProtectedRoute>
              <StartQuiz />
            </StudentProtectedRoute>
          }
        />
        <Route
          path="/quiz"
          element={
            <StudentProtectedRoute>
              <StartQuiz />
            </StudentProtectedRoute>
          }
        />
        <Route
          path="/take-quiz"
          element={
            <StudentProtectedRoute>
              <ProtectedQuizRoute>
                <TakeQuiz />
              </ProtectedQuizRoute>
            </StudentProtectedRoute>
          }
        />
        <Route
          path="/my-scores"
          element={
            <StudentProtectedRoute>
              <MyScores />
            </StudentProtectedRoute>
          }
        />
        <Route
          path="/my-score"
          element={
            <StudentProtectedRoute>
              <MyScores />
            </StudentProtectedRoute>
          }
        />

        {/* NEW ROUTE */}
        <Route
          path="/student-results"
          element={
            <FacultyProtectedRoute>
              <ViewStudentResults />
            </FacultyProtectedRoute>
          }
        />
        <Route
          path="/faculty-analytics"
          element={
            <FacultyProtectedRoute>
              <FacultyAnalytics />
            </FacultyProtectedRoute>
          }
        />

      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppProviders>
        <AppRoutes />
      </AppProviders>
    </BrowserRouter>
  );
}

export default App;
