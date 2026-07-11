import { ImagePlus, Loader2, UploadCloud, Droplets, Leaf, AlertTriangle } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AgentTimeline from "../components/AgentTimeline.jsx";
import ReportView from "../components/ReportView.jsx";
import { analyzePlant } from "../services/api.js";

export default function AnalyzePage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState("");
  const [limitReached, setLimitReached] = useState(false);
  const reportRef = useRef(null);
  const { token } = useAuth();

  useEffect(() => {
    if (result && reportRef.current) {
      setTimeout(() => {
        reportRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    }
  }, [result]);

  useEffect(() => {
    if (!loading) return;
    const timer = setInterval(() => {
      setActiveStep((step) => Math.min(step + 1, 3));
    }, 1200);
    return () => clearInterval(timer);
  }, [loading]);

  useEffect(() => {
    async function checkLimit() {
      if (!token) {
        try {
          const res = await fetch("http://localhost:8000/api/analyze/limit-status");
          if (res.ok) {
            const data = await res.json();
            setLimitReached(data.limit_reached);
          }
        } catch (err) {
          console.error(err);
        }
      } else {
        setLimitReached(false);
      }
    }
    checkLimit();
  }, [token]);

  function onFileChange(event) {
    const nextFile = event.target.files?.[0];
    setFile(nextFile || null);
    setResult(null);
    setError("");
    if (nextFile) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result);
      reader.readAsDataURL(nextFile);
    }
  }

  async function onAnalyze() {
    if (!file || !preview) return;
    setLoading(true);
    setActiveStep(1);
    setError("");
    setResult(null);
    try {
      const headers = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch("http://localhost:8000/api/analyze", {
        method: "POST",
        headers: headers,
        body: JSON.stringify({ 
          image_base64: preview,
          filename: file.name,
          mime_type: file.type || "image/jpeg"
        })
      });
      
      if (response.status === 429) {
        setLimitReached(true);
        throw new Error("Limit reached for the device. Please create an account to continue.");
      }
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || "Analysis failed");
      }
      const data = await response.json();
      setResult(data);
      setActiveStep(4);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <div className="w-full px-4 md:px-12 lg:px-16 mx-auto pt-2 md:pt-0 pb-8 flex flex-col gap-2 animate-fade-in min-h-[calc(100vh-4rem)]">
      <div className="flex-shrink-0 mb-1 mt-2">
        <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-tight text-ink">Upload a plant image</h1>
      </div>

      <div className="flex flex-col lg:grid lg:gap-6 lg:grid-cols-[0.7fr_1.3fr] flex-1 min-h-0 pb-0 gap-6">
        <section className="rounded-[1.5rem] border border-line bg-surface p-5 shadow-xl flex flex-col justify-between min-h-[350px] lg:min-h-0">
          {limitReached ? (
            <div className="flex flex-1 flex-col items-center justify-center rounded-[1.5rem] border border-red-500/20 bg-red-50 p-6 text-center shadow-sm">
               <AlertTriangle size={48} className="text-red-500 mb-4" />
               <h3 className="text-xl font-bold text-red-700 mb-2">Limit Reached</h3>
               <p className="text-[0.95rem] font-medium text-red-600 mb-6">
                 You have reached the maximum number of free diagnoses for this device. Please create an account to continue using PhytoNexus.
               </p>
               <div className="flex flex-col gap-3 w-full">
                 <Link to="/register" className="inline-flex w-full items-center justify-center rounded-[1.25rem] bg-ink px-4 py-4 text-[1.1rem] font-bold text-paper transition-all hover:bg-ink/90 hover:shadow-xl hover:-translate-y-1 duration-200">
                   Create an account
                 </Link>
                 <Link to="/login" className="inline-flex w-full items-center justify-center rounded-[1.25rem] bg-transparent border-2 border-line px-4 py-4 text-[1.1rem] font-bold text-ink transition-all hover:bg-black/5 hover:-translate-y-1 duration-200">
                   Log in
                 </Link>
               </div>
            </div>
          ) : (
            <>
              <label className={`flex flex-1 min-h-0 cursor-pointer flex-col items-center justify-center rounded-[1.5rem] border-2 border-dashed ${loading ? 'border-sage/50 bg-sage/5' : 'border-line bg-[#f8f7f5] hover:border-clay hover:bg-clay/5'} p-5 text-center transition-all duration-300 relative overflow-hidden`}>
                {loading ? (
                  <div className="flex flex-col items-center justify-center z-10">
                    <div className="relative mb-8 flex items-center justify-center">
                       <Droplets size={36} className="text-[#00c3ff] absolute -top-10 animate-bounce drop-shadow-md" />
                       <Leaf size={64} className="text-sage animate-pulse drop-shadow-lg" />
                    </div>
                    <p className="font-serif text-2xl text-ink font-bold tracking-tight">Nourishing data...</p>
                    <p className="mt-2 text-[0.95rem] text-ink/60 font-medium">Multi-agent pipeline active</p>
                  </div>
                ) : preview ? (
                  <img src={preview} alt="Selected plant" className="absolute inset-0 w-full h-full object-cover rounded-[1.2rem] shadow-sm transition-transform duration-500 hover:scale-[1.02]" />
                ) : (
                  <div className="flex flex-col items-center transform transition duration-300 hover:-translate-y-1">
                    <div className="w-16 h-16 rounded-full bg-surface shadow-sm border border-line flex items-center justify-center mb-4 text-sage">
                      <ImagePlus size={28} />
                    </div>
                    <p className="font-bold text-lg text-ink">Choose plant photo</p>
                    <p className="mt-1 text-[0.95rem] text-muted font-medium">JPG, PNG, or WEBP works best</p>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={onFileChange} className="hidden" disabled={loading} />
              </label>
              <button
                onClick={onAnalyze}
                disabled={!file || loading}
                className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-[1.25rem] bg-ink px-4 py-4 text-[1.1rem] font-bold text-paper transition-all hover:bg-ink/90 disabled:cursor-not-allowed disabled:bg-line disabled:text-muted hover:shadow-xl hover:-translate-y-1 active:translate-y-0 duration-200"
              >
                {loading ? <Loader2 className="animate-spin" size={22} /> : <UploadCloud size={22} />}
                {loading ? "Running prediction..." : "Run multi-agent prediction"}
              </button>
              {error && <p className="mt-4 rounded-xl border border-red-500/20 bg-red-50 p-4 text-[0.95rem] font-medium text-red-600 shadow-sm">{error}</p>}
            </>
          )}
        </section>

        <AgentTimeline activeStep={activeStep} done={Boolean(result)} />
      </div>

      </div>

      {result && (
        <div ref={reportRef} className="w-full px-8 md:px-12 lg:px-16 mx-auto pb-16 transition-all duration-700 ease-in-out mt-12">
          <ReportView result={result} />
        </div>
      )}
    </div>
  );
}
