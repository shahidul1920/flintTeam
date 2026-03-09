import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import axios from 'axios';
import gsap from 'gsap';
import Markdown from 'react-markdown';
import './App.css';

function App() {
  const [messages, setMessages] = useState([{
    role: 'eva',
    text: 'System online. What are we building today, boss?'
  }]);
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Refs for scrolling and animation
  const chatContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Initial enter animation
  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      gsap.from(containerRef.current, { 
        opacity: 0, 
        duration: 1.5, 
        ease: "power2.out"
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentInput.trim()) return;

    const userMsg = { role: 'user', text: currentInput };
    setMessages(prev => [...prev, userMsg]);
    setCurrentInput('');
    setIsLoading(true);

    try {
      // Simulate network delay or real fetch
      // const response = await axios.post('http://localhost:8000/api/chat', { message: userMsg.text });
      
      const response = await axios.post('http://localhost:8000/api/chat', { 
        message: userMsg.text 
      });

      const replyText = response.data.reply || response.data.message || JSON.stringify(response.data);

      setMessages(prev => [...prev, {
        role: 'eva',
        text: replyText
      }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        role: 'eva',
        text: `**System Alert:** Connection disrupted. Error: ${err.message}`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen w-full bg-[#050507] text-gray-200 flex flex-col items-center p-4 md:p-6 relative overflow-hidden font-sans selection:bg-purple-500/30">
      
      {/* Ambient Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[100px] animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
      </div>

      <div className="z-10 w-full max-w-4xl flex flex-col h-[90vh]">
        
        {/* Header Title - Compact */}
        <div className="text-center mb-6 shrink-0">
          <div className="inline-block px-3 py-1 mb-2 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-400 text-[10px] tracking-[0.2em] font-medium uppercase font-mono">
            System Online
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-300 to-gray-600 drop-shadow-xl">
            FLINT INTELLIGENCE
          </h1>
        </div>

        {/* Chat Interface */}
        <div className="flex-grow overflow-y-auto mb-6 pr-2 custom-scrollbar" ref={chatContainerRef}>
            <div className="flex flex-col gap-6 pb-2">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] md:max-w-[75%] p-5 rounded-2xl backdrop-blur-md border shadow-lg ${
                            msg.role === 'user' 
                            ? 'bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-blue-500/30 rounded-br-sm text-white' 
                            : 'bg-[#0f0f13]/80 border-white/10 rounded-bl-sm text-gray-300'
                        }`}>
                            <div className="flex items-center gap-2 mb-2 opacity-50 text-[10px] font-mono uppercase tracking-widest">
                                <div className={`w-1.5 h-1.5 rounded-full ${msg.role === 'user' ? 'bg-purple-400' : 'bg-cyan-400 shadow-[0_0_8px_cyan]'}`}></div>
                                {msg.role === 'user' ? 'OPERATOR' : 'EVA: CORE SYSTEM'}
                            </div>
                            {msg.role === 'eva' ? (
                                <div className="prose prose-invert prose-sm prose-headings:text-cyan-100 prose-headings:font-light prose-p:text-gray-300 prose-strong:text-white prose-a:text-cyan-400 max-w-none leading-relaxed">
                                    <Markdown>{msg.text}</Markdown>
                                </div>
                            ) : (
                                <p className="text-sm md:text-base font-light leading-relaxed">{msg.text}</p>
                            )}
                        </div>
                    </div>
                ))}
                
                {isLoading && (
                    <div className="flex justify-start w-full">
                        <div className="max-w-[80%] p-4 rounded-2xl rounded-bl-sm bg-[#0f0f13]/60 border border-white/10 backdrop-blur-md flex items-center gap-4">
                            {/* Mini Scanner Animation */}
                            <div className="relative w-8 h-8 flex items-center justify-center">
                                 <div className="absolute inset-0 border-2 border-transparent border-t-cyan-500/80 border-r-cyan-500/80 rounded-full animate-spin"></div>
                                 <div className="absolute inset-2 border-2 border-transparent border-b-purple-500/80 border-l-purple-500/80 rounded-full animate-spin-reverse-slow"></div>
                                 <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                            </div>
                            <span className="text-xs font-mono text-cyan-400 animate-pulse tracking-widest">PROCESSING STREAM...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
        </div>

        {/* Input Form Container */}
        <div className="w-full shrink-0 relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <form onSubmit={handleSubmit} className="relative flex items-end bg-[#0a0a0c] rounded-xl border border-gray-800/80 p-2 shadow-2xl backdrop-blur-sm">
                <div className="pl-3 pb-3 text-gray-500">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                </div>
                <textarea 
                    placeholder="Enter command or directive..."
                    className="flex-grow bg-transparent border-none outline-none text-white px-4 py-3 placeholder-gray-600 focus:ring-0 font-light tracking-wide resize-none h-14 max-h-32 custom-scrollbar"
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit(e);
                        }
                    }}
                    required
                />
                <button 
                    type="submit"
                    className={`ml-2 mb-1 p-3 rounded-lg border border-white/10 transition-all duration-300 ${isLoading || !currentInput.trim() ? 'bg-white/5 text-gray-500 cursor-not-allowed' : 'bg-white/10 text-white hover:bg-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]'}`}
                    disabled={isLoading || !currentInput.trim()}
                >
                    <svg className="w-5 h-5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                </button>
            </form>
        </div>

      </div>
    </div>
  );
}

export default App;
