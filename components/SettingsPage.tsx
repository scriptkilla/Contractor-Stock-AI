
import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  Bell, 
  Shield, 
  Moon, 
  Sparkles, 
  Download, 
  Trash2, 
  ChevronRight, 
  Globe, 
  HelpCircle, 
  LogOut,
  Smartphone,
  Info,
  Check,
  X,
  Camera,
  Mail,
  Briefcase,
  MessageSquare,
  Bug,
  FileText,
  Send,
  Loader2,
  ChevronDown,
  Volume2,
  Vibrate,
  Maximize2,
  Coins,
  Ruler,
  Settings2,
  Fingerprint,
  Key,
  ShieldCheck,
  History,
  Phone,
  Hash,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  Monitor,
  Tablet,
  Smartphone as PhoneIcon,
  ShieldAlert,
  Trash,
  Upload,
  HardDrive,
  Activity,
  CheckCircle2,
  BrainCircuit,
  Zap,
  Layers,
  SearchCode,
  ImageIcon,
  Languages,
  DollarSign,
  Scale,
  Package,
  Users,
  RefreshCw,
  FileSpreadsheet,
  FileJson,
  FileText as FilePdfIcon,
  Table,
  Bluetooth,
  Printer,
  Wifi,
  Search,
  Cpu,
  Plus
} from 'lucide-react';
import { db } from '../services/database';
import { GoogleGenAI } from "@google/genai";
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';

interface SettingsPageProps {
  onClearData: () => void;
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

const Section = ({ title, children }: { title: string; children?: React.ReactNode }) => (
  <div className="space-y-3">
    <h2 className="text-xs font-bold text-gray-400 tracking-widest uppercase px-1">{title}</h2>
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm transition-colors duration-300">
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
    className={`flex items-center gap-4 p-4 transition-colors ${onClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 active:bg-gray-100' : ''} border-b border-gray-50 dark:border-gray-800 last:border-0`}
  >
    <div className={`p-2 rounded-xl ${destructive ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div className="flex-1">
      <div className={`font-semibold ${destructive ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-100'}`}>{title}</div>
      {subtitle && <div className={`text-xs ${destructive ? 'text-red-400 dark:text-red-500/70' : 'text-gray-400 dark:text-gray-500'}`}>{subtitle}</div>}
    </div>
    {right ? right : onClick && <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600" />}
  </div>
);

const Toggle = ({ enabled, setEnabled }: { enabled: boolean; setEnabled: (v: boolean) => void }) => (
  <button 
    onClick={(e) => {
      e.stopPropagation();
      setEnabled(!enabled);
    }}
    className={`w-11 h-6 rounded-full transition-colors flex items-center px-1 ${enabled ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`}
  >
    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
  </button>
);

const SettingsPage: React.FC<SettingsPageProps> = ({ 
  onClearData, 
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

  // Preferences State
  const [notifLowStock, setNotifLowStock] = useState(() => localStorage.getItem('sv_pref_notif_low') !== 'false');
  const [notifTeam, setNotifTeam] = useState(() => localStorage.getItem('sv_pref_notif_team') !== 'false');
  const [notifSecurity, setNotifSecurity] = useState(() => localStorage.getItem('sv_pref_notif_sec') === 'true');
  const [language, setLanguage] = useState(() => localStorage.getItem('sv_pref_lang') || 'English (US)');
  const [currency, setCurrency] = useState(() => localStorage.getItem('sv_pref_cur') || 'USD ($)');
  const [units, setUnits] = useState(() => localStorage.getItem('sv_pref_units') || 'Metric (kg/cm)');
  const [scanBeep, setScanBeep] = useState(() => localStorage.getItem('sv_pref_scan_beep') !== 'false');
  const [scanVibrate, setScanVibrate] = useState(() => localStorage.getItem('sv_pref_scan_vib') !== 'false');
  const [scanContinuous, setScanContinuous] = useState(() => localStorage.getItem('sv_pref_scan_cont') === 'true');

  useEffect(() => { localStorage.setItem('sv_pref_notif_low', String(notifLowStock)); }, [notifLowStock]);
  useEffect(() => { localStorage.setItem('sv_pref_notif_team', String(notifTeam)); }, [notifTeam]);
  useEffect(() => { localStorage.setItem('sv_pref_notif_sec', String(notifSecurity)); }, [notifSecurity]);
  useEffect(() => { localStorage.setItem('sv_pref_lang', language); }, [language]);
  useEffect(() => { localStorage.setItem('sv_pref_cur', currency); }, [currency]);
  useEffect(() => { localStorage.setItem('sv_pref_units', units); }, [units]);
  useEffect(() => { localStorage.setItem('sv_pref_scan_beep', String(scanBeep)); }, [scanBeep]);
  useEffect(() => { localStorage.setItem('sv_pref_scan_vib', String(scanVibrate)); }, [scanVibrate]);
  useEffect(() => { localStorage.setItem('sv_pref_scan_cont', String(scanContinuous)); }, [scanContinuous]);

  // UI Panels Visibility State
  const [isPersonalInfoVisible, setIsPersonalInfoVisible] = useState(false);
  const [isSecurityPanelVisible, setIsSecurityPanelVisible] = useState(false);
  const [isHelpVisible, setIsHelpVisible] = useState(false);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [isAuditLogsVisible, setIsAuditLogsVisible] = useState(false);
  const [isDeactivateConfirmVisible, setIsDeactivateConfirmVisible] = useState(false);
  const [isNotificationsPanelVisible, setIsNotificationsPanelVisible] = useState(false);
  const [isRegionalPanelVisible, setIsRegionalPanelVisible] = useState(false);
  const [isScannerPanelVisible, setIsScannerPanelVisible] = useState(false);
  const [isModelPanelVisible, setIsModelPanelVisible] = useState(false);
  const [isExportSelectorVisible, setIsExportSelectorVisible] = useState(false);
  const [isImportSelectorVisible, setIsImportSelectorVisible] = useState(false);
  const [isBluetoothPanelVisible, setIsBluetoothPanelVisible] = useState(false);
  const [isPrintersPanelVisible, setIsPrintersPanelVisible] = useState(false);
  
  // New modal states for credentials
  const [isEmailChangeVisible, setIsEmailChangeVisible] = useState(false);
  const [isPasswordChangeVisible, setIsPasswordChangeVisible] = useState(false);

  // Printer Management Functionality
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
    // Simulate a network search delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    const mockFound: NetworkPrinter[] = [
      { id: 'p2', name: 'Shipping Bay 4 (Brother)', ip: '192.168.1.201', type: '2x1 Label', isDefault: false, status: 'online' },
      { id: 'p3', name: 'HP OfficeJet Pro 9010', ip: '192.168.1.105', type: 'Standard Paper', isDefault: false, status: 'online' },
      { id: 'p4', name: 'Mobile Zebra QLn420', ip: '10.0.0.45', type: 'Mobile Thermal', isDefault: false, status: 'online' }
    ];
    // Filter out already saved ones
    const newDiscovered = mockFound.filter(p => !networkPrinters.some(saved => saved.id === p.id));
    setDiscoveredPrinters(newDiscovered);
    setIsSearchingPrinters(false);
  };

  const handleAddPrinter = (printer: NetworkPrinter) => {
    setNetworkPrinters(prev => [...prev, printer]);
    setDiscoveredPrinters(prev => prev.filter(p => p.id !== printer.id));
    addAuditLog(`Printer Added: ${printer.name}`, 'System', 'data');
  };

  const handleRemovePrinter = (id: string) => {
    setNetworkPrinters(prev => {
      const filtered = prev.filter(p => p.id !== id);
      // If we removed the default, set a new one if possible
      if (filtered.length > 0 && !filtered.some(p => p.isDefault)) {
        filtered[0].isDefault = true;
      }
      return filtered;
    });
    addAuditLog(`Printer Removed`, 'System', 'data');
  };

  const handleSetDefaultPrinter = (id: string) => {
    setNetworkPrinters(prev => prev.map(p => ({
      ...p,
      isDefault: p.id === id
    })));
  };

  // Edit Temp Profile
  const [tempProfile, setTempProfile] = useState({ 
    name: '', role: '', location: '', email: '', phone: '', employeeId: '', image: ''
  });
  const profilePhotoInputRef = useRef<HTMLInputElement>(null);

  const handleEditPersonalInfo = () => {
    setTempProfile({ 
      name: userName, role: userRole, location: userLocation, email: userEmail, phone: userPhone, employeeId: employeeId, image: profileImage
    });
    setIsPersonalInfoVisible(true);
  };

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setTempProfile(prev => ({ ...prev, image: event.target?.result as string }));
    reader.readAsDataURL(file);
  };

  const saveProfile = () => {
    if (!tempProfile.name.trim()) return;
    setUserName(tempProfile.name); setUserRole(tempProfile.role); setUserLocation(tempProfile.location);
    setUserEmail(tempProfile.email); setUserPhone(tempProfile.phone); setEmployeeId(tempProfile.employeeId);
    setProfileImage(tempProfile.image);
    localStorage.setItem('sv_user_name', tempProfile.name); localStorage.setItem('sv_user_role', tempProfile.role);
    localStorage.setItem('sv_user_loc', tempProfile.location); localStorage.setItem('sv_user_email', tempProfile.email);
    localStorage.setItem('sv_user_phone', tempProfile.phone); localStorage.setItem('sv_user_id', tempProfile.employeeId);
    localStorage.setItem('sv_user_img', tempProfile.image);
    setIsPersonalInfoVisible(false);
    addAuditLog('Profile Updated', 'Local System', 'security');
  };

  // Intelligence State
  const [aiAutoAnalyze, setAiAutoAnalyze] = useState(() => localStorage.getItem('sv_ai_auto') !== 'false');
  const [aiModel, setAiModel] = useState(() => localStorage.getItem('sv_ai_model') || 'gemini-3-flash-preview');
  const [ocrEnabled, setOcrEnabled] = useState(() => localStorage.getItem('sv_ai_ocr') === 'true');
  const [deepVisualAnalysis, setDeepVisualAnalysis] = useState(() => localStorage.getItem('sv_ai_deep') === 'true');

  useEffect(() => { localStorage.setItem('sv_ai_auto', String(aiAutoAnalyze)); }, [aiAutoAnalyze]);
  useEffect(() => { localStorage.setItem('sv_ai_model', aiModel); }, [aiModel]);
  useEffect(() => { localStorage.setItem('sv_ai_ocr', String(ocrEnabled)); }, [ocrEnabled]);
  useEffect(() => { localStorage.setItem('sv_ai_deep', String(deepVisualAnalysis)); }, [deepVisualAnalysis]);

  const modelsList = [
    { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash', desc: 'Fastest analysis for everyday items.', icon: Zap },
    { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro', desc: 'Superior reasoning for complex labels.', icon: BrainCircuit },
    { id: 'gemini-flash-lite-latest', name: 'Flash Lite', desc: 'Low-latency, efficient identification.', icon: Activity }
  ];

  const currentModelData = modelsList.find(m => m.id === aiModel) || modelsList[0];

  // System State
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [storageUsage, setStorageUsage] = useState('0 KB');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const data = localStorage.getItem('scanventory_db');
    if (data) setStorageUsage(`${(data.length / 1024).toFixed(1)} KB`);
  }, [productCount]);

  const handleExport = async (format: 'json' | 'csv' | 'xlsx' | 'pdf') => {
    setIsExporting(true);
    setIsExportSelectorVisible(false);
    await new Promise(r => setTimeout(r, 800));
    try {
      const data = db.getProducts();
      const dateStr = new Date().toISOString().split('T')[0];

      if (format === 'json') {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `contractor_stock_backup_${dateStr}.json`;
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else if (format === 'csv') {
        const headers = 'id,sku,name,category,quantity,price,lastUpdated\n';
        const rows = data.map(p => `"${p.id}","${p.sku}","${p.name.replace(/"/g, '""')}","${p.category}","${p.quantity}","${p.price}","${p.lastUpdated}"`).join('\n');
        const blob = new Blob([headers + rows], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `inventory_${dateStr}.csv`;
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else if (format === 'xlsx') {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Inventory");
        XLSX.writeFile(wb, `inventory_${dateStr}.xlsx`);
      } else if (format === 'pdf') {
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text("Contractor Stock AI Report", 14, 22);
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
        doc.text(`Total Items: ${data.length}`, 14, 35);
        doc.text(`Total Value: $${data.reduce((acc, p) => acc + (p.price * p.quantity), 0).toLocaleString()}`, 14, 40);
        
        let y = 50;
        doc.setFont("helvetica", "bold");
        doc.text("SKU", 14, y);
        doc.text("Product Name", 45, y);
        doc.text("Qty", 140, y);
        doc.text("Price", 160, y);
        doc.text("Value", 185, y);
        doc.line(14, y + 2, 200, y + 2);
        
        doc.setFont("helvetica", "normal");
        y += 8;
        
        data.forEach((p, i) => {
          if (y > 280) {
            doc.addPage();
            y = 20;
          }
          doc.text(p.sku.substring(0, 15), 14, y);
          doc.text(p.name.substring(0, 45), 45, y);
          doc.text(p.quantity.toString(), 140, y);
          doc.text(`$${p.price}`, 160, y);
          doc.text(`$${(p.price * p.quantity).toLocaleString()}`, 185, y);
          y += 6;
        });
        
        doc.save(`inventory_report_${dateStr}.pdf`);
      }
      addAuditLog(`Exported to ${format.toUpperCase()}`, 'System', 'data');
    } catch (e) { 
      console.error(e);
      alert("Export failed."); 
    } finally { 
      setIsExporting(false); 
    }
  };

  const handleImportClick = () => setIsImportSelectorVisible(true);
  
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    setIsImportSelectorVisible(false);
    
    const reader = new FileReader();
    const extension = file.name.split('.').pop()?.toLowerCase();

    reader.onload = (event) => {
      try {
        let importedProducts: any[] = [];
        const result = event.target?.result;
        
        if (extension === 'json') {
          importedProducts = JSON.parse(result as string);
        } else if (extension === 'csv') {
          const lines = (result as string).split('\n');
          if (lines.length > 0) {
            const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
            importedProducts = lines.slice(1).filter(l => l.trim()).map(line => {
              const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
              const p: any = {};
              headers.forEach((h, i) => p[h] = values[i]);
              return p;
            });
          }
        } else if (extension === 'xlsx' || extension === 'xls') {
          const workbook = XLSX.read(result, { type: 'binary' });
          const firstSheet = workbook.SheetNames[0];
          importedProducts = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet]);
        }

        if (Array.isArray(importedProducts) && importedProducts.length > 0) {
          if (confirm(`Import ${importedProducts.length} items? Matches will be updated.`)) {
            const current = db.getProducts();
            const merged = [...current];
            importedProducts.forEach(newProd => {
              if (!newProd.sku) return;
              const idx = merged.findIndex(p => p.sku === newProd.sku);
              const standardized = {
                id: newProd.id || Math.random().toString(36).substr(2, 9),
                sku: String(newProd.sku),
                name: newProd.name || 'Unnamed Product',
                category: newProd.category || 'General',
                quantity: parseInt(newProd.quantity) || 0,
                price: parseFloat(newProd.price) || 0,
                description: newProd.description || '',
                imageUrl: newProd.imageUrl || undefined,
                lastUpdated: newProd.lastUpdated || new Date().toISOString()
              };
              if (idx > -1) merged[idx] = standardized; else merged.push(standardized);
            });
            localStorage.setItem('scanventory_db', JSON.stringify(merged));
            addAuditLog(`Imported ${file.name}`, 'System', 'data');
            window.location.reload();
          }
        } else {
          alert("No valid product data found in file.");
        }
      } catch (err) { 
        console.error(err);
        alert("Import failed. Check file format."); 
      } finally { 
        setIsImporting(false); 
        // Reset input value to allow re-importing same file
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    if (extension === 'xlsx' || extension === 'xls') {
      reader.readAsBinaryString(file);
    } else {
      reader.readAsText(file);
    }
  };

  // Security State
  const [twoFactor, setTwoFactor] = useState(() => localStorage.getItem('sv_2fa') === 'true');
  const [biometrics, setBiometrics] = useState(() => localStorage.getItem('sv_bio') === 'true');
  const [appLock, setAppLock] = useState(() => localStorage.getItem('sv_lock') === 'true');
  useEffect(() => { localStorage.setItem('sv_2fa', String(twoFactor)); }, [twoFactor]);
  useEffect(() => { localStorage.setItem('sv_bio', String(biometrics)); }, [biometrics]);
  useEffect(() => { localStorage.setItem('sv_lock', String(appLock)); }, [appLock]);

  const [sessions, setSessions] = useState([
    { id: '1', device: 'iPhone 15 Pro', type: 'mobile', location: 'San Francisco, CA', time: 'Online', current: true },
    { id: '2', device: 'Warehouse iPad #4', type: 'tablet', location: 'Site A (Floor)', time: 'Active 2h ago', current: false },
    { id: '3', device: 'Desktop Station', type: 'desktop', location: 'Inventory Office', time: 'Yesterday', current: false }
  ]);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [sessionToRevoke, setSessionToRevoke] = useState<typeof sessions[0] | 'ALL' | null>(null);

  const [auditLogs, setAuditLogs] = useState([
    { id: 1, action: 'Login Success', device: 'iPhone 15 Pro', date: '2025-05-10 14:22:10', type: 'security' },
    { id: 2, action: 'Database Export', device: 'Desktop Station', date: '2025-05-10 11:05:44', type: 'data' }
  ]);

  const addAuditLog = (action: string, device: string, type: string = 'security') => {
    setAuditLogs(prev => [{ id: Date.now(), action, device, date: new Date().toISOString().replace('T', ' ').substring(0, 19), type }, ...prev]);
  };

  const revokeSession = async (session: typeof sessions[0]) => {
    setSessionToRevoke(session);
  };

  const logoutAll = async () => {
    setSessionToRevoke('ALL');
  };

  const confirmRevoke = async () => {
    if (!sessionToRevoke) return;
    
    if (sessionToRevoke === 'ALL') {
      setRevokingId('ALL');
      setSessionToRevoke(null);
      await new Promise(r => setTimeout(r, 1500));
      setSessions(prev => prev.filter(s => s.current));
      addAuditLog('All Remote Sessions Cleared', 'Multiple Devices', 'alert');
      setRevokingId(null);
    } else {
      const session = sessionToRevoke;
      setRevokingId(session.id);
      setSessionToRevoke(null);
      await new Promise(r => setTimeout(r, 1200));
      setSessions(prev => prev.filter(s => s.id !== session.id));
      addAuditLog('Session Revoked', session.device, 'alert');
      setRevokingId(null);
    }
  };

  // Support Chat State
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant', text: string }[]>([
    { role: 'assistant', text: "Hi! How can I help you manage your warehouse today?" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), [chatMessages, isTyping]);

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim(); setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]); setIsTyping(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview", contents: userMsg,
        config: { systemInstruction: "You are the Contractor Stock AI Support Agent. Concise, professional, helpful." }
      });
      setChatMessages(prev => [...prev, { role: 'assistant', text: response.text || "I'm sorry, I couldn't process that." }]);
    } catch (e) { setChatMessages(prev => [...prev, { role: 'assistant', text: "Connection error." }]); } finally { setIsTyping(false); }
  };

  const securityScore = [twoFactor, biometrics, appLock].filter(Boolean).length;
  const healthLabel = securityScore === 3 ? 'Excellent' : securityScore === 2 ? 'Good' : 'At Risk';
  const healthColor = securityScore === 3 ? 'text-emerald-500' : securityScore === 2 ? 'text-amber-500' : 'text-red-500';

  return (
    <div className="space-y-8 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 p-6 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm transition-colors duration-300">
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold uppercase overflow-hidden">
            {profileImage ? <img src={profileImage} className="w-full h-full object-cover" /> : userName.substring(0, 2)}
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-4 border-white dark:border-gray-900 rounded-full"></div>
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">{userName}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{userRole} • {userLocation}</p>
        </div>
        <button onClick={() => { if(confirm("Log out?")) window.location.reload(); }} className="p-2 text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors"><LogOut className="w-5 h-5" /></button>
      </div>

      <Section title="Account">
        <Row icon={User} title="Personal Information" subtitle="Name, ID, and contact details" onClick={handleEditPersonalInfo} />
        <Row icon={Shield} title="Security & Privacy" subtitle="Two-factor, biometrics, sessions" onClick={() => setIsSecurityPanelVisible(true)} />
      </Section>

      <Section title="Connectivity & Hardware">
        <Row icon={Bluetooth} title="Bluetooth Devices" subtitle="Connect external scanners and HID" onClick={() => setIsBluetoothPanelVisible(true)} />
        <Row icon={Printer} title="Label Printers" subtitle="Manage network and local printers" onClick={() => setIsPrintersPanelVisible(true)} />
      </Section>

      <Section title="Preferences">
        <Row icon={Bell} title="Notifications" subtitle="Alert types and delivery" onClick={() => setIsNotificationsPanelVisible(true)} />
        <Row icon={Moon} title="Appearance" subtitle="Theme and layout" right={
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            {(['light', 'dark', 'system'] as const).map((t) => (
              <button key={t} onClick={() => setTheme(t)} className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all uppercase ${theme === t ? 'bg-white dark:bg-indigo-600 shadow-sm text-indigo-600 dark:text-white' : 'text-gray-400'}`}>{t}</button>
            ))}
          </div>
        } />
        <Row icon={Globe} title="Regional Settings" subtitle={`${language}, ${currency}`} onClick={() => setIsRegionalPanelVisible(true)} />
        <Row icon={Settings2} title="Scanner Config" subtitle="Beep, Vibrate, Mode" onClick={() => setIsScannerPanelVisible(true)} />
      </Section>

      <Section title="Intelligence">
        <Row icon={Sparkles} title="Auto-Analysis" subtitle="AI Assist suggestions" right={<Toggle enabled={aiAutoAnalyze} setEnabled={setAiAutoAnalyze} />} />
        <Row icon={currentModelData.icon} title="AI Model" subtitle={currentModelData.name} onClick={() => setIsModelPanelVisible(true)} />
        <Row icon={SearchCode} title="OCR Data Extraction" subtitle="Extract text from labels" right={<Toggle enabled={ocrEnabled} setEnabled={setOcrEnabled} />} />
        <Row icon={Layers} title="Deep Visual Inspection" subtitle="Multi-pass analysis" right={<Toggle enabled={deepVisualAnalysis} setEnabled={setDeepVisualAnalysis} />} />
      </Section>

      <Section title="Support">
        <Row icon={HelpCircle} title="Help Center" subtitle="Tutorials and FAQs" onClick={() => setIsHelpVisible(true)} />
        <Row icon={MessageSquare} title="AI Support Agent" subtitle="Instant chat assistance" onClick={() => setIsChatVisible(true)} />
      </Section>

      <Section title="System">
        <input type="file" ref={fileInputRef} className="hidden" accept=".json,.csv,.xlsx,.xls" onChange={handleFileImport} />
        <Row icon={isExporting ? Loader2 : Download} title="Export Inventory" subtitle="CSV, JSON, Excel, or PDF report" onClick={() => setIsExportSelectorVisible(true)} right={isExporting && <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />} />
        <Row icon={isImporting ? Loader2 : Upload} title="Import Data" subtitle="Restore from JSON, CSV, or Excel" onClick={handleImportClick} right={isImporting && <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />} />
        <Row icon={HardDrive} title="Storage Usage" subtitle={`${storageUsage} in LocalStorage`} right={<span className="text-[10px] font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-500">{(productCount)} items</span>} />
        <Row icon={Activity} title="System Status" subtitle="All services operational" right={<div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full"><CheckCircle2 className="w-3 h-3" /><span className="text-[9px] font-bold uppercase tracking-wider">Live</span></div>} />
        <Row icon={Trash2} title="Factory Reset" subtitle="Wipe all products and cache" destructive onClick={onClearData} />
      </Section>

      {/* --- CONNECTIVITY MODALS --- */}

      {isBluetoothPanelVisible && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300 p-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 duration-500 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b dark:border-gray-800 flex items-center justify-between bg-indigo-50 dark:bg-indigo-900/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-600 text-white rounded-xl"><Bluetooth className="w-5 h-5" /></div>
                <h2 className="text-xl font-bold dark:text-white">Bluetooth Peripherals</h2>
              </div>
              <button onClick={() => setIsBluetoothPanelVisible(false)} className="p-2 text-gray-400 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"><X className="w-6 h-6" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Scanning for devices...</span>
                </div>
                <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
              </div>

              <div className="space-y-3">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Paired Scanners</h3>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white dark:bg-gray-700 rounded-xl shadow-sm"><Maximize2 className="w-5 h-5 text-indigo-500" /></div>
                    <div>
                      <h4 className="font-bold text-sm">KDC-200 Barcode Pro</h4>
                      <p className="text-[10px] text-gray-500">Connected • 88% Battery</p>
                    </div>
                  </div>
                  <button className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Disconnect</button>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Available Nearby</h3>
                {[
                  { name: 'Zebra ZQ320 Printer', type: 'Printer' },
                  { name: 'Symbol CS3000', type: 'Scanner' },
                  { name: 'Warehouse Tablet #2', type: 'HID' }
                ].map((dev, i) => (
                  <button key={i} className="w-full p-4 bg-white dark:bg-gray-950 border dark:border-gray-800 rounded-2xl flex items-center justify-between hover:border-indigo-500 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-400 group-hover:text-indigo-500"><Search className="w-5 h-5" /></div>
                      <div className="text-left">
                        <h4 className="font-bold text-sm">{dev.name}</h4>
                        <p className="text-[10px] text-gray-500">{dev.type}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">Pair Device</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="p-6 border-t dark:border-gray-800">
              <button onClick={() => setIsBluetoothPanelVisible(false)} className="w-full py-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl font-bold hover:bg-gray-200 transition-all">Done</button>
            </div>
          </div>
        </div>
      )}

      {isPrintersPanelVisible && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300 p-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 duration-500 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b dark:border-gray-800 flex items-center justify-between bg-amber-50 dark:bg-amber-900/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-600 text-white rounded-xl"><Printer className="w-5 h-5" /></div>
                <h2 className="text-xl font-bold dark:text-white">Printer Management</h2>
              </div>
              <button onClick={() => setIsPrintersPanelVisible(false)} className="p-2 text-gray-400 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"><X className="w-6 h-6" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="space-y-3">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Network Printers</h3>
                <div className="space-y-3">
                  {networkPrinters.length === 0 && !isSearchingPrinters && discoveredPrinters.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4 italic">No printers configured.</p>
                  )}
                  {networkPrinters.map(printer => (
                    <div key={printer.id} className={`p-5 rounded-3xl shadow-lg relative overflow-hidden group transition-all ${printer.isDefault ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 dark:text-gray-100'}`}>
                      <div className="relative z-10 flex items-center justify-between">
                        <div onClick={() => handleSetDefaultPrinter(printer.id)} className="cursor-pointer flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Wifi className={`w-4 h-4 ${printer.isDefault ? 'text-indigo-200' : 'text-gray-400'}`} />
                            <h4 className="font-black">{printer.name}</h4>
                          </div>
                          <p className={`text-xs ${printer.isDefault ? 'text-indigo-100' : 'text-gray-500'}`}>IP: {printer.ip} • {printer.type}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          {printer.isDefault && <div className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest">Default</div>}
                          <button 
                            onClick={() => handleRemovePrinter(printer.id)}
                            className={`p-2 rounded-xl transition-colors ${printer.isDefault ? 'hover:bg-white/10 text-white' : 'hover:bg-red-50 text-red-500'}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className={`absolute top-0 right-0 p-8 opacity-10 -rotate-12 translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform ${printer.isDefault ? 'text-white' : 'text-gray-300'}`}>
                        <Printer className="w-24 h-24" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Discovery Section */}
              {(isSearchingPrinters || discoveredPrinters.length > 0) && (
                <div className="space-y-3 animate-in fade-in duration-500">
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Discovered Devices</h3>
                  <div className="space-y-3">
                    {isSearchingPrinters && (
                      <div className="flex items-center justify-center gap-3 p-8 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                        <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                        <span className="text-sm font-bold text-gray-500">Broadcasting for AirPrint...</span>
                      </div>
                    )}
                    {discoveredPrinters.map(printer => (
                      <div key={printer.id} className="p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl flex items-center justify-between group hover:border-indigo-500 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600">
                            <Wifi className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm dark:text-gray-100">{printer.name}</h4>
                            <p className="text-[10px] text-gray-500">{printer.ip} • {printer.type}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleAddPrinter(printer)}
                          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 dark:shadow-none hover:bg-indigo-700"
                        >
                          <Plus className="w-3 h-3" />
                          Connect
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-5 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-3xl">
                <div className="flex items-center gap-3 mb-3">
                  <Cpu className="w-5 h-5 text-amber-600" />
                  <h4 className="font-bold text-amber-900 dark:text-amber-300">Printer Support</h4>
                </div>
                <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                  Connect via AirPrint, Cloud Print, or Bluetooth. We recommend industrial thermal printers for asset tags. Ensure your printer is on the same WiFi network.
                </p>
              </div>
            </div>
            <div className="p-6 border-t dark:border-gray-800 flex flex-col gap-3">
              <button 
                onClick={handleSearchPrinters}
                disabled={isSearchingPrinters}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-200 dark:shadow-none transition-all hover:bg-indigo-700 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSearchingPrinters ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                {isSearchingPrinters ? 'Searching Network...' : 'Search for New Printer'}
              </button>
              <button onClick={() => setIsPrintersPanelVisible(false)} className="w-full py-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl font-bold hover:bg-gray-200 transition-all">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* --- SUPPORT MODALS --- */}

      {isHelpVisible && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300 p-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-t-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 h-[80vh] flex flex-col">
            <div className="p-6 border-b dark:border-gray-800 flex items-center justify-between">
              <h2 className="text-xl font-bold dark:text-white">Help Center</h2>
              <button onClick={() => setIsHelpVisible(false)} className="p-2 text-gray-400 rounded-xl"><X className="w-6 h-6" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {[
                { q: "How do I scan a barcode?", a: "Point your camera at any 1D/2D barcode." },
                { q: "What is AI Assist?", a: "Automatically fills in product details from a photo." },
                { q: "How do I export my data?", a: "Go to System > Backup Inventory." }
              ].map((faq, i) => (
                <details key={i} className="group bg-gray-50 dark:bg-gray-800/50 rounded-2xl overflow-hidden border">
                  <summary className="p-4 font-bold flex justify-between items-center cursor-pointer list-none">{faq.q}<ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180 text-gray-400" /></summary>
                  <div className="p-4 pt-0 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{faq.a}</div>
                </details>
              ))}
            </div>
          </div>
        </div>
      )}

      {isModelPanelVisible && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300 p-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 flex flex-col">
            <div className="p-6 border-b dark:border-gray-800 flex items-center justify-between">
              <h2 className="text-xl font-bold dark:text-white">Select AI Model</h2>
              <button onClick={() => setIsModelPanelVisible(false)} className="p-2 text-gray-400 rounded-xl"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-4 space-y-4 flex-1 overflow-y-auto">
              {modelsList.map((m) => (
                <button key={m.id} onClick={() => { setAiModel(m.id); setIsModelPanelVisible(false); }} className={`w-full flex items-center gap-4 p-5 rounded-3xl border-2 ${aiModel === m.id ? 'border-indigo-600 bg-indigo-50/30' : 'border-transparent bg-gray-50 dark:bg-gray-800'}`}>
                  <div className={`p-3 rounded-2xl ${aiModel === m.id ? 'bg-indigo-600 text-white' : 'bg-white text-gray-400'}`}><m.icon className="w-6 h-6" /></div>
                  <div className="flex-1 text-left">
                    <h4 className={`font-bold ${aiModel === m.id ? 'text-indigo-900 dark:text-white' : 'text-gray-800 dark:text-gray-100'}`}>{m.name}</h4>
                    <p className="text-xs text-gray-500 mt-1">{m.desc}</p>
                  </div>
                  {aiModel === m.id && <Check className="w-5 h-5 text-indigo-600" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {isChatVisible && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300 p-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-t-3xl overflow-hidden shadow-2xl h-[80vh] flex flex-col">
            <div className="p-6 bg-indigo-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl"><Sparkles className="w-5 h-5" /></div>
                <div><h2 className="font-bold">AI Support</h2><p className="text-[10px] text-indigo-100 uppercase tracking-widest font-bold tracking-widest">Active</p></div>
              </div>
              <button onClick={() => setIsChatVisible(false)} className="p-2 hover:bg-white/10 rounded-xl"><X className="w-6 h-6" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-gray-100 dark:bg-gray-800 border dark:border-gray-700 dark:text-gray-200 rounded-tl-none'}`}>{msg.text}</div>
                </div>
              ))}
              {isTyping && <div className="flex justify-start animate-pulse"><div className="bg-gray-100 p-3 rounded-2xl rounded-tl-none"><Loader2 className="w-4 h-4 animate-spin text-indigo-600" /></div></div>}
              <div ref={chatEndRef} />
            </div>
            <div className="p-4 border-t dark:border-gray-800 flex gap-2">
              <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} placeholder="Type message..." className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm" />
              <button onClick={handleSendMessage} disabled={!chatInput.trim() || isTyping} className="p-3 bg-indigo-600 text-white rounded-xl disabled:opacity-50"><Send className="w-5 h-5" /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
