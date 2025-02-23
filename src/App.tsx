import React from 'react';
import { Background } from './components/Background';
import { FileUpload } from './components/FileUpload';
import { Activity } from 'lucide-react';
import { ThemeToggle } from './components/ThemeToggle';

function App() {
  return (
    <>
      <Background />
      <ThemeToggle />
      <div className="min-h-screen relative">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Activity className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">HealthAnalyzer AI</h1>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Upload your health report and get instant insights powered by advanced AI analysis
            </p>
          </div>
          
          <div className="flex justify-center">
            <FileUpload />
          </div>
        </div>
      </div>
    </>
  );
}

export default App;