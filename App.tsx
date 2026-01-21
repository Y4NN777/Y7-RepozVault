import React, { useState, useEffect, useMemo } from 'react';
import { Repository } from './types';
import RepoCard from './components/RepoCard';
import AddRepoModal from './components/AddRepoModal';
import { getSmartRecommendation } from './services/geminiService';

const App: React.FC = () => {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'home' | 'magic'>('home');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  
  // Magic Pick states
  const [vibe, setVibe] = useState('');
  const [isPicking, setIsPicking] = useState(false);
  const [recommendation, setRecommendation] = useState<{repo: Repository, reason: string} | null>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('repovault_theme') as 'light' | 'dark';
    const initialTheme = savedTheme || 'dark';
    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');

    const saved = localStorage.getItem('y7_repovault_data');
    if (saved) {
      try { setRepos(JSON.parse(saved)); } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('y7_repovault_data', JSON.stringify(repos));
  }, [repos]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('repovault_theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleAddRepo = (newRepo: Repository) => {
    setRepos(prev => [newRepo, ...prev]);
    setActiveTab('home');
  };

  const handleMagicPick = async () => {
    if (!vibe.trim()) return;
    setIsPicking(true);
    setRecommendation(null);
    try {
      const result = await getSmartRecommendation(repos, vibe);
      const matched = repos.find(r => r.id === result.repoId);
      if (matched) {
        setRecommendation({ repo: matched, reason: result.reason });
      }
    } catch (err) {
      alert("AI is thinking hard, try again!");
    } finally {
      setIsPicking(false);
    }
  };

  const filteredRepos = useMemo(() => {
    return repos.filter(repo => {
      const lowerSearch = searchTerm.toLowerCase();
      return (
        repo.name.toLowerCase().includes(lowerSearch) ||
        repo.owner.toLowerCase().includes(lowerSearch) ||
        repo.aiSummary.toLowerCase().includes(lowerSearch)
      );
    });
  }, [repos, searchTerm]);

  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden bg-light-bg dark:bg-dark-bg transition-colors duration-200">
      
      {/* Header */}
      <header className="pt-12 pb-6 px-6 bg-light-bg dark:bg-dark-bg border-b border-light-border dark:border-dark-border z-50 shrink-0">
        <div className="flex justify-between items-center mb-6">
          <div className="flex flex-col">
            <h1 className="text-3xl font-[900] tracking-tighter text-slate-900 dark:text-white leading-none">
              Y7 <span className="text-primary">RepozVault</span>
            </h1>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mt-2">
              {activeTab === 'home' ? `${repos.length} Discoveries` : 'AI Pick'}
            </p>
          </div>
          <div className="flex gap-2.5">
            <button 
              onClick={toggleTheme}
              className="w-11 h-11 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-500 dark:text-slate-400 active:scale-95 transition-all border border-light-border dark:border-dark-border"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-11 h-11 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-all"
              aria-label="Add Repository"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>

        {activeTab === 'home' && (
          <div className="relative w-full">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
              <svg className="w-5 h-5 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input 
              type="text" 
              placeholder="Search your stack..."
              className="w-full bg-slate-100 dark:bg-slate-900 border border-light-border dark:border-dark-border rounded-2xl pl-12 pr-6 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto no-scrollbar p-6 pb-32">
        {activeTab === 'home' ? (
          <div className="grid grid-cols-1 gap-5 max-w-2xl mx-auto">
            {repos.length === 0 ? (
              <div className="text-center py-20 animate-in fade-in duration-500">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-3xl mx-auto mb-6 flex items-center justify-center border border-light-border dark:border-dark-border">
                  <svg className="w-10 h-10 text-slate-300 dark:text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">Vault Empty</h2>
                <p className="text-sm text-slate-400 font-medium px-8 leading-relaxed">Save GitHub repos and let Gemini organize them into your knowledge base.</p>
              </div>
            ) : filteredRepos.length === 0 ? (
              <div className="text-center py-10 text-slate-500 font-bold uppercase text-xs tracking-widest">No matching results</div>
            ) : (
              filteredRepos.map(repo => (
                <RepoCard key={repo.id} repo={repo} onDelete={(id) => setRepos(prev => prev.filter(r => r.id !== id))} />
              ))
            )}
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-[2rem] p-8 shadow-sm">
              <h2 className="text-xl font-extrabold mb-6 flex items-center gap-3">
                <span className="p-2 bg-primary/10 rounded-xl"><svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zm6.364-1.636l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zM4.343 17.657l.707-.707a1 1 0 011.414 1.414l-.707.707a1 1 0 01-1.414-1.414z" /></svg></span>
                Ask Y7
              </h2>
              <textarea 
                className="w-full bg-slate-50 dark:bg-slate-900 border border-light-border dark:border-dark-border rounded-2xl p-5 text-sm h-36 focus:outline-none focus:ring-2 focus:ring-primary transition-all font-medium text-slate-800 dark:text-slate-200"
                placeholder="Ex: Show me a Rust library for CLI tools..."
                value={vibe}
                onChange={(e) => setVibe(e.target.value)}
              />
              <button 
                onClick={handleMagicPick}
                disabled={isPicking || repos.length === 0}
                className="w-full mt-6 bg-primary text-white font-extrabold py-5 rounded-2xl shadow-lg active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isPicking ? 'Consulting Gemini...' : 'Find the Perfect Match'}
              </button>
            </div>

            {recommendation && (
              <div className="space-y-4 animate-in zoom-in duration-300">
                <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 p-6 rounded-[2rem]">
                  <p className="text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-2">AI Suggestion</p>
                  <p className="text-slate-800 dark:text-slate-100 font-semibold leading-relaxed">
                    "{recommendation.reason}"
                  </p>
                </div>
                <RepoCard repo={recommendation.repo} onDelete={() => {}} />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-light-bg/80 dark:bg-dark-bg/80 backdrop-blur-xl border-t border-light-border dark:border-dark-border px-12 pb-10 pt-4 flex justify-between items-center z-[50] shrink-0">
        <button 
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1.5 transition-all active:scale-90 ${activeTab === 'home' ? 'text-primary' : 'text-slate-400 dark:text-slate-600'}`}
        >
          <svg className="w-6 h-6" fill={activeTab === 'home' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <span className="text-[10px] font-black uppercase tracking-widest">Vault</span>
        </button>

        <button 
          onClick={() => setActiveTab('magic')}
          className={`flex flex-col items-center gap-1.5 transition-all active:scale-90 ${activeTab === 'magic' ? 'text-primary' : 'text-slate-400 dark:text-slate-600'}`}
        >
          <svg className="w-6 h-6" fill={activeTab === 'magic' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-[10px] font-black uppercase tracking-widest">Pick</span>
        </button>
      </nav>

      <AddRepoModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={handleAddRepo}
      />
    </div>
  );
};

export default App;