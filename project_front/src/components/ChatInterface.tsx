import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Bot, User, LogIn } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  userId: string;
}

export function ChatInterface() {
  const [userId, setUserId] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history from localStorage when component mounts
  useEffect(() => {
    if (userId) {
      const savedMessages = localStorage.getItem(`chat_history_${userId}`);
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      }
    }
  }, [userId]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (userId && messages.length > 0) {
      localStorage.setItem(`chat_history_${userId}`, JSON.stringify(messages));
    }
  }, [messages, userId]);

  const handleStartChat = () => {
    if (userId.trim()) {
      setIsAuthenticated(true);
      // Load any existing chat history
      const savedMessages = localStorage.getItem(`chat_history_${userId}`);
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      }
    }
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
      userId: userId
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // Simulate AI response
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I understand you're interested in health information. How can I assist you today?",
        sender: 'bot',
        timestamp: new Date(),
        userId: userId
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      setIsRecording(true);
      setIsListening(true);

      mediaRecorder.current.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          setInputText("Voice input detected. In a real implementation, this would be converted to text.");
          setIsListening(false);
        }
      };

      mediaRecorder.current.start();
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setIsRecording(false);
      setIsListening(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl p-8 shadow-xl">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome to Health Chat</h2>
            <p className="text-gray-600 dark:text-gray-300">Please enter your user ID to start chatting</p>
          </div>
          <div className="space-y-4">
            <div>
              <label htmlFor="userId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                User ID
              </label>
              <input
                type="text"
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
                placeholder="Enter your user ID"
              />
            </div>
            <button
              onClick={handleStartChat}
              disabled={!userId.trim()}
              className="w-full bg-indigo-600 dark:bg-indigo-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start Chatting
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl">
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl p-6 shadow-xl">
        <div className="h-[600px] flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-4 border-b dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                <User className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white">User ID: {userId}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Connected to Health Assistant</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto mb-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  message.sender === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.sender === 'user'
                      ? 'bg-indigo-100 dark:bg-indigo-900'
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}
                >
                  {message.sender === 'user' ? (
                    <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  ) : (
                    <Bot className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  )}
                </div>
                <div
                  className={`flex-1 rounded-lg px-4 py-2 ${
                    message.sender === 'user'
                      ? 'bg-indigo-600 dark:bg-indigo-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message or use voice input..."
              className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent p-4 pr-24"
              rows={3}
            />
            <div className="absolute right-2 bottom-2 flex gap-2">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`p-2 rounded-full transition-colors ${
                  isRecording
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 text-gray-600 dark:text-gray-300'
                }`}
              >
                {isRecording ? (
                  <MicOff className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={handleSend}
                disabled={!inputText.trim()}
                className="p-2 rounded-full bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>

          {isListening && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center">
                <div className="animate-pulse mb-4">
                  <Mic className="w-12 h-12 text-indigo-600 dark:text-indigo-400 mx-auto" />
                </div>
                <p className="text-gray-900 dark:text-gray-100">Listening...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}