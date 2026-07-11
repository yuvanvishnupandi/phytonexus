import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mic, User, Loader2, X, Square } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function FloraVoicePage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [statusMessage, setStatusMessage] = useState("Tap to speak");
  const audioChunksRef = useRef([]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
      }
    };
  }, [mediaRecorder]);

  const toggleMic = async () => {
    if (isListening && mediaRecorder) {
      mediaRecorder.stop();
      setIsListening(false);
      setStatusMessage("Processing audio...");
      setIsProcessing(true);
      return;
    }
    
    // Stop any currently playing TTS
    if (window.speechSynthesis) {
       window.speechSynthesis.cancel();
       setIsPlaying(false);
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await handleSendVoice(audioBlob);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsListening(true);
      setStatusMessage("Listening...");
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access is required for Voice Mode.");
    }
  };

  const playTTS = (text) => {
    if (!window.speechSynthesis) return;
    const cleanText = text.replace(/[*#_`]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    const voices = window.speechSynthesis.getVoices();
    const goodVoice = voices.find(v => v.name.includes("Google") || v.lang.startsWith("en"));
    if (goodVoice) utterance.voice = goodVoice;
    utterance.rate = 1.05;
    
    utterance.onstart = () => {
       setIsPlaying(true);
    };

    utterance.onend = () => {
       setStatusMessage("Tap to speak");
       setIsPlaying(false);
    };
    
    utterance.onerror = () => {
       setIsPlaying(false);
    }

    window.speechSynthesis.speak(utterance);
  };

  const handleStop = () => {
    if (isListening && mediaRecorder) {
      mediaRecorder.stop();
      setIsListening(false);
      setStatusMessage("Tap to speak");
      // Intentionally overriding the onstop processing logic by resetting it or we can just let it process. 
      // Actually, if we just want to cancel, we should just cancel TTS for now.
    }
    if (window.speechSynthesis) {
       window.speechSynthesis.cancel();
       setIsPlaying(false);
       setStatusMessage("Tap to speak");
    }
  };

  const handleSendVoice = async (audioBlob) => {
    if (!token) return;

    const formData = new FormData();
    formData.append("audio", audioBlob, "voice.webm");

    try {
      const res = await fetch((import.meta.env.VITE_API_BASE_URL || "http://localhost:8000") + "/api/qa/voice", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });

      if (!res.ok) {
        throw new Error("Voice processing failed");
      }

      const data = await res.json();
      
      setStatusMessage("Flora is speaking...");
      setIsProcessing(false);
      playTTS(data.answer);

    } catch (err) {
      console.error(err);
      setStatusMessage("Connection lost. Try again.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex h-[100dvh] w-full bg-paper relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute inset-0 z-0 opacity-40 mix-blend-multiply overflow-hidden pointer-events-none">
         <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] rounded-full filter blur-[100px] transition-all duration-1000 ${isListening ? 'bg-red-400 scale-110' : isProcessing ? 'bg-blue-400 scale-100 animate-pulse' : 'bg-sage scale-100'}`}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-6">
         
         <button 
           onClick={() => navigate(-1)}
           className="absolute top-6 right-6 p-3 bg-white/80 backdrop-blur-md rounded-full shadow-sm hover:bg-white hover:shadow-md transition-all text-ink/60 hover:text-ink z-20"
         >
           <X size={24} />
         </button>

         <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-ink tracking-tight mb-4">FloraVoice</h1>
            <p className="text-ink/60 font-medium text-lg max-w-md mx-auto">{statusMessage}</p>
         </div>

         <div className="flex flex-col items-center gap-8">
            <button 
              onClick={toggleMic}
              disabled={isProcessing || !user}
              className={`relative group flex items-center justify-center w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                isListening 
                  ? 'bg-red-500 text-white scale-105 shadow-red-500/40' 
                  : isPlaying ? 'bg-sage text-white shadow-sage/40 scale-105' : 'bg-white text-ink border-4 border-sage/20 hover:border-sage hover:scale-105 hover:shadow-sage/20'
              }`}
            >
               {isProcessing ? (
                  <Loader2 size={36} className="animate-spin md:w-12 md:h-12" />
               ) : (
                  <Mic size={36} className={`transition-transform duration-300 md:w-12 md:h-12 ${isListening || isPlaying ? 'scale-110' : 'group-hover:scale-110'}`} />
               )}

               {(isListening || isPlaying) && (
                  <>
                     <div className={`absolute inset-0 rounded-full border-2 animate-ping opacity-20 ${isListening ? 'border-red-500' : 'border-sage'}`}></div>
                     <div className={`absolute -inset-4 rounded-full border animate-pulse opacity-10 delay-75 ${isListening ? 'border-red-500' : 'border-sage'}`}></div>
                  </>
               )}
            </button>

            {/* Stop Button */}
            {(isListening || isPlaying) && (
               <button 
                 onClick={handleStop}
                 className="flex items-center gap-2 px-6 py-3 bg-white border border-line rounded-full shadow-sm hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all font-bold text-ink/70 animate-fade-in"
               >
                 <Square size={16} className="fill-current" /> Stop
               </button>
            )}
         </div>

      </div>

      {/* Auth Lock Overlay */}
      {!user && (
         <div className="absolute inset-0 z-50 bg-paper/60 backdrop-blur-[6px] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-2xl border border-line max-w-lg w-full flex flex-col items-center">
               <div className="w-16 h-16 bg-sage/10 text-sage rounded-full flex items-center justify-center mb-6">
                  <User size={32} />
               </div>
               <h2 className="text-2xl md:text-3xl font-serif font-bold text-ink mb-3 tracking-tight">Unlock FloraVoice</h2>
               <p className="text-ink/60 font-medium mb-8 text-[1.05rem] leading-relaxed">
                  Log in or create an account to start a live voice conversation with our advanced botanical AI.
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
  );
}
