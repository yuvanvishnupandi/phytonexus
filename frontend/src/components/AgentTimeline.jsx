import { Check, Circle, Loader2, Terminal, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

function TypewriterText({ text }) {
  const [displayedText, setDisplayedText] = useState("");
  
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.substring(0, i + 1));
      i++;
      if (i >= text.length) {
        clearInterval(interval);
      }
    }, 10);
    
    return () => clearInterval(interval);
  }, [text]);

  return <span>{displayedText}</span>;
}

const steps = ["Upload received", "Vision Diagnostician", "Multi-Agent Debate", "Synthesizing Treatment"];

const agentLogs = [
  { step: 0, logs: ["[SYSTEM] Establishing secure connection...", "[SYSTEM] Receiving encrypted Base64 image payload...", "[SYSTEM] Image processing ready."] },
  { step: 1, logs: ["[VISION_AGENT] Booting ResNet-50 & ViT pipelines...", "[VISION_AGENT] Extracting visual features...", "[VISION_AGENT] Base symptoms identified."] },
  { step: 2, logs: ["[PATHOLOGIST_AGENT] Analyzing for fungal & bacterial markers...", "[SOIL_CHEMIST_AGENT] Checking for nutrient deficiencies...", "[BOTANIST_AGENT] Evaluating environmental stressors...", "[SYSTEM] Debating initial diagnosis in parallel..."] },
  { step: 3, logs: ["[MASTER_SYNTHESIZER] Aggregating multi-agent debates...", "[MASTER_SYNTHESIZER] Calculating automated treatment regimen...", "[SYSTEM] Final 7-Day Treatment Plan generated."] }
];

export default function AgentTimeline({ activeStep, done }) {
  const [displayedLogs, setDisplayedLogs] = useState([]);

  useEffect(() => {
    if (done) {
      setDisplayedLogs(agentLogs.flatMap(a => a.logs));
      return;
    }
    
    const currentLogs = agentLogs.filter(a => a.step <= activeStep).flatMap(a => a.logs);
    setDisplayedLogs(currentLogs);
    
  }, [activeStep, done]);

  return (
    <div className="flex flex-col gap-6 h-full min-h-0">
      <div className="w-full flex-1 min-h-0 rounded-[1.5rem] bg-[#1a1a1a] shadow-2xl overflow-hidden border border-line text-left font-mono text-[0.85rem] flex flex-col transition-all duration-300">
        <div className="bg-[#2d2d2d] px-4 py-3 flex items-center gap-2 border-b border-[#404040]">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
          <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
          <div className="ml-4 text-[#a0a0a0] text-xs font-sans font-medium tracking-wide flex items-center gap-2">
            <Terminal size={12}/> AI Diagnostic Engine
          </div>
        </div>
        
        <div className="px-5 py-4 flex-1 flex flex-col gap-2 bg-black/50 leading-snug overflow-hidden">
          <div className="text-white font-medium">
            <span className="text-[#00c3ff] font-bold">system</span><span className="text-white/40">@</span><span className="text-white">phytonexus</span> <span className="text-white/40">~ %</span> ./run_diagnostics.sh
          </div>
          
          <div className="flex flex-col gap-2 mt-2">
             {displayedLogs.map((log, i) => (
               <div key={i} className={`font-medium tracking-tight ${log.includes('[SYSTEM]') ? 'text-[#a0a0a0]' : log.includes('VISION') ? 'text-[#00c3ff]' : log.includes('LIFECYCLE') ? 'text-[#ffbd2e]' : 'text-[#27c93f]'}`}>
                 <TypewriterText text={log} />
               </div>
             ))}
          </div>

          {!done && (
            <div className="flex items-center gap-2 mt-2">
              <span className="w-2 h-4 bg-[#00ff00] animate-pulse inline-block"></span>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-line bg-surface p-4 sm:px-8 shadow-sm overflow-hidden">
        <div className="relative flex items-center justify-between min-w-[320px] w-full px-2">
          <div className="absolute top-1/2 left-4 right-4 h-1 bg-line -translate-y-1/2 z-0 rounded-full"></div>
          
          <div 
            className="absolute top-1/2 left-4 h-1 bg-clay -translate-y-1/2 z-0 transition-all duration-500 ease-in-out rounded-full"
            style={{ width: done ? 'calc(100% - 2rem)' : `calc(${(activeStep / (steps.length - 1)) * 100}% - 2rem)` }}
          ></div>

          {steps.map((step, index) => {
            const complete = done || index < activeStep;
            const active = !done && index === activeStep;
            const pending = !done && index > activeStep;

            return (
              <div key={step} className="flex flex-col items-center gap-3 relative z-10 w-20 sm:w-24 shrink-0">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-surface
                    ${complete ? 'border-clay text-clay bg-clay/10' : 
                      active ? 'border-clay text-clay shadow-[0_0_15px_rgba(217,119,87,0.3)]' : 
                      'border-line text-muted'}`}
                >
                  {complete ? (
                    <Check size={16} strokeWidth={3} />
                  ) : active ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-line"></div>
                  )}
                </div>
                <span className={`text-[0.75rem] text-center font-bold uppercase tracking-wider leading-tight ${active || complete ? 'text-ink' : 'text-muted'}`}>
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
