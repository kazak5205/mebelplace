'use client';

import React from 'react';

export default function TestSimple() {
  return (
    <div className="min-h-screen glass-bg-primary p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-4">Тест API интеграции</h1>
        <div className="glass-bg-secondary rounded-lg p-6">
          <p className="text-white">Фронтенд работает!</p>
          <p className="text-gray-300 mt-2">API хуки готовы к интеграции</p>
        </div>
      </div>
    </div>
  );
}
