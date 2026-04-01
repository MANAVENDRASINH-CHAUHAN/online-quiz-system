import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ExamLayout, { ExamHeader } from "../components/ExamLayout";
import { Badge, Button, Card, CircularProgress } from "../components/ui";
import { useUISound } from "../components/AppProviders";
import { clearActiveQuizSession, getActiveQuizSession } from "../utils/quizSession";
import { fetchJson } from "../utils/api";
import { getLocalStorageItem, setLocalStorageItem } from "../utils/storage";

function formatTime(remainingMs) {
  const safeRemaining = Math.max(remainingMs, 0);
  const minutes = String(Math.floor(safeRemaining / 60000)).padStart(2, "0");
  const seconds = String(Math.floor((safeRemaining % 60000) / 1000)).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

async function saveQuizResult({ quizId, score }) {
  const studentName = getLocalStorageItem("studentName");
  const studentId = getLocalStorageItem("studentId");

  await fetchJson("save_result.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      student: studentName,
      student_id: studentId,
      quiz_id: quizId,
      score,
    }),
  });
}

function TakeQuiz() {
  const navigate = useNavigate();
  const [activeQuizSession] = useState(() => getActiveQuizSession());
  const [initialNow] = useState(() => Date.now());
  const quizId = activeQuizSession?.quizId || null;
  const quizStartedAt = Number(activeQuizSession?.startedAt || initialNow);

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [faceApiModule, setFaceApiModule] = useState(null);
  const [timeLeft, setTimeLeft] = useState(() =>
    formatTime((Number(activeQuizSession?.duration || 30) || 30) * 60 * 1000)
  );
  const [cameraError, setCameraError] = useState("");

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const completionTriggeredRef = useRef(false);
  const faceMissingCountRef = useRef(0);
  const faceAlertActiveRef = useRef(false);
  const faceRecoveryRequiredRef = useRef(false);
  const { click, success } = useUISound();

  const stopCameraStream = useCallback(() => {
    if (!streamRef.current) {
      return;
    }

    streamRef.current.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const exitQuizRoute = useCallback(
    (redirectTo = "/student-dashboard") => {
      completionTriggeredRef.current = true;
      setSubmitted(true);
      clearActiveQuizSession();
      stopCameraStream();
      navigate(redirectTo, { replace: true });
    },
    [navigate, stopCameraStream]
  );

  const finalizeQuizAttempt = useCallback(
    async ({ score, violationReason = "", redirectTo = "/student-dashboard" }) => {
      if (completionTriggeredRef.current) {
        return;
      }

      completionTriggeredRef.current = true;
      setSubmitted(true);
      clearActiveQuizSession();
      stopCameraStream();

      if (violationReason) {
        setLocalStorageItem(
          "quizViolation",
          `Warning: ${violationReason}\n\nQuiz auto submitted with score ${score}`
        );
      }

      try {
        await saveQuizResult({ quizId, score });
      } catch (error) {
        console.error("Failed to save quiz result:", error);
      }

      navigate(redirectTo, { replace: true });
    },
    [navigate, quizId, stopCameraStream]
  );

  const handleViolation = useCallback(
    async (reason) => {
      await finalizeQuizAttempt({
        score: 0,
        violationReason: reason,
      });
    },
    [finalizeQuizAttempt]
  );

  const quizDuration = Number(activeQuizSession?.duration || questions[0]?.duration || 30) || 30;
  const initialTimeLeft = formatTime(
    Math.max(quizStartedAt + quizDuration * 60 * 1000 - initialNow, 0)
  );

  useEffect(() => {
    document.body.style.filter = "none";

    return () => {
      stopCameraStream();
    };
  }, [stopCameraStream]);

  useEffect(() => {
    if (!quizId) {
      navigate("/student-dashboard", { replace: true });
      return;
    }

    fetchJson(`get_quiz_questions.php?quiz_id=${quizId}`)
      .then((data) => setQuestions(Array.isArray(data) ? data : []))
      .catch((error) => console.error(error));
  }, [navigate, quizId]);

  const requestCameraAccess = useCallback(async () => {
    try {
      stopCameraStream();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((error) => console.error(error));
      }

      setCameraError("");
      setCameraReady(true);
    } catch (error) {
      console.error("Camera access failed:", error);
      setCameraReady(false);
      setCameraError("Camera access is required to start the quiz. Allow camera access and retry.");
    }
  }, [stopCameraStream]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      requestCameraAccess();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [requestCameraAccess]);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const faceApi = await import("face-api.js");
        setFaceApiModule(faceApi);

        await faceApi.nets.tinyFaceDetector.loadFromUri("/models");
        setModelLoaded(true);
      } catch (error) {
        console.error("Face model loading failed:", error);
        setModelLoaded(false);
        setCameraError("Face detection could not start. Refresh the page and retry.");
      }
    };

    loadModels();
  }, []);

  const monitoringActive =
    Boolean(quizId) && cameraReady && modelLoaded && Boolean(faceApiModule) && !cameraError && !submitted;

  useEffect(() => {
    if (submitted) {
      return undefined;
    }

    const handlePopState = () => {
      exitQuizRoute("/student-dashboard");
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [exitQuizRoute, submitted]);

  useEffect(() => {
    if (!monitoringActive) {
      return undefined;
    }

    const detectFace = window.setInterval(async () => {
      if (
        submitted ||
        faceAlertActiveRef.current ||
        !videoRef.current ||
        videoRef.current.readyState < 2
      ) {
        return;
      }

      const detection = await faceApiModule.detectSingleFace(
        videoRef.current,
        new faceApiModule.TinyFaceDetectorOptions({
          inputSize: 416,
          scoreThreshold: 0.5,
        })
      );

      if (detection) {
        faceRecoveryRequiredRef.current = false;
        return;
      }

      if (faceRecoveryRequiredRef.current) {
        return;
      }

      faceMissingCountRef.current += 1;
      faceAlertActiveRef.current = true;
      faceRecoveryRequiredRef.current = true;

      if (faceMissingCountRef.current >= 3) {
        alert("Warning: Face not detected (3/3)\n\nQuiz auto submitted with score 0");
        await handleViolation("Face not detected 3 times");
      } else {
        alert(
          `Warning: Face not detected (${faceMissingCountRef.current}/3)\n\nPlease keep your face visible in front of the camera.`
        );
      }

      faceAlertActiveRef.current = false;
    }, 2000);

    return () => window.clearInterval(detectFace);
  }, [faceApiModule, handleViolation, monitoringActive, submitted]);

  useEffect(() => {
    if (!monitoringActive) {
      return undefined;
    }

    const cameraCheck = window.setInterval(() => {
      if (!videoRef.current || !videoRef.current.srcObject) {
        handleViolation("Camera disabled");
      }
    }, 3000);

    return () => window.clearInterval(cameraCheck);
  }, [handleViolation, monitoringActive]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden && monitoringActive) {
        handleViolation("Tab switching detected");
      }
    };

    const onPageHide = () => {
      if (monitoringActive) {
        handleViolation("Leaving quiz page detected");
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", onPageHide);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, [handleViolation, monitoringActive]);

  useEffect(() => {
    const preventAction = (event) => {
      event.preventDefault();
    };

    const onContextMenu = (event) => preventAction(event);
    const onCopy = (event) => preventAction(event);
    const onCut = (event) => preventAction(event);
    const onPaste = (event) => preventAction(event);
    const onSelectStart = (event) => preventAction(event);
    const onDragStart = (event) => preventAction(event);
    const onKeyDown = (event) => {
      const key = event.key.toLowerCase();
      const metaKey = event.ctrlKey || event.metaKey;

      if (
        (metaKey && ["c", "x", "v", "a", "p", "s", "u"].includes(key)) ||
        (metaKey && event.shiftKey && ["i", "j", "c"].includes(key)) ||
        key === "f12" ||
        key === "printscreen"
      ) {
        preventAction(event);
      }
    };

    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("copy", onCopy);
    document.addEventListener("cut", onCut);
    document.addEventListener("paste", onPaste);
    document.addEventListener("selectstart", onSelectStart);
    document.addEventListener("dragstart", onDragStart);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("cut", onCut);
      document.removeEventListener("paste", onPaste);
      document.removeEventListener("selectstart", onSelectStart);
      document.removeEventListener("dragstart", onDragStart);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const selectAnswer = (id, option) => {
    click();
    setAnswers((prev) => ({ ...prev, [id]: option }));
  };

  const submitQuiz = useCallback(async () => {
    if (completionTriggeredRef.current) {
      return;
    }

    let score = 0;
    questions.forEach((question) => {
      if (answers[question.id] === question.correct_answer) {
        score += 1;
      }
    });

    await finalizeQuizAttempt({ score });
    success();
  }, [answers, finalizeQuizAttempt, questions, success]);

  useEffect(() => {
    if (!monitoringActive) {
      return undefined;
    }

    const updateCountdown = () => {
      const remaining = Math.max(quizStartedAt + quizDuration * 60 * 1000 - Date.now(), 0);
      setTimeLeft(formatTime(remaining));

      if (remaining <= 0) {
        submitQuiz();
      }
    };

    updateCountdown();
    const timer = window.setInterval(updateCountdown, 1000);

    return () => window.clearInterval(timer);
  }, [initialTimeLeft, monitoringActive, quizDuration, quizStartedAt, submitQuiz]);

  const answeredCount = Object.keys(answers).length;
  const progress = questions.length ? Math.round((answeredCount / questions.length) * 100) : 0;
  const quizTitle = questions[0]?.quiz_title || activeQuizSession?.title || "Quiz Session";
  const displayTimeLeft = monitoringActive ? timeLeft : initialTimeLeft;
  const securityStatus = monitoringActive
    ? "Face, tab, and copy lock active"
    : cameraError
      ? "Camera required to start"
      : cameraReady
        ? "Loading face monitor"
        : "Waiting for camera permission";

  const cameraPanel = (
    <div className="flex items-center gap-3 rounded-[24px] border border-red-400/45 bg-red-500/12 px-3 py-3 shadow-[0_0_0_1px_rgba(248,113,113,0.14),0_16px_36px_rgba(127,29,29,0.18)]">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="h-16 w-24 rounded-2xl bg-slate-950 object-cover"
      />
      <div>
        <p className="text-sm font-semibold text-[#ff6b78] drop-shadow-[0_0_10px_rgba(255,77,95,0.18)]">
          Camera monitor
        </p>
        <p className="font-instruction mt-1 text-xs text-[#ff8692]">
          {cameraError ? "Camera not enabled" : cameraReady ? "Camera enabled" : "Waiting for permission"}
        </p>
      </div>
    </div>
  );

  return (
    <ExamLayout
      onBack={() => exitQuizRoute("/student-dashboard")}
      header={
        <ExamHeader
          title={quizTitle}
          progress={progress}
          answeredCount={answeredCount}
          totalQuestions={questions.length}
          cameraReady={cameraReady}
          modelLoaded={modelLoaded}
          timeLeft={displayTimeLeft}
          securityStatus={securityStatus}
        />
      }
    >
      <div
        className="grid items-start gap-6 xl:grid-cols-[1fr_280px]"
        style={{ userSelect: "none", WebkitUserSelect: "none" }}
      >
        <div className="space-y-5">
          {questions.map((question, index) => (
            <Card key={question.id} className="rounded-[28px]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="section-kicker">Question {index + 1}</p>
                  <h2 className="font-question mt-3 text-xl font-bold text-white">
                    {question.question}
                  </h2>
                </div>
                <Badge tone={answers[question.id] ? "teal" : "slate"}>
                  {answers[question.id] ? "Answered" : "Pending"}
                </Badge>
              </div>

              <div className="mt-6 grid gap-3">
                {["A", "B", "C", "D"].map((option) => {
                  const text = question[`option_${option.toLowerCase()}`];
                  const selected = answers[question.id] === option;

                  return (
                    <button
                      key={option}
                      onClick={() => selectAnswer(question.id, option)}
                      disabled={!monitoringActive}
                      className={[
                        "button-press font-option rounded-[22px] border px-5 py-4 text-left transition",
                        selected
                          ? "glow-ring border-cyan-300 bg-gradient-to-r from-cyan-300 via-sky-400 to-fuchsia-500 text-white shadow-[0_14px_30px_rgba(74,144,226,0.22)]"
                          : "border-white/14 bg-white/10 text-white hover:border-cyan-200 hover:bg-white/14",
                      ].join(" ")}
                    >
                      <span className="flex items-start gap-4">
                        <span
                          className={[
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                            selected ? "bg-white/20 text-white" : "bg-white/14 text-white",
                          ].join(" ")}
                        >
                          {option}
                        </span>
                        <span className="font-option pt-1 text-sm font-medium">{text}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </Card>
          ))}

          <div className="flex justify-end">
            <Button variant="success" onClick={submitQuiz} disabled={!monitoringActive}>
              Submit Quiz
            </Button>
          </div>
        </div>

        <div className="sticky top-[20px] flex flex-col gap-5 self-start">
          {cameraPanel}

          <Card className="glow-ring rounded-[28px]">
            <div className="flex justify-center">
              <CircularProgress
                value={progress}
                label="Answered"
                sublabel={`${answeredCount}/${questions.length || 0}`}
              />
            </div>
            <p className="mt-5 text-sm font-semibold text-white">Question Navigator</p>
            <p className="font-instruction mt-1 text-sm text-white/70">
              Quick visual check of answered and pending items.
            </p>

            <div className="mt-5 grid grid-cols-4 gap-3">
              {questions.map((question, index) => {
                const answered = Boolean(answers[question.id]);
                return (
                  <div
                    key={question.id}
                    className={[
                      "flex h-12 items-center justify-center rounded-2xl text-sm font-semibold",
                      answered
                        ? "bg-gradient-to-r from-cyan-300 via-sky-400 to-fuchsia-500 text-white"
                        : "bg-white/10 text-white/70",
                    ].join(" ")}
                  >
                    {index + 1}
                  </div>
                );
              })}
            </div>

            <div className="mt-5 rounded-[22px] border border-red-400/35 bg-red-500/10 p-4">
              <p className="text-sm font-semibold uppercase tracking-wide text-[#ff6b78] drop-shadow-[0_0_10px_rgba(255,77,95,0.18)]">
                Security Features
              </p>
              <div className="font-instruction mt-3 space-y-2 text-sm text-[#ff8692]">
                <p className="text-[#ff8692]">Answered: {answeredCount}</p>
                <p className="text-[#ff8692]">Pending: {Math.max(questions.length - answeredCount, 0)}</p>
                <p className="text-[#ff8692]">Timer: {displayTimeLeft}</p>
                <p className="font-semibold text-[#ff4d5f] drop-shadow-[0_0_10px_rgba(255,77,95,0.16)]">Copy lock: active</p>
                <p className="font-semibold text-[#ff4d5f] drop-shadow-[0_0_10px_rgba(255,77,95,0.16)]">Camera: {monitoringActive ? "active" : "required"}</p>
                <p className="font-semibold text-[#ff4d5f] drop-shadow-[0_0_10px_rgba(255,77,95,0.16)]">Tab switch: blocked</p>
                <p className="font-semibold text-[#ff4d5f] drop-shadow-[0_0_10px_rgba(255,77,95,0.16)]">Face detection: required</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </ExamLayout>
  );
}

export default TakeQuiz;
