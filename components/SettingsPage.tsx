
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  User, 
  Bell, 
  Shield, 
  Moon, 
  Sparkles, 
  Download, 
  Upload,
  Trash2, 
  ChevronRight, 
  Globe, 
  HelpCircle, 
  LogOut,
  X,
  Camera,
  Mail,
  MessageSquare,
  Send,
  Loader2,
  ChevronDown,
  Settings2,
  ShieldCheck,
  History,
  Phone,
  Hash,
  MapPin,
  Lock,
  Activity,
  CheckCircle2,
  BrainCircuit,
  Zap,
  Layers,
  SearchCode,
  Bluetooth,
  Printer,
  Wifi,
  Search,
  Cpu,
  Plus,
  Check,
  Smartphone,
  Save,
  Volume2,
  Vibrate,
  Database,
  FileJson,
  FileSpreadsheet,
  FileText,
  Maximize2,
  FileUp,
  AlertCircle,
  AlertTriangle,
  AlertCircle as AlertCircleIcon,
  Fingerprint,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';
import { db } from '../services/database';
import { GoogleGenAI } from "@google/genai";
import { jsPDF } from 'jspdf';
import { Product } from '../types';

interface SettingsPageProps {
  onClearData: () => void;
  onDataImport: () => void;
  productCount: number;
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  privacyMode: boolean;
  setPrivacyMode: (v: boolean) => void;
}

interface NetworkPrinter {
  id: string;
  name: string;
  ip: string;
  type: string;
  isDefault: boolean;
  status: 'online' | 'offline';
}

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-900 w-full max-w-2xl max-h-[90vh] rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col border border-gray-100 dark:border-gray-800 animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b dark:border-gray-800 flex items-center justify-between shrink-0">
          <h3 className="text-xl font-black dark:text-white tracking-tight">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
            <X className="w-6 h-6 text-gray-400 dark:text-white" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

const Section = ({ title, children }: { title: string; children?: React.ReactNode }) => (
  <div className="space-y-4">
    <h2 className="text-xs font-black text-gray-400 tracking-[0.2em] uppercase px-1">{title}</h2>
    <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm transition-colors duration-300">
      {children}
    </div>
  </div>
);

const Row = ({ 
  icon: Icon, 
  title, 
  subtitle, 
  right, 
  onClick,
  destructive 
}: { 
  icon: any; 
  title: string; 
  subtitle?: string; 
  right?: React.ReactNode; 
  onClick?: () => void;
  destructive?: boolean;
}) => (
  <div 
    onClick={onClick}
    className={`flex items-center gap-5 p-5 transition-colors ${onClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 active:bg-gray-100' : ''} border-b border-gray-50 dark:border-gray-800 last:border-0`}
  >
    <div className={`p-2.5 rounded-[1.2rem] ${destructive ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div className="flex-1 min-w-0">
      <div className={`font-black tracking-tight truncate ${destructive ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-100'}`}>{title}</div>
      {subtitle && <div className={`text-xs font-medium truncate ${destructive ? 'text-red-400 dark:text-red-500/70' : 'text-gray-400 dark:text-gray-500'}`}>{subtitle}</div>}
    </div>
    <div className="shrink-0">
      {right ? right : onClick && <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600" />}
    </div>
  </div>
);

const Toggle = ({ enabled, setEnabled }: { enabled: boolean; setEnabled: (v: boolean) => void }) => (
  <button 
    onClick={(e) => {
      e.stopPropagation();
      setEnabled(!enabled);
    }}
    className={`w-12 h-6.5 rounded-full transition-colors flex items-center px-1 ${enabled ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`}
  >
    <div className={`w-4.5 h-4.5 bg-white rounded-full shadow-md transition-transform ${enabled ? 'translate-x-5.5' : 'translate-x-0'}`} />
  </button>
);

const SettingsPage: React.FC<SettingsPageProps> = ({ 
  onClearData, 
  onDataImport,
  productCount, 
  theme, 
  setTheme, 
  privacyMode, 
  setPrivacyMode 
}) => {
  // Profile State
  const [userName, setUserName] = useState(() => localStorage.getItem('sv_user_name') || 'Sarah Wilson');
  const [userRole, setUserRole] = useState(() => localStorage.getItem('sv_user_role') || 'Owner');
  const [userLocation, setUserLocation] = useState(() => localStorage.getItem('sv_user_loc') || 'Headquarters');
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('sv_user_email') || 'sarah@contractorstock.ai');
  const [userPhone, setUserPhone] = useState(() => localStorage.getItem('sv_user_phone') || '+1 (555) 902-1234');
  const [employeeId, setEmployeeId] = useState(() => localStorage.getItem('sv_user_id') || 'OWN-001');
  const [profileImage, setProfileImage] = useState(() => localStorage.getItem('sv_user_img') || '');

  // UI Panels
  const [isPersonalInfoVisible, setIsPersonalInfoVisible] = useState(false);
  const [isSecurityPanelVisible, setIsSecurityPanelVisible] = useState(false);
  const [isChangeEmailVisible, setIsChangeEmailVisible] = useState(false);
  const [isChangePasswordVisible, setIsChangePasswordVisible] = useState(false);
  const [isHelpVisible, setIsHelpVisible] = useState(false);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [isNotificationsPanelVisible, setIsNotificationsPanelVisible] = useState(false);
  const [isRegionalPanelVisible, setIsRegionalPanelVisible] = useState(false);
  const [isScannerPanelVisible, setIsScannerPanelVisible] = useState(false);
  const [isModelPanelVisible, setIsModelPanelVisible] = useState(false);
  const [isExportSelectorVisible, setIsExportSelectorVisible] = useState(false);
  const [isImportSelectorVisible, setIsImportSelectorVisible] = useState(false);
  const [isBluetoothPanelVisible, setIsBluetoothPanelVisible] = useState(false);
  const [isPrintersPanelVisible, setIsPrintersPanelVisible] = useState(false);

  // Security Toggles
  const [biometricsEnabled, setBiometricsEnabled] = useState(() => localStorage.getItem('sv_sec_biometrics') === 'true');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(() => localStorage.getItem('sv_sec_2fa') === 'true');

  useEffect(() => {
    localStorage.setItem('sv_sec_biometrics', String(biometricsEnabled));
    localStorage.setItem('sv_sec_2fa', String(twoFactorEnabled));
  }, [biometricsEnabled, twoFactorEnabled]);

  // Printer Management
  const [networkPrinters, setNetworkPrinters] = useState<NetworkPrinter[]>(() => {
    const saved = localStorage.getItem('sv_saved_printers');
    return saved ? JSON.parse(saved) : [
      { id: 'p1', name: 'Warehouse Central (Zebra ZT)', ip: '192.168.1.144', type: '4x2 Thermal', isDefault: true, status: 'online' }
    ];
  });
  const [discoveredPrinters, setDiscoveredPrinters] = useState<NetworkPrinter[]>([]);
  const [isSearchingPrinters, setIsSearchingPrinters] = useState(false);

  useEffect(() => {
    localStorage.setItem('sv_saved_printers', JSON.stringify(networkPrinters));
  }, [networkPrinters]);

  const handleSearchPrinters = async () => {
    setIsSearchingPrinters(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    const mockFound: NetworkPrinter[] = [
      { id: 'p2', name: 'Shipping Bay 4 (Brother)', ip: '192.168.1.201', type: '2x1 Label', isDefault: false, status: 'online' },
      { id: 'p3', name: 'HP OfficeJet Pro 9010', ip: '192.168.1.105', type: 'Standard Paper', isDefault: false, status: 'online' }
    ];
    setDiscoveredPrinters(mockFound.filter(p => !networkPrinters.some(saved => saved.id === p.id)));
    setIsSearchingPrinters(false);
  };

  const handleAddPrinter = (printer: NetworkPrinter) => {
    setNetworkPrinters(prev => [...prev, printer]);
    setDiscoveredPrinters(prev => prev.filter(p => p.id !== printer.id));
  };

  const handleRemovePrinter = (id: string) => {
    setNetworkPrinters(prev => prev.filter(p => p.id !== id));
  };

  const handleSetDefaultPrinter = (id: string) => {
    setNetworkPrinters(prev => prev.map(p => ({ ...p, isDefault: p.id === id })));
  };

  // Email/Password states
  const [newEmail, setNewEmail] = useState('');
  const [currentPasswordForEmail, setCurrentPasswordForEmail] = useState('');
  
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

  // Profile Form Logic
  const [tempProfile, setTempProfile] = useState({ 
    name: userName, role: userRole, location: userLocation, email: userEmail, phone: userPhone, employeeId: employeeId, image: profileImage
  });
  const profilePhotoInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempProfile(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProfile = () => {
    setUserName(tempProfile.name); setUserRole(tempProfile.role); setUserLocation(tempProfile.location);
    setUserEmail(tempProfile.email); setUserPhone(tempProfile.phone); setEmployeeId(tempProfile.employeeId);
    setProfileImage(tempProfile.image);
    localStorage.setItem('sv_user_name', tempProfile.name);
    localStorage.setItem('sv_user_role', tempProfile.role);
    localStorage.setItem('sv_user_loc', tempProfile.location);
    localStorage.setItem('sv_user_email', tempProfile.email);
    localStorage.setItem('sv_user_phone', tempProfile.phone);
    localStorage.setItem('sv_user_id', tempProfile.employeeId);
    localStorage.setItem('sv_user_img', tempProfile.image);
    setIsPersonalInfoVisible(false);
  };

  const handleEmailUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !currentPasswordForEmail) return;
    setUserEmail(newEmail);
    localStorage.setItem('sv_user_email', newEmail);
    setIsChangeEmailVisible(false);
    alert("Authority email updated successfully.");
    setNewEmail('');
    setCurrentPasswordForEmail('');
  };

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      alert("New passwords do not match.");
      return;
    }
    // Simulation
    setIsChangePasswordVisible(false);
    alert("Cryptographic access key (password) has been cycled.");
    setOldPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
  };

  // Intelligence
  const [aiAutoAnalyze, setAiAutoAnalyze] = useState(() => localStorage.getItem('sv_ai_auto') !== 'false');
  const [aiModel, setAiModel] = useState(() => localStorage.getItem('sv_ai_model') || 'gemini-3-flash-preview');
  const [ocrEnabled, setOcrEnabled] = useState(() => localStorage.getItem('sv_ai_ocr') === 'true');
  const [deepVisualAnalysis, setDeepVisualAnalysis] = useState(() => localStorage.getItem('sv_ai_deep') === 'true');

  useEffect(() => {
    localStorage.setItem('sv_ai_auto', String(aiAutoAnalyze));
    localStorage.setItem('sv_ai_model', aiModel);
    localStorage.setItem('sv_ai_ocr', String(ocrEnabled));
    localStorage.setItem('sv_ai_deep', String(deepVisualAnalysis));
  }, [aiAutoAnalyze, aiModel, ocrEnabled, deepVisualAnalysis]);

  const modelsList = [
    { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash', desc: 'Fastest for standard assets.', icon: Zap },
    { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro', desc: 'Highest reasoning accuracy.', icon: BrainCircuit }
  ];

  const currentModelData = modelsList.find(m => m.id === aiModel) || modelsList[0];

  // System Health
  const [storageUsage, setStorageUsage] = useState('0 KB');

  useEffect(() => {
    const data = localStorage.getItem('scanventory_db');
    if (data) setStorageUsage(`${(data.length / 1024).toFixed(1)} KB`);
  }, [productCount]);

  // Export Logic
  const handleExport = useCallback(async (format: string) => {
    const products = db.getProducts();
    if (products.length === 0) {
      alert("No data available to export.");
      return;
    }

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(products, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `inventory_dump_${new Date().getTime()}.json`;
      link.click();
    } else if (format === 'csv') {
      const headers = ['SKU', 'Name', 'Category', 'Quantity', 'Price', 'LastUpdated'];
      const csvRows = products.map(p => [p.sku, p.name, p.category, p.quantity, p.price, p.lastUpdated].join(","));
      const csvContent = [headers.join(","), ...csvRows].join("\n");
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `inventory_report_${new Date().getTime()}.csv`;
      link.click();
    } else if (format === 'pdf') {
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.text("Inventory Manifest", 14, 22);
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()} | Total Assets: ${products.length}`, 14, 30);
      
      let y = 40;
      products.forEach((p, i) => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.setFont("helvetica", "bold");
        doc.text(`${p.sku} - ${p.name}`, 14, y);
        doc.setFont("helvetica", "normal");
        doc.text(`Qty: ${p.quantity} | Value: $${p.price.toFixed(2)} | Category: ${p.category}`, 14, y + 5);
        y += 15;
      });
      doc.save(`inventory_manifest_${new Date().getTime()}.pdf`);
    }
  }, []);

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      try {
        if (file.name.endsWith('.json')) {
          const imported = JSON.parse(content);
          if (Array.isArray(imported)) {
            imported.forEach(p => db.saveProduct(p));
            alert(`Successfully imported ${imported.length} records.`);
            onDataImport();
            setIsImportSelectorVisible(false);
          } else {
            throw new Error("Invalid JSON structure. Expected an array of products.");
          }
        } else if (file.name.endsWith('.csv')) {
          const lines = content.split('\n');
          const headers = lines[0].split(',');
          const imported = [];
          for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            const values = lines[i].split(',');
            const product: Partial<Product> = {
              id: Math.random().toString(36).substr(2, 9),
              sku: values[0],
              name: values[1],
              category: values[2],
              quantity: parseInt(values[3]),
              price: parseFloat(values[4]),
              lastUpdated: values[5] || new Date().toISOString()
            };
            db.saveProduct(product as Product);
            imported.push(product);
          }
          alert(`Successfully imported ${imported.length} records from CSV.`);
          onDataImport();
          setIsImportSelectorVisible(false);
        }
      } catch (err) {
        console.error(err);
        alert("Import failed. Please check the file format.");
      }
    };
    reader.readAsText(file);
  };

  // Support Chat logic
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant', text: string }[]>([
    { role: 'assistant', text: "Hello! I'm the Contractor Stock AI Assistant. How can I help with your inventory today?" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isTyping) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are a technical support assistant for "Contractor Stock AI", an inventory app. 
        Current Context: User has ${productCount} products in stock.
        User Question: ${userMsg}
        Answer concisely and helpfully.`
      });
      const aiText = response.text || "I'm having trouble connecting to my knowledge base right now. Please try again later.";
      setChatMessages(prev => [...prev, { role: 'assistant', text: aiText }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'assistant', text: "Service temporarily unavailable. Please check your connectivity." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="space-y-10 pb-40 animate-in fade-in slide-in-from-bottom-6 duration-700 max-w-5xl mx-auto w-full px-4 text-gray-900 dark:text-white">
      {/* Profile Summary */}
      <div className="flex flex-col md:flex-row items-center gap-8 p-10 bg-white dark:bg-gray-900 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-xl transition-all duration-300">
        <div className="relative shrink-0">
          <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-[2rem] flex items-center justify-center text-white text-3xl font-black uppercase overflow-hidden shadow-lg">
            {profileImage ? <img src={profileImage} className="w-full h-full object-cover" /> : userName.substring(0, 2)}
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 border-4 border-white dark:border-gray-900 rounded-full shadow-sm animate-pulse"></div>
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-black tracking-tight">{userName}</h1>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-1">
            <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest">{userRole}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400 font-bold">• {userLocation}</span>
          </div>
        </div>
        <button onClick={() => { if(confirm("Terminate current session?")) window.location.reload(); }} className="flex items-center gap-2 px-6 py-3 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all font-black uppercase text-[10px] tracking-widest"><LogOut className="w-4 h-4" /> Sign Out</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-10">
          <Section title="Asset Authority">
            <Row icon={User} title="Personnel File" subtitle="Role, ID, and workstation" onClick={() => { setTempProfile({ name: userName, role: userRole, location: userLocation, email: userEmail, phone: userPhone, employeeId, image: profileImage }); setIsPersonalInfoVisible(true); }} />
            <Row icon={ShieldCheck} title="Security & Logs" subtitle="Biometrics and session tracking" onClick={() => setIsSecurityPanelVisible(true)} />
          </Section>

          <Section title="Credential Protocols">
            <Row icon={Mail} title="Identity Email" subtitle={userEmail} onClick={() => setIsChangeEmailVisible(true)} />
            <Row icon={KeyRound} title="Access Keys" subtitle="Password cycling & encryption" onClick={() => setIsChangePasswordVisible(true)} />
          </Section>

          <Section title="Physical Links">
            <Row icon={Bluetooth} title="External HID" subtitle="Bluetooth scanners and tools" onClick={() => setIsBluetoothPanelVisible(true)} />
            <Row icon={Printer} title="Label Output" subtitle="Thermal and network printers" onClick={() => setIsPrintersPanelVisible(true)} />
          </Section>
        </div>

        <div className="space-y-10">
          <Section title="Cognition">
            <Row icon={Sparkles} title="Neural Analysis" subtitle="Auto-match scan data" right={<Toggle enabled={aiAutoAnalyze} setEnabled={setAiAutoAnalyze} />} />
            <Row icon={currentModelData.icon} title="Inference Engine" subtitle={currentModelData.name} onClick={() => setIsModelPanelVisible(true)} />
            <Row icon={SearchCode} title="OCR Pipeline" subtitle="Text extraction from labels" right={<Toggle enabled={ocrEnabled} setEnabled={setOcrEnabled} />} />
            <Row icon={Layers} title="Deep Visual Pass" subtitle="Multi-stage asset verification" right={<Toggle enabled={deepVisualAnalysis} setEnabled={setDeepVisualAnalysis} />} />
          </Section>

          <Section title="Experience">
            <Row icon={Bell} title="Signal System" subtitle="Inventory alerts & updates" onClick={() => setIsNotificationsPanelVisible(true)} />
            <Row icon={Moon} title="Visual Shell" subtitle="System interface theme" right={
              <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                {(['light', 'dark', 'system'] as const).map((t) => (
                  <button key={t} onClick={() => setTheme(t)} className={`px-4 py-1.5 text-[9px] font-black rounded-lg transition-all uppercase tracking-tighter ${theme === t ? 'bg-white dark:bg-indigo-600 shadow-sm text-indigo-600 dark:text-white' : 'text-gray-400'}`}>{t}</button>
                ))}
              </div>
            } />
            <Row icon={Globe} title="Regional Specs" subtitle="Language and Currency" onClick={() => setIsRegionalPanelVisible(true)} />
            <Row icon={Settings2} title="Scanner Logic" subtitle="Haptic & Audio feedback" onClick={() => setIsScannerPanelVisible(true)} />
          </Section>

          <Section title="Knowledge Base">
            <Row icon={HelpCircle} title="Command Center" subtitle="Protocols and tutorials" onClick={() => setIsHelpVisible(true)} />
            <Row icon={MessageSquare} title="Logic Support" subtitle="Direct AI assistant link" onClick={() => setIsChatVisible(true)} />
          </Section>

          <Section title="Data Core">
            <Row icon={Download} title="Manifest Export" subtitle="JSON, CSV, PDF reports" onClick={() => setIsExportSelectorVisible(true)} />
            <Row icon={Upload} title="Import Core" subtitle="Ingest JSON or CSV manifests" onClick={() => setIsImportSelectorVisible(true)} />
            <Row icon={Activity} title="Health Metrics" subtitle={`${storageUsage} utilized`} right={<div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-100 dark:border-emerald-800"><CheckCircle2 className="w-3 h-3" /><span className="text-[10px] font-black uppercase">Live</span></div>} />
            <Row icon={Trash2} title="Purge Core" subtitle="Delete all local records" destructive onClick={onClearData} />
          </Section>
        </div>
      </div>

      {/* Modals Implementation */}
      
      {/* Personal Info Modal */}
      <Modal isOpen={isPersonalInfoVisible} onClose={() => setIsPersonalInfoVisible(false)} title="Personnel File">
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="relative group">
              <div className="w-32 h-32 rounded-[2rem] overflow-hidden border-4 border-indigo-50 dark:border-indigo-900/30 shadow-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-900 dark:text-white">
                {tempProfile.image ? <img src={tempProfile.image} className="w-full h-full object-cover" /> : <User className="w-12 h-12 text-gray-400" />}
              </div>
              <button onClick={() => profilePhotoInputRef.current?.click()} className="absolute -bottom-2 -right-2 p-2.5 bg-indigo-600 text-white rounded-2xl shadow-lg hover:scale-110 transition-transform">
                <Camera className="w-4 h-4" />
              </button>
              <input type="file" ref={profilePhotoInputRef} className="hidden" accept="image/*" onChange={handlePhotoChange} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Name</label>
              <input value={tempProfile.name} onChange={e => setTempProfile({...tempProfile, name: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-sm font-bold dark:text-white focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Position</label>
              <input value={tempProfile.role} onChange={e => setTempProfile({...tempProfile, role: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-sm font-bold dark:text-white focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Workstation</label>
              <input value={tempProfile.location} onChange={e => setTempProfile({...tempProfile, location: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-sm font-bold dark:text-white focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Employee ID</label>
              <input value={tempProfile.employeeId} readOnly className="w-full p-4 bg-gray-100 dark:bg-gray-950 border-none rounded-2xl text-sm font-mono font-bold text-gray-400 cursor-not-allowed" />
            </div>
          </div>
          <button onClick={saveProfile} className="w-full py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black shadow-xl shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
            <Save className="w-5 h-5" /> Save Changes
          </button>
        </div>
      </Modal>

      {/* Security Modal */}
      <Modal isOpen={isSecurityPanelVisible} onClose={() => setIsSecurityPanelVisible(false)} title="Security & Logs">
        <div className="space-y-6">
          <Section title="Access Control">
            <Row icon={Fingerprint} title="Biometric Unlock" subtitle="FaceID or TouchID required" right={<Toggle enabled={biometricsEnabled} setEnabled={setBiometricsEnabled} />} />
            <Row icon={Lock} title="Two-Factor Auth" subtitle="Secure your data manifest" right={<Toggle enabled={twoFactorEnabled} setEnabled={setTwoFactorEnabled} />} />
          </Section>
          <Section title="Session Manifest">
            <div className="p-4 space-y-4">
              {[
                { time: '10:45 AM', action: 'Authorized access from primary device', status: 'verified' },
                { time: '09:20 AM', action: 'Inventory manifest exported to PDF', status: 'verified' },
                { time: 'Yesterday', action: 'Personnel file credentials modified', status: 'verified' }
              ].map((log, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                  <div className="min-w-0 pr-4">
                    <div className="text-xs font-black dark:text-white truncate">{log.action}</div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{log.time}</div>
                  </div>
                  <div className="shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </Modal>

      {/* Change Email Modal */}
      <Modal isOpen={isChangeEmailVisible} onClose={() => setIsChangeEmailVisible(false)} title="Update Authority Email">
        <form onSubmit={handleEmailUpdate} className="space-y-6">
          <div className="p-5 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800 flex items-start gap-4 mb-4">
            <AlertCircle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <p className="text-[10px] text-indigo-800 dark:text-indigo-400 font-bold leading-normal">
              Changing your authority email will require re-verification upon next login for all synchronized workstations.
            </p>
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">New Authority Email</label>
              <input 
                required
                type="email"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                placeholder="new.email@company.com"
                className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-sm font-bold dark:text-white focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Current Password</label>
              <div className="relative">
                <input 
                  required
                  type={showPasswords ? "text" : "password"}
                  value={currentPasswordForEmail}
                  onChange={e => setCurrentPasswordForEmail(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-sm font-bold dark:text-white focus:ring-2 focus:ring-indigo-500" 
                />
                <button 
                  type="button"
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-500 transition-colors"
                >
                  {showPasswords ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
          <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all uppercase text-[10px] tracking-widest">
            Commit Identity Change
          </button>
        </form>
      </Modal>

      {/* Change Password Modal */}
      <Modal isOpen={isChangePasswordVisible} onClose={() => setIsChangePasswordVisible(false)} title="Access Key Protocols">
        <form onSubmit={handlePasswordUpdate} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Current Access Key</label>
              <input 
                required
                type={showPasswords ? "text" : "password"}
                value={oldPassword}
                onChange={e => setOldPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-sm font-bold dark:text-white focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
            <div className="space-y-1.5 border-t dark:border-gray-800 pt-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">New Access Key</label>
              <input 
                required
                type={showPasswords ? "text" : "password"}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Minimum 12 characters"
                className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-sm font-bold dark:text-white focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirm New Key</label>
              <input 
                required
                type={showPasswords ? "text" : "password"}
                value={confirmNewPassword}
                onChange={e => setConfirmNewPassword(e.target.value)}
                placeholder="Repeat new password"
                className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-sm font-bold dark:text-white focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
            <div className="flex items-center justify-end">
              <button 
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-2"
              >
                {showPasswords ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                {showPasswords ? "Shield Visuals" : "Visual Confirmation"}
              </button>
            </div>
          </div>
          <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all uppercase text-[10px] tracking-widest">
            Cycle Access Keys
          </button>
        </form>
      </Modal>

      {/* Printers Modal */}
      <Modal isOpen={isPrintersPanelVisible} onClose={() => setIsPrintersPanelVisible(false)} title="Printer Management">
        <div className="space-y-6">
          <Section title="Active Printers">
            {networkPrinters.length > 0 ? networkPrinters.map(printer => (
              <Row 
                key={printer.id}
                icon={Printer} 
                title={printer.name} 
                subtitle={`${printer.type} • ${printer.ip}`} 
                right={
                  <div className="flex items-center gap-2">
                    {printer.isDefault && <span className="text-[8px] font-black bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 px-2 py-1 rounded-full uppercase tracking-widest">Default</span>}
                    <button onClick={() => handleRemovePrinter(printer.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                  </div>
                }
                onClick={() => !printer.isDefault && handleSetDefaultPrinter(printer.id)}
              />
            )) : (
              <div className="p-10 text-center text-gray-400 text-xs font-medium">No printers configured.</div>
            )}
          </Section>

          <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-gray-700">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="p-4 bg-white dark:bg-gray-900 rounded-[1.5rem] shadow-sm">
                {isSearchingPrinters ? <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" /> : <Wifi className="w-8 h-8 text-gray-400" />}
              </div>
              <div>
                <h4 className="font-black dark:text-white">Network Discovery</h4>
                <p className="text-xs text-gray-500 font-medium mt-1">Search for nearby thermal or desk printers.</p>
              </div>
              <button 
                onClick={handleSearchPrinters}
                disabled={isSearchingPrinters}
                className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50 transition-all"
              >
                {isSearchingPrinters ? 'Searching...' : 'Scan Network'}
              </button>
            </div>

            {discoveredPrinters.length > 0 && (
              <div className="mt-8 space-y-3 animate-in fade-in slide-in-from-top-4">
                <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Devices Found</h5>
                {discoveredPrinters.map(printer => (
                  <div key={printer.id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-xl"><Printer className="w-4 h-4" /></div>
                      <div>
                        <div className="text-sm font-black dark:text-white">{printer.name}</div>
                        <div className="text-[10px] font-bold text-gray-400">{printer.ip}</div>
                      </div>
                    </div>
                    <button onClick={() => handleAddPrinter(printer)} className="p-2.5 bg-indigo-600 text-white rounded-xl hover:scale-105 transition-transform shadow-lg shadow-indigo-100 dark:shadow-none"><Plus className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Model Selection Modal */}
      <Modal isOpen={isModelPanelVisible} onClose={() => setIsModelPanelVisible(false)} title="Intelligence Engine">
        <div className="space-y-4">
          <p className="text-sm text-gray-500 font-medium px-2 mb-4">Choose the logic core used for automated product identification and analysis.</p>
          {modelsList.map(model => (
            <button 
              key={model.id}
              onClick={() => { setAiModel(model.id); setIsModelPanelVisible(false); }}
              className={`w-full text-left p-6 rounded-[2rem] border-2 transition-all flex items-start gap-5 ${aiModel === model.id ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/30' : 'border-gray-50 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-indigo-100'}`}
            >
              <div className={`p-3 rounded-2xl ${aiModel === model.id ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-50 dark:bg-gray-800 text-gray-400'}`}>
                <model.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className={`font-black tracking-tight ${aiModel === model.id ? 'text-indigo-900 dark:text-indigo-300 font-white' : 'dark:text-white'}`}>{model.name}</h4>
                  {aiModel === model.id && <Check className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
                </div>
                <p className="text-xs text-gray-500 font-medium mt-1 leading-relaxed">{model.desc}</p>
              </div>
            </button>
          ))}
          <div className="mt-4 p-5 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-900/40 flex items-start gap-3">
             <Activity className="w-5 h-5 text-amber-600 shrink-0" />
             <p className="text-[10px] text-amber-800 dark:text-amber-400 font-bold leading-normal">Switching engines may affect identification accuracy and response latency during peak operational hours.</p>
          </div>
        </div>
      </Modal>

      {/* Export Modal */}
      <Modal isOpen={isExportSelectorVisible} onClose={() => setIsExportSelectorVisible(false)} title="Export Manifest">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { id: 'json', label: 'Raw JSON', desc: 'Full database dump', icon: FileJson, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30' },
            { id: 'csv', label: 'Spreadsheet', desc: 'CSV optimized for Excel', icon: FileSpreadsheet, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30' },
            { id: 'pdf', label: 'Audit PDF', desc: 'Printable technical report', icon: FileText, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30' }
          ].map(opt => (
            <button 
              key={opt.id}
              onClick={() => handleExport(opt.id)}
              className="group p-6 bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:border-indigo-100 hover:shadow-xl transition-all flex flex-col items-center text-center gap-3"
            >
              <div className={`p-4 rounded-3xl transition-transform group-hover:scale-110 ${opt.color}`}>
                <opt.icon className="w-8 h-8" />
              </div>
              <div>
                <div className="font-black dark:text-white">{opt.label}</div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{opt.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </Modal>

      {/* Import Modal */}
      <Modal isOpen={isImportSelectorVisible} onClose={() => setIsImportSelectorVisible(false)} title="Import Core Manifest">
        <div className="space-y-8">
          <div className="flex flex-col items-center justify-center p-12 bg-gray-50 dark:bg-gray-800/50 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-gray-700 relative hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
            <div className="w-20 h-20 bg-white dark:bg-gray-900 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-sm">
              <FileUp className="w-10 h-10 text-indigo-600" />
            </div>
            <div className="text-center mb-8">
              <h4 className="text-lg font-black dark:text-white">Upload Manifest</h4>
              <p className="text-xs text-gray-500 font-medium mt-1">Supports .json or .csv audit logs.</p>
            </div>
            <input 
              type="file" 
              accept=".json,.csv"
              onChange={handleImportFile}
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
            />
            <div className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 dark:shadow-none">Select File</div>
          </div>
          <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800 flex items-start gap-4">
            <AlertCircleIcon className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
            <div>
              <h5 className="text-sm font-black text-indigo-900 dark:text-indigo-300 uppercase tracking-widest text-[10px]">Data Protocol</h5>
              <p className="text-[10px] text-indigo-700/70 dark:text-indigo-400/70 mt-1 font-medium leading-relaxed">Imported records with matching SKUs will overwrite existing local data. Ensure your manifest schema adheres to standard Contractor Stock AI formatting.</p>
            </div>
          </div>
        </div>
      </Modal>

      {/* Support Chat Modal */}
      <Modal isOpen={isChatVisible} onClose={() => setIsChatVisible(false)} title="Logic Support AI">
        <div className="flex flex-col h-[500px]">
          <div className="flex-1 space-y-4 overflow-y-auto p-2 scroll-smooth">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-3xl text-sm font-medium ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-gray-100 dark:bg-gray-800 dark:text-white rounded-tl-none'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-3xl rounded-tl-none flex gap-1">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div className="mt-4 pt-4 border-t dark:border-gray-800 flex gap-3">
            <input 
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask about inventory, app features..."
              className="flex-1 p-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-sm font-bold dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
            <button 
              onClick={handleSendMessage}
              disabled={!chatInput.trim() || isTyping}
              className="p-4 bg-indigo-600 text-white rounded-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </Modal>

      {/* Static Info Modals (Help, Bluetooth, etc.) - Simplified content */}
      <Modal isOpen={isHelpVisible} onClose={() => setIsHelpVisible(false)} title="Command Center Protocols">
        <div className="space-y-6">
          <Section title="Quick Start">
            <div className="p-4 text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
              1. <span className="text-gray-900 dark:text-white font-black">Scan Assets</span>: Use the central scan button for real-time barcode lookup.<br/>
              2. <span className="text-gray-900 dark:text-white font-black">AI Assistance</span>: Capture images to automatically fill name, category, and price.<br/>
              3. <span className="text-gray-900 dark:text-white font-black">Ops Studio</span>: Configure printers and export data for audits.
            </div>
          </Section>
          <Section title="System Information">
            <Row icon={Cpu} title="Core Version" subtitle="v2.1.0 Build Alpha" right={<span className="text-[9px] font-black text-indigo-500 uppercase">Latest</span>} />
            <Row icon={Database} title="Local Storage" subtitle={`${productCount} objects indexed`} />
          </Section>
        </div>
      </Modal>

      {/* Bluetooth Connectivity Modal */}
      <Modal isOpen={isBluetoothPanelVisible} onClose={() => setIsBluetoothPanelVisible(false)} title="External HID Connectivity">
        <div className="space-y-6">
          <div className="flex flex-col items-center justify-center p-12 bg-gray-50 dark:bg-gray-800/50 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-gray-700">
             <div className="w-20 h-20 bg-white dark:bg-gray-900 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-sm">
                <Bluetooth className="w-10 h-10 text-indigo-600" />
             </div>
             <div className="text-center mb-8">
                <h4 className="text-lg font-black dark:text-white">External Devices</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">Connect rugged Bluetooth scanners or diagnostic tools.</p>
             </div>
             <button className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg">Scan for Devices</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isScannerPanelVisible} onClose={() => setIsScannerPanelVisible(false)} title="Scanner Logic">
        <div className="space-y-4">
          <Section title="Feedback Settings">
            <Row icon={Volume2} title="Audio Feedback" subtitle="Beep on successful identification" right={<Toggle enabled={true} setEnabled={() => {}} />} />
            <Row icon={Vibrate} title="Haptic Pulse" subtitle="Vibrate on error or warning" right={<Toggle enabled={true} setEnabled={() => {}} />} />
            <Row icon={Maximize2} title="Auto Focus" subtitle="Optimize camera for small codes" right={<Toggle enabled={true} setEnabled={() => {}} />} />
          </Section>
        </div>
      </Modal>

      <Modal isOpen={isRegionalPanelVisible} onClose={() => setIsRegionalPanelVisible(false)} title="Regional Specifications">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 dark:text-gray-300 uppercase tracking-widest ml-1">Language Protocol</label>
            <select className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-sm font-bold dark:text-white">
              <option>English (United States)</option>
              <option>Español (Latinoamérica)</option>
              <option>Deutsch (Deutschland)</option>
              <option>Français (France)</option>
            </select>
          </div>
          <div className="space-y-1.5 pt-4">
            <label className="text-[10px] font-black text-gray-400 dark:text-gray-300 uppercase tracking-widest ml-1">Currency Format</label>
            <select className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-sm font-bold dark:text-white">
              <option>USD ($) - US Dollar</option>
              <option>EUR (€) - Euro</option>
              <option>GBP (£) - British Pound</option>
              <option>AUD ($) - Australian Dollar</option>
            </select>
          </div>
        </div>
      </Modal>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
        }
      `}</style>
    </div>
  );
};

export default SettingsPage;
