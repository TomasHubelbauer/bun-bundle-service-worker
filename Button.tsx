import React, { MouseEvent } from 'react';

type ButtonProps = {
  text: string;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void | Promise<void>;
  danger?: true;
} & {
  [key: `data-${string}`]: string;
};

export default function Button({ text, onClick, danger, ...dataset }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`cursor-pointer px-4 border-1 rounded bg-white hover:${danger ? 'bg-red-100' : 'bg-slate-100'}`}
      {...dataset}
    >
      {text}
    </button>
  );
}
