import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Search, Camera, Bot, CalendarClock, Stethoscope, ShieldCheck, Zap, Database, CheckCircle2, ChevronRight, Code, MessageSquare, TerminalSquare, Layers, Cpu, Smartphone, LayoutDashboard, Settings, FileText, Globe, Leaf, MessageCircle, Users } from "lucide-react";
import TopNavbar from "../components/TopNavbar.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function TypingText({ text }) {
  const [displayText, setDisplayText] = useState("");
  
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setDisplayText(text.substring(0, index + 1));
      index++;
      if (index === text.length) clearInterval(interval);
    }, 100);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <span className="italic text-clay relative inline-block">
      {displayText}
      <span className="absolute -right-2 top-1 bottom-2 w-1 bg-clay animate-pulse"></span>
    </span>
  );
}

function CapabilitiesSection() {
  return (
    <section className="py-24 px-6 md:px-8 max-w-6xl mx-auto">
      <h2 className="font-serif text-[2.2rem] sm:text-[3rem] text-center text-ink mb-16 tracking-tight">
        PhytoNexus's capabilities
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-center md:text-left mb-24">
        <div>
          <Camera className="w-10 h-10 text-ink mb-6 mx-auto md:mx-0" strokeWidth={1.5} />
          <h3 className="font-bold text-lg text-ink mb-3">Advanced visual analysis</h3>
          <p className="text-ink/70 text-sm leading-relaxed">Upload any plant image for instant disease, pest, and species detection using our custom-trained Vision Transformer models.</p>
        </div>
        <div>
          <Bot className="w-10 h-10 text-ink mb-6 mx-auto md:mx-0" strokeWidth={1.5} />
          <h3 className="font-bold text-lg text-ink mb-3">Agentic workflow</h3>
          <p className="text-ink/70 text-sm leading-relaxed">Our multi-agent pipeline simulates an entire team of expert botanists consulting on your plant's health simultaneously.</p>
        </div>
        <div>
          <CalendarClock className="w-10 h-10 text-ink mb-6 mx-auto md:mx-0" strokeWidth={1.5} />
          <h3 className="font-bold text-lg text-ink mb-3">Lifecycle tracking</h3>
          <p className="text-ink/70 text-sm leading-relaxed">Accurate predictions of botanical growth stages, expected lifespans, and future health trajectories based on current data.</p>
        </div>
        <div>
          <Stethoscope className="w-10 h-10 text-ink mb-6 mx-auto md:mx-0" strokeWidth={1.5} />
          <h3 className="font-bold text-lg text-ink mb-3">Care recommendations</h3>
          <p className="text-ink/70 text-sm leading-relaxed">Generate incredibly detailed, step-by-step recovery and maintenance plans tailored exactly to the detected diagnosis.</p>
        </div>
      </div>
      
    </section>
  );
}

function SystemArchitectureSection() {
  return (
    <section className="py-12 px-6 md:px-16 lg:px-24 w-full mx-auto mb-8">
       <div className="w-full bg-[#efeee8] rounded-[2rem] p-8 md:p-16 flex flex-col lg:flex-row items-center justify-between gap-16 shadow-sm">
           {/* Left Text */}
           <div className="w-full lg:w-1/2 flex flex-col items-start text-left">
              <h2 className="font-sans text-3xl md:text-4xl text-ink font-bold mb-4 tracking-tight">AI Diagnostic Engine</h2>
              <p className="text-ink/80 text-lg mb-8 leading-relaxed font-medium">
                Upload a photo of your plant, and our specialized multi-agent pipeline will work together to identify the species, diagnose diseases, and generate an actionable treatment plan.
              </p>
              <Link to="/qa" className="bg-[#1a1a1a] text-white px-8 py-3 rounded-[1rem] font-medium shadow-md hover:bg-black transition-colors">
                 Try FloraChat now
              </Link>
           </div>
          
          {/* Right Interface Mock */}
         <div className="w-full lg:w-[50%] flex flex-col gap-4 relative">
            <div className="bg-white rounded-[1rem] p-3 self-end shadow-sm flex items-center gap-4 border border-line/50 hover:shadow-md transition-shadow">
               <div className="bg-[#5c7a52] text-white p-3 rounded-lg"><Camera size={18} strokeWidth={2}/></div>
               <div className="flex flex-col pr-4">
                  <span className="text-sm font-bold text-ink">tomato_leaf_sample_A4.jpg</span>
                  <span className="text-[0.65rem] font-medium text-ink/50 uppercase tracking-wide">High-res Vision Scan • 2.4MB</span>
               </div>
            </div>
            
            <div className="flex gap-3 self-end justify-end w-full mt-2">
               <div className="bg-[#c2d1b4] rounded-2xl rounded-tr-sm p-4 text-[0.95rem] font-medium shadow-sm max-w-[85%] text-ink leading-snug">
                  Diagnose this leaf and provide a multi-agent treatment plan.
               </div>
               <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-sm mt-1">
                  YV
               </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 text-[0.95rem] shadow-sm border border-line/50 w-full mt-2 leading-relaxed">
               <div className="font-mono text-[0.85rem] mb-4 space-y-2">
                 <div className="text-[#d16b47] font-bold flex gap-2"><span>[VISION_AGENT]</span> <span className="text-ink/70 font-medium">Analyzing... Early Blight (Alternaria solani) detected.</span></div>
                 <div className="text-[#5c7a52] font-bold flex gap-2"><span>[LIFECYCLE_EXPERT]</span> <span className="text-ink/70 font-medium">Plant is in early fruiting. Yield risk: High.</span></div>
                 <div className="text-[#1b62f3] font-bold flex gap-2"><span>[TREATMENT_AGENT]</span> <span className="text-ink/70 font-medium">Generating organic fungicide protocol.</span></div>
               </div>
               <p className="font-bold text-ink mb-2">Recommended Action:</p>
               <ul className="text-ink/70 space-y-1.5 list-disc pl-5 font-medium marker:text-ink/30">
                  <li>Apply copper-based fungicide immediately.</li>
                  <li>Prune affected lower leaves to improve airflow.</li>
                  <li>Ensure bottom-watering to keep foliage dry.</li>
               </ul>
            </div>
         </div>
       </div>
    </section>
  );
}

function WhyPhytoNexusSection() {
  return (
    <section className="min-h-[calc(100vh-3.5rem)] py-16 px-6 md:px-8 max-w-6xl mx-auto flex flex-col justify-center">
      <div className="flex-shrink-0">
        <h2 className="font-serif text-[2.2rem] sm:text-[3rem] text-center text-ink mb-2 tracking-tight">
          Why PhytoNexus?
        </h2>
        <p className="text-center text-ink/70 mb-10 font-medium">A foundation of security and reliability for your agricultural data.</p>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-12 flex-1 min-h-0">
         {/* Left text column */}
         <div className="w-full lg:w-[30%] flex flex-col justify-between h-full py-4 pr-4">
            <div>
              <h3 className="font-bold text-ink mb-1.5 text-xl">Secure</h3>
              <p className="text-[0.95rem] text-ink/70 leading-relaxed">Our robust data privacy protocols ensure that your proprietary greenhouse data, location tags, and crop yields remain strictly confidential and encrypted.</p>
            </div>
            <div>
              <h3 className="font-bold text-ink mb-1.5 text-xl">Accurate</h3>
              <p className="text-[0.95rem] text-ink/70 leading-relaxed">Continuously fine-tuned on verified botanical datasets to reduce hallucination and provide precise, scientifically-backed diagnoses.</p>
            </div>
            <div>
              <h3 className="font-bold text-ink mb-1.5 text-xl">Comprehensive</h3>
              <p className="text-[0.95rem] text-ink/70 leading-relaxed">From a simple houseplant to massive industrial crops, our models scale to handle thousands of species and complex environmental variables.</p>
            </div>
         </div>
         
         {/* Right Image */}
         <div className="w-full lg:w-[70%] flex items-center justify-center h-full mix-blend-multiply">
            <img src="/dashboard.png" alt="PhytoNexus Features" className="w-full h-auto max-h-[85vh] object-contain scale-[1.05] hover:scale-[1.08] transition-transform duration-500 origin-center" />
         </div>
      </div>
    </section>
  );
}


function FooterSection() {
  return (
    <footer className="bg-paper text-ink pt-16 pb-8 px-6 md:px-16 lg:px-24 w-full min-h-[calc(100vh-3.5rem)] flex flex-col justify-between">
      {/* Top Row */}
      <div className="w-full mx-auto flex flex-col lg:flex-row justify-between items-start gap-12 lg:gap-0">
        <div className="mb-8 lg:mb-0">
          <h2 className="text-[2rem] md:text-5xl font-medium tracking-tight">Experience liftoff</h2>
        </div>
        
        <div className="flex gap-12 md:gap-32 font-medium text-[1rem]">
          <ul className="space-y-5">
            <li><Link to="/analyze" className="hover:underline">Analyze</Link></li>
            <li><Link to="/qa" className="hover:underline">FloraAI</Link></li>
            <li><Link to="/encyclopedia" className="hover:underline">Encyclopedia</Link></li>
          </ul>
          <ul className="space-y-5">
             <a href="https://github.com/yuvanvishnupandi/phytonexus" target="_blank" rel="noopener noreferrer" className="hover:text-ink transition-colors">GitHub Repository</a>
            <li><Link to="/history" className="hover:underline">History</Link></li>
          </ul>
        </div>
      </div>
      
      {/* Massive Text Row */}
      <div className="w-full flex justify-center items-center flex-1 overflow-visible">
        <h1 className="text-[17vw] leading-none font-bold tracking-tighter text-ink pointer-events-none select-none">
          PhytoNexus
        </h1>
      </div>
      
      {/* Bottom Row */}
      <div className="w-full mx-auto flex flex-col md:flex-row justify-between items-center gap-6 pt-12 text-[0.9rem] font-bold">
        <div className="flex items-center gap-2 font-serif text-xl">
          <img src="/favicon.png" alt="Logo" className="w-6 h-6 grayscale" style={{ imageRendering: 'pixelated' }} />
          PhytoNexus
        </div>
        <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-ink/70">
          {/* <Link to="/" className="hover:text-ink transition-colors">Documentation</Link> */}
         
          {/* <Link to="/" className="hover:text-ink transition-colors">System Architecture</Link> */}
          {/* <Link to="/" className="hover:text-ink transition-colors">Model Guidelines</Link> */}
        </div>
      </div>
    </footer>
  );
}

function HeroSection() {
  const { user, loading } = useAuth();
  
  return (
    <section className="flex flex-col-reverse lg:flex-row items-center justify-between pt-8 pb-16 lg:pb-20 px-6 md:px-16 lg:px-24 w-full mx-auto gap-12 lg:gap-16 min-h-[calc(100vh-3.5rem)]">
      
      {/* Left Side: Text & Actions */}
      <div className="w-full lg:w-[45%] flex flex-col items-center lg:items-start text-center lg:text-left mt-8 lg:mt-0">
        
        <h1 className="mb-6 font-serif text-[2.7rem] sm:text-[4.5rem] leading-[1.05] tracking-tight text-ink">
          Understand your plants in <TypingText text="one snapshot." />
        </h1>
        
        <p className="mb-12 text-lg sm:text-xl text-ink/70 font-medium max-w-xl">
          Agentic AI that helps you diagnose diseases, predict botanical lifecycles, and care for your plants with total confidence.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center lg:justify-start">
          <Link to="/analyze" className="flex w-full sm:w-auto justify-center items-center gap-2 rounded-full bg-ink px-8 py-4 text-[1.05rem] font-bold text-paper shadow-md transition hover:bg-ink/90 hover:scale-105 transform duration-200">
            Start your diagnosis <ArrowRight size={18} />
          </Link>
          {!loading && !user && (
            <Link to="/register" className="flex w-full sm:w-auto justify-center items-center gap-2 rounded-full bg-surface border-2 border-line px-8 py-3.5 text-[1.05rem] font-bold text-ink shadow-sm transition hover:bg-line/50 hover:scale-105 transform duration-200">
              Create an account
            </Link>
          )}
        </div>
      </div>

      {/* Right Side: Hero Image Mockup */}
      <div className="w-full lg:w-[50%] flex justify-center lg:justify-end items-center relative">
        <img src="/brain-plant.png" alt="AI Botanical Brain" className="w-full max-w-[320px] lg:max-w-none lg:w-[85%] max-h-[50vh] lg:max-h-[80vh] object-contain hover:-translate-y-2 transition-transform duration-500" />
      </div>

    </section>
  );
}

export default function HomePage() {
  return (
    <div className="w-full bg-paper font-sans text-ink selection:bg-clay/20">
      
      {/* 1. Unified Top Navigation */}
      <TopNavbar />

      {/* 2. Hero Section */}
      <HeroSection />      {/* Content Sections */}
      <CapabilitiesSection />
      <SystemArchitectureSection />
      <WhyPhytoNexusSection />
      <FooterSection />

    </div>
  );
}
