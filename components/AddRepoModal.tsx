
import React, { useState, useEffect } from 'react';
import { analyzeRepository } from '../services/geminiService';
import { Repository } from '../types';

interface AddRepoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (repo: Repository) => void;
}

const AddRepoModal: React.FC<AddRepoModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = url.trim();
    if (!cleanUrl.includes('github.com')) {
      setError('Please provide a valid GitHub link');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const parts = cleanUrl.replace(/https?:\/\/github\.com\//, '').split('/');
      const owner = parts[0];
      const name = parts[1];

      const analysis = await analyzeRepository(cleanUrl, notes);

      const newRepo: Repository = {
        id: crypto.randomUUID(),
        url: cleanUrl,
        name: name,
        owner: owner,
        description: notes || analysis.summary,
        stars: analysis.estimatedStars || 0,
        forks: 0,
        language: analysis.primaryLanguage,
        topics: analysis.topics,
        aiSummary: analysis.summary,
        useCases: analysis.useCases,
        difficulty: analysis.difficulty,
        addedAt: Date.now()
      };

      onAdd(newRepo);
      setUrl('');
      setNotes('');
      onClose();
    } catch (err) {
      setError('Analysis failed. Try again?');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-[60] flex items-end justify-center transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className={`relative w-full max-w-lg bg-light-card dark:bg-dark-card rounded-t-[3rem] p-8 shadow-2xl transition-transform duration-500 bottom-sheet border-t border-light-border dark:border-dark-border ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-8" onClick={onClose} />
        
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-6">New Collection</h2>

        <form onSubmit={handleSubmit} className="space-y-6 pb-12">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">GitHub URL</label>
            <input
              type="text"
              required
              inputMode="url"
              placeholder="github.com/facebook/react"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-light-border dark:border-dark-border rounded-2xl px-6 py-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary transition-all font-medium"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Your Context</label>
            <textarea
              placeholder="What makes this project special to you?"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-light-border dark:border-dark-border rounded-2xl px-6 py-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary transition-all h-28 resize-none font-medium"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {error && <p className="text-red-500 text-sm font-bold text-center">{error}</p>}

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full bg-primary active:scale-[0.97] text-white font-extrabold py-5 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-3 disabled:opacity-70"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing with Gemini...
              </>
            ) : (
              'Add Repository'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddRepoModal;
