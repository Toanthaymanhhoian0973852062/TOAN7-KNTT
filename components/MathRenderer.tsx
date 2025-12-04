import React from 'react';
import katex from 'katex';

interface MathRendererProps {
  text: string;
  className?: string;
}

export const MathRenderer: React.FC<MathRendererProps> = ({ text, className = '' }) => {
  if (!text) return null;

  // Split text by $...$ delimiters
  const parts = text.split(/\$(.*?)\$/g);

  return (
    <span className={`math-renderer leading-loose text-slate-800 ${className}`}>
      {parts.map((part, index) => {
        // Even indices are regular text, odd indices are math content
        if (index % 2 === 0) {
          return <span key={index}>{part}</span>;
        } else {
          try {
            const html = katex.renderToString(part, {
              throwOnError: false,
              displayMode: false, // Inline mode
              output: 'html',
              trust: true,
              globalGroup: true,
            });
            
            return (
              <span
                key={index}
                className="inline-block px-0.5 align-middle max-w-full overflow-x-auto overflow-y-hidden no-scrollbar"
                dangerouslySetInnerHTML={{ __html: html }}
                style={{
                  // Ensure math is slightly scaled for readability but doesn't break flow
                  fontSize: '1.1em', 
                }}
              />
            );
          } catch (error) {
            console.warn("KaTeX rendering error:", error);
            // Fallback for failed renders
            return (
                <code key={index} className="text-rose-500 text-xs px-1.5 py-0.5 bg-rose-50 rounded border border-rose-100 font-mono align-middle">
                    ${part}$
                </code>
            );
          }
        }
      })}
    </span>
  );
};