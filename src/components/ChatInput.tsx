'use client';

import { useState } from 'react';

interface ChatInputProps {
  onSubmit: (prompt: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSubmit, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || disabled) return;
    onSubmit(input);
    setInput('');
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about the image..."
          disabled={disabled}
          className="flex-1 px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-600
                     bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100
                     placeholder-zinc-400 dark:placeholder-zinc-500
                     focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                     disabled:opacity-50 disabled:cursor-not-allowed
                     text-sm sm:text-base"
        />
        <button
          type="submit"
          disabled={disabled || !input.trim()}
          className="px-3 sm:px-4 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-700
                     disabled:bg-zinc-400 disabled:cursor-not-allowed
                     text-white rounded-lg font-medium transition-colors
                     text-sm sm:text-base whitespace-nowrap"
        >
          <span className="hidden sm:inline">Send</span>
          <svg className="w-5 h-5 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </form>
  );
}
