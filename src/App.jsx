import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import axios from 'axios';
import gsap from 'gsap';
import Markdown from 'react-markdown';
import './App.css';

function App() {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [report, setReport] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Refs for animation
  const containerRef = useRef(null);
  const formWrapperRef = useRef(null);
  const loadingWrapperRef = useRef(null);
  const resultWrapperRef = useRef(null);
  const scannerRingRef = useRef(null);

  // Initial enter animation
  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      // Initial state setup to avoid FOUC
      gsap.set(formWrapperRef.current, { y: 0, opacity: 1, display: 'flex' });
      gsap.set(loadingWrapperRef.current, { display: 'none', opacity: 0 });
      gsap.set(resultWrapperRef.current, { display: 'none', opacity: 0 });

      gsap.from(formWrapperRef.current, { 
        y: 50, 
        opacity: 0, 
        duration: 1.2, 
        ease: "power3.out",
        delay: 0.2
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url) return;

    setStatus('loading');
    setErrorMsg('');
    setReport('');

    // Animate transition to loading
    const ctx = gsap.context(() => {
        const tl = gsap.timeline();
        tl.to(formWrapperRef.current, { 
            y: -20, 
            opacity: 0, 
            duration: 0.5, 
            ease: "power2.in",
            onComplete: () => {
                gsap.set(formWrapperRef.current, { display: 'none' });
                gsap.set(loadingWrapperRef.current, { display: 'flex' });
            }
        })
        .fromTo(loadingWrapperRef.current, 
            { opacity: 0, scale: 0.9 },
            { opacity: 1, scale: 1, duration: 0.8, ease: "power2.out" }
        );

        // Continuous scanner rotation
        gsap.to(scannerRingRef.current, {
            rotation: 360,
            duration: 8,
            repeat: -1,
            ease: "linear"
        });
    }, containerRef);
  };

  // Effect to trigger API call when status becomes loading
  useEffect(() => {
    if (status !== 'loading') return;

    const analyzeUrl = async () => {
        try {
            // Using a slight delay to allow the animation to show start
            await new Promise(r => setTimeout(r, 1500)); 
            
            const response = await axios.post('http://localhost:8000/api/analyze', { url });
            const data = response.data.report || response.data; 
            setReport(typeof data === 'string' ? data : JSON.stringify(data, null, 2));
            setStatus('success');
        } catch (err) {
            console.error(err);
            setStatus('error');
            setErrorMsg(err.message || 'Failed to analyze target.');
        }
    };
    analyzeUrl();
  }, [status, url]);

  // Handle success/error transitions
  useEffect(() => {
      if (status === 'success') {
          const ctx = gsap.context(() => {
              const tl = gsap.timeline();
              tl.to(loadingWrapperRef.current, {
                  opacity: 0,
                  scale: 1.1,
                  duration: 0.5,
                  ease: "power2.in",
                  onComplete: () => {
                      gsap.set(loadingWrapperRef.current, { display: 'none' });
                      gsap.set(scannerRingRef.current, { rotation: 0 }); // Reset rotation
                      gsap.set(resultWrapperRef.current, { display: 'block' });
                  }
              })
              .fromTo(resultWrapperRef.current,
                  { y: 50, opacity: 0 },
                  { y: 0, opacity: 1, duration: 1, ease: "power4.out" }
              );
          }, containerRef);
          return () => ctx.revert();
      } else if (status === 'error') {
           const ctx = gsap.context(() => {
              gsap.to(loadingWrapperRef.current, {
                  opacity: 0,
                  duration: 0.3,
                  onComplete: () => {
                    gsap.set(loadingWrapperRef.current, { display: 'none' });
                    gsap.set(scannerRingRef.current, { rotation: 0 });
                    gsap.set(formWrapperRef.current, { display: 'flex' });
                    gsap.to(formWrapperRef.current, {
                        y: 0,
                        opacity: 1,
                        duration: 0.5
                    });
                  }
              });
           }, containerRef);
           return () => ctx.revert();
      }
  }, [status]);

  const handleReset = () => {
     const ctx = gsap.context(() => {
        gsap.to(resultWrapperRef.current, { 
            opacity: 0, 
            y: 20, 
            duration: 0.4, 
            onComplete: () => {
                setStatus('idle');
                setReport('');
                setUrl('');
                
                // Reset views
                gsap.set(resultWrapperRef.current, { display: 'none' });
                gsap.set(formWrapperRef.current, { display: 'flex' });
                
                gsap.fromTo(formWrapperRef.current, 
                    { y: 50, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
                );
            }
        });
     }, containerRef);
  };

  return (
    <div ref={containerRef} className="min-h-screen w-full bg-[#050507] text-gray-200 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-purple-500/30">
      
      {/* Ambient Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[100px] animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
      </div>

      <div className="z-10 w-full max-w-5xl flex flex-col items-center">
        
        {/* Header Title */}
        <div className={`text-center mb-16 transition-all duration-700 ease-out ${status === 'success' ? 'opacity-40 scale-90 mb-8' : 'opacity-100'}`}>
          <div className="inline-block px-3 py-1 mb-4 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-400 text-xs tracking-[0.2em] font-medium uppercase font-mono">
            System Online
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-300 to-gray-600 drop-shadow-xl">
            FLINT INTELLIGENCE
          </h1>
          <p className="mt-4 text-gray-500 text-sm md:text-base tracking-[0.2em] uppercase font-mono">
            Automated Reconnaissance & Lead Analysis
          </p>
        </div>

        {/* Input Form Container */}
        <div ref={formWrapperRef} className="w-full flex-col items-center w-full max-w-xl">
            <form onSubmit={handleSubmit} className="w-full relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative flex items-center bg-[#0a0a0c] rounded-xl border border-gray-800/80 p-2 shadow-2xl backdrop-blur-sm">
                    <div className="pl-4 text-gray-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                    <input 
                        type="url" 
                        placeholder="Enter Target URL to Analyze..."
                        className="flex-grow bg-transparent border-none outline-none text-white px-4 py-4 placeholder-gray-600 focus:ring-0 font-light tracking-wide"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        required
                    />
                    <button 
                        type="submit"
                        className="mr-1 px-8 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-all duration-300 transform shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]"
                    >
                        ANALYZE
                    </button>
                </div>
            </form>
            
            {status === 'error' && (
                <div className="mt-6 text-red-400 bg-red-950/30 border border-red-900/50 px-6 py-4 rounded-lg text-sm text-center font-mono">
                    <span className="block text-xs font-bold uppercase mb-1 opacity-70">Error Details</span>
                    {errorMsg}
                </div>
            )}
        </div>

        {/* Scanning Animation Container */}
        <div ref={loadingWrapperRef} className="hidden flex-col items-center justify-center py-8">
            <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
                {/* Scanner Rings */}
                <div ref={scannerRingRef} className="absolute inset-0 border-[1px] border-transparent border-t-cyan-500/50 border-r-cyan-500/50 rounded-full shadow-[0_0_40px_rgba(6,182,212,0.2)]"></div>
                <div className="absolute inset-4 border-[1px] border-transparent border-b-purple-500/50 border-l-purple-500/50 rounded-full animate-spin-reverse-slow"></div>
                <div className="absolute inset-[30%] bg-cyan-500/10 rounded-full blur-xl animate-pulse"></div>
                
                {/* Center Tech Graphic */}
                 <div className="w-2 h-2 bg-white rounded-full shadow-[0_0_20px_white]"></div>
            </div>
            <h2 className="text-2xl font-mono text-cyan-400 tracking-widest animate-pulse">ANALYZING TARGET</h2>
            <div className="mt-3 flex flex-col items-center space-y-1">
                <span className="text-gray-600 font-mono text-xs uppercase tracking-widest">Deciphering HTML Structure...</span>
                <span className="text-gray-700 font-mono text-[10px] uppercase tracking-widest">Extracting Meta Signals...</span>
            </div>
        </div>

        {/* Success Result Container */}
        <div ref={resultWrapperRef} className="hidden w-full relative">
            <div className="backdrop-blur-xl bg-[#0f0f13]/80 border border-white/10 rounded-2xl p-8 md:p-12 shadow-2xl relative overflow-hidden ring-1 ring-white/5">
                
                {/* Glass decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-cyan-500/5 to-transparent rounded-bl-[200px] pointer-events-none"></div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 border-b border-white/5 pb-8 gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                             <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_lime]"></span>
                             <span className="text-green-500/80 text-xs font-mono uppercase tracking-widest">Analysis Complete</span>
                        </div>
                        <h2 className="text-3xl font-bold text-white tracking-tight">Intelligence Report</h2>
                        <a href={url} target="_blank" rel="noreferrer" className="text-gray-400 text-sm mt-1 hover:text-cyan-400 transition-colors font-mono truncate max-w-md block">{url}</a>
                    </div>
                    <button 
                        onClick={handleReset}
                        className="px-6 py-2.5 text-xs font-mono font-bold uppercase tracking-wider border border-white/10 rounded hover:bg-white/5 hover:border-white/30 transition-all text-gray-300"
                    >
                        Create New Report
                    </button>
                </div>
                
                {/* Markdown Content */}
                <div className="result-content prose prose-invert prose-headings:text-cyan-100 prose-headings:font-light prose-h1:text-2xl prose-h2:text-xl prose-p:text-gray-300 prose-strong:text-white prose-li:text-gray-300 prose-a:text-cyan-400 max-w-none">
                    <Markdown>{report}</Markdown>
                </div>

                {/* Footer */}
                <div className="mt-12 pt-6 border-t border-white/5 flex justify-between items-center text-[10px] text-gray-600 font-mono uppercase tracking-widest opacity-50">
                    <span>Flint Intelligence Node v4.2</span>
                    <span>{new Date().toISOString().split('T')[0]}</span>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}

export default App;
