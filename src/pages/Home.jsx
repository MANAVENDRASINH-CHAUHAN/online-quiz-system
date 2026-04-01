import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import { Button } from "../components/ui";

function Home() {
  return (
    <Layout
      title="Choose your workspace"
      description="Sign in as a student or faculty member to continue."
    >
      <div className="space-y-4">
        <Link to="/student-login" className="block">
          <Button className="w-full" size="lg">Student Login</Button>
        </Link>

        <Link to="/student-register" className="block">
          <Button className="w-full" variant="secondary" size="lg">Student Register</Button>
        </Link>

        <Link to="/faculty-login" className="block">
          <Button className="w-full" variant="secondary" size="lg">Faculty Login</Button>
        </Link>
      </div>
    </Layout>
  );
}

export default Home;
