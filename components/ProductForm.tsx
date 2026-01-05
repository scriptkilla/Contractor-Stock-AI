import React, { useState, useEffect, useCallback } from 'react';
import { Product } from '../types';
import { analyzeProductImage } from '../services/geminiService';
// Added RefreshCw to the imports from lucide-react
import { Sparkles, Camera, Save, Loader2, Check, AlertCircle, Wand2, RefreshCw } from 'lucide-react';

interface ProductFormProps {
  initialSku?: string;
  initialProduct?: Product;
  onSave: (product: Product) => void;
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ initialSku = '', initialProduct, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Product>>({
    sku: initialSku,
    name: '',
    description: '',
    category: '',
    quantity: 1,
    price: 0,
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAiSuccess, setShowAiSuccess] = useState(false);
  const [highlightedFields, setHighlightedFields] = useState<Set<string>>(new Set());
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [autoAnalyzeEnabled] = useState(() => localStorage.getItem('sv_ai_auto') !== 'false');

  useEffect(() => {
    if (initialProduct) {
      setFormData(initialProduct);
      if (initialProduct.imageUrl) {
        setPreviewImage(initialProduct.imageUrl);
      }
    }
  }, [initialProduct]);

  const handleAiAssist = useCallback(async (imageToAnalyze?: string) => {
    const targetImage = imageToAnalyze || previewImage;
    if (!targetImage) {
      return;
    }

    setIsAnalyzing(true);
    setShowAiSuccess(false);
    
    // Clear previous highlights
    setHighlightedFields(new Set());

    const result = await analyzeProductImage(targetImage);
    
    if (result) {
      setFormData(prev => ({
        ...prev,
        sku: (!initialProduct && result.sku) ? result.sku : prev.sku,
        name: result.name || prev.name,
        category: result.category || prev.category,
        description: result.description || prev.description,
        price: result.estimatedPrice || prev.price
      }));
      
      // Visual feedback orchestration
      const fields = ['name', 'category', 'description', 'price'];
      if (!initialProduct && result.sku) fields.push('sku');
      
      const newHighlights = new Set(fields);
      setHighlightedFields(newHighlights);
      setShowAiSuccess(true);
      
      // Elegant exit for highlights
      setTimeout(() => setHighlightedFields(new Set()), 4000);
    }
    setIsAnalyzing(false);
  }, [previewImage, initialProduct]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setPreviewImage(base64String);
      
      // Auto-trigger AI if enabled and this is a new product
      if (autoAnalyzeEnabled && !initialProduct) {
        handleAiAssist(base64String);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const product: Product = {
      id: initialProduct?.id || Math.random().toString(36).substr(2, 9),
      sku: formData.sku!,
      name: formData.name!,
      description: formData.description || '',
      category: formData.category || 'General',
      quantity: Number(formData.quantity) || 0,
      price: Number(formData.price) || 0,
      imageUrl: previewImage || undefined,
      lastUpdated: new Date().toISOString()
    };
    onSave(product);
  };

  const inputClasses = (field: string) => `
    w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all duration-700
    ${isAnalyzing ? 'animate-pulse bg-gray-50 dark:bg-gray-800/50' : ''}
    ${highlightedFields.has(field) 
      ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20 ring-4 ring-indigo-500/10' 
      : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800'}
  `;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl p-8 max-w-2xl mx-auto border border-gray-100 dark:border-gray-800 transition-colors duration-300">
      <div className="flex justify-between items-start mb-8">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
            {initialProduct ? 'Update Entry' : 'New Asset'}
          </h2>
          <div className="flex items-center gap-2">
            {showAiSuccess ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-bold uppercase tracking-wider animate-in fade-in zoom-in duration-300">
                <Check className="w-3 h-3" /> Smart Matched
              </div>
            ) : (
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Complete the product details below</p>
            )}
          </div>
        </div>

        <button 
          type="button"
          onClick={() => handleAiAssist()}
          disabled={!previewImage || isAnalyzing}
          className={`
            group flex items-center gap-2 px-5 py-3 rounded-2xl transition-all font-bold text-sm relative overflow-hidden
            ${isAnalyzing 
              ? 'bg-indigo-50 text-indigo-300 dark:bg-indigo-900/20' 
              : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-500/20 active:scale-95'}
            disabled:opacity-60
          `}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Thinking...</span>
            </>
          ) : (
            <>
              <Wand2 className={`w-4 h-4 transition-transform ${previewImage ? 'group-hover:rotate-12' : ''}`} />
              AI Intelligence
            </>
          )}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-7">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Asset Reference (SKU)</label>
              <div className="relative">
                <input
                  required
                  className={inputClasses('sku')}
                  value={formData.sku}
                  onChange={e => setFormData({ ...formData, sku: e.target.value })}
                  readOnly={!!initialProduct}
                  placeholder={isAnalyzing ? "Scanning ID..." : "0000000000"}
                />
                {!initialProduct && isAnalyzing && <Sparkles className="w-4 h-4 text-indigo-400 absolute right-4 top-1/2 -translate-y-1/2 animate-pulse" />}
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Product Designation</label>
              <div className="relative">
                <input
                  required
                  className={inputClasses('name')}
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder={isAnalyzing ? "AI is identifying..." : "Official name..."}
                />
                {isAnalyzing && <Sparkles className="w-4 h-4 text-indigo-400 absolute right-4 top-1/2 -translate-y-1/2 animate-pulse" />}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Classification</label>
              <input
                className={inputClasses('category')}
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                placeholder="Hardware, Parts, etc."
              />
            </div>
          </div>

          <div className="relative group">
            <div className={`
              h-full min-h-[220px] rounded-3xl border-2 border-dashed transition-all duration-500 overflow-hidden flex flex-col items-center justify-center p-4
              ${previewImage ? 'border-transparent' : 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 hover:bg-gray-100 dark:hover:bg-gray-900'}
              ${isAnalyzing ? 'ring-4 ring-indigo-500/20' : ''}
            `}>
              {previewImage ? (
                <>
                  <img 
                    src={previewImage} 
                    alt="Preview" 
                    className={`w-full h-full object-cover absolute inset-0 transition-all duration-1000 ${isAnalyzing ? 'scale-110 blur-sm brightness-75 grayscale-[0.5]' : 'group-hover:scale-105'}`} 
                  />
                  {isAnalyzing && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-indigo-950/40 backdrop-blur-[2px] animate-in fade-in duration-500">
                      <div className="relative mb-3">
                         <div className="absolute inset-0 bg-indigo-400 blur-xl opacity-30 animate-pulse" />
                         <Loader2 className="w-10 h-10 text-white animate-spin relative" />
                      </div>
                      <span className="text-white text-[10px] font-black uppercase tracking-[0.2em]">Neural Processing</span>
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-400 to-transparent shadow-[0_0_20px_rgba(129,140,248,0.8)] animate-[smartScan_2.5s_ease-in-out_infinite]" />
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 bg-white dark:bg-gray-900 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                    <Camera className="w-8 h-8 text-gray-400 dark:text-gray-600" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Capture Visual</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Image required for AI Assist</p>
                  </div>
                </div>
              )}
              
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="absolute inset-0 opacity-0 cursor-pointer z-20"
                onChange={handleImageUpload}
                disabled={isAnalyzing}
              />
              
              {previewImage && !isAnalyzing && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
                  <div className="flex items-center gap-2 text-white font-bold text-sm bg-white/10 px-4 py-2 rounded-full border border-white/20">
                    <RefreshCw className="w-4 h-4" />
                    Replace Photo
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Detailed Log / Description</label>
          <textarea
            rows={4}
            className={inputClasses('description')}
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            placeholder="Key specs, damage reports, or technical details..."
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Current Stock</label>
            <div className="relative">
               <input
                type="number"
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:text-white"
                value={formData.quantity}
                onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Asset Value ($)</label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                className={inputClasses('price')}
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-6">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-700 font-bold transition-all disabled:opacity-50"
            disabled={isAnalyzing}
          >
            Discard
          </button>
          <button
            type="submit"
            disabled={isAnalyzing}
            className="flex-[1.5] flex items-center justify-center gap-3 px-6 py-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 font-black shadow-xl shadow-indigo-200 dark:shadow-none transition-all disabled:opacity-50 active:scale-95"
          >
            <Save className="w-5 h-5" />
            {initialProduct ? 'Update Inventory' : 'Finalize Asset'}
          </button>
        </div>
      </form>
      
      <style>{`
        @keyframes smartScan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default ProductForm;