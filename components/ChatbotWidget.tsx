import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { useProducts } from '../contexts/AppContext';
import { Product, ChatMessage } from '../types';
import { BotIcon, XIcon, SendIcon } from './Icons';
import { useI18n } from '../contexts/I18nContext';

// IMPORTANT: This should be handled by environment variables in a real-world scenario
// For this context, we assume process.env.API_KEY is available.
const API_KEY = process.env.API_KEY;

export const ChatbotWidget: React.FC = () => {
    const { t } = useI18n();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'model', content: t('chatbot.initialMessage') }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { products } = useProducts();
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const generateProductContext = (allProducts: Product[]): string => {
        let context = "Here is the list of available products in the HypeHaat store:\n\n";
        allProducts.forEach(p => {
            const price = p.discountPrice ? `Tk ${p.discountPrice} (Original: Tk ${p.price})` : `Tk ${p.price}`;
            const variants = p.variants?.map(v => 
                `${v.name}: ${v.options.map(o => o.name).join(', ')}`
            ).join('; ');

            context += `ID: ${p.id}\n`;
            context += `Name: ${p.name}\n`;
            context += `Description: ${p.description}\n`;
            context += `Price: ${price}\n`;
            context += `Category: ${p.category}\n`;
            if (variants) {
                context += `Options: ${variants}\n`;
            }
            context += "------------------------\n";
        });
        return context;
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            if (!API_KEY) {
              throw new Error("API key is not configured.");
            }
            const ai = new GoogleGenAI({ apiKey: API_KEY });

            const productContext = generateProductContext(products);
            const systemInstruction = `You are HypeHaat's friendly and expert AI Shopping Assistant. Your goal is to help users find the perfect product from our catalog. Be helpful, concise, and stay strictly on topic. Do not answer questions unrelated to HypeHaat or its products. Use ONLY the provided product list to answer questions. If you don't know the answer or the information is not in the list, say you can't find that information. Here is the complete and up-to-date list of products available in our store. Use ONLY this information to answer user questions:\n\n${productContext}`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: input,
                config: {
                    systemInstruction: systemInstruction,
                },
            });

            const modelMessage: ChatMessage = { role: 'model', content: response.text };
            setMessages(prev => [...prev, modelMessage]);

        } catch (error) {
            console.error("Error communicating with Gemini API:", error);
            const errorMessage: ChatMessage = { role: 'model', content: "Sorry, I'm having trouble connecting right now. Please try again later." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 left-6 bg-primary text-background w-16 h-16 rounded-full flex items-center justify-center shadow-lg hover:bg-opacity-80 transition-transform duration-300 hover:scale-110 z-40"
                aria-label="Open AI Assistant"
            >
                <BotIcon className="w-8 h-8" />
            </button>

            <div className={`fixed bottom-24 left-6 w-full max-w-sm h-[60vh] bg-surface rounded-lg shadow-2xl border border-white/10 flex flex-col transition-all duration-300 ease-in-out z-50 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
                    <h3 className="font-bold text-lg text-textPrimary">HypeHaat AI Assistant</h3>
                    <button onClick={() => setIsOpen(false)} className="text-textSecondary hover:text-primary">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Messages */}
                <div ref={chatContainerRef} className="flex-grow p-4 overflow-y-auto space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-primary text-background' : 'bg-background text-textPrimary'}`}>
                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                             <div className="max-w-xs px-4 py-2 rounded-2xl bg-background text-textPrimary">
                                <p className="text-sm animate-pulse">Typing...</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Form */}
                <div className="p-4 border-t border-white/10 flex-shrink-0">
                    <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about products..."
                            className="w-full bg-background border border-white/20 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary text-textPrimary"
                        />
                        <button type="submit" disabled={isLoading} className="bg-primary text-background p-3 rounded-full hover:bg-opacity-80 disabled:bg-gray-500">
                            <SendIcon className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};