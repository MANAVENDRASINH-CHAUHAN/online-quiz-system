import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { Button, Field, Input } from "../components/ui";
import { fetchJson } from "../utils/api";
import { setLocalStorageItem } from "../utils/storage";

function StudentRegister() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      alert("Please fill all fields");
      return;
    }

    try {
      const data = await fetchJson("register.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      if (data.status === "success") {
        alert("Registration Successful");
        setLocalStorageItem("studentName", data.name || name);
        setLocalStorageItem("studentId", String(data.user_id || ""));
        navigate("/student-dashboard", { replace: true });
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Server Error");
    }
  };

  return (
    <Layout
      title="Student Register"
      showBack
      backTo="/"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Field label="Full name">
          <Input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>

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
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>

        <Button type="submit" className="mt-2 w-full" size="lg">
          Register
        </Button>
      </form>

      <p className="mt-5 text-sm text-slate-500">
        Already registered?{" "}
        <Link className="font-semibold text-blue-600 hover:text-blue-700" to="/student-login">
          Go to login
        </Link>
      </p>
    </Layout>
  );
}

export default StudentRegister;
