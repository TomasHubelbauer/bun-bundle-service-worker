import React, { useCallback, useState } from 'react';

type BaseResult = { id: number; stamp: string; };
type SuccessResult = BaseResult & { result: string; source: 'service-worker' | 'web-server'; };
type ErrorResult = BaseResult & { error: string; };

export default function Demo() {
  const [results, setResults] = useState<(SuccessResult | ErrorResult)[]>([]);

  const handleDemoButtonClick = useCallback(async () => {
    const stamp = new Date().toISOString().slice(0, 'yyyy-mm-dd-hh-mm-ss'.length).replace('T', ' ');

    try {
      const response = await fetch('/api/test');
      const text = await response.text();
      const source = response.headers.get('x-service-worker') ? 'service-worker' as const : 'web-server' as const;
      setResults(results => [{ id: results.length, stamp, result: text, source }, ...results]);
    }
    catch (error) {
      setResults(results => [{ id: results.length, stamp, error: error.message }, ...results]);
    }
  }, []);

  return (
    <>
      <button onClick={handleDemoButtonClick} className='cursor-pointer mr-auto px-4 border-1 rounded hover:bg-slate-100'>
        Hit service worker
      </button>
      <ul>
        {results.map(result => (
          <li key={result.id}>
            <time dateTime={result.stamp} className='text-slate-500'>{result.stamp}:</time>
            {' '}
            {'error' in result
              ? result.error
              : (
                <>
                  {result.result} <span className='text-slate-500'>({result.source})</span>
                </>
              )}
          </li>
        ))}
      </ul>
    </>
  );
}
