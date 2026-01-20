
import React, { useState, useRef, useEffect } from 'react';
import { 
  User, 
  Shield, 
  Moon, 
  Trash2, 
  ChevronRight, 
  LogOut,
  X,
  Camera,
  Save,
  MapPin,
  Plus,
  Warehouse,
  Check,
  Download,
  Upload,
  FileJson,
  FileSpreadsheet,
  FileText,
  Info,
  Printer,
  Tag,
  DollarSign,
  QrCode,
  ShieldAlert,
  Bluetooth,
  Smartphone,
  Link,
  Mail,
  Lock,
  KeyRound,
  ShieldCheck
} from 'lucide-react';
import { db } from '../services/database';

interface StorageLocation {
  id: string;
  name: string;
  type: string;
  isPrimary: boolean;
}

interface SettingsPageProps {
  onClearData: () => void;
  onDataImport: () => void;
  onProfileUpdate: (name: string, email: string) => void;
  productCount: number;
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  privacyMode: boolean;
  setPrivacyMode: (v: boolean) => void;
  printOptions: any;
  setPrintOptions: (options: any) => void;
}

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col border border-gray-100 dark:border-gray-800 animate-in zoom-in-95 duration-300">
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

const SettingsPage: React.FC<SettingsPageProps> = ({ onClearData, onDataImport, onProfileUpdate, productCount, theme, setTheme, privacyMode, setPrivacyMode, printOptions, setPrintOptions }) => {
  const [userName, setUserName] = useState(() => localStorage.getItem('sv_user_name') || 'Authorized User');
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('sv_user_email') || '');
  const [profileImage, setProfileImage] = useState(() => localStorage.getItem('sv_user_img') || '');
  
  const [isPersonalInfoVisible, setIsPersonalInfoVisible] = useState(false);
  const [isLocationsVisible, setIsLocationsVisible] = useState(false);
  const [isAddDeviceVisible, setIsAddDeviceVisible] = useState(false);
  const [isEmailModalVisible, setIsEmailModalVisible] = useState(false);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  
  const [tempProfile, setTempProfile] = useState({ name: userName, email: userEmail, image: profileImage });
  const [newEmail, setNewEmail] = useState(userEmail);
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });

  const [locations, setLocations] = useState<StorageLocation[]>(() => {
    const saved = localStorage.getItem('sv_storage_locations');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Main Warehouse', type: 'Warehouse', isPrimary: true },
      { id: '2', name: 'Service Truck A', type: 'Vehicle', isPrimary: false }
    ];
  });

  const [newLocation, setNewLocation] = useState({ name: '', type: 'Warehouse' });
  const profilePhotoInputRef = useRef<HTMLInputElement>(null);
  const importFileInputRef = useRef<HTMLInputElement>(null);
  const csvImportInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('sv_storage_locations', JSON.stringify(locations));
  }, [locations]);

  const saveProfile = () => {
    setUserName(tempProfile.name);
    setUserEmail(tempProfile.email);
    setProfileImage(tempProfile.image);
    localStorage.setItem('sv_user_name', tempProfile.name);
    localStorage.setItem('sv_user_email', tempProfile.email);
    localStorage.setItem('sv_user_img', tempProfile.image);
    onProfileUpdate(tempProfile.name, tempProfile.email);
    setIsPersonalInfoVisible(false);
  };

  const handleUpdateEmail = () => {
    if (!newEmail.includes('@')) {
      alert("Please enter a valid email address.");
      return;
    }
    setUserEmail(newEmail);
    localStorage.setItem('sv_user_email', newEmail);
    onProfileUpdate(userName, newEmail);
    setIsEmailModalVisible(false);
    alert("Identity email updated successfully.");
  };

  const handleUpdatePassword = () => {
    if (passwords.next !== passwords.confirm) {
      alert("Passwords do not match.");
      return;
    }
    if (passwords.next.length < 6) {
      alert("Security key must be at least 6 characters.");
      return;
    }
    setIsPasswordModalVisible(false);
    setPasswords({ current: '', next: '', confirm: '' });
    alert("Security access key updated.");
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setTempProfile(prev => ({ ...prev, image: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const addLocation = () => {
    if (!newLocation.name.trim()) return;
    const loc: StorageLocation = {
      id: Math.random().toString(36).substr(2, 9),
      name: newLocation.name,
      type: newLocation.type,
      isPrimary: locations.length === 0
    };
    setLocations([...locations, loc]);
    setNewLocation({ name: '', type: 'Warehouse' });
  };

  const removeLocation = (id: string) => {
    setLocations(locations.filter(l => l.id !== id));
  };

  const setPrimaryLocation = (id: string) => {
    setLocations(locations.map(l => ({ ...l, isPrimary: l.id === id })));
  };

  const handleExportData = () => {
    const data = {
      products: db.getProducts(),
      locations: locations,
      exportDate: new Date().toISOString(),
      version: "1.0"
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inventory-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.products && Array.isArray(data.products)) {
          localStorage.setItem('scanventory_db', JSON.stringify(data.products));
        }
        if (data.locations && Array.isArray(data.locations)) {
          localStorage.setItem('sv_storage_locations', JSON.stringify(data.locations));
          setLocations(data.locations);
        }
        onDataImport(); // Signal parent to refresh state
        alert("Data successfully imported from manifest.");
      } catch (err) {
        alert("Failed to parse manifest file. Ensure it is a valid backup JSON.");
      }
    };
    reader.readAsText(file);
    if (importFileInputRef.current) importFileInputRef.current.value = '';
  };

  const handleCsvImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const newProducts = lines.slice(1).filter(line => line.trim()).map(line => {
        const values = line.split(',').map(v => v.trim());
        const product: any = {
          id: Math.random().toString(36).substr(2, 9),
          lastUpdated: new Date().toISOString()
        };

        headers.forEach((header, index) => {
          if (header === 'sku') product.sku = values[index];
          if (header === 'name') product.name = values[index];
          if (header === 'category') product.category = values[index];
          if (header === 'quantity') product.quantity = parseInt(values[index]) || 0;
          if (header === 'price') product.price = parseFloat(values[index]) || 0;
          if (header === 'description') product.description = values[index];
          if (header === 'location') product.locations = [values[index]];
        });

        return product;
      });

      const existingProducts = db.getProducts();
      // Simple duplicate prevention based on SKU
      const merged = [...existingProducts];
      newProducts.forEach(newP => {
        const idx = merged.findIndex(p => p.sku === newP.sku);
        if (idx >= 0) {
          merged[idx] = { ...merged[idx], ...newP };
        } else {
          merged.push(newP);
        }
      });

      localStorage.setItem('scanventory_db', JSON.stringify(merged));
      onDataImport();
      alert(`Import complete. Processed ${newProducts.length} entries.`);
    };
    reader.readAsText(file);
    if (csvImportInputRef.current) csvImportInputRef.current.value = '';
  };

  const downloadCsvTemplate = () => {
    const headers = "sku,name,category,quantity,price,description,location\n";
    const sample = "SKU-100,Sample Product,Hardware,10,129.99,Industrial Grade Bolt,Warehouse A";
    const blob = new Blob([headers + sample], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = "inventory_template.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-10 pb-40 animate-in fade-in slide-in-from-bottom-6 duration-700 max-w-3xl mx-auto w-full px-4">
      <div className="flex flex-col md:flex-row items-center gap-8 p-10 bg-white dark:bg-gray-900 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-xl">
        <div className="w-24 h-24 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white text-3xl font-black uppercase overflow-hidden">
          {profileImage ? <img src={profileImage} alt="Profile" className="w-full h-full object-cover" /> : userName.substring(0, 2)}
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-black tracking-tight dark:text-white">{userName}</h1>
          <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">{userEmail}</p>
        </div>
        <button onClick={() => { localStorage.removeItem('sv_auth'); window.location.reload(); }} className="px-6 py-3 bg-gray-50 dark:bg-gray-800 text-gray-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:text-red-500 transition-all"><LogOut className="w-4 h-4 mr-2 inline" /> Sign Out</button>
      </div>

      <div className="space-y-10">
        <Section title="Account">
          <Row icon={User} title="Edit Profile" subtitle="Change name and avatar" onClick={() => { setTempProfile({ name: userName, email: userEmail, image: profileImage }); setIsPersonalInfoVisible(true); }} />
          <Row icon={Mail} title="Update Email" subtitle="Change primary contact address" onClick={() => { setNewEmail(userEmail); setIsEmailModalVisible(true); }} />
          <Row icon={Lock} title="Change Password" subtitle="Update security access key" onClick={() => setIsPasswordModalVisible(true)} />
          <Row icon={Shield} title="Privacy Mode" subtitle="Hide inventory values" right={<Toggle enabled={privacyMode} setEnabled={setPrivacyMode} />} />
        </Section>

        <Section title="Logistics Network">
          <Row icon={MapPin} title="Storage Nodes" subtitle={`${locations.length} locations configured`} onClick={() => setIsLocationsVisible(true)} />
        </Section>

        <Section title="Label Printing">
          <Row icon={Tag} title="Show Asset Name" subtitle="Display nomenclature on label" right={<Toggle enabled={printOptions.showName} setEnabled={(v) => setPrintOptions({...printOptions, showName: v})} />} />
          <Row icon={DollarSign} title="Include MSRP" subtitle="Display unit price on label" right={<Toggle enabled={printOptions.showPrice} setEnabled={(v) => setPrintOptions({...printOptions, showPrice: v})} />} />
          <Row icon={QrCode} title="High Contrast" subtitle="Optimize for light scanning" right={<Toggle enabled={printOptions.highContrast} setEnabled={(v) => setPrintOptions({...printOptions, highContrast: v})} />} />
          <Row icon={ShieldAlert} title="Security Mark" subtitle="Watermark labels for authenticity" right={<Toggle enabled={printOptions.securityMark} setEnabled={(v) => setPrintOptions({...printOptions, securityMark: v})} />} />
        </Section>

        <Section title="Hardware Connectivity">
          <Row icon={Bluetooth} title="Add Peripheral Device" subtitle="Pair external scanners or printers" onClick={() => setIsAddDeviceVisible(true)} />
          <Row icon={Smartphone} title="Mobile Handset Sync" subtitle="Pair additional scanning units" onClick={() => setIsAddDeviceVisible(true)} />
        </Section>

        <Section title="Data Integration">
          <Row icon={Download} title="Export Manifest" subtitle="Download full backup (.json)" onClick={handleExportData} />
          <Row icon={Upload} title="Import JSON Manifest" subtitle="Restore from JSON backup" onClick={() => importFileInputRef.current?.click()} />
          <Row icon={FileSpreadsheet} title="Import CSV Batch" subtitle="Upload spreadsheet (.csv)" onClick={() => csvImportInputRef.current?.click()} />
          <Row icon={FileText} title="Download Template" subtitle="CSV import structure" onClick={downloadCsvTemplate} />
          
          <input 
            type="file" 
            ref={importFileInputRef} 
            className="hidden" 
            accept=".json" 
            onChange={handleImportData} 
          />
          <input 
            type="file" 
            ref={csvImportInputRef} 
            className="hidden" 
            accept=".csv" 
            onChange={handleCsvImport} 
          />
        </Section>

        <Section title="System">
          <Row icon={Moon} title="Appearance" subtitle="Theme selection" right={
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
              {(['light', 'dark', 'system'] as const).map(t => (
                <button key={t} onClick={() => setTheme(t)} className={`px-4 py-1.5 text-[9px] font-black rounded-lg transition-all uppercase tracking-tighter ${theme === t ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white' : 'text-gray-400'}`}>{t}</button>
              ))}
            </div>
          } />
          <Row icon={Trash2} title="Purge Records" subtitle="Clear all local data" destructive onClick={onClearData} />
        </Section>
      </div>

      <Modal isOpen={isPersonalInfoVisible} onClose={() => setIsPersonalInfoVisible(false)} title="Edit Profile">
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
          </div>
          <button onClick={saveProfile} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg flex items-center justify-center gap-2"><Save className="w-4 h-4" /> Save Changes</button>
        </div>
      </Modal>

      <Modal isOpen={isEmailModalVisible} onClose={() => setIsEmailModalVisible(false)} title="Update Email">
        <div className="space-y-6">
          <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800 flex items-start gap-4">
            <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <p className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase leading-relaxed">Changing your email will update your unique identity across all integrated logistics nodes.</p>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">New Identity Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="email"
                value={newEmail} 
                onChange={e => setNewEmail(e.target.value)} 
                className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 rounded-2xl text-sm font-bold dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" 
                placeholder="name@company.com"
              />
            </div>
          </div>
          <button onClick={handleUpdateEmail} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"><Save className="w-4 h-4" /> Confirm Change</button>
        </div>
      </Modal>

      <Modal isOpen={isPasswordModalVisible} onClose={() => setIsPasswordModalVisible(false)} title="Modify Access Key">
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Current Key</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="password"
                  value={passwords.current} 
                  onChange={e => setPasswords({...passwords, current: e.target.value})} 
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 rounded-2xl text-sm font-bold dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" 
                  placeholder="••••••••"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">New Security Key</label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="password"
                  value={passwords.next} 
                  onChange={e => setPasswords({...passwords, next: e.target.value})} 
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 rounded-2xl text-sm font-bold dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" 
                  placeholder="Min. 6 characters"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirm New Key</label>
              <div className="relative">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="password"
                  value={passwords.confirm} 
                  onChange={e => setPasswords({...passwords, confirm: e.target.value})} 
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 rounded-2xl text-sm font-bold dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" 
                  placeholder="Re-enter new key"
                />
              </div>
            </div>
          </div>
          <button onClick={handleUpdatePassword} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"><Save className="w-4 h-4" /> Update Access Key</button>
        </div>
      </Modal>

      <Modal isOpen={isLocationsVisible} onClose={() => setIsLocationsVisible(false)} title="Storage Nodes">
        <div className="space-y-8">
          <div className="p-5 bg-gray-50 dark:bg-gray-800/50 rounded-3xl space-y-4 border border-gray-100 dark:border-gray-800">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Add New Node</h4>
            <div className="flex gap-3">
              <input 
                placeholder="Node Name (e.g. Shelf B4)" 
                value={newLocation.name} 
                onChange={e => setNewLocation({...newLocation, name: e.target.value})}
                className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 rounded-xl text-sm font-bold border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none" 
              />
              <select 
                value={newLocation.type}
                onChange={e => setNewLocation({...newLocation, type: e.target.value})}
                className="px-4 py-3 bg-white dark:bg-gray-800 rounded-xl text-sm font-bold border border-gray-200 dark:border-gray-700 outline-none"
              >
                <option>Warehouse</option>
                <option>Vehicle</option>
                <option>Jobsite</option>
                <option>Retail</option>
              </select>
              <button onClick={addLocation} className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 active:scale-95 transition-all"><Plus className="w-5 h-5" /></button>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Configured Nodes</h4>
            {locations.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 dark:bg-gray-800 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                <Warehouse className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-gray-400">No storage nodes detected.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {locations.map(loc => (
                  <div key={loc.id} className="flex items-center gap-4 p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm group">
                    <div className={`p-2 rounded-lg ${loc.isPrimary ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-gray-100 text-gray-400 dark:bg-gray-800'}`}>
                      <Warehouse className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm dark:text-white truncate">{loc.name}</span>
                        {loc.isPrimary && <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-md text-[8px] font-black uppercase">Primary</span>}
                      </div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{loc.type}</span>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!loc.isPrimary && (
                        <button onClick={() => setPrimaryLocation(loc.id)} className="p-2 text-gray-400 hover:text-emerald-500 rounded-lg"><Check className="w-4 h-4" /></button>
                      )}
                      <button onClick={() => removeLocation(loc.id)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>

      <Modal isOpen={isAddDeviceVisible} onClose={() => setIsAddDeviceVisible(false)} title="Pair New Device">
        <div className="space-y-6 py-4">
          <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-[2rem] bg-gray-50 dark:bg-gray-800/20">
             <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-full flex items-center justify-center mb-4 animate-pulse">
               <Bluetooth className="w-8 h-8" />
             </div>
             <p className="text-sm font-black text-gray-400 uppercase tracking-widest text-center">Scanning for signals...</p>
             <p className="text-[10px] text-gray-400 mt-1">Ensure Bluetooth is active on your peripheral</p>
          </div>
          
          <div className="space-y-3">
             <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Manual Pairing</h4>
             <button className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl hover:bg-gray-50 transition-colors">
               <div className="flex items-center gap-3">
                 <Link className="w-4 h-4 text-gray-400" />
                 <span className="text-sm font-bold dark:text-white">IP/Network Scanner</span>
               </div>
               <ChevronRight className="w-4 h-4 text-gray-300" />
             </button>
             <button className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl hover:bg-gray-50 transition-colors">
               <div className="flex items-center gap-3">
                 <QrCode className="w-4 h-4 text-gray-400" />
                 <span className="text-sm font-bold dark:text-white">Scan Device Code</span>
               </div>
               <ChevronRight className="w-4 h-4 text-gray-300" />
             </button>
          </div>
        </div>
      </Modal>

      <style>{`.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; } .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; }`}</style>
    </div>
  );
};

export default SettingsPage;
