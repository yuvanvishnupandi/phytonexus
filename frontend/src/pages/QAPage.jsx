import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Plus, MessageSquare, Search, Mic, 
  ArrowUp, Sparkles, User, X, PenTool, Paperclip, PanelLeftClose, PanelLeftOpen, Trash2
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function QAPage() {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  
  const [chatSessions, setChatSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const { token } = useAuth();
  
  // Current Chat State
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentAIResponse, setCurrentAIResponse] = useState("");
  
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages, currentAIResponse]);

  const loadSessions = async () => {
    if (!token) return;
    try {
      const res = await fetch("https://phytonexus-backend.onrender.com" + "/api/qa/sessions", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // transform DB model to frontend state
        const formatted = data.map(s => ({
          id: s.id,
          title: s.title,
          messages: s.messages.map(m => ({ role: m.role === 'assistant' ? 'ai' : 'user', content: m.content }))
        }));
        setChatSessions(formatted);
      }
    } catch (err) {
      console.error("Failed to load sessions", err);
    }
  };

  useEffect(() => {
    loadSessions();
  }, [token]);

  const handleNewChat = () => {
    if (messages.length > 0 && !activeSessionId) {
      // Save current to recents
      const newSession = {
        id: Date.now(),
        title: messages[0].content.substring(0, 30) + "...",
        messages: [...messages]
      };
      setChatSessions([newSession, ...chatSessions]);
    }
    setMessages([]);
    setActiveSessionId(null);
  };

  const handleSelectSession = (session) => {
    // If we have an unsaved chat, save it
    if (messages.length > 0 && !activeSessionId) {
      const newSession = {
        id: Date.now(),
        title: messages[0].content.substring(0, 30) + "...",
        messages: [...messages]
      };
      setChatSessions([newSession, ...chatSessions]);
    }
    setActiveSessionId(session.id);
    setMessages(session.messages && session.messages.length > 0 ? session.messages : [{ role: 'user', content: 'Load previous chat...' }, { role: 'ai', content: 'This is a simulated past conversation.' }]);
  };

  const handleDeleteSession = async (e, sessionId) => {
    e.stopPropagation();
    if (!token) return;
    try {
      const res = await fetch(`https://phytonexus-backend.onrender.com/api/qa/sessions/${sessionId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setChatSessions(prev => prev.filter(s => s.id !== sessionId));
        if (activeSessionId === sessionId) {
          setMessages([]);
          setActiveSessionId(null);
        }
      }
    } catch (err) {
      console.error("Failed to delete session", err);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    
    const userMsg = input.trim();
    const newMessages = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);
    setCurrentAIResponse("");

    // Optimistic sidebar update
    let tempId = null;
    if (!activeSessionId) {
       tempId = `temp_${Date.now()}`;
       const optimisticSession = {
         id: tempId,
         title: userMsg.substring(0, 30) + "...",
         messages: newMessages
       };
       setChatSessions(prev => [optimisticSession, ...prev]);
       setActiveSessionId(tempId);
    }

    try {
      const res = await fetch("https://phytonexus-backend.onrender.com" + "/api/qa/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          session_id: activeSessionId && !activeSessionId.toString().startsWith("temp") ? activeSessionId : null,
          message: userMsg
        })
      });
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        let errMsg = errData.detail || "Failed to get response";
        if (typeof errMsg === 'object') errMsg = JSON.stringify(errMsg);
        throw new Error(errMsg);
      }
      const data = await res.json();
      
      const finalMessages = [...newMessages, { role: "ai", content: data.answer }];
      setMessages(finalMessages);
      setIsTyping(false);
      
      // Update session with real DB ID
      if (!activeSessionId || tempId) {
        setChatSessions(prev => prev.map(s => s.id === tempId ? { ...s, id: data.session_id, title: data.title, messages: finalMessages } : s));
        setActiveSessionId(data.session_id);
      } else {
        setChatSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, messages: finalMessages } : s));
      }
    } catch (err) {
      console.error(err);
      const finalMessages = [...newMessages, { role: "ai", content: err.message || "Error communicating with FloraAi." }];
      setMessages(finalMessages);
      setIsTyping(false);
      // Update the temporary session with the error message so they see it in history
      const currentId = tempId || activeSessionId;
      if (currentId) {
        setChatSessions(prev => prev.map(s => s.id === currentId ? { ...s, messages: finalMessages } : s));
      }
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const uploadMsg = `Uploaded file: ${file.name}`;
      const newMessages = [...messages, { role: "user", content: uploadMsg }];
      setMessages(newMessages);
      setIsTyping(true);
      
      // Optimistic sidebar update
      let tempId = null;
      if (!activeSessionId) {
         tempId = `temp_${Date.now()}`;
         const optimisticSession = {
           id: tempId,
           title: uploadMsg.substring(0, 30) + "...",
           messages: newMessages
         };
         setChatSessions(prev => [optimisticSession, ...prev]);
         setActiveSessionId(tempId);
      }
      
      const formData = new FormData();
      formData.append("file", file);
      const realSessionId = activeSessionId && !activeSessionId.toString().startsWith("temp") ? activeSessionId : null;
      if (realSessionId) {
        formData.append("session_id", realSessionId);
      }

      try {
        const res = await fetch("https://phytonexus-backend.onrender.com" + "/api/qa/upload", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`
          },
          body: formData
        });
        
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          let errMsg = errData.detail || "File upload failed.";
          if (typeof errMsg === 'object') errMsg = JSON.stringify(errMsg);
          throw new Error(errMsg);
        }
        
        const data = await res.json();
        
        const finalMessages = [...newMessages, { role: "ai", content: data.answer }];
        setMessages(finalMessages);
        setIsTyping(false);
        
        if (!activeSessionId || tempId) {
           setChatSessions(prev => prev.map(s => s.id === tempId ? { ...s, id: data.session_id, title: data.title, messages: finalMessages } : s));
           setActiveSessionId(data.session_id);
        } else {
           setChatSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, messages: finalMessages } : s));
        }
        
      } catch (err) {
        const finalMessages = [...newMessages, { role: "ai", content: err.message }];
        setMessages(finalMessages);
        setIsTyping(false);
        const currentId = tempId || activeSessionId;
        if (currentId) {
          setChatSessions(prev => prev.map(s => s.id === currentId ? { ...s, messages: finalMessages } : s));
        }
      }
      
      // Reset input
      e.target.value = null;
    }
  };



  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="relative flex h-[100dvh] w-full overflow-hidden bg-paper font-sans text-ink">
      
      {!user && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-paper/60 backdrop-blur-md">
          <div className="bg-surface border border-line rounded-[2rem] p-10 shadow-2xl flex flex-col items-center text-center max-w-md mx-4 animate-fade-in">
             <div className="w-16 h-16 bg-sage/10 text-sage rounded-full flex items-center justify-center mb-6">
                <Sparkles size={32} />
             </div>
             <h2 className="font-serif text-3xl font-bold text-ink mb-3 tracking-tight">Unlock FloraAi</h2>
             <p className="text-ink/70 font-medium mb-8 leading-relaxed">
               FloraAi is an advanced, personalized botanical assistant. Create an account to save your chat history and unlock multi-agent reasoning.
             </p>
             <div className="flex flex-col w-full gap-3">
               <Link to="/register" className="w-full py-3.5 rounded-full bg-ink text-paper font-bold text-[1.05rem] hover:bg-ink/90 transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5">
                 Create an account
               </Link>
               <Link to="/login" className="w-full py-3.5 rounded-full bg-transparent border-2 border-line text-ink font-bold text-[1.05rem] hover:bg-black/5 transition-colors">
                 Log in to continue
               </Link>
               <Link to="/" className="mt-2 text-sm font-bold text-ink/50 hover:text-ink transition-colors">
                 Return to homepage
               </Link>
             </div>
          </div>
        </div>
      )}

      <div className={`flex h-[100dvh] w-full transition-all duration-500 ${!user ? 'blur-md pointer-events-none select-none scale-[0.99] opacity-60' : ''}`}>
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
         <div 
           className="md:hidden fixed inset-0 z-[60] bg-ink/20 backdrop-blur-sm"
           onClick={() => setIsSidebarOpen(false)}
         />
      )}

      {/* Sidebar */}
      <div className={`absolute md:relative z-[70] h-full bg-[#f8f7f5] border-r border-line flex flex-col justify-between py-4 shrink-0 transition-all duration-300 ${isSidebarOpen ? 'w-[280px] md:w-[260px] px-3 translate-x-0' : 'w-[280px] md:w-0 px-3 md:px-0 -translate-x-full md:translate-x-0 opacity-0 md:border-none'}`}>
        <div className="w-full overflow-hidden whitespace-nowrap">
          {/* Top Header / Logo */}
          <div className="flex items-center gap-2 mb-8 px-2 mt-2">
            <img src="/favicon.png" className="w-6 h-6 object-contain drop-shadow-sm" style={{imageRendering: 'pixelated'}} />
            <span className="font-serif font-bold text-xl text-ink tracking-tight">FloraChat</span>
          </div>
          
          {/* Primary Actions */}
          <button onClick={handleNewChat} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-ink hover:bg-black/5 transition-colors mb-2 font-medium">
            <Plus size={16} strokeWidth={2}/>
            New chat
          </button>
          
          <div className="space-y-1 mb-6">
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-ink hover:bg-black/5 transition-colors">
              <MessageSquare size={16} />
              Chats
            </button>
          </div>

          {/* Recents Section */}
          <div>
             <div className="px-3 text-[0.65rem] font-bold uppercase tracking-widest text-ink/40 mb-2 flex justify-between items-center">
               Recents
               <Search size={12} className="cursor-pointer hover:text-ink transition-colors"/>
             </div>
             <div className="space-y-1 overflow-y-auto max-h-[60vh] custom-scrollbar pr-1">
               {chatSessions.map((session) => (
                 <div key={session.id} className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs transition-colors group ${activeSessionId === session.id ? 'bg-black/5 text-ink font-bold' : 'text-ink/80 hover:bg-black/5'}`}>
                   <button 
                     onClick={() => handleSelectSession(session)} 
                     className="flex-1 truncate text-left"
                   >
                     {session.title}
                   </button>
                   <button 
                     onClick={(e) => handleDeleteSession(e, session.id)}
                     className="text-ink/30 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1 rounded-md"
                     title="Delete Chat"
                   >
                     <Trash2 size={14} />
                   </button>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-[100dvh] bg-paper relative selection:bg-clay/20 w-full overflow-hidden">
         
         {/* Top bar with Toggle & Close */}
         <div className="absolute top-6 left-6 right-8 flex items-center justify-between z-50">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-md hover:bg-black/5 text-ink/70 hover:text-ink transition-colors bg-surface/50 backdrop-blur-md shadow-sm border border-line">
               {isSidebarOpen ? <PanelLeftClose size={18}/> : <PanelLeftOpen size={18}/>}
            </button>
            <Link to="/" className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-line text-xs font-bold text-ink hover:bg-black/5 transition-all shadow-sm">
               <X size={14}/> Close
            </Link>
         </div>
         
         {/* Scrollable Container (ChatGPT style) */}
         <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col w-full relative pt-24 pb-40">
            <div className={`w-full max-w-3xl mx-auto px-4 md:px-8 flex flex-col min-h-full ${!hasMessages ? 'justify-end' : 'justify-start'}`}>
               
               {!hasMessages ? (
                  <div className="flex-1 flex items-center justify-center mb-10">
                     <h1 className="font-serif text-[2.5rem] sm:text-[3rem] text-ink tracking-tight text-center max-w-2xl">
                        How can I assist your greenhouse today, {user ? user.name : "Guest"}?
                     </h1>
                  </div>
               ) : (
                  <div className="flex flex-col flex-1 pb-4">
                     {messages.map((msg, i) => (
                        <div key={i} className="w-full flex gap-4 mb-8 animate-fade-in">
                           <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-surface border border-line text-ink' : 'bg-ink text-paper'}`}>
                              {msg.role === 'user' ? <User size={16} /> : <Sparkles size={16} />}
                           </div>
                           <div className="flex-1 pt-1 font-medium text-ink leading-relaxed">
                              {msg.role === 'user' ? (
                                 msg.content
                              ) : (
                                 <div className="prose prose-sm md:prose-base prose-ink max-w-none">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                       {msg.content}
                                    </ReactMarkdown>
                                 </div>
                              )}
                           </div>
                        </div>
                     ))}
                     
                     {isTyping && (
                        <div className="w-full flex gap-4 mb-8 animate-fade-in">
                           <div className="w-8 h-8 rounded-full bg-ink text-paper flex items-center justify-center shrink-0">
                              <Sparkles size={16} />
                           </div>
                           <div className="flex-1 pt-1 font-medium text-ink leading-relaxed flex items-center flex-wrap">
                              {currentAIResponse}
                              <span className="inline-block w-2 h-4 bg-ink/70 animate-pulse ml-1 mt-1"></span>
                           </div>
                        </div>
                     )}
                     <div ref={messagesEndRef} className="h-4" />
                  </div>
               )}
            </div>
         </div>

         {/* Fixed Input Box at Bottom */}
         <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-paper via-paper to-transparent pt-10 pb-4 md:pb-8 px-4 z-40" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
            <div className="w-full max-w-3xl mx-auto">
               <div className="w-full bg-[#f8f7f5] border border-line rounded-[1.5rem] p-4 flex flex-col shadow-lg shadow-black/5 focus-within:shadow-xl focus-within:border-ink/20 transition-all">
                  <textarea 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isTyping || !user}
                    placeholder="How can FloraChat help you today?"
                    className="w-full bg-transparent resize-none outline-none text-ink text-[1.05rem] placeholder:text-ink/40 min-h-[60px] max-h-[200px] overflow-y-auto custom-scrollbar pb-4 px-2 disabled:opacity-50"
                  />
                  <div className="flex items-center justify-between border-t border-line/50 pt-3 mt-2 px-2">
                     <button onClick={() => fileInputRef.current?.click()} disabled={isTyping} className="flex items-center gap-2 px-2 py-1.5 text-[0.8rem] font-bold text-ink/60 hover:text-ink hover:bg-black/5 rounded-md transition-colors disabled:opacity-50">
                        <Paperclip size={16} />
                        Upload PDF/CSV
                     </button>
                     <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.csv,.txt" onChange={handleFileUpload} />
                     
                     <div className="flex items-center gap-2">
                        <button 
                          onClick={handleSend}
                          disabled={!input.trim() || isTyping || !user}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                            input.trim() && !isTyping ? "bg-ink text-paper shadow-md hover:bg-ink/90 hover:-translate-y-0.5" : "bg-black/5 text-ink/30"
                          }`}
                        >
                          <ArrowUp size={16} strokeWidth={2.5} />
                        </button>
                     </div>
                  </div>
               </div>

               {!hasMessages && (
                 <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-6">
                    <button onClick={() => setInput("Write a care guide for ")} className="flex items-center gap-2 px-4 py-2 bg-[#f8f7f5] border border-line rounded-full text-xs font-medium text-ink hover:bg-black/5 transition-colors">
                      <PenTool size={14}/> Write care guide
                    </button>
                    <button onClick={() => setInput("Identify species from attached image ")} className="flex items-center gap-2 px-4 py-2 bg-[#f8f7f5] border border-line rounded-full text-xs font-medium text-ink hover:bg-black/5 transition-colors">
                      <Search size={14}/> Identify species
                    </button>
                    <button onClick={() => setInput("Diagnose this disease: ")} className="flex items-center gap-2 px-4 py-2 bg-[#f8f7f5] border border-line rounded-full text-xs font-medium text-ink hover:bg-black/5 transition-colors">
                      <Sparkles size={14}/> Diagnose disease
                     </button>
                  </div>
               )}
            </div>
         </div>
      </div>
      
      {/* Auth Lock Overlay */}
      {!user && (
         <div className="absolute inset-0 z-50 bg-paper/60 backdrop-blur-[6px] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-2xl border border-line max-w-lg w-full flex flex-col items-center">
               <div className="w-16 h-16 bg-sage/10 text-sage rounded-full flex items-center justify-center mb-6">
                  <User size={32} />
               </div>
               <h2 className="text-2xl md:text-3xl font-serif font-bold text-ink mb-3 tracking-tight">Unlock FloraChat</h2>
               <p className="text-ink/60 font-medium mb-8 text-[1.05rem] leading-relaxed">
                  Log in or create an account to start chatting with our advanced botanical AI. Save your history, upload documents, and more.
               </p>
               <div className="flex flex-col sm:flex-row gap-4 w-full">
                  <Link to="/login" className="flex-1 bg-ink text-paper py-3.5 rounded-xl font-bold hover:bg-ink/90 transition-colors">
                     Log In
                  </Link>
                  <Link to="/register" className="flex-1 bg-surface border border-line text-ink py-3.5 rounded-xl font-bold hover:bg-black/5 transition-colors">
                     Sign Up
                  </Link>
               </div>
            </div>
         </div>
      )}

      </div>
    </div>
  );
}
