import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { Button, Field, Input } from "../components/ui";
import { fetchJson } from "../utils/api";
import { setLocalStorageItem } from "../utils/storage";

function StudentLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    try {
      const data = await fetchJson("student_login.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (data.status === "success") {
        setLocalStorageItem("studentName", data.name || "Student");
        setLocalStorageItem("studentId", String(data.user_id || ""));
        alert("Login Successful");
        navigate("/student-dashboard", { replace: true });
      } else {
        alert(data.message || "Invalid Email or Password");
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert("Server Error - Check backend");
    }
  };

  return (
    <Layout
      title="Student Login"
      showBack
      backTo="/"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Field label="Email address">
          <Input
            type="email"
            placeholder="student@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>

        <Field label="Password">
          <Input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>

        <Button type="submit" className="mt-2 w-full" size="lg">
          Login
        </Button>
      </form>

      <p className="mt-5 text-sm text-slate-500">
        Need an account?{" "}
        <Link className="font-semibold text-blue-600 hover:text-blue-700" to="/student-register">
          Register here
        </Link>
      </p>
    </Layout>
  );
}

export default StudentLogin;
