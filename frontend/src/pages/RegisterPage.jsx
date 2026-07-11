import { User, Loader2, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "PhytoNexus | Create Account";
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const emailRegex = /^[a-zA-Z0-9_.+-]+@(gmail\.com|outlook\.com|yahoo\.com)$/i;
    if (!emailRegex.test(email)) {
      setError("Please use a valid @gmail.com, @outlook.com, or @yahoo.com email address.");
      return;
    }

    setIsLoading(true);
    try {
      await register(name, email, password);
      navigate("/");
    } catch (err) {
      setError(err.message || "Failed to register");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-paper font-sans">
      <div className="flex flex-1 w-full overflow-hidden relative">
      
      <div className="flex h-full w-full flex-col items-center justify-center px-6 md:w-[50%] lg:w-[45%] relative">

        <div className="absolute top-8 left-8 flex items-center gap-2 text-ink">
          <Link to="/" className="flex items-center gap-2">
            <img src="/favicon.png" alt="PhytoNexus Logo" className="w-8 h-8 object-contain" style={{ imageRendering: 'pixelated' }} />
            <span className="font-serif text-2xl font-bold tracking-tight">PhytoNexus</span>
          </Link>
        </div>

        <h1 className="mb-4 text-center font-serif text-[3.5rem] leading-[1.1] text-ink sm:text-[4rem]">
          Bring your plants<br />back to life
        </h1>
        <p className="mb-10 text-center text-[1.05rem] text-ink/80 font-medium">
          Multi-agent AI for precise plant lifecycle predictions..
        </p>

        <div className="w-full max-w-md rounded-[1.5rem] border border-line bg-surface/50 p-8 shadow-sm">
          
          <form className="space-y-4" onSubmit={handleSubmit}>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-line bg-surface px-4 py-3.5 text-[0.95rem] text-ink shadow-sm placeholder:text-muted focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink"
              placeholder="Enter your full name"
              required
            />

            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-line bg-surface px-4 py-3.5 text-[0.95rem] text-ink shadow-sm placeholder:text-muted focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink"
              placeholder="Enter your email"
              required
            />
            
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-line bg-surface px-4 py-3.5 pr-12 text-[0.95rem] text-ink shadow-sm placeholder:text-muted focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink"
                placeholder="Create a password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            {error && (
              <div className="text-sm font-medium text-red-500 bg-red-50 border border-red-500/20 p-3 rounded-lg text-center">
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-ink py-3.5 text-[0.95rem] font-bold text-paper shadow-sm transition hover:bg-ink/90 mt-2 disabled:bg-line disabled:text-muted"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : "Sign up with email"}
            </button>
          </form>

          <div className="mt-6 text-center text-[0.9rem] text-muted">
            Already have an account? <Link to="/login" className="font-medium text-ink underline hover:text-ink/80">Sign In</Link>
          </div>
        </div>

      </div>

      <div className="hidden h-full w-full flex-col justify-center bg-[#f0efe9] md:flex md:w-[50%] lg:w-[55%]">
        <div className="relative mx-auto w-full max-w-2xl px-12">
          
          <div className="flex flex-col gap-6">
            
            <div className="self-end max-w-md rounded-2xl bg-[#e6e4dc] p-4 text-[0.95rem] font-medium text-ink shadow-sm flex gap-3">
              <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-ink text-paper overflow-hidden">
                <User size={14} />
              </div>
              <p>PhytoNexus, identify the disease on this leaf and predict its lifespan.</p>
            </div>

            <div className="self-start max-w-[180px] rounded-2xl bg-surface p-4 text-[0.95rem] font-medium text-ink shadow-sm">
              Here's the report.
            </div>

            <div className="self-start w-full max-w-lg rounded-2xl bg-surface p-8 shadow-md">
              <h3 className="font-serif text-xl font-bold text-ink mb-3">Plant Health Report</h3>
              <p className="text-[0.85rem] text-ink/80 leading-relaxed mb-6">
                This report provides an analysis of the uploaded leaf image across our multi-agent diagnostics pipeline. The data presented offers insights into the current health state and expected botanical lifespan.
              </p>
              
              <h4 className="text-sm font-bold text-ink mb-4">Overview</h4>
              
              <div className="grid grid-cols-3 gap-3 mb-8">
                <div className="rounded-xl bg-[#f4f3ee] p-3">
                  <div className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted mb-1">Species</div>
                  <div className="text-sm font-bold text-ink">Monstera</div>
                </div>
                <div className="rounded-xl bg-[#f4f3ee] p-3">
                  <div className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted mb-1">Health</div>
                  <div className="text-sm font-bold text-ink">80%</div>
                </div>
                <div className="rounded-xl bg-[#f4f3ee] p-3">
                  <div className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted mb-1">Lifespan</div>
                  <div className="text-sm font-bold text-ink">20 wks</div>
                </div>
              </div>

              <h4 className="text-sm font-bold text-ink mb-2">Trend: Minor nutrient deficiency</h4>
              <p className="text-[0.85rem] text-ink/80 leading-relaxed">
                The analysis shows a clear indication of slight yellowing. Starting from the edges of the leaf, it has increased by nearly 15% over the observed period. Immediate fertilization is recommended.
              </p>
            </div>

          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
