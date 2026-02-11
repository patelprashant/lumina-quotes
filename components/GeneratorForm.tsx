import React, { useState } from 'react';
import { GenerationState } from '../types';

interface GeneratorFormProps {
  onGenerate: (topic: string, style: string) => void;
  state: GenerationState;
}

export const GeneratorForm: React.FC<GeneratorFormProps> = ({ onGenerate, state }) => {
  const [topic, setTopic] = useState('');
  const [style, setStyle] = useState('Cinematic');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      onGenerate(topic, style);
    }
  };

  const isLoading = state === GenerationState.GENERATING_TEXT || state === GenerationState.GENERATING_IMAGE;

  return (
    <div className="w-full max-w-xl mx-auto bg-slate-800/50 backdrop-blur-md border border-slate-700 p-6 rounded-2xl shadow-xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="topic" className="block text-sm font-medium text-slate-300 mb-1">
            Topic, Theme, or Person
          </label>
          <input
            id="topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Stoicism, Marie Curie, The Ocean..."
            className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-white placeholder-slate-500 transition-all"
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="style" className="block text-sm font-medium text-slate-300 mb-1">
            Visual Style
          </label>
          <select
            id="style"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-white transition-all"
            disabled={isLoading}
          >
            <option value="Cinematic">Cinematic & Dramatic</option>
            <option value="Minimalist">Minimalist & Clean</option>
            <option value="Surrealist">Surrealist & Dreamy</option>
            <option value="Watercolor">Watercolor & Soft</option>
            <option value="Cyberpunk">Cyberpunk & Neon</option>
            <option value="Vintage">Vintage & Nostalgic</option>
            <option value="Nature Photography">Nature Photography</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isLoading || !topic.trim()}
          className={`mt-2 py-3 px-6 rounded-lg font-semibold text-white shadow-lg transition-all transform flex justify-center items-center
            ${isLoading || !topic.trim() 
              ? 'bg-slate-600 cursor-not-allowed opacity-70' 
              : 'bg-indigo-600 hover:bg-indigo-500 hover:scale-[1.02] active:scale-[0.98] hover:shadow-indigo-500/25'
            }`}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
               <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
               {state === GenerationState.GENERATING_TEXT ? 'Consulting the Muse...' : 'Painting the Vision...'}
            </span>
          ) : (
            'Generate Quote Card'
          )}
        </button>
      </form>
    </div>
  );
};