import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, FunctionDeclaration, Type } from "@google/genai";
import { useProducts } from '../contexts/AppContext';
import { ChatMessage, Order } from '../types';
import { BotIcon, XIcon, SendIcon, ClipboardListIcon } from './Icons';
import { youwareService } from '../services/youwareService';
import { useI18n } from '../contexts/I18nContext';

// IMPORTANT: This should be handled by environment variables in a real-world scenario
// For this context, we assume process.env.API_KEY is available.
const API_KEY = process.env.API_KEY;

// --- Function Declarations for Gemini ---
const getDashboardSummary: FunctionDeclaration = {
    name: 'getDashboardSummary',
    description: 'Get a summary of the store dashboard, including total products, total stock, and number of pending orders.'
};
const getLatestOrders: FunctionDeclaration = {
    name: 'getLatestOrders',
    description: 'Get a list of the 5 most recent orders.',
    parameters: { type: Type.OBJECT, properties: {} }
};
const getOrderStatus: FunctionDeclaration = {
    name: 'getOrderStatus',
    description: 'Get the current status of a specific order by its ID.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            orderId: { type: Type.STRING, description: 'The ID of the order to check.' }
        },
        required: ['orderId']
    }
};
const updateOrderStatus: FunctionDeclaration = {
    name: 'updateOrderStatus',
    description: 'Update the status of a specific order.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            orderId: { type: Type.STRING, description: 'The ID of the order to update.' },
            newStatus: { type: Type.STRING, description: 'The new status for the order. Must be one of: Pending, Shipped, Delivered, Cancelled.' }
        },
        required: ['orderId', 'newStatus']
    }
};

export const AdminChatbotWidget: React.FC = () => {
    const { t } = useI18n();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'model', content: t('adminChatbot.initialMessage') }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            if (!API_KEY) throw new Error("API key is not configured.");
            const ai = new GoogleGenAI({ apiKey: API_KEY });
            
            const systemInstruction = "You are an AI assistant for the admin of an e-commerce store called HypeHaat. You can help manage orders and provide dashboard summaries by calling the available functions. Be concise and professional.";

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: input,
                config: {
                    systemInstruction,
                    tools: [{ functionDeclarations: [getDashboardSummary, getLatestOrders, getOrderStatus, updateOrderStatus] }]
                },
            });

            if (response.functionCalls && response.functionCalls.length > 0) {
                const fc = response.functionCalls[0];
                let functionResult: any;
                
                // Call the appropriate service function based on the model's request
                switch(fc.name) {
                    case 'getDashboardSummary':
                        const products = youwareService.getProducts();
                        const orders = youwareService.getAllOrders();
                        functionResult = `Total Products: ${products.length}, Total Stock: ${products.reduce((s, p) => s + p.stock, 0)}, Pending Orders: ${orders.filter(o => o.status === 'Pending').length}`;
                        break;
                    case 'getLatestOrders':
                        const latestOrders = youwareService.getAllOrders().slice(0, 5);
                        functionResult = `Here are the 5 latest orders:\n` + latestOrders.map(o => `- ID: ${o.id.slice(-6)}, Customer: ${o.userName}, Total: Tk ${o.grandTotal}, Status: ${o.status}`).join('\n');
                        break;
                    case 'getOrderStatus':
                        // FIX: Cast `orderId` from function call arguments to string.
                        const orderId = fc.args.orderId as string;
                        const order = youwareService.getAllOrders().find(o => o.id.includes(orderId));
                        functionResult = order ? `The status of order ${order.id.slice(-6)} is ${order.status}.` : `Sorry, I couldn't find an order with the ID containing "${orderId}".`;
                        break;
                    case 'updateOrderStatus':
                        // FIX: Cast `orderId` and `newStatus` from function call arguments to their respective types.
                        const orderIdToUpdate = fc.args.orderId as string;
                        const newStatus = fc.args.newStatus as Order['status'];
                        const orderToUpdate = youwareService.getAllOrders().find(o => o.id.includes(orderIdToUpdate));
                        if (orderToUpdate) {
                            youwareService.updateOrderStatus(orderToUpdate.id, newStatus);
                            functionResult = `Done! I've updated the status for order ${orderToUpdate.id.slice(-6)} to ${newStatus}.`;
                        } else {
                             functionResult = `Sorry, I couldn't find an order with the ID containing "${orderIdToUpdate}" to update.`;
                        }
                        break;
                    default:
                        functionResult = "Sorry, I can't do that.";
                }

                const modelMessage: ChatMessage = { role: 'model', content: functionResult };
                setMessages(prev => [...prev, modelMessage]);

            } else {
                 const modelMessage: ChatMessage = { role: 'model', content: response.text };
                 setMessages(prev => [...prev, modelMessage]);
            }
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
                className="fixed bottom-6 left-6 bg-secondary text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg hover:bg-opacity-80 transition-transform duration-300 hover:scale-110 z-40"
                aria-label="Open AI Admin Assistant"
            >
                <ClipboardListIcon className="w-8 h-8" />
            </button>

            <div className={`fixed bottom-24 left-6 w-full max-w-md h-[70vh] bg-surface rounded-lg shadow-2xl border border-white/10 flex flex-col transition-all duration-300 ease-in-out z-50 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                <div className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
                    <h3 className="font-bold text-lg text-textPrimary">AI Admin Assistant</h3>
                    <button onClick={() => setIsOpen(false)} className="text-textSecondary hover:text-primary">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

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
                                <p className="text-sm animate-pulse">Thinking...</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-white/10 flex-shrink-0">
                    <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="e.g., Update order 1a2b3c to Shipped"
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