import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Loader2, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "PhytoNexus | Sign In";
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.message || "Invalid login credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-paper font-sans">
      <div className="flex flex-1 w-full">
      
      <div className="flex w-full flex-col items-center justify-center px-6 py-12 md:w-[50%] lg:w-[45%]">
        
        <div className="absolute top-8 left-8 flex items-center gap-2 text-ink">
          <Link to="/" className="flex items-center gap-2">
            <img src="/favicon.png" alt="PhytoNexus Logo" className="w-8 h-8 object-contain" style={{ imageRendering: 'pixelated' }} />
            <span className="font-serif text-2xl font-bold tracking-tight">PhytoNexus</span>
          </Link>
        </div>

        <h1 className="mb-12 text-center font-serif text-5xl leading-[1.1] text-ink sm:text-[3.5rem]">
          Spark your<br />botanical journey
        </h1>

        <div className="w-full max-w-md rounded-[1.5rem] border border-line bg-surface/50 p-8 shadow-sm">
          <p className="mb-6 text-center text-[0.95rem] font-medium text-ink">
            Sign in to your account below
          </p>
          
          <form className="space-y-4" onSubmit={handleSubmit}>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-line bg-surface px-4 py-3.5 text-[0.95rem] text-ink shadow-sm placeholder:text-muted focus:border-clay focus:outline-none focus:ring-1 focus:ring-clay"
              placeholder="Email address"
              required
            />
            
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-line bg-surface px-4 py-3.5 pr-12 text-[0.95rem] text-ink shadow-sm placeholder:text-muted focus:border-clay focus:outline-none focus:ring-1 focus:ring-clay"
                placeholder="Password"
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
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-clay py-3.5 text-[0.95rem] font-medium text-white shadow-sm transition hover:bg-[#c25c38] disabled:bg-line disabled:text-muted"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : "Sign In"}
            </button>
          </form>
        </div>

        <div className="mt-6 text-center text-[0.95rem] text-muted">
          Don't have an account? <Link to="/register" className="font-medium text-ink underline hover:text-ink/80">Register</Link>
        </div>
      </div>

      <div className="hidden w-full flex-col justify-center bg-[#f0efe9] md:flex md:w-[50%] lg:w-[55%]">
        <div className="relative mx-auto w-full max-w-2xl px-12 mt-16">
          
          <div className="absolute -top-20 right-10 z-10 max-w-sm rounded-[1.5rem] rounded-bl-sm bg-surface p-5 text-sm font-medium text-ink shadow-xl ring-1 ring-line/50">
            <span className="text-xl leading-none text-muted">“</span>
            PhytoNexus, identify the disease on this leaf and predict its lifespan.
          </div>

          <div className="overflow-hidden rounded-2xl border border-line shadow-2xl relative z-0 mt-8 mb-8">
            <img 
              src="/8bit-plants.png" 
              alt="8-bit potted plants" 
              className="h-auto w-full object-cover"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>

          <div className="absolute -bottom-16 left-0 z-10 max-w-[280px] rounded-[1.5rem] rounded-tl-sm bg-surface p-5 text-sm font-medium text-ink shadow-xl ring-1 ring-line/50">
            <span className="text-xl leading-none text-muted">“</span>
            Also, provide a 3-step care guide to keep it healthy.
          </div>
        </div>
      </div>
      
      </div>
    </div>
  );
}
