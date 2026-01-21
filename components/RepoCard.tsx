
import React from 'react';
import { Repository } from '../types';

interface RepoCardProps {
  repo: Repository;
  onDelete: (id: string) => void;
}

const RepoCard: React.FC<RepoCardProps> = ({ repo, onDelete }) => {
  const difficultyColors = {
    Beginner: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    Intermediate: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    Advanced: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  const imageUrl = `https://opengraph.githubassets.com/1/${repo.owner}/${repo.name}`;

  return (
    <div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-3xl overflow-hidden shadow-sm active:scale-[0.98] transition-all duration-200">
      <div className="relative h-28 w-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
        <img 
          src={imageUrl} 
          alt={repo.name} 
          className="w-full h-full object-cover"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/90 dark:bg-slate-800/90 px-2.5 py-1 rounded-full shadow-sm text-[10px] font-bold">
          <svg className="w-3.5 h-3.5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
          <span className="text-slate-700 dark:text-slate-200">{repo.stars > 999 ? (repo.stars / 1000).toFixed(1) + 'k' : repo.stars}</span>
        </div>
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white truncate">
              <a href={repo.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                {repo.name}
              </a>
            </h3>
            <p className="text-xs text-slate-500 font-medium">by {repo.owner}</p>
          </div>
          <button 
            onClick={() => { if(confirm("Discard this project?")) onDelete(repo.id); }}
            className="p-1 text-slate-400 hover:text-red-500 active:scale-90 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          <span className={`text-[10px] px-2 py-0.5 rounded-lg font-bold uppercase tracking-wider ${difficultyColors[repo.difficulty]}`}>
            {repo.difficulty}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider">
            {repo.language}
          </span>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-light-border dark:border-dark-border">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="bg-primary/10 p-1 rounded-md">
                <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" /></svg>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">Insight</span>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-snug line-clamp-3 font-medium">
              {repo.aiSummary}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {repo.useCases.slice(0, 2).map((uc, i) => (
              <span key={i} className="text-[10px] bg-white dark:bg-slate-800 border border-light-border dark:border-dark-border text-slate-700 dark:text-slate-200 px-3 py-1 rounded-full font-bold uppercase tracking-tight">
                {uc}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepoCard;
