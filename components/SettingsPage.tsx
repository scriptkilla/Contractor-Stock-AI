
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
  Cpu
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
                <div className="p-5 bg-indigo-600 text-white rounded-3xl shadow-lg relative overflow-hidden group">
                  <div className="relative z-10 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Wifi className="w-4 h-4 text-indigo-200" />
                        <h4 className="font-black">Warehouse Central (Zebra ZT)</h4>
                      </div>
                      <p className="text-xs text-indigo-100">IP: 192.168.1.144 • 4x2 Thermal</p>
                    </div>
                    <div className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest">Default</div>
                  </div>
                  <div className="absolute top-0 right-0 p-8 opacity-10 -rotate-12 translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform">
                    <Printer className="w-24 h-24" />
                  </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border dark:border-gray-700 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white dark:bg-gray-700 rounded-xl shadow-sm"><Monitor className="w-5 h-5 text-gray-400" /></div>
                    <div>
                      <h4 className="font-bold text-sm">HP OfficeJet Pro</h4>
                      <p className="text-[10px] text-gray-500">Offline • Last used 2d ago</p>
                    </div>
                  </div>
                  <button className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Connect</button>
                </div>
              </div>

              <div className="p-5 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-3xl">
                <div className="flex items-center gap-3 mb-3">
                  <Cpu className="w-5 h-5 text-amber-600" />
                  <h4 className="font-bold text-amber-900 dark:text-amber-300">Printer Support</h4>
                </div>
                <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                  Connect via AirPrint, Cloud Print, or Bluetooth. We recommend industrial thermal printers for asset tags.
                </p>
              </div>
            </div>
            <div className="p-6 border-t dark:border-gray-800 flex flex-col gap-3">
              <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-200 dark:shadow-none transition-all">Search for New Printer</button>
              <button onClick={() => setIsPrintersPanelVisible(false)} className="w-full py-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl font-bold">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* --- SYSTEM MODALS --- */}

      {/* Export Selector Modal */}
      {isExportSelectorVisible && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300 p-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 duration-500 flex flex-col">
            <div className="p-6 border-b dark:border-gray-800 flex items-center justify-between">
              <h2 className="text-xl font-bold dark:text-white">Choose Export Format</h2>
              <button onClick={() => setIsExportSelectorVisible(false)} className="p-2 text-gray-400 rounded-xl"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <button onClick={() => handleExport('json')} className="flex flex-col items-center gap-3 p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl border hover:border-indigo-500 transition-all group">
                <FileJson className="w-8 h-8 text-amber-500 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-sm">JSON Backup</span>
                <span className="text-[10px] text-gray-400 text-center">Best for full system restore</span>
              </button>
              <button onClick={() => handleExport('csv')} className="flex flex-col items-center gap-3 p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl border hover:border-indigo-500 transition-all group">
                <Table className="w-8 h-8 text-emerald-500 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-sm">CSV Table</span>
                <span className="text-[10px] text-gray-400 text-center">Compatible with most apps</span>
              </button>
              <button onClick={() => handleExport('xlsx')} className="flex flex-col items-center gap-3 p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl border hover:border-indigo-500 transition-all group">
                <FileSpreadsheet className="w-8 h-8 text-blue-500 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-sm">Excel Sheet</span>
                <span className="text-[10px] text-gray-400 text-center">Formatted spreadsheet</span>
              </button>
              <button onClick={() => handleExport('pdf')} className="flex flex-col items-center gap-3 p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl border hover:border-indigo-500 transition-all group">
                <FilePdfIcon className="w-8 h-8 text-red-500 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-sm">PDF Report</span>
                <span className="text-[10px] text-gray-400 text-center">Print-ready summary</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Selector Modal */}
      {isImportSelectorVisible && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300 p-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 duration-500 flex flex-col">
            <div className="p-6 border-b dark:border-gray-800 flex items-center justify-between">
              <h2 className="text-xl font-bold dark:text-white">Import Inventory</h2>
              <button onClick={() => setIsImportSelectorVisible(false)} className="p-2 text-gray-400 rounded-xl"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-6 text-center space-y-4">
              <div className="p-8 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl bg-gray-50 dark:bg-gray-950 flex flex-col items-center gap-4">
                <Upload className="w-12 h-12 text-gray-300" />
                <div>
                  <p className="font-bold dark:text-gray-100">Click to upload file</p>
                  <p className="text-xs text-gray-500 mt-1">Supports JSON, CSV, and Excel (.xlsx)</p>
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()} 
                  className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 dark:shadow-none"
                >
                  Select File
                </button>
              </div>
              <p className="text-[10px] text-gray-400 px-4">Importing will merge new items with your existing database. Items with matching SKUs will be updated.</p>
            </div>
          </div>
        </div>
      )}

      {/* --- PREFERENCES MODALS --- */}

      {isNotificationsPanelVisible && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300 p-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 duration-500 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b dark:border-gray-800 flex items-center justify-between">
              <h2 className="text-xl font-bold dark:text-white">Notifications</h2>
              <button onClick={() => setIsNotificationsPanelVisible(false)} className="p-2 text-gray-400 rounded-xl"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-4 space-y-2">
              <Row icon={Package} title="Low Stock Alerts" subtitle="Get notified when items drop below 5 units" right={<Toggle enabled={notifLowStock} setEnabled={setNotifLowStock} />} />
              <Row icon={Users} title="Team Activity" subtitle="Updates on product additions and changes" right={<Toggle enabled={notifTeam} setEnabled={setNotifTeam} />} />
              <Row icon={ShieldAlert} title="Security Alerts" subtitle="Unrecognized logins and access revocations" right={<Toggle enabled={notifSecurity} setEnabled={setNotifSecurity} />} />
            </div>
          </div>
        </div>
      )}

      {isRegionalPanelVisible && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300 p-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 duration-500 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b dark:border-gray-800 flex items-center justify-between">
              <h2 className="text-xl font-bold dark:text-white">Regional Settings</h2>
              <button onClick={() => setIsRegionalPanelVisible(false)} className="p-2 text-gray-400 rounded-xl"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Language</label>
                <div className="grid grid-cols-2 gap-2">
                  {['English (US)', 'Spanish', 'French', 'German'].map(lang => (
                    <button key={lang} onClick={() => setLanguage(lang)} className={`p-4 rounded-2xl border-2 text-sm font-bold transition-all ${language === lang ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600' : 'border-gray-50 dark:border-gray-800 dark:text-gray-300'}`}>{lang}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Currency</label>
                <div className="grid grid-cols-3 gap-2">
                  {['USD ($)', 'EUR (€)', 'GBP (£)'].map(cur => (
                    <button key={cur} onClick={() => setCurrency(cur)} className={`p-3 rounded-2xl border-2 text-[10px] font-bold transition-all ${currency === cur ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600' : 'border-gray-50 dark:border-gray-800 dark:text-gray-300'}`}>{cur}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Unit System</label>
                <div className="flex gap-2">
                  {['Metric (kg/cm)', 'Imperial (lb/in)'].map(sys => (
                    <button key={sys} onClick={() => setUnits(sys)} className={`flex-1 p-4 rounded-2xl border-2 text-sm font-bold transition-all ${units === sys ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600' : 'border-gray-50 dark:border-gray-800 dark:text-gray-300'}`}>{sys}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isScannerPanelVisible && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300 p-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 duration-500 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b dark:border-gray-800 flex items-center justify-between">
              <h2 className="text-xl font-bold dark:text-white">Scanner Configuration</h2>
              <button onClick={() => setIsScannerPanelVisible(false)} className="p-2 text-gray-400 rounded-xl"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-4 space-y-2">
              <Row icon={Volume2} title="Audio Feedback" subtitle="Beep on successful scan" right={<Toggle enabled={scanBeep} setEnabled={setScanBeep} />} />
              <Row icon={Vibrate} title="Haptic Feedback" subtitle="Vibrate on successful scan" right={<Toggle enabled={scanVibrate} setEnabled={setScanVibrate} />} />
              <Row icon={RefreshCw} title="Continuous Mode" subtitle="Don't close scanner after a match" right={<Toggle enabled={scanContinuous} setEnabled={setScanContinuous} />} />
            </div>
          </div>
        </div>
      )}

      {/* --- PERSONAL INFO MODAL --- */}

      {isPersonalInfoVisible && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300 p-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 duration-500 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b dark:border-gray-800 flex items-center justify-between">
              <button onClick={() => setIsPersonalInfoVisible(false)} className="p-2 text-gray-400 hover:bg-gray-50 rounded-xl"><X className="w-6 h-6" /></button>
              <h2 className="text-xl font-bold dark:text-white">Personal Info</h2>
              <button onClick={saveProfile} className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm">Save</button>
            </div>
            <div className="p-6 space-y-6 overflow-y-auto">
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <div className="w-24 h-24 bg-indigo-500 rounded-3xl flex items-center justify-center text-white text-3xl font-bold uppercase overflow-hidden shadow-lg border-4 border-white dark:border-gray-800">
                    {tempProfile.image ? <img src={tempProfile.image} className="w-full h-full object-cover" /> : tempProfile.name.substring(0, 2) || 'JD'}
                  </div>
                  <button onClick={() => profilePhotoInputRef.current?.click()} className="absolute -bottom-2 -right-2 p-2 bg-white dark:bg-gray-800 rounded-full shadow-md border border-gray-100 dark:border-gray-700 text-indigo-600 hover:scale-110 transition-transform"><Camera className="w-4 h-4" /></button>
                  <input type="file" ref={profilePhotoInputRef} className="hidden" accept="image/*" onChange={handleProfilePhotoChange} />
                </div>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Full Name', val: 'name', icon: User },
                  { label: 'Employee ID', val: 'employeeId', icon: Hash },
                  { label: 'Department', val: 'role', icon: Briefcase },
                  { label: 'Work Email', val: 'email', icon: Mail },
                  { label: 'Phone', val: 'phone', icon: Phone },
                  { label: 'Site', val: 'location', icon: MapPin }
                ].map(field => (
                  <div key={field.val} className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">{field.label}</label>
                    <div className="relative">
                      <field.icon className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="text" value={(tempProfile as any)[field.val]} onChange={e => setTempProfile({...tempProfile, [field.val]: e.target.value})} className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 dark:text-white text-sm" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {isSecurityPanelVisible && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300 p-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 duration-500 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b dark:border-gray-800 flex items-center justify-between">
              <h2 className="text-xl font-bold dark:text-white">Security & Privacy</h2>
              <button onClick={() => setIsSecurityPanelVisible(false)} className="p-2 text-gray-400 rounded-xl transition-colors"><X className="w-6 h-6" /></button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-3xl p-5 border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Account Health</span>
                    <span className={`text-xs font-bold uppercase ${healthColor}`}>{healthLabel}</span>
                  </div>
                  <div className="flex gap-1.5 h-1.5 mb-4">
                    {[1,2,3].map(i => <div key={i} className={`flex-1 rounded-full transition-colors ${securityScore >= i ? (i===1 ? 'bg-red-500' : i===2 ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-gray-200 dark:bg-gray-700'}`} />)}
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">{securityScore === 3 ? "Fully protected. Great job!" : "Enhance security layers."}</p>
                </div>
              </div>
              <div className="px-2">
                <h3 className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Access Control</h3>
                <Row icon={Key} title="Two-Factor Auth" subtitle="SMS or App" right={<Toggle enabled={twoFactor} setEnabled={setTwoFactor} />} />
                <Row icon={Fingerprint} title="Biometric Lock" subtitle="FaceID / TouchID" right={<Toggle enabled={biometrics} setEnabled={setBiometrics} />} />
                <Row icon={Lock} title="Quick App Lock" subtitle="Lock on launch" right={<Toggle enabled={appLock} setEnabled={setAppLock} />} />
                
                <div className="mt-6 mb-2"><h3 className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Credentials</h3></div>
                <Row icon={Mail} title="Change Email" subtitle={userEmail} onClick={() => setIsEmailChangeVisible(true)} />
                <Row icon={Lock} title="Update Password" subtitle="Last changed 3 months ago" onClick={() => setIsPasswordChangeVisible(true)} />
                
                <div className="mt-6 mb-2"><h3 className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Privacy Controls</h3></div>
                <Row icon={privacyMode ? EyeOff : Eye} title="Privacy Screen" subtitle="Mask values in lists" right={<Toggle enabled={privacyMode} setEnabled={setPrivacyMode} />} />
              </div>
              <div className="px-6 py-6 border-t dark:border-gray-800 mt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Device Sessions</h3>
                  <button onClick={logoutAll} disabled={revokingId === 'ALL' || sessions.length <= 1} className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Logout All</button>
                </div>
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div key={session.id} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${session.current ? 'border-indigo-100 bg-indigo-50/20 dark:border-indigo-900/30' : 'border-gray-50 bg-gray-50/50'}`}>
                      <div className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm">{session.type === 'mobile' ? <PhoneIcon className="w-5 h-5 text-gray-400" /> : session.type === 'tablet' ? <Tablet className="w-5 h-5 text-gray-400" /> : <Monitor className="w-5 h-5 text-gray-400" />}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2"><h4 className="font-bold text-sm">{session.device}</h4>{session.current && <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[8px] font-bold rounded-full uppercase">Current</span>}</div>
                        <p className="text-[10px] text-gray-500">{session.location} • {session.time}</p>
                      </div>
                      {!session.current && (
                        <button onClick={() => revokeSession(session)} disabled={revokingId === session.id} className="p-2 text-red-500 disabled:opacity-50">
                          {revokingId === session.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 border-t dark:border-gray-800 flex flex-col gap-3">
              <button onClick={() => setIsAuditLogsVisible(true)} className="w-full py-4 bg-indigo-50 text-indigo-600 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"><History className="w-4 h-4" />View Audit Logs</button>
              <button onClick={() => setIsDeactivateConfirmVisible(true)} className="w-full py-4 text-red-600 font-bold text-sm">Deactivate Account</button>
            </div>
          </div>
        </div>
      )}

      {/* Change Email Modal */}
      {isEmailChangeVisible && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl p-8 border border-gray-100 dark:border-gray-800 animate-in zoom-in-95">
            <h3 className="text-2xl font-black mb-1">Update Email</h3>
            <p className="text-xs text-gray-500 mb-6 font-medium">Provide your new official work email.</p>
            <div className="space-y-4 mb-8">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Current Email</label>
                <input type="text" disabled value={userEmail} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-none text-gray-400 text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">New Email</label>
                <input type="email" placeholder="new.email@company.com" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 dark:text-white text-sm" />
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <button onClick={() => { setIsEmailChangeVisible(false); alert("Verification email sent to new address."); }} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all">Update Address</button>
              <button onClick={() => setIsEmailChangeVisible(false)} className="w-full py-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl font-bold">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {isPasswordChangeVisible && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl p-8 border border-gray-100 dark:border-gray-800 animate-in zoom-in-95">
            <h3 className="text-2xl font-black mb-1">Update Security</h3>
            <p className="text-xs text-gray-500 mb-6 font-medium">Use at least 8 characters with a mix of types.</p>
            <div className="space-y-4 mb-8">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Current Password</label>
                <input type="password" placeholder="••••••••" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 dark:text-white text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">New Password</label>
                <input type="password" placeholder="••••••••" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 dark:text-white text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                <input type="password" placeholder="••••••••" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 dark:text-white text-sm" />
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <button onClick={() => { setIsPasswordChangeVisible(false); alert("Password updated successfully."); }} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all">Save New Password</button>
              <button onClick={() => setIsPasswordChangeVisible(false)} className="w-full py-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl font-bold">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {isAuditLogsVisible && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[70vh]">
            <div className="p-6 border-b dark:border-gray-800 flex items-center justify-between">
              <h3 className="text-xl font-bold dark:text-white">Security Logs</h3>
              <button onClick={() => setIsAuditLogsVisible(false)} className="p-2 text-gray-400"><X className="w-6 h-6" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {auditLogs.map(log => (
                <div key={log.id} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${log.type === 'alert' ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'}`}>{log.action}</span>
                    <span className="text-[10px] text-gray-400">{log.date}</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Target: {log.device}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Session Revocation Confirmation Modal */}
      {sessionToRevoke && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300 border border-gray-100 dark:border-gray-800 text-center">
            <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <ShieldAlert className="w-10 h-10 text-red-600 dark:text-red-500" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
              {sessionToRevoke === 'ALL' ? 'Logout All?' : 'Revoke Session?'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
              {sessionToRevoke === 'ALL' 
                ? 'Are you sure you want to end all other active device sessions? You will need to sign back in on those devices.'
                : `Are you sure you want to revoke the session for ${sessionToRevoke.device}? The device will be signed out immediately.`
              }
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={confirmRevoke}
                className="w-full py-4 bg-red-600 text-white rounded-2xl font-bold shadow-xl shadow-red-200 dark:shadow-none hover:bg-red-700 active:scale-[0.98] transition-all"
              >
                {sessionToRevoke === 'ALL' ? 'Confirm Logout All' : 'Confirm Revocation'}
              </button>
              <button 
                onClick={() => setSessionToRevoke(null)}
                className="w-full py-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-[0.98] transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
