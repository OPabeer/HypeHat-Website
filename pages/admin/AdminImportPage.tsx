import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../contexts/I18nContext';

// Schema for Gemini to follow when generating product data
const productSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: "A creative and appealing name for the product, suitable for an e-commerce store called HypeHaat." },
        description: { type: Type.STRING, description: "A detailed, engaging, and unique description for the product, highlighting its key features and benefits." },
        price: { type: Type.NUMBER, description: "A realistic market price for this type of product in Bangladeshi Taka (Tk). Should be a round number." },
        discountPrice: { type: Type.NUMBER, description: "A realistic discounted price, slightly lower than the original price. Omit this for about 30% of products." },
        category: { type: Type.STRING, description: "A relevant product category based on the inferred product type (e.g., Keyboards, Mice, Headsets, Monitors, Accessories)." },
        images: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of 3 realistic, high-quality public image URLs for the product. Use a placeholder service like 'https://picsum.photos/seed/...' with relevant keywords in the seed." },
        stock: { type: Type.INTEGER, description: "A realistic stock count, like a number between 20 and 100." },
        productType: { type: Type.STRING, enum: ['dropship'], description: "Default this to 'dropship'." },
        supplierInfo: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING, description: "The name of the dropshipping supplier. If the URL is from aliexpress.com, use 'AliExpress'. If it is from cjdropshipping.com, use 'CJdropshipping'. Otherwise, infer from the domain." },
                costPrice: { type: Type.NUMBER, description: "A realistic cost price in Bangladeshi Taka (Tk). This should be a plausible wholesale price, typically 50-70% of the main sale price." }
            },
            required: ['name', 'costPrice']
        },
    },
    required: ['name', 'description', 'price', 'category', 'images', 'stock', 'productType', 'supplierInfo']
};


export const AdminImportPage: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useI18n();
    const [url, setUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleImport = async () => {
        if (!url.trim()) {
            setError(t('adminImportPage.error.urlRequired'));
            return;
        }
        if (!process.env.API_KEY) {
            setError("API Key is not configured. Please contact support.");
            return;
        }
        setIsLoading(true);
        setError('');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const systemInstruction = `You are a creative product data generator for an e-commerce store called HypeHaat that primarily uses CJdropshipping. The user will provide a URL of a product they want to import. You CANNOT access this URL. Instead, analyze the text of the URL itself to infer the product type, name, and key features. Then, generate a realistic, complete, and unique JSON object for a fictional product of that type. The JSON must strictly adhere to the provided schema. Make the name and description sound plausible and appealing. The supplier name should be 'CJdropshipping'.`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: `Generate product data based on this URL from CJdropshipping: ${url}`,
                config: {
                    systemInstruction,
                    responseMimeType: "application/json",
                    responseSchema: productSchema
                },
            });

            const productJson = JSON.parse(response.text);
            
            // Ensure the supplier URL is the one the user provided
            if (productJson.supplierInfo) {
                productJson.supplierInfo.url = url;
            } else {
                 productJson.supplierInfo = {
                    name: 'CJdropshipping',
                    url: url,
                    costPrice: (productJson.price * 0.6).toFixed(0) // Estimate cost price
                 }
            }
            
            const params = new URLSearchParams();
            for (const [key, value] of Object.entries(productJson)) {
                if (Array.isArray(value) || typeof value === 'object') {
                    params.append(key, JSON.stringify(value));
                } else if (value !== undefined && value !== null) {
                    params.append(key, String(value));
                }
            }
            
            navigate(`/admin/new?${params.toString()}`);

        } catch (e: any) {
            console.error("Error generating product with Gemini:", e);
            setError(t('adminImportPage.error.apiError', (e.message || 'Unknown error')));
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold">{t('adminImportPage.title')}</h1>
                <p className="text-textSecondary mt-2">
                    {t('adminImportPage.subtitle')}
                </p>
            </div>

            <div className="bg-surface p-6 rounded-lg border border-white/10">
                <label htmlFor="productUrl" className="block text-sm font-medium text-textSecondary mb-2">
                    {t('adminImportPage.productUrlLabel')}
                </label>
                <div className="flex gap-4">
                    <input
                        id="productUrl"
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder={t('adminImportPage.urlPlaceholder')}
                        className="w-full p-3 bg-background border border-white/20 rounded-md focus:outline-none focus:ring-1 focus:ring-primary font-mono text-sm"
                        disabled={isLoading}
                    />
                    <button onClick={handleImport} disabled={isLoading} className="bg-primary text-background font-bold py-2 px-8 rounded-full hover:bg-opacity-80 transition disabled:bg-gray-500 whitespace-nowrap">
                        {isLoading ? t('adminImportPage.importing') : t('adminImportPage.importButton')}
                    </button>
                </div>
                 {error && <p className="text-red-500 mt-4">{error}</p>}
            </div>
            
             <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <h3 className="font-semibold text-primary">{t('adminImportPage.howItWorksTitle')}</h3>
                <p className="text-sm text-textSecondary mt-1">
                    {t('adminImportPage.howItWorksText')}
                </p>
            </div>

        </div>
    );
};
