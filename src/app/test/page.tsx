'use client';

import { Suspense } from 'react';
import TestContent from './TestContent';

export default function TestPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)', color: 'var(--accent-purple)' }}>Loading...</div>}>
      <TestContent />
    </Suspense>
  );
}