'use client';

import { Suspense } from 'react';
import ResultsContent from './ResultsContent';

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)', color: 'var(--accent-purple)' }}>Loading...</div>}>
      <ResultsContent />
    </Suspense>
  );
}