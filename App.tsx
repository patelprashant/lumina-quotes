import React, { useState } from 'react';
import { GeneratorForm } from './components/GeneratorForm';
import { QuoteCardDisplay } from './components/QuoteCardDisplay';
import { generateQuoteMetadata, generateCardImage } from './services/api';
import { GeneratedCard, GenerationState } from './types';

export default function App() {
  const [generationState, setGenerationState] = useState<GenerationState>(GenerationState.IDLE);
  const [generatedCard, setGeneratedCard] = useState<GeneratedCard | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (topic: string, style: string) => {
    setError(null);
    setGeneratedCard(null);
    setGenerationState(GenerationState.GENERATING_TEXT);

    try {
      // Step 1: Generate Text & Metadata with Gemini
      const metadata = await generateQuoteMetadata(topic, style);
      
      setGenerationState(GenerationState.GENERATING_IMAGE);

      // Step 2: Generate Image with Gemini
      // We append the style to the prompt to guide the model better
      const enhancedVisualPrompt = `${style} style. ${metadata.visualPrompt}`;
      const imageUrl = await generateCardImage(enhancedVisualPrompt);

      setGeneratedCard({
        metadata,
        imageUrl
      });
      setGenerationState(GenerationState.COMPLETE);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong during generation. Please try again.");
      setGenerationState(GenerationState.ERROR);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0f172a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-900 to-slate-900 pb-20">
      
      {/* Header */}
      <header className="pt-16 pb-12 px-6 text-center">
        <h1 className="text-5xl md:text-6xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-white to-indigo-200 mb-4 drop-shadow-sm">
          Lumina Quotes
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Transform wisdom into art. Powered by <span className="text-indigo-400 font-semibold">Gemini</span> for both insight and visuals.
        </p>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 flex flex-col items-center gap-12">
        
        {/* Form Section */}
        <section className="w-full flex justify-center">
          <GeneratorForm onGenerate={handleGenerate} state={generationState} />
        </section>

        {/* Error Display */}
        {error && (
          <div className="w-full max-w-xl bg-red-500/10 border border-red-500/50 text-red-200 px-6 py-4 rounded-lg flex items-center gap-3">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p>{error}</p>
          </div>
        )}

        {/* Result Display */}
        {generationState === GenerationState.COMPLETE && generatedCard && (
          <section className="w-full animate-fade-in">
             <QuoteCardDisplay card={generatedCard} />
          </section>
        )}

        {/* Loading Placeholders / States if needed beyond the button spinner */}
        {(generationState === GenerationState.GENERATING_TEXT || generationState === GenerationState.GENERATING_IMAGE) && (
             <div className="text-slate-500 text-sm animate-pulse mt-4">
                {generationState === GenerationState.GENERATING_TEXT 
                    ? "Gemini is searching for the perfect words..." 
                    : "Gemini is painting the vision..."}
             </div>
        )}

      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 w-full py-4 text-center text-slate-600 text-xs bg-slate-900/80 backdrop-blur border-t border-slate-800">
        <p>Generated content may be inaccurate. Use with discretion.</p>
      </footer>
    </div>
  );
}