import React from 'react';

// See https://tailwindcss.com/docs/colors
type TailwindColorName = 'red' | 'orange' | 'amber' | 'yellow' | 'lime' | 'green' | 'emerald' | 'teal' | 'cyan' | 'sky' | 'blue' | 'indigo' | 'violet' | 'purple' | 'fuchsia' | 'pink' | 'rose' | 'slate' | 'gray' | 'zinc' | 'neutral' | 'stone';
type TailwindColorStep = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950;

export default function Status({ text, colorName, colorStep = 500 }: { text: string; colorName: TailwindColorName; colorStep?: TailwindColorStep }) {
  return (
    <span className={`text-${colorName}-${colorStep}`}>
      {text}
      <span className={`w-2 h-2 inline-block rounded ml-1 ${`bg-${colorName}-${colorStep}`}`} />
    </span>
  );
}
