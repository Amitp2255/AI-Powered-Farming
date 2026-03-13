
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { getChatbotResponse } from '../services/geminiService';
import { ChatMessage } from '../types';
import { Send, Bot, User, Loader2, Mic, Volume2, X } from 'lucide-react';
import { useLocalization } from '../contexts/LocalizationContext';
import { Language } from '../translations';

// Speech Recognition setup - checking for browser compatibility
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

// Mapping internal language codes to BCP 47 tags for Speech API
const localeMap: Record<string, string> = {
    'en': 'en-IN',
    'hi': 'hi-IN',
    'mr': 'mr-IN',
    'gu': 'gu-IN',
    'ta': 'ta-IN',
    'te': 'te-IN',
    'bn': 'bn-IN',
    'pa': 'pa-IN',
    'kn': 'kn-IN',
    'ml': 'ml-IN',
    'or': 'or-IN', 
    'bho': 'hi-IN', 
};

// Helper function to format text containing bold markdown (**text**)
const formatMessageText = (text: string) => {
    // Split by the bold markdown syntax
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            // Remove the asterisks and render as bold
            return <strong key={index} className="font-bold">{part.slice(2, -2)}</strong>;
        }
        return <span key={index}>{part}</span>;
    });
};

const Chatbot: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { t, language, supportedLanguages } = useLocalization(); // Directly use global language
    
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef(SpeechRecognition ? new SpeechRecognition() : null);

    const speak = useCallback((text: string, langCode: string) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // Cancel any previous speech
            
            // Clean up markdown before speaking
            const cleanText = text.replace(/\*\*/g, '');

            const utterance = new SpeechSynthesisUtterance(cleanText);
            const targetLocale = localeMap[langCode] || 'en-IN';
            
            // Try to find a specific voice for this locale
            const voices = window.speechSynthesis.getVoices();
            const voice = voices.find(v => v.lang === targetLocale) || voices.find(v => v.lang.startsWith(langCode));
            
            utterance.lang = targetLocale;
            if (voice) {
                utterance.voice = voice;
            }
            
            window.speechSynthesis.speak(utterance);
        }
    }, []);

    // Effect to initialize greeting when language changes
    useEffect(() => {
        const greetingText = t('chatbot.greeting');
        setMessages([{ id: crypto.randomUUID(), sender: 'ai', text: greetingText }]);
        // Optional: Speak greeting on open if desired, but usually better to wait for interaction
    }, [t, language]); 

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = useCallback(async (messageText: string) => {
        if (messageText.trim() === '' || isLoading) return;

        const userMessage: ChatMessage = { id: crypto.randomUUID(), sender: 'user', text: messageText };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Pass global language to AI service to enforce response language
            const aiResponse = await getChatbotResponse(messageText, language);
            const aiMessage: ChatMessage = { id: crypto.randomUUID(), sender: 'ai', text: aiResponse };
            setMessages(prev => [...prev, aiMessage]);
            speak(aiResponse, language);
        } catch (error) {
            const errorMessageText = t('chatbot.error');
            const errorMessage: ChatMessage = { id: crypto.randomUUID(), sender: 'ai', text: errorMessageText };
            setMessages(prev => [...prev, errorMessage]);
            speak(errorMessageText, language);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, language, speak, t]);

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSend(input);
        }
    };

    const toggleRecording = () => {
        if (!recognitionRef.current) {
            alert("Speech recognition is not supported in this browser.");
            return;
        }
        if (isRecording) {
            recognitionRef.current.stop();
        } else {
            // Set the recognition language to the selected app language
            recognitionRef.current.lang = localeMap[language] || 'en-IN';
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.start();
        }
    };

    useEffect(() => {
        const rec = recognitionRef.current;
        if (!rec) return;

        rec.onstart = () => setIsRecording(true);
        rec.onend = () => setIsRecording(false);
        rec.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setIsRecording(false);
        };
        rec.onresult = (event: any) => {
            let finalTranscript = '';
            let interimTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            
            setInput(finalTranscript || interimTranscript);
            
            if (finalTranscript) {
                handleSend(finalTranscript);
            }
        };
    }, [handleSend, language]);
    
    useEffect(() => {
        return () => {
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
        };
    }, [language]); 


    return (
        <div className="flex flex-col h-[90vh] w-full max-w-md mx-auto bg-white rounded-2xl shadow-2xl animate-fade-in-up">
            <header className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-2xl">
                <div className="text-center flex-1">
                    <h1 className="text-lg font-semibold text-black">{t('chatbot.title')}</h1>
                    <p className="text-xs text-gray-500 capitalize">{supportedLanguages.find(l => l.code === language)?.name}</p>
                </div>
                <button onClick={onClose} className="p-2 text-gray-500 rounded-full hover:bg-gray-200" aria-label={t('chatbot.ariaClose')}>
                    <X className="w-5 h-5" />
                </button>
            </header>
            <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
                <div className="space-y-4">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                            {msg.sender === 'ai' && (
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center">
                                    <Bot className="w-5 h-5 text-white" />
                                </div>
                            )}
                            <div className={`max-w-xs sm:max-w-md p-3 rounded-lg relative group ${msg.sender === 'user' ? 'bg-primary-200 text-black rounded-br-none' : 'bg-gray-200 text-black rounded-bl-none'}`}>
                                <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>
                                    {msg.sender === 'ai' ? formatMessageText(msg.text) : msg.text}
                                </p>
                                {msg.sender === 'ai' && (
                                    <button
                                        onClick={() => speak(msg.text, language)}
                                        className="absolute -bottom-3 -right-3 p-1 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                                        aria-label={t('chatbot.ariaReadAloud')}
                                    >
                                        <Volume2 className="w-4 h-4 text-primary-600" />
                                    </button>
                                )}
                            </div>
                            {msg.sender === 'user' && (
                                 <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                                    <User className="w-5 h-5 text-white" />
                                </div>
                            )}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <div className="max-w-xs p-3 rounded-lg bg-gray-200 text-black rounded-bl-none">
                                <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </main>
            <footer className="p-4 border-t bg-gray-50 rounded-b-2xl">
                <div className="flex items-center space-x-2 sm:space-x-3">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={t('chatbot.placeholder')}
                        className="flex-1 w-full px-4 py-2 bg-white border border-gray-300 rounded-full shadow-sm text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        disabled={isLoading || isRecording}
                    />
                     <button onClick={toggleRecording} disabled={!recognitionRef.current || isLoading} className={`p-3 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-50 ${isRecording ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                        <Mic className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleSend(input)} disabled={isLoading || isRecording || input.trim() === ''} className="p-3 bg-primary-600 text-white rounded-full hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-300 disabled:cursor-not-allowed">
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default Chatbot;
