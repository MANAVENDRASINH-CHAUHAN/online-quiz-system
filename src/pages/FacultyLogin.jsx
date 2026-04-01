import { useState } from "react";
import Layout from "../components/Layout";
import { Button, Field, Input } from "../components/ui";
import { useNavigate } from "react-router-dom";
import { fetchJson } from "../utils/api";
import { setLocalStorageItem } from "../utils/storage";

function FacultyLogin() {
  const navigate = useNavigate();
  const [facultyId, setFacultyId] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!facultyId || !password) {
      alert("Please enter Faculty ID and Password");
      return;
    }

    try {
      const data = await fetchJson("faculty_login.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          faculty_id: facultyId,
          password,
        }),
      });

      if (data.status === "success") {
        setLocalStorageItem("facultyId", facultyId);
        setLocalStorageItem("facultyName", data.name || facultyId);
        alert("Login Successful");
        navigate("/faculty-dashboard", { replace: true });
      } else {
        alert(data.message || "Invalid Login");
      }
    } catch (error) {
      console.error(error);
      alert("Server Error");
    }
  };

  return (
    <Layout
      title="Faculty Login"
      showBack
      backTo="/"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Field label="Faculty ID">
          <Input
            type="text"
            placeholder="FAC-1024"
            value={facultyId}
            onChange={(e) => setFacultyId(e.target.value)}
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
    </Layout>
  );
}

export default FacultyLogin;
