import { AlertTriangle, ClipboardList, Leaf, Sprout, Bug, Calendar, Sun, Droplets, Mountain, CheckCircle2, FlaskConical, Stethoscope } from "lucide-react";
import MetricCard, { FormatText } from "./MetricCard.jsx";
import { useState } from "react";

export default function ReportView({ result }) {
  if (!result) return null;
  const diagnosis = result.vision_diagnosis;
  const prediction = result.lifecycle_prediction;
  const agentDebates = result.agent_debates || [];
  const treatmentPlan = result.treatment_plan;

  const [activeTab, setActiveTab] = useState("overview");

  const hasAdvancedFeatures = agentDebates.length > 0 && treatmentPlan;

  return (
    <section className="space-y-6 animate-fade-in pb-8">
      
      {/* Navigation Tabs */}
      {hasAdvancedFeatures && (
        <div className="flex bg-surface p-1 rounded-2xl md:rounded-full border border-line shadow-sm w-full max-w-2xl mx-auto mb-8">
          <button onClick={() => setActiveTab("overview")} className={`flex-1 py-2 rounded-xl md:rounded-full font-bold text-xs sm:text-[0.95rem] transition-all ${activeTab === 'overview' ? 'bg-ink text-paper shadow-md' : 'text-ink/60 hover:text-ink'}`}>Diagnosis Overview</button>
          <button onClick={() => setActiveTab("debates")} className={`flex-1 py-2 rounded-xl md:rounded-full font-bold text-xs sm:text-[0.95rem] transition-all ${activeTab === 'debates' ? 'bg-ink text-paper shadow-md' : 'text-ink/60 hover:text-ink'}`}>Agent Debates</button>
          <button onClick={() => setActiveTab("regimen")} className={`flex-1 py-2 rounded-xl md:rounded-full font-bold text-xs sm:text-[0.95rem] transition-all ${activeTab === 'regimen' ? 'bg-ink text-paper shadow-md' : 'text-ink/60 hover:text-ink'}`}>Treatment Regimen</button>
        </div>
      )}

      {activeTab === "overview" && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            <MetricCard label="Likely species" value={diagnosis.likely_species} tone={diagnosis.is_dead ? "default" : "green"} />
            <MetricCard label="Plant Status" value={diagnosis.is_dead ? "Dead" : "Alive"} tone={diagnosis.is_dead ? "critical" : "green"} />
            <MetricCard label="Action Priority" value={diagnosis.is_dead ? "Discard" : "Treat"} tone={diagnosis.is_dead ? "critical" : "warning"} />
            <MetricCard label="Risk level" value={diagnosis.is_dead ? "Critical (Dead)" : prediction.risk_level} tone={diagnosis.is_dead ? "critical" : "clay"} />
            <MetricCard label="Recovery prob." value={diagnosis.is_dead ? "0%" : prediction.recovery_probability} tone={diagnosis.is_dead ? "critical" : "blue"} />
            <MetricCard label="Growth stage" value={diagnosis.growth_stage} tone="default" />
          </div>

          {diagnosis.disease_detection && diagnosis.disease_detection.length > 0 ? (
            <div className="rounded-[1.5rem] border border-red-200 bg-red-50 p-6 shadow-sm">
               <div className="mb-5 flex items-center gap-2">
                 <Bug className="text-red-500" size={24} />
                 <h2 className="text-xl font-bold text-red-700">Disease & Pathogen Detection</h2>
               </div>
               <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                 {diagnosis.disease_detection.map((disease, i) => (
                   <div key={i} className="bg-white border border-red-100 rounded-2xl p-4 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md duration-200">
                     <p className="font-bold text-red-800 text-lg"><FormatText text={disease.name} /></p>
                     <div className="flex justify-between items-center mt-3 text-[0.85rem] font-semibold">
                       <span className={`px-3 py-1 rounded-full ${disease.severity === 'high' || disease.severity === 'critical' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                         Severity: <FormatText text={disease.severity} />
                       </span>
                       <span className="text-ink/50"><FormatText text={disease.confidence} /> conf.</span>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          ) : (
            <div className="rounded-[1.5rem] border border-sage/30 bg-sage/5 p-6 shadow-sm flex items-center gap-4">
               <Leaf className="text-sage" size={32} />
               <div>
                 <h2 className="text-xl font-bold text-sage">No Diseases Detected</h2>
                 <p className="text-[1rem] font-medium text-ink/70 mt-1">The diagnostic engine did not find any visible pathogens or critical diseases.</p>
               </div>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-[1.5rem] border border-line bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <div className="mb-5 flex items-center gap-2">
                <Leaf className="text-sage" size={24} />
                <h2 className="text-xl font-bold">Vision Diagnosis</h2>
              </div>
              <List title="Symptoms" items={diagnosis.symptoms} />
              <List title="Possible causes" items={diagnosis.possible_causes} />
              {diagnosis.environmental_stressors && diagnosis.environmental_stressors.length > 0 && (
                <List title="Environmental stressors" items={diagnosis.environmental_stressors} />
              )}
              <List title="Health observations" items={diagnosis.health_observations} />
              <p className="mt-5 rounded-xl bg-[#faf9f8] p-5 text-[0.95rem] text-ink/80 font-medium leading-relaxed border border-line shadow-inner"><FormatText text={diagnosis.visible_limitations} /></p>
            </div>

            <div className="rounded-[1.5rem] border border-line bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col gap-6">
              <div>
                <div className="mb-5 flex items-center gap-2">
                  <Sprout className="text-clay" size={24} />
                  <h2 className="text-xl font-bold">Lifecycle Prediction</h2>
                </div>
                <div className="mb-5 grid gap-3 sm:grid-cols-3">
                  <MetricCard label="Life estimate" value={prediction.remaining_life_weeks} tone="blue" />
                  <MetricCard label="Yield estimate" value={prediction.yield_estimate} />
                  <MetricCard label="Yield window" value={prediction.expected_yield_window} />
                </div>
                
                {prediction.prediction_timeline && prediction.prediction_timeline.length > 0 && (
                  <div className="mb-6">
                    <p className="mb-3 text-[0.95rem] font-bold">Prediction Timeline</p>
                    <div className="space-y-3">
                      {prediction.prediction_timeline.map((item, idx) => (
                        <div key={idx} className="flex gap-4 items-start bg-[#faf9f8] p-4 rounded-xl border border-line shadow-sm">
                           <div className="bg-clay/10 text-clay font-bold text-xs uppercase tracking-wider px-3 py-1 rounded-full whitespace-nowrap">
                              {item.timeframe}
                           </div>
                           <p className="text-[0.95rem] font-medium text-ink/80"><FormatText text={item.expected_change} /></p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <List title="General Action Plan" items={prediction.action_plan} numbered />
                
                {prediction.monitoring_advice && (
                   <div className="mt-5 p-4 rounded-xl bg-blue-50 border border-blue-100 text-blue-900 shadow-inner">
                      <p className="font-bold text-[0.9rem] mb-1 flex items-center gap-2"><CheckCircle2 size={16} /> Monitoring Advice</p>
                      <p className="text-[0.95rem] font-medium leading-relaxed"><FormatText text={prediction.monitoring_advice} /></p>
                   </div>
                )}
              </div>

              {prediction.environmental_requirements && (
                <div className="bg-[#faf9f8] rounded-2xl p-5 border border-line shadow-inner mt-auto">
                  <p className="mb-4 text-[0.95rem] font-bold">Optimal Requirements</p>
                  <div className="grid gap-3 sm:grid-cols-3">
                     <div className="flex flex-col gap-1.5 bg-white p-3.5 rounded-xl border border-line shadow-sm">
                       <div className="flex items-center gap-1.5 text-amber-500 font-bold text-[0.7rem] uppercase tracking-wider"><Sun size={14}/> Light</div>
                       <p className="text-[0.85rem] font-medium text-ink/80 leading-snug"><FormatText text={prediction.environmental_requirements.light} /></p>
                     </div>
                     <div className="flex flex-col gap-1.5 bg-white p-3.5 rounded-xl border border-line shadow-sm">
                       <div className="flex items-center gap-1.5 text-blue-500 font-bold text-[0.7rem] uppercase tracking-wider"><Droplets size={14}/> Water</div>
                       <p className="text-[0.85rem] font-medium text-ink/80 leading-snug"><FormatText text={prediction.environmental_requirements.water} /></p>
                     </div>
                     <div className="flex flex-col gap-1.5 bg-white p-3.5 rounded-xl border border-line shadow-sm">
                       <div className="flex items-center gap-1.5 text-clay font-bold text-[0.7rem] uppercase tracking-wider"><Mountain size={14}/> Soil</div>
                       <p className="text-[0.85rem] font-medium text-ink/80 leading-snug"><FormatText text={prediction.environmental_requirements.soil_nutrients} /></p>
                     </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "debates" && (
         <div className="space-y-6 animate-fade-in w-full max-w-4xl mx-auto">
            <div className="text-center mb-8">
               <h2 className="text-3xl font-serif font-bold text-ink mb-2">Multi-Agent Diagnostics</h2>
               <p className="text-ink/60 font-medium text-[1.05rem]">Review the raw analysis from our specialized AI experts before synthesis.</p>
            </div>
            
            <div className="grid gap-6">
              {agentDebates.map((agent, i) => (
                <div key={i} className="bg-white border border-line/40 rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
                   <div className="absolute top-0 left-0 w-2 h-full" style={{ backgroundColor: i===0?'#ef4444':i===1?'#eab308':'#22c55e' }}></div>
                   <div className="pl-4">
                      <div className="flex justify-between items-center mb-4">
                         <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-surface border border-line flex items-center justify-center">
                               {i===0 ? <Stethoscope className="text-red-500" size={24}/> : i===1 ? <FlaskConical className="text-yellow-500" size={24}/> : <Leaf className="text-green-500" size={24}/>}
                            </div>
                            <div>
                               <div className="font-bold text-xl leading-none">{agent.agent_name}</div>
                               <div className="font-medium text-ink/50 text-[0.85rem] mt-1 tracking-wider uppercase">{agent.agent_role}</div>
                            </div>
                         </div>
                         <div className="flex flex-col items-end">
                            <span className="text-[0.7rem] font-bold text-ink/50 uppercase tracking-widest">Confidence</span>
                            <span className={`text-[0.95rem] font-bold ${agent.confidence === 'high' ? 'text-green-600' : agent.confidence === 'medium' ? 'text-yellow-600' : 'text-red-600'}`}>{agent.confidence}</span>
                         </div>
                      </div>
                      <div className="bg-[#faf9f8] border border-line/50 p-5 rounded-2xl shadow-inner prose prose-sm max-w-none font-medium text-ink/80 leading-relaxed whitespace-pre-wrap">
                         {agent.opinion}
                      </div>
                   </div>
                </div>
              ))}
            </div>
         </div>
      )}

      {activeTab === "regimen" && treatmentPlan && (
         <div className="space-y-8 animate-fade-in w-full max-w-4xl mx-auto">
            <div className="text-center mb-10">
               <h2 className="text-3xl font-serif font-bold text-ink mb-2">Automated Treatment Regimen</h2>
               <p className="text-ink/60 font-medium text-[1.05rem]">Your day-by-day actionable recovery plan, generated by the Master Synthesizer.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
               <div className="bg-clay/10 border border-clay/20 rounded-2xl p-6 flex flex-col justify-center">
                  <div className="text-[0.8rem] font-bold text-clay/70 uppercase tracking-widest mb-1">Estimated Recovery Time</div>
                  <div className="text-2xl font-bold text-clay">{treatmentPlan.estimated_recovery_time}</div>
               </div>
               <div className="bg-white border border-line/40 shadow-sm rounded-2xl p-6">
                  <div className="text-[0.8rem] font-bold text-ink/50 uppercase tracking-widest mb-3">Required Materials</div>
                  <div className="flex flex-wrap gap-2">
                     {treatmentPlan.required_materials.map((mat, i) => (
                        <span key={i} className="px-3 py-1.5 bg-[#faf9f8] border border-line rounded-lg text-[0.85rem] font-bold text-ink/80">{mat}</span>
                     ))}
                  </div>
               </div>
            </div>

            <div className="relative">
               <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-line z-0"></div>
               <div className="space-y-6 relative z-10">
                  {treatmentPlan.daily_regimen.map((step, i) => (
                     <div key={i} className="flex gap-6 items-start group">
                        <div className="w-14 h-14 rounded-full bg-white border-[3px] border-clay shadow-sm flex flex-col items-center justify-center shrink-0 mt-1 transition-transform group-hover:scale-110 duration-300">
                           <span className="text-[0.6rem] font-bold text-ink/50 uppercase tracking-widest leading-none">Day</span>
                           <span className="text-xl font-bold text-ink leading-none mt-0.5">{step.day}</span>
                        </div>
                        <div className="flex-1 bg-white border border-line/40 rounded-2xl p-6 shadow-sm group-hover:shadow-md transition-shadow cursor-pointer">
                           <div className="flex justify-between items-start mb-2">
                              <h3 className="text-lg font-bold text-ink">{step.action}</h3>
                              <button className="text-ink/20 hover:text-green-500 transition-colors">
                                 <CheckCircle2 size={24} />
                              </button>
                           </div>
                           <p className="text-[0.95rem] font-medium text-ink/70 leading-relaxed">
                              {step.details}
                           </p>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      )}

      <div className="mt-12 rounded-xl border border-dashed border-line p-5 text-center text-sm font-medium text-ink/40">
        <FormatText text={result.disclaimer} />
      </div>
    </section>
  );
}

function List({ title, items, numbered = false }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="mb-5">
      <p className="mb-2 text-[0.95rem] font-bold text-ink/60">{title}</p>
      {numbered ? (
        <ol className="space-y-2.5">
          {items.map((item, i) => (
            <li key={i} className="flex gap-3 text-[0.95rem] font-medium leading-relaxed">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-bold text-paper shadow-sm">{i + 1}</span>
              <span className="pt-0.5"><FormatText text={item} /></span>
            </li>
          ))}
        </ol>
      ) : (
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li key={i} className="flex gap-2 text-[0.95rem] font-medium leading-relaxed">
              <span className="text-sage mt-1 shrink-0">•</span>
              <span><FormatText text={item} /></span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
