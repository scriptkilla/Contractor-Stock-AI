
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
  Settings2, 
  ShieldCheck,
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
  Plus,
  Check,
  Smartphone,
  Save,
  Database,
  AlertTriangle,
  ShieldAlert,
  Ghost,
  ImageOff,
  Clock,
  ExternalLink,
  Terminal,
  Construction,
  Package,
  Users
} from 'lucide-react';
import { db } from '../services/database';
import { GoogleGenAI } from "@google/genai";
import { jsPDF } from 'jspdf';
import { Product } from '../types';

interface SettingsPageProps {
  onClearData: () => void;
  onDataImport: () => void;
  onProfileUpdate: (name: string, email: string) => void;
  productCount: number;
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  privacyMode: boolean;
  setPrivacyMode: (v: boolean) => void;
}

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-900 w-full max-w-2xl max-h-[90vh] rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col border border-gray-100 dark:border-gray-800 animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b dark:border-gray-800 flex items-center justify-between shrink-0">
          <h3 className="text-xl font-black dark:text-white tracking-tight">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"><X className="w-6 h-6 text-gray-400 dark:text-white" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">{children}</div>
      </div>
    </div>
  );
};

const Section: React.FC<{ title: string; children?: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-4">
    <h2 className="text-xs font-black text-gray-400 tracking-[0.2em] uppercase px-1">{title}</h2>
    <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">{children}</div>
  </div>
);

const Row: React.FC<{ icon: any; title: string; subtitle?: string; right?: React.ReactNode; onClick?: () => void; destructive?: boolean; }> = ({ icon: Icon, title, subtitle, right, onClick, destructive }) => (
  <div onClick={onClick} className={`flex items-center gap-5 p-5 transition-colors ${onClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 active:bg-gray-100' : ''} border-b border-gray-50 dark:border-gray-800 last:border-0`}>
    <div className={`p-2.5 rounded-[1.2rem] ${destructive ? 'bg-red-50 dark:bg-red-900/30 text-red-600' : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'}`}><Icon className="w-5 h-5" /></div>
    <div className="flex-1 min-w-0">
      <div className={`font-black tracking-tight truncate ${destructive ? 'text-red-600' : 'text-gray-800 dark:text-gray-100'}`}>{title}</div>
      {subtitle && <div className="text-xs font-medium truncate text-gray-400">{subtitle}</div>}
    </div>
    <div className="shrink-0">{right ? right : onClick && <ChevronRight className="w-4 h-4 text-gray-300" />}</div>
  </div>
);

const Toggle: React.FC<{ enabled: boolean; setEnabled: (v: boolean) => void }> = ({ enabled, setEnabled }) => (
  <button onClick={(e) => { e.stopPropagation(); setEnabled(!enabled); }} className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 ${enabled ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`}>
    <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform ${enabled ? 'translate-x-6' : 'translate-x-0'}`} />
  </button>
);

const SettingsPage: React.FC<SettingsPageProps> = ({ onClearData, onDataImport, onProfileUpdate, productCount, theme, setTheme, privacyMode, setPrivacyMode }) => {
  const [userName, setUserName] = useState(() => localStorage.getItem('sv_user_name') || 'Sarah Wilson');
  const [userRole, setUserRole] = useState(() => localStorage.getItem('sv_user_role') || 'Owner');
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('sv_user_email') || 'sarah@contractorstock.ai');
  const [profileImage, setProfileImage] = useState(() => localStorage.getItem('sv_user_img') || '');
  
  const [isPersonalInfoVisible, setIsPersonalInfoVisible] = useState(false);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [tempProfile, setTempProfile] = useState({ name: userName, role: userRole, email: userEmail, image: profileImage });
  const profilePhotoInputRef = useRef<HTMLInputElement>(null);

  const saveProfile = () => {
    setUserName(tempProfile.name);
    setUserRole(tempProfile.role);
    setUserEmail(tempProfile.email);
    setProfileImage(tempProfile.image);
    localStorage.setItem('sv_user_name', tempProfile.name);
    localStorage.setItem('sv_user_role', tempProfile.role);
    localStorage.setItem('sv_user_email', tempProfile.email);
    localStorage.setItem('sv_user_img', tempProfile.image);
    onProfileUpdate(tempProfile.name, tempProfile.email);
    setIsPersonalInfoVisible(false);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setTempProfile(prev => ({ ...prev, image: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-10 pb-40 animate-in fade-in slide-in-from-bottom-6 duration-700 max-w-5xl mx-auto w-full px-4">
      <div className="flex flex-col md:flex-row items-center gap-8 p-10 bg-white dark:bg-gray-900 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-xl">
        <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-[2rem] flex items-center justify-center text-white text-3xl font-black uppercase overflow-hidden">
          {profileImage ? <img src={profileImage} alt="Profile" className="w-full h-full object-cover" /> : userName.substring(0, 2)}
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-black tracking-tight dark:text-white">{userName}</h1>
          <p className="text-indigo-600 font-bold uppercase text-xs tracking-widest">{userRole}</p>
        </div>
        <button onClick={() => { if(confirm("Terminate session?")) { localStorage.removeItem('sv_auth'); window.location.reload(); } }} className="px-6 py-3 bg-gray-50 dark:bg-gray-800 text-gray-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:text-red-500 transition-all"><LogOut className="w-4 h-4 mr-2 inline" /> Sign Out</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-10">
          <Section title="Identity Management">
            <Row icon={User} title="Personnel File" subtitle="Role, Name and workstation" onClick={() => { setTempProfile({ name: userName, role: userRole, email: userEmail, image: profileImage }); setIsPersonalInfoVisible(true); }} />
            <Row icon={Shield} title="Privacy Shield" subtitle="Obfuscate values" right={<Toggle enabled={privacyMode} setEnabled={setPrivacyMode} />} />
          </Section>
          <Section title="Experience">
            <Row icon={Moon} title="Visual Shell" subtitle="Theme controls" right={
              <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                {(['light', 'dark', 'system'] as const).map(t => (
                  <button key={t} onClick={() => setTheme(t)} className={`px-4 py-1.5 text-[9px] font-black rounded-lg transition-all uppercase tracking-tighter ${theme === t ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white' : 'text-gray-400'}`}>{t}</button>
                ))}
              </div>
            } />
          </Section>
        </div>
        <div className="space-y-10">
          <Section title="Cognition">
            <Row icon={BrainCircuit} title="Logic Support" subtitle="AI Assistant" onClick={() => setIsChatVisible(true)} />
          </Section>
          <Section title="Data Core">
            <Row icon={Trash2} title="Purge Core" subtitle="Delete all records" destructive onClick={onClearData} />
          </Section>
        </div>
      </div>

      <Modal isOpen={isPersonalInfoVisible} onClose={() => setIsPersonalInfoVisible(false)} title="Personnel File">
        <div className="space-y-6">
          <div className="flex justify-center mb-4">
            <div className="relative group">
              <div className="w-28 h-28 bg-gray-100 dark:bg-gray-800 rounded-[2.5rem] overflow-hidden flex items-center justify-center text-4xl font-black">
                {tempProfile.image ? <img src={tempProfile.image} className="w-full h-full object-cover" /> : tempProfile.name.substring(0, 2)}
              </div>
              <button onClick={() => profilePhotoInputRef.current?.click()} className="absolute -bottom-2 -right-2 p-3 bg-indigo-600 text-white rounded-2xl shadow-xl hover:scale-110 transition-transform"><Camera className="w-4 h-4" /></button>
              <input type="file" ref={profilePhotoInputRef} className="hidden" accept="image/*" onChange={handlePhotoChange} />
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
              <input value={tempProfile.name} onChange={e => setTempProfile({...tempProfile, name: e.target.value})} className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-800 rounded-2xl text-sm font-bold dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Workstation Email</label>
              <input value={tempProfile.email} onChange={e => setTempProfile({...tempProfile, email: e.target.value})} className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-800 rounded-2xl text-sm font-bold dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
          </div>
          <button onClick={saveProfile} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg">Commit Identity Changes</button>
        </div>
      </Modal>

      <Modal isOpen={isChatVisible} onClose={() => setIsChatVisible(false)} title="Logic Support AI">
        <div className="flex flex-col h-[400px]">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-2xl text-sm font-medium dark:text-white">How can I help with your inventory roster today?</div>
          </div>
          <div className="p-4 border-t dark:border-gray-800 flex gap-2">
            <input placeholder="Type command..." className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none text-sm dark:text-white" />
            <button className="p-3 bg-indigo-600 text-white rounded-xl"><Send className="w-5 h-5" /></button>
          </div>
        </div>
      </Modal>

      <style>{`.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; } .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; }`}</style>
    </div>
  );
};

export default SettingsPage;
