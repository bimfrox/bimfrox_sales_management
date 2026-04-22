import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/bimfroxlogo.webp";
import API from "../api/axios";

function Register() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [city, setCity] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {

    e.preventDefault();

    if (!username || !password || !city) {
      alert("Username, password, and city are required");
      return;
    }

    try {

      setLoading(true);

      const res = await API.post(
        "/auth/register",
        { username, password, city, email, phone }
      );

      alert(res.data.msg || "Request sent to admin");
      navigate("/");

    } catch (err) {

      console.error(err);
      alert(err.response?.data?.msg || "Registration Failed");

    } finally {

      setLoading(false);

    }

  };


  /* NETWORK BACKGROUND */

  useEffect(() => {

    const canvas = document.getElementById("network-bg");
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    const nodeCount = 35;
    const nodes = [];

    for (let i = 0; i < nodeCount; i++) {

      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) / 1.5,
        vy: (Math.random() - 0.5) / 1.5,
        radius: 4 + Math.random() * 3
      });

    }

    function draw() {

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < nodeCount; i++) {
        for (let j = i + 1; j < nodeCount; j++) {

          let dx = nodes[i].x - nodes[j].x;
          let dy = nodes[i].y - nodes[j].y;
          let dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 160) {

            ctx.strokeStyle = `rgba(0,200,255,${1 - dist / 160})`;
            ctx.lineWidth = 1.4;

            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();

          }

        }
      }

      nodes.forEach(n => {

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,200,255,0.9)";
        ctx.fill();

        n.x += n.vx;
        n.y += n.vy;

        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;

      });

      requestAnimationFrame(draw);

    }

    requestAnimationFrame(draw);

    return () => {
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

      <canvas id="network-bg" className="absolute inset-0 w-full h-full"></canvas>

      <div className="relative z-10 w-[90%] max-w-104 p-6 sm:p-8 md:p-10 rounded-3xl
      bg-white/20 backdrop-blur-2xl border border-cyan-300/50
      shadow-[0_0_60px_rgba(0,255,255,0.6)] ring-1 ring-white/30">

        <div className="flex justify-center mb-6">

          <div className="p-4 rounded-full 
          bg-black/30 backdrop-blur-md
          border border-white/40
          shadow-[0_0_25px_rgba(0,255,255,0.7)]">

            <img
              src={logo}
              className="w-28 sm:w-32 md:w-36 drop-shadow-[0_0_15px_rgba(0,0,0,0.6)]"
              alt="logo"
            />

          </div>

        </div>

        <h2 className="text-center text-xl sm:text-2xl text-white mb-6 font-semibold tracking-wide">
          Sales Registration
        </h2>

        <form onSubmit={handleRegister} autoComplete="on" className="space-y-4">

          <input
            type="text"
            id="username"
            name="username"
            autoComplete="username"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-full p-3 rounded-xl bg-white/10 border border-white/30 
            text-white outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-600"
          />

          <input
            type="password"
            id="password"
            name="password"
            autoComplete="new-password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full p-3 rounded-xl bg-white/10 border border-white/30 
            text-white outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-600"
          />

          <input
            type="text"
            id="city"
            name="city"
            autoComplete="address-level2"
            placeholder="City"
            value={city}
            onChange={e => setCity(e.target.value)}
            className="w-full p-3 rounded-xl bg-white/10 border border-white/30 
            text-white outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-600"
          />

          <input
            type="email"
            id="email"
            name="email"
            autoComplete="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full p-3 rounded-xl bg-white/10 border border-white/30 
            text-white outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-600"
          />

          <input
            type="tel"
            id="phone"
            name="phone"
            autoComplete="tel"
            placeholder="Phone"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="w-full p-3 rounded-xl bg-white/10 border border-white/30 
            text-white outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-600"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-cyan-700 text-white font-semibold 
            hover:bg-cyan-500 transition shadow-lg hover:shadow-cyan-500/50"
          >
            {loading ? "Sending..." : "Register"}
          </button>

        </form>

        <p className="text-center text-white mt-6 text-sm sm:text-base">
          Already have an account ?
          <span
            onClick={() => navigate("/")}
            className="text-cyan-700 cursor-pointer ml-2 underline"
          >
            Login
          </span>
        </p>

      </div>

    </div>

  );

}

export default Register;