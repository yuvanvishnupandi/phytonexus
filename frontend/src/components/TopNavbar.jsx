import { Leaf, LogOut, History, User as UserIcon, ChevronDown, Home, Sparkles, BookOpen, Globe, MessageSquare, Mic, Menu, X } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const ChartSearchIcon = ({ size = 14, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="8" y1="14" x2="8" y2="10" />
    <line x1="11" y1="14" x2="11" y2="6" />
    <line x1="14" y1="14" x2="14" y2="10" />
  </svg>
);



export default function TopNavbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileFloraAiOpen, setIsMobileFloraAiOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, logout, loading } = useAuth();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 w-full bg-paper backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full items-center justify-between px-8 md:px-16 lg:px-24">
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-2 font-bold tracking-tight text-ink font-serif text-[1.4rem]">
            <img src="/favicon.png" alt="PhytoNexus Logo" className="w-6 h-6 object-contain" style={{ imageRendering: 'pixelated' }} />
            PhytoNexus
          </Link>
        </div>
        
        <nav className="hidden items-center md:flex bg-[#e2e0da]/60 backdrop-blur-md rounded-xl px-2 py-1.5 shadow-sm">
          <NavLink to="/" className={({ isActive }) => `flex items-center gap-2 px-4 py-1.5 rounded-lg text-[0.7rem] font-bold tracking-wider transition-all duration-200 ${isActive ? "bg-white text-ink shadow-sm" : "text-ink/60 hover:text-ink hover:bg-white/40"}`}>
            <Home size={12} /> HOME
          </NavLink>
          <NavLink to="/analyze" className={({ isActive }) => `flex items-center gap-2 px-4 py-1.5 rounded-lg text-[0.7rem] font-bold tracking-wider transition-all duration-200 ${isActive ? "bg-white text-ink shadow-sm" : "text-ink/60 hover:text-ink hover:bg-white/40"}`}>
            <ChartSearchIcon size={12} /> ANALYZE
          </NavLink>
          <div className="relative group">
            <button className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-[0.7rem] font-bold tracking-wider text-ink/60 transition-all duration-200 group-hover:bg-white group-hover:text-ink group-hover:shadow-sm">
              <Sparkles size={12} /> FLORAAI
            </button>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-white border border-line rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 flex flex-col overflow-hidden">
              <NavLink to="/qa" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 text-sm font-bold transition-colors hover:bg-black/5 ${isActive ? 'bg-sage/10 text-sage' : 'text-ink/70'}`}>
                <MessageSquare size={16} /> FloraChat
              </NavLink>
              <NavLink to="/voice" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 text-sm font-bold transition-colors hover:bg-black/5 border-t border-line ${isActive ? 'bg-sage/10 text-sage' : 'text-ink/70'}`}>
                <Mic size={16} /> FloraVoice
              </NavLink>
            </div>
          </div>
          <NavLink to="/encyclopedia" className={({ isActive }) => `flex items-center gap-2 px-4 py-1.5 rounded-lg text-[0.7rem] font-bold tracking-wider transition-all duration-200 ${isActive ? "bg-white text-ink shadow-sm" : "text-ink/60 hover:text-ink hover:bg-white/40"}`}>
            <BookOpen size={12} /> ENCYCLOPEDIA
          </NavLink>
        </nav>

        <div className="flex items-center gap-4 relative" ref={dropdownRef}>
          <button 
            className="md:hidden p-2 text-ink/70 hover:text-ink transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className="hidden md:flex items-center gap-4 relative">
            {!loading && user ? (
              <>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 rounded-full border border-line bg-surface/50 pl-2 pr-3 py-1.5 text-[0.95rem] font-medium text-ink transition hover:bg-black/5"
                >
                  <div className="bg-clay text-paper rounded-full p-1.5 flex items-center justify-center">
                    <UserIcon size={14} />
                  </div>
                  <span>{user.name}</span>
                  <ChevronDown size={14} className={`text-ink/60 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-line bg-surface shadow-2xl py-2 flex flex-col z-50">
                    <div className="px-5 py-3 border-b border-line mb-1">
                      <p className="text-sm font-bold text-ink truncate">{user.name}</p>
                      <p className="text-xs text-ink/60 truncate mt-0.5">{user.email}</p>
                    </div>
                    <Link to="/history" className="flex items-center gap-3 px-5 py-2.5 text-[0.95rem] font-medium text-ink hover:bg-black/5 transition-colors">
                      <History size={16} className="text-ink/70" />
                      Diagnostic History
                    </Link>
                    <button onClick={logout} className="flex items-center gap-3 px-5 py-2.5 text-[0.95rem] font-medium text-red-600 hover:bg-red-50 transition-colors mt-1 border-t border-line pt-3 w-full text-left">
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                )}
              </>
            ) : !loading ? (
              <div className="flex items-center gap-5 mt-1">
                <Link to="/login" className="text-[0.95rem] font-medium text-ink/80 hover:text-ink transition-colors">
                  Log in
                </Link>
                <Link to="/register" className="bg-clay text-paper px-4 py-2 rounded-full text-[0.95rem] font-medium hover:bg-clay/90 transition-colors shadow-sm">
                  Sign up
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-paper border-b border-line shadow-2xl md:hidden z-40 flex flex-col px-8 py-6 gap-4 animate-fade-in h-[calc(100vh-4rem)] overflow-y-auto">
          <NavLink to="/" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-lg font-bold transition-all ${isActive ? "bg-sage/10 text-sage" : "text-ink/70 hover:bg-black/5 hover:text-ink"}`}>
            <Home size={20} /> Home
          </NavLink>
          <NavLink to="/analyze" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-lg font-bold transition-all ${isActive ? "bg-sage/10 text-sage" : "text-ink/70 hover:bg-black/5 hover:text-ink"}`}>
            <ChartSearchIcon size={20} /> Analyze
          </NavLink>
          <div className="flex flex-col">
             <button 
               onClick={() => setIsMobileFloraAiOpen(!isMobileFloraAiOpen)} 
               className="flex items-center justify-between px-4 py-3 rounded-xl text-lg font-bold text-ink/70 hover:bg-black/5 hover:text-ink transition-all"
             >
               <div className="flex items-center gap-3">
                 <Sparkles size={20} /> FloraAI
               </div>
               <ChevronDown size={20} className={`transition-transform duration-300 ${isMobileFloraAiOpen ? 'rotate-180' : ''}`} />
             </button>
             
             {isMobileFloraAiOpen && (
               <div className="flex flex-col gap-2 pl-4 border-l-2 border-line ml-6 my-2 animate-fade-in">
                 <NavLink to="/qa" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-lg font-bold transition-all ${isActive ? "bg-sage/10 text-sage" : "text-ink/70 hover:bg-black/5 hover:text-ink"}`}>
                   <MessageSquare size={20} /> FloraChat
                 </NavLink>
                 <NavLink to="/voice" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-lg font-bold transition-all ${isActive ? "bg-sage/10 text-sage" : "text-ink/70 hover:bg-black/5 hover:text-ink"}`}>
                   <Mic size={20} /> FloraVoice
                 </NavLink>
               </div>
             )}
          </div>
          <NavLink to="/encyclopedia" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-lg font-bold transition-all ${isActive ? "bg-sage/10 text-sage" : "text-ink/70 hover:bg-black/5 hover:text-ink"}`}>
            <BookOpen size={20} /> Encyclopedia
          </NavLink>

          <div className="mt-8 border-t border-line pt-6">
            {!loading && user ? (
              <div className="flex flex-col gap-4">
                 <div className="flex items-center gap-4 mb-2">
                    <div className="bg-clay text-paper rounded-full p-3 flex items-center justify-center">
                      <UserIcon size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-ink text-lg">{user.name}</p>
                      <p className="text-sm text-ink/60">{user.email}</p>
                    </div>
                 </div>
                 <Link to="/history" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-lg font-bold text-ink hover:bg-black/5 transition-colors">
                   <History size={20} className="text-ink/70" />
                   Diagnostic History
                 </Link>
                 <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="flex items-center gap-3 px-4 py-3 rounded-xl text-lg font-bold text-red-600 hover:bg-red-50 transition-colors w-full text-left">
                   <LogOut size={20} />
                   Sign Out
                 </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex justify-center w-full py-4 rounded-xl border-2 border-line font-bold text-ink hover:bg-black/5 transition-colors text-lg">
                  Log in
                </Link>
                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="flex justify-center w-full py-4 rounded-xl bg-ink text-paper font-bold hover:bg-ink/90 transition-colors text-lg">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
