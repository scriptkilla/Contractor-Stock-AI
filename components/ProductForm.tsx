
import React, { useState, useEffect, useCallback } from 'react';
import { Product } from '../types';
import { analyzeProductImage, AIAnalysisError } from '../services/geminiService';
import { Sparkles, Camera, Save, Loader2, Check, Wand2, RefreshCw, MapPin, CheckSquare, Square, X, Box, Tag, DollarSign, Hash, AlertCircle } from 'lucide-react';

interface ProductFormProps {
  initialSku?: string;
  initialProduct?: Product;
  onSave: (product: Product) => void;
  onCancel: () => void;
}

interface StorageLocation {
  id: string;
  name: string;
  type: string;
  isPrimary: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({ initialSku = '', initialProduct, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Product>>({
    sku: initialSku,
    name: '',
    description: '',
    category: '',
    locations: [],
    quantity: 1,
    price: 0,
  });

  const [availableLocations, setAvailableLocations] = useState<StorageLocation[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAiSuccess, setShowAiSuccess] = useState(false);
  const [aiError, setAiError] = useState<AIAnalysisError | null>(null);
  const [highlightedFields, setHighlightedFields] = useState<Set<string>>(new Set());
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [autoAnalyzeEnabled] = useState(() => localStorage.getItem('sv_ai_auto') !== 'false');

  useEffect(() => {
    const savedLocations = localStorage.getItem('sv_storage_locations');
    if (savedLocations) {
      const parsed = JSON.parse(savedLocations);
      setAvailableLocations(parsed);
      
      if (!initialProduct && (!formData.locations || formData.locations.length === 0)) {
        const primary = parsed.find((l: StorageLocation) => l.isPrimary);
        if (primary) {
          setFormData(prev => ({ ...prev, locations: [primary.name] }));
        }
      }
    }
    
    if (initialProduct) {
      // Handle potential legacy data where location might have been a string
      const legacyLocation = (initialProduct as any).location;
      const initialLocations = Array.isArray(initialProduct.locations) 
        ? initialProduct.locations 
        : legacyLocation ? [legacyLocation] : [];
        
      setFormData({
        ...initialProduct,
        locations: initialLocations
      });
      
      if (initialProduct.imageUrl) {
        setPreviewImage(initialProduct.imageUrl);
      }
    }
  }, [initialProduct]);

  const toggleLocation = (locName: string) => {
    setFormData(prev => {
      const current = prev.locations || [];
      if (current.includes(locName)) {
        return { ...prev, locations: current.filter(l => l !== locName) };
      } else {
        return { ...prev, locations: [...current, locName] };
      }
    });
  };

  const handleAiAssist = useCallback(async (imageToAnalyze?: string) => {
    const targetImage = imageToAnalyze || previewImage;
    if (!targetImage) return;

    setIsAnalyzing(true);
    setShowAiSuccess(false);
    setAiError(null);
    setHighlightedFields(new Set());

    try {
      const { data: result, error } = await analyzeProductImage(targetImage);
      
      if (error) {
        setAiError(error);
        return;
      }

      if (result) {
        setFormData(prev => ({
          ...prev,
          sku: (!initialProduct && result.sku) ? result.sku : prev.sku,
          name: result.name || prev.name,
          category: result.category || prev.category,
          description: result.description || prev.description,
          price: result.estimatedPrice || prev.price
        }));
        
        const fields = ['name', 'category', 'description', 'price'];
        if (!initialProduct && result.sku) fields.push('sku');
        
        const newHighlights = new Set(fields);
        setHighlightedFields(newHighlights);
        setShowAiSuccess(true);
        
        setTimeout(() => setHighlightedFields(new Set()), 4000);
      }
    } catch (error) {
      console.error("AI Assist failed:", error);
      setAiError('UNKNOWN');
    } finally {
      setIsAnalyzing(false);
    }
  }, [previewImage, initialProduct]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setPreviewImage(base64String);
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
      locations: formData.locations && formData.locations.length > 0 ? formData.locations : ['Unassigned'],
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
    <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl p-8 max-w-2xl mx-auto border border-gray-100 dark:border-gray-800 transition-colors duration-300 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />
      
      <div className="flex justify-between items-start mb-8 relative z-10">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
            {initialProduct ? 'Update Entry' : 'New Asset'}
          </h2>
          <div className="flex flex-col gap-2">
             {showAiSuccess && (
               <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase animate-in slide-in-from-left-2 self-start">
                 <Sparkles className="w-3 h-3" />
                 AI Optimized
               </div>
             )}
             {aiError && (
               <div className="flex items-center gap-1.5 px-3 py-1 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-[10px] font-black uppercase animate-in slide-in-from-left-2 self-start">
                 <AlertCircle className="w-3 h-3" />
                 {aiError === 'QUOTA_EXCEEDED' ? 'AI Busy (Quota Reached)' : 'AI Error (Retrying...)'}
               </div>
             )}
          </div>
        </div>
        <button onClick={onCancel} className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        <div className="flex flex-col items-center">
          <div className="relative group">
            <div className={`w-40 h-40 rounded-[2.5rem] bg-gray-50 dark:bg-gray-800 border-2 border-dashed ${isAnalyzing ? 'border-indigo-500 animate-pulse' : 'border-gray-200 dark:border-gray-700'} overflow-hidden flex items-center justify-center transition-all`}>
              {previewImage ? (
                <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-4">
                  <Box className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-tight">No Media<br/>Captured</p>
                </div>
              )}
            </div>
            <label className="absolute bottom-1 -right-1 p-3 bg-indigo-600 text-white rounded-2xl shadow-xl hover:scale-110 transition-all cursor-pointer">
              <Camera className="w-5 h-5" />
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
            {previewImage && (
              <button 
                type="button"
                onClick={() => handleAiAssist()}
                disabled={isAnalyzing}
                className={`absolute -top-1 -left-1 p-3 rounded-2xl shadow-xl transition-all ${isAnalyzing ? 'bg-gray-200 cursor-not-allowed' : 'bg-emerald-500 text-white hover:scale-110'}`}
              >
                {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
              <Hash className="w-3 h-3" /> Asset Sku
            </label>
            <input 
              required
              value={formData.sku}
              onChange={e => setFormData({...formData, sku: e.target.value})}
              className={inputClasses('sku')}
              placeholder="SKU-XXX-XXX"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
              <Tag className="w-3 h-3" /> Category
            </label>
            <input 
              required
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value})}
              className={inputClasses('category')}
              placeholder="e.g. Hardware, Electrical"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Asset Nomenclature</label>
            <input 
              required
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className={inputClasses('name')}
              placeholder="Full Product Name"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
              <DollarSign className="w-3 h-3" /> Unit Price
            </label>
            <input 
              type="number"
              step="0.01"
              value={formData.price}
              onChange={e => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
              className={inputClasses('price')}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Stock Quantity</label>
            <input 
              type="number"
              value={formData.quantity}
              onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
              className={inputClasses('quantity')}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Documentation & Specification</label>
          <textarea 
            rows={3}
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            className={inputClasses('description') + ' resize-none'}
            placeholder="Technical details, material specs..."
          />
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
            <MapPin className="w-3 h-3" /> Logistical Nodes
          </label>
          <div className="flex flex-wrap gap-2">
            {availableLocations.map(loc => {
              const isSelected = formData.locations?.includes(loc.name);
              return (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => toggleLocation(loc.name)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isSelected ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none' : 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:bg-gray-100'}`}
                >
                  {isSelected ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                  {loc.name}
                </button>
              );
            })}
            {availableLocations.length === 0 && (
              <p className="text-xs text-gray-400 italic">No storage nodes configured in settings.</p>
            )}
          </div>
        </div>

        <div className="flex gap-4 pt-6">
          <button 
            type="button" 
            onClick={onCancel} 
            className="flex-1 py-4 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-gray-100 transition-all"
          >
            Discard
          </button>
          <button 
            type="submit" 
            className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <Save className="w-4 h-4" /> Commit To Ledger
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
