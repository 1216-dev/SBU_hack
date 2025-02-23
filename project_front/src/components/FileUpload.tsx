import { useState } from 'react';
import { Upload, FileType, AlertCircle } from 'lucide-react';

export function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const analyzeReport = async () => {
    if (!file) return;
    
    setAnalyzing(true);
    // Simulate analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock result - in a real app, this would come from your backend
    setResult("Based on the analysis of your health report, no significant health issues were detected. However, your vitamin D levels are slightly below optimal range. We recommend consulting with your healthcare provider for personalized advice.");
    setAnalyzing(false);
  };

  return (
    <div className="w-full max-w-2xl">
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl p-8 shadow-xl">
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-indigo-600 dark:border-indigo-400 border-dashed rounded-lg cursor-pointer bg-white/50 dark:bg-gray-900/50 hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-12 h-12 mb-4 text-indigo-600 dark:text-indigo-400" />
              <p className="mb-2 text-lg text-gray-500 dark:text-gray-400">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">PDF or Image files (MAX. 10MB)</p>
            </div>
            <input
              type="file"
              className="hidden"
              accept=".pdf,image/*"
              onChange={handleFileChange}
            />
          </label>
        </div>

        {file && (
          <div className="mt-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <FileType className="w-4 h-4" />
              <span>{file.name}</span>
            </div>
            <button
              onClick={analyzeReport}
              disabled={analyzing}
              className="mt-4 w-full bg-indigo-600 dark:bg-indigo-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors disabled:opacity-50"
            >
              {analyzing ? 'Analyzing...' : 'Analyze Report'}
            </button>
          </div>
        )}

        {result && (
          <div className="mt-6 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-1 flex-shrink-0" />
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{result}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}