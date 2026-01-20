
import React, { useState, useEffect, useCallback } from 'react';
import { Product } from '../types';
import { analyzeProductImage } from '../services/geminiService';
import { Sparkles, Camera, Save, Loader2, Check, Wand2, RefreshCw, MapPin, CheckSquare, Square } from 'lucide-react';

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
      
      const fields = ['name', 'category', 'description', 'price'];
      if (!initialProduct && result.sku) fields.push('sku');
      
      const newHighlights = new Set(fields);
      setHighlightedFields(newHighlights);
      setShowAiSuccess(true);
      
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
    <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl p-8 max-w-2xl mx-auto border border-gray-100 dark:border-gray-800 transition-colors duration-300 overflow-hidden">
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
            <><Loader2 className="w-4 h-4 animate-spin" /><span>Thinking...</span></>
          ) : (
            <><Wand2 className={`w-4 h-4 transition-transform ${previewImage ? 'group-hover:rotate-12' : ''}`} />AI Intelligence</>
          )}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-7">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Asset Reference (SKU)</label>
              <input
                required
                className={inputClasses('sku')}
                value={formData.sku}
                onChange={e => setFormData({ ...formData, sku: e.target.value })}
                readOnly={!!initialProduct}
                placeholder={isAnalyzing ? "Scanning ID..." : "0000000000"}
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Product Designation</label>
              <input
                required
                className={inputClasses('name')}
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder={isAnalyzing ? "AI is identifying..." : "Official name..."}
              />
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
            `}>
              {previewImage ? (
                <img 
                  src={previewImage} 
                  alt="Preview" 
                  className={`w-full h-full object-cover absolute inset-0 transition-all duration-1000 ${isAnalyzing ? 'scale-110 blur-sm' : 'group-hover:scale-105'}`} 
                />
              ) : (
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-white dark:bg-gray-900 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                    <Camera className="w-6 h-6 text-gray-400 dark:text-gray-600" />
                  </div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Capture Visual</p>
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
            </div>
          </div>
        </div>

        {/* Multi-Location Facility Network Assignment */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Facility Network Links</label>
            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-tighter">{(formData.locations || []).length} Nodes Connected</span>
          </div>
          <div className="grid grid-cols-2 gap-3 max-h-[160px] overflow-y-auto p-1 custom-scrollbar">
            {availableLocations.length > 0 ? (
              availableLocations.map(loc => {
                const isSelected = (formData.locations || []).includes(loc.name);
                return (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => toggleLocation(loc.name)}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                      isSelected 
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' 
                        : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 hover:border-indigo-200'
                    }`}
                  >
                    {isSelected ? <CheckSquare className="w-4 h-4 text-indigo-600 shrink-0" /> : <Square className="w-4 h-4 text-gray-300 dark:text-gray-600 shrink-0" />}
                    <div className="min-w-0">
                      <div className={`text-xs font-black truncate ${isSelected ? 'text-indigo-900 dark:text-indigo-300' : 'text-gray-500 dark:text-gray-400'}`}>
                        {loc.name}
                      </div>
                      <div className="text-[8px] font-bold text-gray-400 truncate uppercase tracking-tighter">{loc.type}</div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="col-span-2 p-6 text-center bg-gray-50 dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                <MapPin className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                <p className="text-[10px] font-bold text-gray-400 uppercase">No storage nodes configured in settings.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Technical Intelligence Log</label>
          <textarea
            rows={2}
            className={inputClasses('description')}
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            placeholder="Key specs, maintenance notes..."
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Aggregate Stock</label>
            <input
              type="number"
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:text-white"
              value={formData.quantity}
              onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Unit Asset Value ($)</label>
            <input
              type="number"
              step="0.01"
              className={inputClasses('price')}
              value={formData.price}
              onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
            />
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button type="button" onClick={onCancel} className="flex-1 px-6 py-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl hover:bg-gray-200 font-bold transition-all">Discard</button>
          <button type="submit" disabled={isAnalyzing} className="flex-[1.5] flex items-center justify-center gap-3 px-6 py-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 font-black shadow-xl transition-all disabled:opacity-50">
            <Save className="w-5 h-5" />{initialProduct ? 'Update Manifest' : 'Finalize Asset'}
          </button>
        </div>
      </form>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; }
      `}</style>
    </div>
  );
};

export default ProductForm;
