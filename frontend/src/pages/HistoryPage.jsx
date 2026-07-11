import { RefreshCw, Leaf, Calendar, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { getAnalyses } from "../services/api.js";
import { useAuth } from "../context/AuthContext";

export default function HistoryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { token } = useAuth();

  async function loadHistory() {
    setLoading(true);
    setError("");
    try {
      const data = await getAnalyses(token);
      setItems(data.items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "Unknown Date";
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="w-full px-8 md:px-16 lg:px-24 mx-auto py-8 md:py-12">
      <div className="mb-12 flex flex-col md:flex-row items-start md:items-end justify-between gap-6 animate-fade-in">
        <div>
          <div className="flex items-center gap-2 mb-3">
             <div className="w-8 h-8 rounded-full bg-sage/10 text-sage flex items-center justify-center">
               <Leaf size={16} />
             </div>
             <span className="text-sm font-bold uppercase tracking-widest text-ink/40">PhytoNexus Reports</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-ink tracking-tight">
            Diagnostic History
          </h1>
          <p className="text-ink/60 mt-3 max-w-xl text-[1.05rem]">
            Review your past botanical analyses, health diagnoses, and lifecycle estimates.
          </p>
        </div>
        
        <button 
          onClick={loadHistory} 
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-bold text-ink hover:bg-black/5 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          {loading ? "Syncing..." : "Sync Records"}
        </button>
      </div>

      {loading && items.length === 0 && (
        <div className="mx-auto w-full space-y-6 animate-pulse">
           {[1, 2, 3].map(i => (
             <div key={i} className="h-48 bg-surface rounded-[1.5rem] border border-line"></div>
           ))}
        </div>
      )}
      
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm flex items-start gap-3">
           <AlertTriangle size={24} className="shrink-0" />
           <div>
             <h3 className="font-bold mb-1">Failed to sync records</h3>
             <p className="text-sm font-medium">{error}</p>
           </div>
        </div>
      )}
      
      {!loading && !items.length && !error && (
        <div className="rounded-[2rem] border-2 border-dashed border-line bg-surface p-12 text-center flex flex-col items-center">
          <Leaf size={48} className="text-ink/20 mb-4" />
          <h3 className="text-xl font-serif font-bold text-ink mb-2">No Diagnostics Found</h3>
          <p className="text-ink/60 max-w-sm">You haven't run any plant analyses yet. Head over to the Analyze page to get started!</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        {items.map((item) => {
          const imageSrc = item.image_base64 ? `data:image/jpeg;base64,${item.image_base64}` : null;
          const riskLevel = item.lifecycle_prediction?.risk_level || "unknown";
          
          return (
            <article 
              key={item._id} 
              className="group rounded-[1.5rem] border border-line bg-surface p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6 md:gap-8 animate-fade-in"
            >
              <div className="shrink-0 w-full md:w-48 h-48 rounded-2xl overflow-hidden bg-[#f8f7f5] border border-line relative">
                {imageSrc ? (
                  <img src={imageSrc} alt={item.filename} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-ink/20">
                    <Leaf size={40} />
                    <span className="text-xs font-medium mt-2">No Image</span>
                  </div>
                )}
                
                <div className="absolute top-3 right-3">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm border ${
                    riskLevel.toLowerCase().includes('low') ? 'bg-green-100 text-green-800 border-green-200' :
                    riskLevel.toLowerCase().includes('high') ? 'bg-red-100 text-red-800 border-red-200' :
                    'bg-yellow-100 text-yellow-800 border-yellow-200'
                  }`}>
                    {riskLevel} Risk
                  </span>
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-between py-1">
                <div>
                  <div className="flex items-center gap-2 text-ink/50 text-xs font-bold uppercase tracking-wider mb-2">
                    <Calendar size={14} />
                    {formatDate(item.created_at)}
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-ink mb-1 truncate">
                    {item.vision_diagnosis?.likely_species?.split(',')[0] || item.filename}
                  </h2>
                  <p className="text-sm font-medium text-sage mb-6 line-clamp-1">
                    {item.vision_diagnosis?.likely_species || "Unknown species"}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-[#f8f7f5] rounded-xl p-3 border border-line/50">
                    <span className="block text-xs font-bold uppercase tracking-wider text-ink/40 mb-1">Life Estimate</span>
                    <p className="text-sm font-medium text-ink/90 line-clamp-2">
                      {item.lifecycle_prediction?.remaining_life_weeks || "N/A"}
                    </p>
                  </div>
                  <div className="bg-[#f8f7f5] rounded-xl p-3 border border-line/50">
                    <span className="block text-xs font-bold uppercase tracking-wider text-ink/40 mb-1">Expected Yield</span>
                    <p className="text-sm font-medium text-ink/90 line-clamp-2">
                      {item.lifecycle_prediction?.yield_estimate || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
