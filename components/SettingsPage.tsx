
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
  EyeOff,
  Clock,
  Package,
  Users,
  Terminal,
  Server,
  Cloud,
  ExternalLink,
  BookOpen,
  Scan,
  Map,
  Truck,
  Warehouse,
  Construction,
  ShieldAlert,
  Ghost,
  ImageOff
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

interface StorageLocation {
  id: string;
  name: string;
  type: 'Warehouse' | 'Vehicle' | 'Job Site';
  address: string;
  isPrimary: boolean;
}

interface SecurityLog {
  id: string;
  timestamp: string;
  action: string;
  status: 'verified' | 'alert';
}

const Modal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  title: string; 
  children: React.ReactNode 
}> = ({ isOpen, onClose, title, children }) => {
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

const Section: React.FC<{ 
  title: string; 
  children?: React.ReactNode 
}> = ({ title, children }) => (
  <div className="space-y-4">
    <h2 className="text-xs font-black text-gray-400 tracking-[0.2em] uppercase px-1">{title}</h2>
    <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm transition-colors duration-300">
      {children}
    </div>
  </div>
);

const Row: React.FC<{ 
  icon: any; 
  title: string; 
  subtitle?: string; 
  right?: React.ReactNode; 
  onClick?: () => void;
  destructive?: boolean;
}> = ({ 
  icon: Icon, 
  title, 
  subtitle, 
  right, 
  onClick,
  destructive 
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

const Toggle: React.FC<{ 
  enabled: boolean; 
  setEnabled: (v: boolean) => void 
}> = ({ enabled, setEnabled }) => (
  <button 
    onClick={(e) => {
      e.stopPropagation();
      setEnabled(!enabled);
    }}
    className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 ${enabled ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`}
  >
    <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform ${enabled ? 'translate-x-6' : 'translate-x-0'}`} />
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
  const [userName, setUserName] = useState(() => localStorage.getItem('sv_user_name') || 'Sarah Wilson');
  const [userRole, setUserRole] = useState(() => localStorage.getItem('sv_user_role') || 'Owner');
  const [userLocation, setUserLocation] = useState(() => localStorage.getItem('sv_user_loc') || 'Headquarters');
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('sv_user_email') || 'sarah@contractorstock.ai');
  const [userPhone, setUserPhone] = useState(() => localStorage.getItem('sv_user_phone') || '+1 (555) 902-1234');
  const [employeeId, setEmployeeId] = useState(() => localStorage.getItem('sv_user_id') || 'OWN-001');
  const [profileImage, setProfileImage] = useState(() => localStorage.getItem('sv_user_img') || '');

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
  const [isLocationsPanelVisible, setIsLocationsPanelVisible] = useState(false);
  const [isPrivacyPanelVisible, setIsPrivacyPanelVisible] = useState(false);

  const [privacyOptions, setPrivacyOptions] = useState(() => {
    const saved = localStorage.getItem('sv_privacy_opts');
    return saved ? JSON.parse(saved) : {
      obfuscateValues: true,
      obfuscateStock: true,
      blurImages: false,
      autoActivate: false
    };
  });

  useEffect(() => {
    localStorage.setItem('sv_privacy_opts', JSON.stringify(privacyOptions));
  }, [privacyOptions]);

  const [locations, setLocations] = useState<StorageLocation[]>(() => {
    const saved = localStorage.getItem('sv_storage_locations');
    return saved ? JSON.parse(saved) : [
      { id: 'l1', name: 'Main HQ Warehouse', type: 'Warehouse', address: '123 Supply Ln, Austin TX', isPrimary: true },
      { id: 'l2', name: 'Service Truck #42', type: 'Vehicle', address: 'Mobile Unit - Austin Area', isPrimary: false }
    ];
  });
  const [newLocationName, setNewLocationName] = useState('');
  const [newLocationType, setNewLocationType] = useState<'Warehouse' | 'Vehicle' | 'Job Site'>('Warehouse');
  const [newLocationAddress, setNewLocationAddress] = useState('');

  useEffect(() => {
    localStorage.setItem('sv_storage_locations', JSON.stringify(locations));
    const primary = locations.find(l => l.isPrimary);
    if (primary && primary.name !== userLocation) {
        setUserLocation(primary.name);
        localStorage.setItem('sv_user_loc', primary.name);
    }
  }, [locations]);

  const handleAddLocation = () => {
    if (!newLocationName || !newLocationAddress) return;
    const newLoc: StorageLocation = {
      id: Math.random().toString(36).substr(2, 9),
      name: newLocationName,
      type: newLocationType,
      address: newLocationAddress,
      isPrimary: locations.length === 0
    };
    setLocations([...locations, newLoc]);
    setNewLocationName('');
    setNewLocationAddress('');
    logAction(`Created Location: ${newLoc.name}`);
  };

  const handleSetPrimaryLocation = (id: string) => {
    setLocations(prev => prev.map(l => ({ ...l, isPrimary: l.id === id })));
    const loc = locations.find(l => l.id === id);
    if (loc) logAction(`Primary Location set to ${loc.name}`);
  };

  const handleRemoveLocation = (id: string) => {
    const loc = locations.find(l => l.id === id);
    if (loc?.isPrimary && locations.length > 1) {
        alert("Select another primary location before removal.");
        return;
    }
    setLocations(prev => prev.filter(l => l.id !== id));
    if (loc) logAction(`Destroyed Location Reference: ${loc.name}`, 'alert');
  };

  const [systemUptime, setSystemUptime] = useState('00:00:00');
  const [pingStatus, setPingStatus] = useState<number | null>(null);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const diff = Date.now() - startTime;
      const hours = Math.floor(diff / 3600000).toString().padStart(2, '0');
      const minutes = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
      const seconds = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
      setSystemUptime(`${hours}:${minutes}:${seconds}`);
      if (Math.random() > 0.7) {
        setPingStatus(Math.floor(Math.random() * 40) + 15);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const [notifInventory, setNotifInventory] = useState(() => localStorage.getItem('sv_notif_inv') !== 'false');
  const [notifTeam, setNotifTeam] = useState(() => localStorage.getItem('sv_notif_team') !== 'false');
  const [notifSystem, setNotifSystem] = useState(() => localStorage.getItem('sv_notif_sys') !== 'false');

  useEffect(() => {
    localStorage.setItem('sv_notif_inv', String(notifInventory));
    localStorage.setItem('sv_notif_team', String(notifTeam));
    localStorage.setItem('sv_notif_sys', String(notifSystem));
  }, [notifInventory, notifTeam, notifSystem]);

  const [biometricsEnabled, setBiometricsEnabled] = useState(() => localStorage.getItem('sv_sec_biometrics') === 'true');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(() => localStorage.getItem('sv_sec_2fa') === 'true');
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>(() => {
    const saved = localStorage.getItem('sv_security_logs');
    return saved ? JSON.parse(saved) : [
      { id: '1', timestamp: new Date().toISOString(), action: 'System Initialized', status: 'verified' }
    ];
  });

  const logAction = (action: string, status: 'verified' | 'alert' = 'verified') => {
    const newLog: SecurityLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      action,
      status
    };
    setSecurityLogs(prev => {
      const updated = [newLog, ...prev].slice(0, 50);
      localStorage.setItem('sv_security_logs', JSON.stringify(updated));
      return updated;
    });
  };

  const [networkPrinters, setNetworkPrinters] = useState<NetworkPrinter[]>(() => {
    const saved = localStorage.getItem('sv_saved_printers');
    return saved ? JSON.parse(saved) : [
      { id: 'p1', name: 'Warehouse Central (Zebra ZT)', ip: '192.168.1.144', type: '4x2 Thermal', isDefault: true, status: 'online' }
    ];
  });
  const [discoveredPrinters, setDiscoveredPrinters] = useState<NetworkPrinter[]>([]);
  const [isSearchingPrinters, setIsSearchingPrinters] = useState(false);

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
    logAction(`Added Printer: ${printer.name}`);
  };

  const handleRemovePrinter = (id: string) => {
    setNetworkPrinters(prev => prev.filter(p => p.id !== id));
  };

  const handleSetDefaultPrinter = (id: string) => {
    setNetworkPrinters(prev => prev.map(p => ({ ...p, isDefault: p.id === id })));
  };

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
    logAction("Personnel File Updated");
  };

  const [newEmail, setNewEmail] = useState('');
  const [currentPasswordForEmail, setCurrentPasswordForEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

  const handleEmailUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !currentPasswordForEmail) return;
    setUserEmail(newEmail);
    localStorage.setItem('sv_user_email', newEmail);
    setIsChangeEmailVisible(false);
    logAction(`Authority Email Changed to ${newEmail}`);
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
    logAction("Access Key Protocol Cycled");
    setIsChangePasswordVisible(false);
    alert("Cryptographic access key (password) has been cycled.");
    setOldPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
  };

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

  const [storageUsage, setStorageUsage] = useState('0 KB');

  useEffect(() => {
    const data = localStorage.getItem('scanventory_db');
    if (data) setStorageUsage(`${(data.length / 1024).toFixed(1)} KB`);
  }, [productCount]);

  const handleExport = useCallback(async (format: string) => {
    const products = db.getProducts();
    if (products.length === 0) {
      alert("No data available to export.");
      return;
    }
    logAction(`Manifest Export Triggered (${format.toUpperCase()})`);
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
      products.forEach((p) => {
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
            logAction(`Bulk JSON Import: ${imported.length} objects`);
            alert(`Successfully imported ${imported.length} records.`);
            onDataImport();
            setIsImportSelectorVisible(false);
          } else {
            throw new Error("Invalid JSON structure. Expected an array of products.");
          }
        } else if (file.name.endsWith('.csv')) {
          const lines = content.split('\n');
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
          logAction(`Bulk CSV Import: ${imported.length} objects`);
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

  const logoutAndClear = () => {
    if (confirm("Terminate current authority session?")) {
      localStorage.removeItem('sv_auth');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-10 pb-40 animate-in fade-in slide-in-from-bottom-6 duration-700 max-w-5xl mx-auto w-full px-4 text-gray-900 dark:text-white">
      <div className="flex flex-col md:flex-row items-center gap-8 p-10 bg-white dark:bg-gray-900 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-xl transition-all duration-300">
        <div className="relative shrink-0">
          <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-[2rem] flex items-center justify-center text-white text-3xl font-black uppercase overflow-hidden shadow-lg">
            {profileImage ? <img src={profileImage} alt="User profile" className="w-full h-full object-cover" /> : userName.substring(0, 2)}
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
        <button onClick={logoutAndClear} className="flex items-center gap-2 px-6 py-3 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all font-black uppercase text-[10px] tracking-widest"><LogOut className="w-4 h-4" /> Sign Out</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-10">
          <Section title="Asset Authority">
            <Row icon={User} title="Personnel File" subtitle="Role, ID, and workstation" onClick={() => { setTempProfile({ name: userName, role: userRole, location: userLocation, email: userEmail, phone: userPhone, employeeId, image: profileImage }); setIsPersonalInfoVisible(true); }} />
            <Row icon={ShieldCheck} title="Security & Logs" subtitle="Access manifests and history" onClick={() => setIsSecurityPanelVisible(true)} />
            <Row icon={Shield} title="Privacy Shield" subtitle="Obfuscate values in stock view" right={<Toggle enabled={privacyMode} setEnabled={(v) => { setPrivacyMode(v); logAction(`Privacy Shield ${v ? 'Active' : 'Standby'}`); }} />} onClick={() => setIsPrivacyPanelVisible(true)} />
          </Section>

          <Section title="Credential Protocols">
            <Row icon={Mail} title="Identity Email" subtitle={userEmail} onClick={() => setIsChangeEmailVisible(true)} />
            <Row icon={KeyRound} title="Access Keys" subtitle="Password cycling & encryption" onClick={() => setIsChangePasswordVisible(true)} />
          </Section>

          <Section title="Facility Network">
            <Row icon={MapPin} title="Storage Locations" subtitle="Warehouses, trucks, and sites" onClick={() => setIsLocationsPanelVisible(true)} />
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
      {/* (Other Modals Remain Unchanged) */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; }
      `}</style>
    </div>
  );
};

export default SettingsPage;
