import { Search, Book, ExternalLink, Loader2, Sprout, AlertCircle, Check, ChevronDown } from "lucide-react";
import { useState } from "react";

export default function EncyclopediaPage() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [images, setImages] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);
    setSections([]);
    setImages([]);

    try {
      const wikiSearchRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query.trim() + " plant")}&utf8=&format=json&origin=*`);
      if (!wikiSearchRes.ok) throw new Error("Failed to connect to Wikipedia.");
      const wikiSearchData = await wikiSearchRes.json();

      if (!wikiSearchData.query.search || wikiSearchData.query.search.length === 0) {
        throw new Error("No information found for this query. Try a different plant name.");
      }

      const wikiTitle = wikiSearchData.query.search[0].title;

      const summaryRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiTitle)}`);
      if (!summaryRes.ok) throw new Error("Failed to fetch Wikipedia summary.");
      const wikiSummary = await summaryRes.json();

      let taxonomy = null;
      let fetchedImages = [];
      try {
        const gbifMatchRes = await fetch(`https://api.gbif.org/v1/species/match?name=${encodeURIComponent(wikiTitle)}`);
        const gbifData = await gbifMatchRes.json();
        
        if (gbifData.usageKey && (gbifData.kingdom === "Plantae" || gbifData.kingdom === "Fungi")) {
          taxonomy = {
            kingdom: gbifData.kingdom,
            phylum: gbifData.phylum,
            order: gbifData.order,
            family: gbifData.family,
            genus: gbifData.genus,
            species: gbifData.species,
          };

          const occRes = await fetch(`https://api.gbif.org/v1/occurrence/search?taxonKey=${gbifData.usageKey}&mediaType=StillImage&limit=20`);
          if (occRes.ok) {
            const occData = await occRes.json();
            if (occData.results) {
              const uniqueImages = [];
              for (const record of occData.results) {
                if (record.media) {
                  for (const media of record.media) {
                    if (media.type === "StillImage" && media.identifier && !uniqueImages.includes(media.identifier)) {
                      uniqueImages.push(media.identifier);
                      if (uniqueImages.length >= 6) break;
                    }
                  }
                }
                if (uniqueImages.length >= 6) break;
              }
              fetchedImages = uniqueImages;
            }
          }
        }
      } catch (e) {
        console.error("GBIF fetch failed gracefully", e);
      }

      if (fetchedImages.length === 0 && wikiSummary.thumbnail) {
        fetchedImages = [wikiSummary.thumbnail.source];
      }
      setImages(fetchedImages);

      const combinedResult = {
        title: wikiSummary.title,
        scientificName: taxonomy ? taxonomy.species || taxonomy.genus || wikiSummary.title : wikiSummary.title,
        description: wikiSummary.description || "Botanical specimen",
        extract: wikiSummary.extract || "No detailed description available.",
        taxonomy: taxonomy
      };

      setResult(combinedResult);

      try {
        const fullRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=1&format=json&redirects=1&origin=*&titles=${encodeURIComponent(wikiTitle)}`);
        if (fullRes.ok) {
          const fullData = await fullRes.json();
          const pages = fullData.query?.pages;
          if (pages) {
            const pageId = Object.keys(pages)[0];
            const extract = pages[pageId].extract;
            if (extract) {
              const rawSections = extract.split(/\n== /);
              const parsedSections = [];
              for (let i = 1; i < rawSections.length; i++) {
                let chunk = rawSections[i].trim();
                if (chunk.includes("==")) {
                   let [title, ...content] = chunk.split("==");
                   let text = content.join("==").trim();
                   text = text.replace(/={2,}/g, "");
                   if (text.length > 50 && !title.toLowerCase().includes("see also") && !title.toLowerCase().includes("references") && !title.toLowerCase().includes("external links")) {
                     parsedSections.push({ title: title.trim(), content: text });
                   }
                }
              }
              setSections(parsedSections);
            }
          }
        }
      } catch (e) {
        console.error("Wikipedia full article fetch failed", e);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full px-6 md:px-12 pt-2 pb-8 md:pb-12">
      <div className="mb-4 text-center animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-ink tracking-tight mb-4 mt-2">
          Botanical Encyclopedia
        </h1>
        <p className="text-ink/60 text-lg max-w-xl mx-auto">
          Explore the world's largest open botanical database. Search by common name, genus, or species.
        </p>
      </div>

      <form onSubmit={handleSearch} className="mx-auto mb-10 flex w-full max-w-5xl items-center gap-3 rounded-[2rem] border border-line bg-surface p-2 shadow-sm transition-all focus-within:shadow-md focus-within:border-ink/30 relative z-20">
        <div className="pl-4 text-ink/50">
          <Search size={22} />
        </div>
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. Monstera Deliciosa, Venus Flytrap..." 
          className="flex-1 min-w-0 bg-transparent px-2 py-3.5 text-[1.1rem] text-ink outline-none placeholder:text-ink/30 font-medium"
        />
        <button 
          type="submit"
          disabled={isLoading || !query.trim()}
          className="rounded-[1.5rem] bg-ink px-5 sm:px-8 py-3.5 font-bold text-paper transition-all hover:bg-ink/90 disabled:opacity-50 flex items-center justify-center min-w-[90px] sm:min-w-[120px]"
        >
          {isLoading ? <Loader2 size={20} className="animate-spin" /> : "Search"}
        </button>
      </form>

      {error && (
        <div className="mx-auto max-w-3xl mb-12 rounded-2xl border border-red-200 bg-red-50 p-5 flex items-center gap-3 text-red-700 animate-fade-in shadow-sm">
          <AlertCircle size={20} className="shrink-0" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {isLoading && !error && (
        <div className="mx-auto w-full max-w-6xl space-y-6 animate-pulse">
           <div className="h-64 bg-surface rounded-3xl border border-line"></div>
           <div className="space-y-3">
             <div className="h-4 bg-surface rounded-full w-3/4"></div>
             <div className="h-4 bg-surface rounded-full w-5/6"></div>
             <div className="h-4 bg-surface rounded-full w-1/2"></div>
           </div>
        </div>
      )}

      {result && !isLoading && (
        <div className="mx-auto w-full animate-fade-in pb-12">
          <div className="rounded-[2rem] border border-line bg-surface shadow-xl p-6 md:p-10 lg:p-12">
            
            <div className="flex flex-col lg:flex-row gap-10 mb-12">
               
               <div className="shrink-0 w-full lg:w-[500px]">
                 {images.length > 0 ? (
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 h-full">
                     {images.slice(0, 4).map((imgUrl, idx) => (
                       <div key={idx} className={`rounded-2xl overflow-hidden bg-[#f0eee9] border border-line shadow-inner ${idx === 0 ? 'sm:col-span-2 h-[250px]' : 'h-[150px]'}`}>
                         <img 
                           src={imgUrl} 
                           alt={`${result.title} image ${idx + 1}`} 
                           className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                           onError={(e) => { e.target.style.display = 'none'; }}
                         />
                       </div>
                     ))}
                   </div>
                 ) : (
                   <div className="w-full h-[350px] lg:h-[450px] rounded-[2rem] bg-sage/5 border border-sage/20 flex flex-col items-center justify-center text-sage">
                     <Sprout size={80} className="opacity-50" />
                     <span className="mt-4 font-medium opacity-70">No image available</span>
                   </div>
                 )}
               </div>

               <div className="flex-1 flex flex-col justify-center">
                 <h2 className="text-5xl lg:text-7xl font-serif font-bold text-ink mb-2 tracking-tight capitalize" dangerouslySetInnerHTML={{__html: result.title}}></h2>
                 {result.description && (
                   <p className="text-xl text-sage font-medium capitalize mb-8 tracking-wide">{result.description}</p>
                 )}
                 
                 <div className="bg-[#f8f7f5] rounded-[1.5rem] p-6 lg:p-8 border border-line mb-6 shadow-sm">
                   <h3 className="text-sm font-bold uppercase tracking-widest text-ink/40 mb-4">Scientific Classification (GBIF)</h3>
                   <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-6 gap-x-4 text-ink/80 font-medium">
                      
                      {result.taxonomy && Object.entries(result.taxonomy).map(([rank, name]) => {
                         if (!name) return null;
                         return (
                           <div key={rank} className="flex flex-col">
                             <span className="text-[0.7rem] uppercase tracking-wider opacity-50 font-bold mb-1">{rank}</span>
                             <span className="capitalize">{name}</span>
                           </div>
                         );
                      })}
                   </div>
                 </div>
               </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
              <details className="group border border-line rounded-[1.5rem] bg-surface overflow-hidden shadow-sm" open>
                <summary className="cursor-pointer px-8 py-6 font-bold text-xl text-ink list-none flex justify-between items-center bg-[#f8f7f5] group-open:border-b group-open:border-line transition-colors hover:bg-line/30">
                  Botanical Summary
                  <ChevronDown size={24} className="text-ink/50 group-open:rotate-180 transition-transform duration-300" />
                </summary>
                <div className="p-8 text-ink/80 text-lg leading-relaxed whitespace-pre-wrap">
                  {result.extract}
                </div>
              </details>

              {sections.length > 0 ? (
                sections.map((section, idx) => (
                  <details key={idx} className="group border border-line rounded-[1.5rem] bg-surface overflow-hidden shadow-sm">
                    <summary className="cursor-pointer px-8 py-6 font-bold text-xl text-ink list-none flex justify-between items-center bg-[#f8f7f5] group-open:border-b group-open:border-line transition-colors hover:bg-line/30 capitalize">
                      {section.title}
                      <ChevronDown size={24} className="text-ink/50 group-open:rotate-180 transition-transform duration-300" />
                    </summary>
                    <div className="p-8 text-ink/80 text-lg leading-relaxed whitespace-pre-wrap">
                      {section.content}
                    </div>
                  </details>
                ))
              ) : (
                <details className="group border border-line rounded-[1.5rem] bg-surface overflow-hidden shadow-sm">
                  <summary className="cursor-pointer px-8 py-6 font-bold text-xl text-ink list-none flex justify-between items-center bg-[#f8f7f5] group-open:border-b group-open:border-line transition-colors hover:bg-line/30">
                    Taxonomy & Classification Details
                    <ChevronDown size={24} className="text-ink/50 group-open:rotate-180 transition-transform duration-300" />
                  </summary>
                  <div className="p-8 text-ink/80 text-lg leading-relaxed">
                    <p>No extra details available for this specific entry. For the complete taxonomic hierarchy, please consult the complete Wikipedia article below.</p>
                  </div>
                </details>
              )}
            </div>

            {result.content_urls?.desktop?.page && (
               <div className="mt-12 flex justify-end">
                  <a 
                    href={result.content_urls.desktop.page} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 px-10 py-5 rounded-full bg-ink text-paper text-lg font-bold hover:bg-ink/90 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                  >
                    Read full article on Wikipedia <ExternalLink size={20} />
                  </a>
               </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
