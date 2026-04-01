import {
  getLocalStorageItem,
  getSessionStorageItem,
  removeSessionStorageItem,
  setSessionStorageItem,
} from "./storage";

const ACTIVE_QUIZ_SESSION_KEY = "activeQuizSession";

function readStudentIdentity() {
  return {
    studentId: getLocalStorageItem("studentId"),
    studentName: getLocalStorageItem("studentName"),
  };
}

function isSessionOwnedByCurrentStudent(session) {
  const currentStudent = readStudentIdentity();

  if (!currentStudent.studentId && !currentStudent.studentName) {
    return false;
  }

  if (session.studentId && currentStudent.studentId) {
    return session.studentId === currentStudent.studentId;
  }

  return Boolean(session.studentName && currentStudent.studentName && session.studentName === currentStudent.studentName);
}

export function getActiveQuizSession() {
  const rawSession = getSessionStorageItem(ACTIVE_QUIZ_SESSION_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    const session = JSON.parse(rawSession);

    if (!session?.quizId || session.status !== "active") {
      removeSessionStorageItem(ACTIVE_QUIZ_SESSION_KEY);
      return null;
    }

    if (!isSessionOwnedByCurrentStudent(session)) {
      return null;
    }

    return session;
  } catch (error) {
    console.error("Failed to parse active quiz session:", error);
    removeSessionStorageItem(ACTIVE_QUIZ_SESSION_KEY);
    return null;
  }
}

export function hasActiveQuizSession() {
  return Boolean(getActiveQuizSession());
}

export function startActiveQuizSession({ quizId, duration, title }) {
  const { studentId, studentName } = readStudentIdentity();

  if (!quizId || (!studentId && !studentName)) {
    return null;
  }

  const session = {
    quizId: String(quizId),
    duration: Number(duration) || null,
    title: title || "",
    startedAt: Date.now(),
    studentId: studentId || null,
    studentName: studentName || null,
    status: "active",
  };

  setSessionStorageItem(ACTIVE_QUIZ_SESSION_KEY, JSON.stringify(session));
  return session;
}

export function clearActiveQuizSession() {
  removeSessionStorageItem(ACTIVE_QUIZ_SESSION_KEY);
}
