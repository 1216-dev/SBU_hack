import React, { useState } from 'react';
import { Background } from './components/Background';
import { FileUpload } from './components/FileUpload';
import { Activity } from 'lucide-react';
import { ThemeToggle } from './components/ThemeToggle';
import { ChatInterface } from './components/ChatInterface';

function App() {
  const [activeTab, setActiveTab] = useState<'upload' | 'chat'>('upload');

  return (
    <>
      <Background />
      <ThemeToggle />
      <div className="min-h-screen relative">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Activity className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">HealthAnalyzer AI</h1>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Upload your health report or chat with our AI assistant for instant insights
            </p>
          </div>

          <div className="flex justify-center mb-8">
            <div className="inline-flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
              <button
                onClick={() => setActiveTab('upload')}
                className={`px-6 py-2.5 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'upload'
                    ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
                }`}
              >
                Upload Report
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-6 py-2.5 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'chat'
                    ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
                }`}
              >
                Chat Assistant
              </button>
            </div>
          </div>
          
          <div className="flex justify-center">
            {activeTab === 'upload' ? <FileUpload /> : <ChatInterface />}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;