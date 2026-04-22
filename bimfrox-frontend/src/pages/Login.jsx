import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/bimfroxlogo.webp";
import API from "../api/axios";

function Login() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const cardRef = useRef(null);

  // ✅ LOGIN FUNCTION
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      alert("Please enter username and password");
      return;
    }

    try {
      setLoading(true);

      const res = await API.post("/auth/login", {
        username,
        password,
      });

      const token = res.data.token;
      const role = res.data.user.role;

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("username", res.data.user.username);

      if (role === "admin") navigate("/admin-dashboard");
      else navigate("/sales-dashboard");

    } catch (err) {
      alert(err.response?.data?.msg || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // ✅ LIGHTWEIGHT BACKGROUND (NO GLITCH)
  useEffect(() => {

    const canvas = document.getElementById("network-bg");
    const ctx = canvas.getContext("2d");

    let animationId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    const nodes = Array.from({ length: 20 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: 2 + Math.random() * 2
    }));

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      nodes.forEach(n => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,200,255,0.6)";
        ctx.fill();

        n.x += n.vx;
        n.y += n.vy;

        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      });

      animationId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };

  }, []);

  return (

    <div
      className="relative min-h-screen flex items-center justify-center px-4"
      style={{
        background: "linear-gradient(135deg,#0d47a1,#1976d2,#42a5f5,#1e88e5)"
      }}
    >

      {/* ✅ Canvas background */}
      <canvas id="network-bg" className="absolute inset-0 w-full h-full"></canvas>

      {/* ✅ LOGIN CARD */}
      <div
        ref={cardRef}
        className="relative z-10 w-[90%] max-w-md p-6 sm:p-8 rounded-3xl
        bg-white/20 backdrop-blur-2xl border border-cyan-300/50
        shadow-[0_0_50px_rgba(0,255,255,0.4)]"
      >

        {/* LOGO */}
        <div className="flex justify-center mb-6">
          <div className="p-3 rounded-full 
          bg-black/30 backdrop-blur-md
          border border-white/40">

            <img
              src={logo}
              className="w-24 sm:w-28"
              alt="logo"
            />

          </div>
        </div>

        <h2 className="text-center text-xl sm:text-2xl text-white mb-6 font-semibold">
          Login to BIMFROX
        </h2>

        {/* FORM */}
        <form onSubmit={handleLogin} className="space-y-4">

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 rounded-xl bg-white/10 border border-white/30 
            text-white outline-none focus:border-cyan-400"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-xl bg-white/10 border border-white/30 
              text-white outline-none focus:border-cyan-400"
            />

            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-3 cursor-pointer text-white text-sm"
            >
              {showPassword ? "Hide" : "Show"}
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-cyan-700 text-white font-semibold 
            hover:bg-cyan-500 transition disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        <p className="text-center text-white mt-5 text-sm">
          Don't have an account?
          <span
            onClick={() => navigate("/register")}
            className="text-cyan-300 cursor-pointer ml-2 underline"
          >
            Register
          </span>
        </p>

      </div>

    </div>
  );
}

export default Login;