import React from 'react';

export default function Title({ text }: { text: string }) {
  return (
    <div className='flex items-center gap-[1ch]'>
      <hr className='flex-1 border-slate-200' />
      <span className='text-slate-700'>{text}</span>
      <hr className='flex-1 border-slate-200' />
    </div>
  );
}
