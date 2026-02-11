import React, { useState } from 'react';
import { GeneratedCard } from '../types';

interface QuoteCardDisplayProps {
  card: GeneratedCard;
}

export const QuoteCardDisplay: React.FC<QuoteCardDisplayProps> = ({ card }) => {
  const { metadata, imageUrl } = card;
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageUrl;
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      // Set canvas dimensions to match the source image
      canvas.width = img.width;
      canvas.height = img.height;

      // 1. Draw Image
      ctx.drawImage(img, 0, 0);

      // 2. Draw Gradient Overlay
      // Matches: bg-gradient-to-t from-black/90 via-black/40 to-transparent
      const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0.9)');
      gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.4)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 3. Configure Text Rendering
      // Wait for fonts to be ready ensures we use the correct font family
      await document.fonts.ready;

      const w = canvas.width;
      const h = canvas.height;
      const contentPadding = w * 0.08; // Padding from sides and bottom

      // --- Draw Author ---
      const authorFontSize = w * 0.035; 
      ctx.font = `500 ${authorFontSize}px 'Inter', sans-serif`;
      ctx.fillStyle = '#e2e8f0'; // slate-200
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      
      const authorY = h - contentPadding;
      ctx.fillText(metadata.author.toUpperCase(), w / 2, authorY);
      
      // --- Draw Separator ---
      const separatorGap = authorFontSize * 1.5;
      const separatorY = authorY - authorFontSize - separatorGap;
      const separatorWidth = w * 0.15;
      
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = Math.max(1, w * 0.002);
      ctx.beginPath();
      ctx.moveTo((w / 2) - (separatorWidth / 2), separatorY);
      ctx.lineTo((w / 2) + (separatorWidth / 2), separatorY);
      ctx.stroke();

      // --- Draw Quote ---
      const quoteFontSize = w * 0.075;
      ctx.font = `italic ${quoteFontSize}px 'Playfair Display', serif`;
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';

      const quoteBottomMargin = separatorGap;
      const quoteYBase = separatorY - quoteBottomMargin;
      const maxWidth = w - (contentPadding * 2);
      const lineHeight = quoteFontSize * 1.2;

      // Word Wrap Logic
      const words = `"${metadata.quote}"`.split(' ');
      let line = '';
      const lines = [];

      for(let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && i > 0) {
          lines.push(line);
          line = words[i] + ' ';
        } else {
          line = testLine;
        }
      }
      lines.push(line);

      // Draw lines from bottom up
      let currentY = quoteYBase;
      // Reverse lines to draw from the bottom-most line upwards
      lines.reverse().forEach((textLine) => {
        ctx.fillText(textLine.trim(), w / 2, currentY);
        currentY -= lineHeight;
      });

      // 4. Trigger Download
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `lumina-quote-${Date.now()}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (e) {
      console.error("Failed to generate download", e);
      alert("Could not generate image download.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col md:flex-row gap-8 items-start animate-fade-in-up">
      {/* The Visual Card */}
      <div className="relative group w-full md:w-[400px] aspect-[3/4] rounded-xl overflow-hidden shadow-2xl transition-transform hover:scale-[1.01] duration-500 shrink-0">
        <img 
          src={imageUrl} 
          alt={metadata.visualPrompt} 
          className="w-full h-full object-cover"
        />
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80" />

        {/* Text Content Overlay */}
        <div className="absolute inset-0 p-8 flex flex-col justify-end text-center">
          <div className="mb-6">
            <p className="text-white font-serif text-2xl md:text-3xl leading-tight drop-shadow-lg italic">
              "{metadata.quote}"
            </p>
          </div>
          <div className="border-t border-white/30 w-16 mx-auto mb-4" />
          <p className="text-slate-200 font-medium tracking-widest text-sm uppercase drop-shadow-md">
            {metadata.author}
          </p>
        </div>
      </div>

      {/* The Details / Context Section */}
      <div className="flex-1 space-y-6 pt-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 backdrop-blur-sm">
          <h3 className="text-xl font-bold text-indigo-400 mb-2 font-serif">Behind the Quote</h3>
          <p className="text-slate-300 leading-relaxed">
            {metadata.description}
          </p>
        </div>

        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm">
          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">AI Vision</h4>
          <p className="text-slate-400 text-sm italic border-l-2 border-indigo-500 pl-4 py-1">
            "{metadata.visualPrompt}"
          </p>
          <div className="mt-4 flex gap-2">
            <span className="px-3 py-1 rounded-full bg-slate-700 text-xs text-slate-300 border border-slate-600">
              Mood: {metadata.mood}
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-700 text-xs text-slate-300 border border-slate-600">
              Gemini 2.5 Flash
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={handleDownload}
            disabled={isDownloading}
            className={`flex-1 py-3 px-4 rounded-lg font-medium text-center transition-colors border flex items-center justify-center gap-2
              ${isDownloading 
                ? 'bg-slate-800 text-slate-400 border-slate-700 cursor-wait' 
                : 'bg-indigo-600 hover:bg-indigo-500 text-white border-transparent shadow-lg hover:shadow-indigo-500/25'
              }`}
          >
            {isDownloading ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Exporting...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Card
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};