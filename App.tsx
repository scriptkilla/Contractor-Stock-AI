
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, Product } from './types';
import { db } from './services/database';
import Scanner from './components/Scanner';
import ProductForm from './components/ProductForm';
import SettingsPage from './components/SettingsPage';
import { 
  Scan, 
  Package, 
  LayoutDashboard, 
  Plus, 
  Search, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  Box,
  ChevronRight, 
  Edit2, 
  Trash2, 
  Settings, 
  Users, 
  UserPlus, 
  Mail, 
  X, 
  AlertTriangle, 
  UserMinus, 
  Shield, 
  ShieldCheck, 
  Activity, 
  User, 
  Save, 
  Hash, 
  RefreshCcw, 
  Ban, 
  Camera, 
  Printer, 
  QrCode, 
  FileStack, 
  Maximize2, 
  Check, 
  Minus, 
  Plus as PlusIcon, 
  Type, 
  Calendar, 
  ShieldAlert as ShieldIcon, 
  Send, 
  Clock, 
  Briefcase,
  Palette
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Manager' | 'Staff';
  status: 'online' | 'offline' | 'away';
  lastActive: string;
  initial: string;
  color: string;
  imageUrl?: string;
}

interface PendingInvite {
  id: string;
  email: string;
  role: 'Manager' | 'Staff';
  sentAt: string;
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [products, setProducts] = useState<Product[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState<{sku: string, product?: Product} | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [privacyMode, setPrivacyMode] = useState(false);
  const [inventorySearch, setInventorySearch] = useState('');
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Teams State - Initialized with only the Owner
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { 
      id: '1', 
      name: 'Sarah Wilson', 
      email: 'sarah@contractorstock.ai', 
      role: 'Owner', 
      status: 'online', 
      lastActive: 'Now', 
      initial: 'SW', 
      color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-white' 
    }
  ]);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);
  const [memberToEdit, setMemberToEdit] = useState<TeamMember | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'Manager' | 'Staff'>('Staff');

  // Pending Invites State - Start empty
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [isPendingInvitesModalOpen, setIsPendingInvitesModalOpen] = useState(false);

  // Print Modal State
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printSelection, setPrintSelection] = useState<'all' | 'recent' | 'custom'>('all');
  const [printFormat, setPrintFormat] = useState<'qr' | 'barcode' | 'tag'>('qr');
  const [printTemplate, setPrintTemplate] = useState<'modern' | 'industrial' | 'compact'>('modern');
  const [printSize, setPrintSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [printCopies, setPrintCopies] = useState(1);
  const [printOptions, setPrintOptions] = useState({
    showName: true,
    showPrice: false,
    showSku: true,
    showDate: false,
    showBarcode: true,
    highContrast: true,
    labelColor: 'bg-white',
    securityMark: false
  });

  const memberPhotoInputRef = useRef<HTMLInputElement>(null);

  // Lifted Theme State
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
    return (localStorage.getItem('scanventory_theme') as 'light' | 'dark' | 'system') || 'dark';
  });

  useEffect(() => {
    setProducts(db.getProducts());
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    const applyTheme = (t: string) => {
      if (t === 'dark') {
        root.classList.add('dark');
      } else if (t === 'light') {
        root.classList.remove('dark');
      } else {
        const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        systemIsDark ? root.classList.add('dark') : root.classList.remove('dark');
      }
    };

    localStorage.setItem('scanventory_theme', theme);
    applyTheme(theme);
  }, [theme]);

  const handleScan = (sku: string) => {
    const existingProduct = db.getProductBySku(sku);
    setIsScanning(false);
    setScannedResult({ sku, product: existingProduct });
  };

  const handleSaveProduct = (product: Product) => {
    db.saveProduct(product);
    setProducts(db.getProducts());
    setScannedResult(null);
    setEditingProduct(undefined);
    setCurrentView(View.INVENTORY);
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setScannedResult(null);
    setCurrentView(View.ADD_PRODUCT);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      db.deleteProduct(productToDelete.id);
      setProducts(prevProducts => prevProducts.filter(p => p.id !== productToDelete.id));
      setProductToDelete(null);
    }
  };

  const handleClearDatabase = () => {
    if (confirm("Are you sure you want to delete all inventory data? This cannot be undone.")) {
      localStorage.removeItem('scanventory_db');
      setProducts([]);
      alert("Database cleared.");
    }
  };

  const handleDataImport = () => {
    setProducts(db.getProducts());
  };

  const handleInvite = () => {
    if (!inviteEmail.trim()) return;
    const newInvite: PendingInvite = {
      id: Math.random().toString(36).substr(2, 9),
      email: inviteEmail,
      role: inviteRole,
      sentAt: 'Just now'
    };
    setPendingInvites(prev => [newInvite, ...prev]);
    setIsInviteModalOpen(false);
    setInviteEmail('');
  };

  const handleCancelInvite = (id: string) => {
    setPendingInvites(prev => prev.filter(inv => inv.id !== id));
  };

  const handleResendInvite = (email: string) => {
    alert(`Invitation resent to ${email}`);
  };

  const handleRemoveMember = () => {
    if (memberToDelete) {
      setTeamMembers(prev => prev.filter(m => m.id !== memberToDelete.id));
      setMemberToDelete(null);
    }
  };

  const handleUpdateMember = () => {
    if (memberToEdit) {
      setTeamMembers(prev => prev.map(m => m.id === memberToEdit.id ? memberToEdit : m));
      setMemberToEdit(null);
    }
  };

  const handleMemberPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !memberToEdit) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setMemberToEdit({ ...memberToEdit, imageUrl: event.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  const filteredInventory = useMemo(() => {
    if (!inventorySearch.trim()) return products;
    const query = inventorySearch.toLowerCase();
    return products.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.sku.toLowerCase().includes(query) || 
      p.category.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query)
    );
  }, [products, inventorySearch]);

  const renderDashboard = () => (
    <div className="space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-5xl mx-auto w-full">
      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-3xl text-white shadow-xl">
        <h1 className="text-3xl font-black mb-1 tracking-tight">Welcome Back</h1>
        <p className="text-indigo-100 mb-8 font-medium">Your inventory health is optimal.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
            <Package className="w-8 h-8 mb-3 text-indigo-200" />
            <div className="text-3xl font-black text-white">{products.length}</div>
            <div className="text-sm font-bold text-indigo-100 uppercase tracking-widest">Total Assets</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
            <TrendingUp className="w-8 h-8 mb-3 text-indigo-200" />
            <div className="text-3xl font-black text-white">
              ${products.reduce((acc, p) => acc + (p.price * p.quantity), 0).toLocaleString()}
            </div>
            <div className="text-sm font-bold text-indigo-100 uppercase tracking-widest">Inventory Value</div>
          </div>
          <div className="hidden lg:block bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
            <Activity className="w-8 h-8 mb-3 text-indigo-200" />
            <div className="text-3xl font-black text-white">Active</div>
            <div className="text-sm font-bold text-indigo-100 uppercase tracking-widest">System Status</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button 
          onClick={() => {
            setIsScanning(true);
            setEditingProduct(undefined);
          }}
          className="flex items-center gap-4 p-5 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:border-indigo-300 transition-all group"
        >
          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl group-hover:bg-indigo-100 transition-colors">
            <Scan className="w-6 h-6 text-indigo-600 dark:text-white" />
          </div>
          <div className="text-left flex-1">
            <h3 className="font-bold text-gray-800 dark:text-white">Quick Scan</h3>
            <p className="text-xs text-gray-500 dark:text-gray-200">Barcode lookup & add</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-400" />
        </button>

        <button 
          onClick={() => {
            setEditingProduct(undefined);
            setCurrentView(View.ADD_PRODUCT);
          }}
          className="flex items-center gap-4 p-5 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:border-emerald-300 transition-all group"
        >
          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl group-hover:bg-emerald-100 transition-colors">
            <Plus className="w-6 h-6 text-emerald-600 dark:text-white" />
          </div>
          <div className="text-left flex-1">
            <h3 className="font-bold text-gray-800 dark:text-white">Manual Entry</h3>
            <p className="text-xs text-gray-500 dark:text-gray-200">Add without scanning</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-emerald-400" />
        </button>

        <button 
          onClick={() => setIsPrintModalOpen(true)}
          className="flex items-center gap-4 p-5 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:border-amber-300 transition-all group"
        >
          <div className="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-xl group-hover:bg-amber-100 transition-colors">
            <Printer className="w-6 h-6 text-amber-600 dark:text-white" />
          </div>
          <div className="text-left flex-1">
            <h3 className="font-bold text-gray-800 dark:text-white">Print Labels</h3>
            <p className="text-xs text-gray-500 dark:text-gray-200">Batch asset labeling</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-amber-400" />
        </button>
      </div>

      <div className="flex items-center justify-between px-1">
        <h2 className="text-xl font-black text-gray-800 dark:text-white tracking-tight uppercase">Recent Activity</h2>
        <button onClick={() => setCurrentView(View.INVENTORY)} className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:underline">View All</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {products.slice(-4).reverse().map(p => (
          <div key={p.id} className="flex items-center gap-4 bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:border-indigo-100 transition-all">
            <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center overflow-hidden shrink-0 border border-gray-50 dark:border-gray-700">
              {p.imageUrl ? <img src={p.imageUrl} className="w-full h-full object-cover" /> : <Box className="text-gray-400 dark:text-gray-500" />}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-gray-800 dark:text-white truncate">{p.name}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-200">SKU: {p.sku} • {new Date(p.lastUpdated).toLocaleDateString()}</p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 block mb-1">Qty: {p.quantity}</span>
              <div className="flex gap-1">
                <button onClick={() => handleEditClick(p)} className="p-2 text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-white rounded-lg hover:bg-indigo-100 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                <button onClick={() => setProductToDelete(p)} className="p-2 text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-white rounded-lg hover:bg-red-100 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          </div>
        ))}
        {products.length === 0 && <p className="text-sm text-gray-400 italic px-1">No recent activity found.</p>}
      </div>
    </div>
  );

  const renderInventory = () => (
    <div className="space-y-4 pb-24 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-5xl mx-auto w-full">
      <div className="flex flex-col gap-6 mb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-3xl font-black dark:text-white tracking-tight">Current Inventory</h1>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsPrintModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-white rounded-xl text-sm font-black shadow-sm active:scale-95 transition-all"
            >
              <Printer className="w-4 h-4" />
              Batch Print
            </button>
            <button 
              onClick={() => {
                setEditingProduct(undefined);
                setCurrentView(View.ADD_PRODUCT);
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-black shadow-lg shadow-indigo-100 dark:shadow-none active:scale-95 transition-all"
            >
              <PlusIcon className="w-4 h-4" />
              Add Asset
            </button>
          </div>
        </div>
        <div className="relative group max-w-2xl">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
          <input 
            value={inventorySearch}
            onChange={(e) => setInventorySearch(e.target.value)}
            placeholder="Search by name, SKU, or category..." 
            className="w-full pl-12 pr-10 py-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-base dark:text-white transition-all outline-none shadow-sm"
          />
          {inventorySearch && (
            <button onClick={() => setInventorySearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white"><X className="w-4 h-4" /></button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredInventory.map(product => (
          <div key={product.id} className="bg-white dark:bg-gray-900 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col gap-4 hover:border-indigo-100 dark:hover:border-indigo-900/30 transition-all group relative overflow-hidden">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center border border-gray-100 dark:border-gray-700 overflow-hidden shrink-0">
                {product.imageUrl ? <img src={product.imageUrl} className="w-full h-full object-cover" /> : <Box className="w-7 h-7 text-gray-300 dark:text-gray-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-gray-500 dark:text-white uppercase">{product.sku}</span>
                  <span className="text-[10px] font-black px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded uppercase tracking-tighter">{product.category}</span>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white truncate text-lg">{product.name}</h3>
              </div>
            </div>
            
            <p className="text-xs text-gray-500 dark:text-gray-200 line-clamp-2 min-h-[2.5em]">{product.description || "No description provided for this asset."}</p>
            
            <div className="flex items-center justify-between mt-2 pt-4 border-t border-gray-50 dark:border-gray-800">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-gray-400 dark:text-gray-300 uppercase tracking-widest">Asset Value</span>
                <span className="text-xl font-black text-gray-900 dark:text-white">${product.price.toFixed(2)}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-gray-400 dark:text-gray-300 uppercase tracking-widest">Stock Level</span>
                <span className={`text-sm font-black px-3 py-1 rounded-full mt-1 ${product.quantity < 5 ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-white' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-white'}`}>
                  {product.quantity} Units
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <button onClick={() => handleEditClick(product)} className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-50 dark:hover:bg-indigo-900/40 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all">
                <Edit2 className="w-3.5 h-3.5" />
                Edit
              </button>
              <button onClick={() => setProductToDelete(product)} className="px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-white rounded-xl hover:bg-red-100 transition-all active:scale-95">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {filteredInventory.length === 0 && (
          <div className="text-center py-24 bg-white dark:bg-gray-900 rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-gray-800 col-span-full animate-in fade-in duration-700 shadow-sm">
            <Package className="w-20 h-20 text-gray-200 dark:text-gray-800 mx-auto mb-6" />
            <p className="text-gray-500 dark:text-white font-bold px-6 text-xl">
              {inventorySearch ? `No matches found for "${inventorySearch}"` : 'Your inventory is currently empty'}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderTeams = () => (
    <div className="space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-5xl mx-auto w-full">
      <div className="flex flex-col gap-1 px-1">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black dark:text-white tracking-tight">Organization Team</h1>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsPendingInvitesModalOpen(true)}
              className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-white rounded-2xl text-sm font-black shadow-sm active:scale-95 transition-all"
            >
              <Clock className="w-4 h-4" />
              Pending
              {pendingInvites.length > 0 && <span className="flex items-center justify-center w-5 h-5 bg-amber-500 text-white text-[10px] rounded-full">{pendingInvites.length}</span>}
            </button>
            <button 
              onClick={() => setIsInviteModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-black shadow-lg shadow-indigo-100 dark:shadow-none active:scale-95 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              Invite Member
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-200 font-medium">Coordinate warehouse operations and access control.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Members', count: teamMembers.length, icon: Users, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-white' },
          { label: 'Admins', count: teamMembers.filter(m => m.role !== 'Staff').length, icon: ShieldCheck, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-white' },
          { label: 'Active Now', count: teamMembers.filter(m => m.status === 'online').length, icon: Activity, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-white' }
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center gap-2 text-center">
            <stat.icon className={`w-6 h-6 ${stat.color} p-1.5 rounded-xl`} />
            <div className="text-3xl font-black dark:text-white">{stat.count}</div>
            <div className="text-[10px] font-black text-gray-400 dark:text-gray-300 uppercase tracking-widest">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h2 className="text-xs font-black text-gray-400 dark:text-gray-300 tracking-widest uppercase px-1">Active Roster</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teamMembers.map((member) => (
            <div key={member.id} className="bg-white dark:bg-gray-900 p-5 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-5 hover:border-indigo-100 transition-all group">
              <div className="relative">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl shadow-sm overflow-hidden ${member.imageUrl ? '' : member.color}`}>
                  {member.imageUrl ? <img src={member.imageUrl} className="w-full h-full object-cover" /> : member.initial}
                </div>
                {member.status === 'online' && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-white dark:border-gray-900 rounded-full">
                    <div className="w-full h-full bg-emerald-500 rounded-full animate-ping opacity-75" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-black text-gray-800 dark:text-white truncate text-lg">{member.name}</h3>
                  {member.role === 'Owner' && <span title="Account Owner"><Shield className="w-4 h-4 text-indigo-500" /></span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black px-2 py-1 rounded uppercase tracking-tighter ${
                    member.role === 'Owner' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40 dark:text-white' :
                    member.role === 'Manager' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-white' :
                    'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-200'
                  }`}>
                    {member.role}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-300 font-medium">• {member.lastActive}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setMemberToEdit({ ...member })} className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 dark:text-white rounded-xl transition-all"><Edit2 className="w-4 h-4" /></button>
                {member.role !== 'Owner' && <button onClick={() => setMemberToDelete(member)} className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 dark:text-white rounded-xl transition-all"><UserMinus className="w-4 h-4" /></button>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderBarcodeSVG = (sku: string, height: number = 40, isInverse: boolean = false) => {
    if (!sku) return null;
    const bars = [];
    let currentX = 0;
    const color = isInverse ? "white" : "currentColor";
    // Simple pseudo-barcode algorithm using char codes
    for (let i = 0; i < sku.length; i++) {
      const code = sku.charCodeAt(i);
      const w1 = (code % 3) + 1;
      const g = (code % 2) + 1;
      const w2 = ((code >> 2) % 3) + 1;
      bars.push(<rect key={`${i}-1`} x={currentX} y="0" width={w1} height={height} fill={color} />);
      currentX += w1 + g;
      bars.push(<rect key={`${i}-2`} x={currentX} y="0" width={w2} height={height} fill={color} />);
      currentX += w2 + g;
    }
    return (
      <svg width="100%" height={height} viewBox={`0 0 ${currentX} ${height}`} preserveAspectRatio="none" className={isInverse ? "text-white" : "text-gray-900 dark:text-white"}>
        {bars}
      </svg>
    );
  };

  const LabelPreview = () => {
    const previewProduct = products[0] || {
      name: 'Industrial Valve 400 Series',
      sku: 'SKU-9921-X',
      price: 1240.50,
      lastUpdated: new Date().toISOString()
    };

    const labelSizeClasses = {
      sm: 'w-48 h-48',
      md: 'w-72 h-36',
      lg: 'w-full h-48'
    }[printSize];

    const isBlackLabel = printOptions.labelColor === 'bg-black';

    return (
      <div className="bg-black p-10 rounded-[2.5rem] border border-zinc-800 flex flex-col items-center gap-8 shadow-inner overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:20px_20px]" />
        </div>
        
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
          <span className="text-[10px] font-black text-zinc-500 dark:text-white uppercase tracking-[0.3em]">Master View Engine</span>
        </div>
        
        <div className={`${labelSizeClasses} ${printOptions.labelColor} rounded-2xl shadow-2xl border ${printOptions.highContrast ? (isBlackLabel ? 'border-white/50 border-2' : 'border-black border-2') : 'border-transparent'} p-8 flex items-center gap-8 relative overflow-hidden transition-all duration-700 hover:scale-[1.02] active:scale-95 cursor-default z-10`}>
          {printOptions.securityMark && (
            <div className={`absolute -top-4 -right-4 w-20 h-20 rounded-full flex items-center justify-center opacity-10 rotate-12 ${isBlackLabel ? 'bg-white' : 'bg-black'}`}>
              <ShieldIcon className={`w-10 h-10 ${isBlackLabel ? 'text-white' : 'text-gray-400 dark:text-white'}`} />
            </div>
          )}
          
          <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
            <div>
              {printOptions.showName && <h4 className={`text-lg font-black truncate uppercase tracking-tighter ${isBlackLabel ? 'text-white' : (printOptions.highContrast ? 'text-black' : 'text-gray-900')}`}>{previewProduct.name}</h4>}
              {printOptions.showSku && (
                <div className="flex items-center gap-2 mt-1">
                  <Hash className={`w-4 h-4 ${isBlackLabel ? 'text-white/60' : (printOptions.highContrast ? 'text-black' : 'text-gray-400')}`} />
                  <p className={`text-xs font-mono font-bold ${isBlackLabel ? 'text-white/60' : (printOptions.highContrast ? 'text-black' : 'text-gray-500')}`}>{previewProduct.sku}</p>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              {printOptions.showBarcode && (
                <div className={`w-full h-8 mb-2 ${isBlackLabel ? 'opacity-100' : (printOptions.highContrast ? 'opacity-100' : 'opacity-80')}`}>
                  {renderBarcodeSVG(previewProduct.sku, 32, isBlackLabel)}
                </div>
              )}
              {printOptions.showPrice && <div className={`text-2xl font-black ${isBlackLabel ? 'text-white' : (printOptions.highContrast ? 'text-black underline decoration-2 decoration-indigo-500 underline-offset-4' : 'text-indigo-600')}`}>${previewProduct.price.toLocaleString()}</div>}
              {printOptions.showDate && <div className={`text-[10px] font-black uppercase tracking-widest ${isBlackLabel ? 'text-white/40' : (printOptions.highContrast ? 'text-black' : 'text-gray-400')}`}>{new Date(previewProduct.lastUpdated).toLocaleDateString()}</div>}
            </div>
          </div>

          <div className="shrink-0 flex flex-col items-center justify-center gap-3">
            {printFormat === 'qr' ? (
              <div className={`p-3 bg-white rounded-xl shadow-sm border ${printOptions.highContrast || isBlackLabel ? 'border-zinc-200 border' : 'border-gray-50'}`}><QrCode className="w-20 h-20 text-gray-900" /></div>
            ) : printFormat === 'barcode' ? (
              <div className={`p-4 bg-white rounded-xl shadow-sm border flex items-center justify-center h-24 w-32 ${printOptions.highContrast || isBlackLabel ? 'border-zinc-200 border' : 'border-gray-50'}`}>
                {renderBarcodeSVG(previewProduct.sku, 60, false)}
              </div>
            ) : (
              <div className={`w-24 h-24 rounded-2xl flex flex-col items-center justify-center p-3 ${isBlackLabel ? 'bg-white text-black' : (printOptions.highContrast ? 'bg-black text-white' : 'bg-gray-900 text-white')}`}>
                <Hash className="w-8 h-8 mb-2 opacity-50" />
                <span className="text-xs font-black tracking-tighter truncate w-full text-center">{previewProduct.sku.split('-')[0]}</span>
              </div>
            )}
            <span className={`text-[10px] font-black uppercase tracking-widest ${isBlackLabel ? 'text-white/50' : (printOptions.highContrast ? 'text-black' : 'text-gray-300')}`}>{printFormat}</span>
          </div>
          
          {printTemplate === 'industrial' && <div className={`absolute inset-x-0 bottom-0 h-2 ${isBlackLabel ? 'bg-white/20' : (printOptions.highContrast ? 'bg-black' : 'bg-gray-900/10')}`} />}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white transition-colors duration-300 flex flex-col">
      <div className="flex-1 w-full px-4 pt-8 pb-32">
        {isScanning ? (
          <Scanner onScan={handleScan} onClose={() => setIsScanning(false)} />
        ) : currentView === View.ADD_PRODUCT || editingProduct || scannedResult ? (
          <div className="animate-in fade-in zoom-in duration-500">
            <ProductForm 
              initialSku={scannedResult?.sku || editingProduct?.sku}
              initialProduct={scannedResult?.product || editingProduct}
              onSave={handleSaveProduct}
              onCancel={() => {
                setScannedResult(null);
                setEditingProduct(undefined);
                setCurrentView(View.DASHBOARD);
              }}
            />
          </div>
        ) : currentView === View.SETTINGS ? (
          <SettingsPage 
            onClearData={handleClearDatabase} 
            onDataImport={handleDataImport}
            productCount={products.length}
            theme={theme}
            setTheme={setTheme}
            privacyMode={privacyMode}
            setPrivacyMode={setPrivacyMode}
          />
        ) : currentView === View.TEAMS ? (
          renderTeams()
        ) : currentView === View.INVENTORY ? (
          renderInventory()
        ) : (
          renderDashboard()
        )}
      </div>

      {/* Delete Product Modal */}
      {productToDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300 border border-gray-100 dark:border-gray-800 text-center">
            <div className="w-24 h-24 bg-red-50 dark:bg-red-900/30 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-sm">
              <AlertTriangle className="w-12 h-12 text-red-600 dark:text-red-500" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">Delete Asset?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-200 mb-10 leading-relaxed font-medium">
              Permanently remove <span className="font-black text-gray-900 dark:text-white">{productToDelete.name}</span>? This cannot be reversed.
            </p>
            <div className="flex flex-col gap-4">
              <button onClick={confirmDelete} className="w-full py-4 bg-red-600 text-white rounded-2xl font-black shadow-xl shadow-red-200 dark:shadow-none hover:bg-red-700 active:scale-[0.98] transition-all uppercase tracking-widest text-xs">Permanently Delete</button>
              <button onClick={() => setProductToDelete(null)} className="w-full py-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white rounded-2xl font-black hover:bg-gray-200 active:scale-[0.98] transition-all uppercase tracking-widest text-xs">Keep Asset</button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[70] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-900 w-full max-md rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-white rounded-2xl">
                <UserPlus className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-black dark:text-white tracking-tight">Invite Member</h3>
                <p className="text-sm text-gray-500 dark:text-gray-200 font-medium">Grant access to your organization.</p>
              </div>
            </div>

            <div className="space-y-6 mb-10">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-300 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="email" 
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="teammate@company.com"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-sm font-bold dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-300 uppercase tracking-widest ml-1">Assigned Role</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Manager', 'Staff'].map((role) => (
                    <button 
                      key={role}
                      onClick={() => setInviteRole(role as any)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${inviteRole === role ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20 text-indigo-600 dark:text-white' : 'border-gray-50 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-400 dark:text-gray-500'}`}
                    >
                      {role === 'Manager' ? <ShieldCheck className="w-5 h-5" /> : <Briefcase className="w-5 h-5" />}
                      <span className="text-xs font-black uppercase tracking-widest">{role}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={handleInvite} 
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
              >
                <Send className="w-4 h-4" />
                Send Invitation
              </button>
              <button 
                onClick={() => setIsInviteModalOpen(false)} 
                className="w-full py-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white rounded-2xl font-black hover:bg-gray-200 transition-all uppercase tracking-widest text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pending Invites Modal */}
      {isPendingInvitesModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[70] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300 border border-gray-100 dark:border-gray-800 flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between mb-8 shrink-0">
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-amber-500" />
                <h3 className="text-2xl font-black dark:text-white tracking-tight">Pending Invites</h3>
              </div>
              <button onClick={() => setIsPendingInvitesModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"><X className="w-6 h-6" /></button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              {pendingInvites.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-gray-700">
                  <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-sm font-bold text-gray-400 dark:text-gray-200">No active pending invitations.</p>
                </div>
              ) : (
                pendingInvites.map((invite) => (
                  <div key={invite.id} className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-xl flex items-center justify-center">
                        <Mail className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-bold dark:text-white truncate max-w-[150px]">{invite.email}</div>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400 dark:text-gray-300 font-black uppercase tracking-widest">
                          {invite.role} • Sent {invite.sentAt}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleResendInvite(invite.email)} className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 dark:text-white rounded-lg" title="Resend"><RefreshCcw className="w-4 h-4" /></button>
                      <button onClick={() => handleCancelInvite(invite.id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 dark:text-white rounded-lg" title="Revoke"><Ban className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button 
              onClick={() => setIsPendingInvitesModalOpen(false)} 
              className="mt-8 w-full py-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white rounded-2xl font-black hover:bg-gray-200 transition-all uppercase tracking-widest text-xs"
            >
              Close Manifest
            </button>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {memberToEdit && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[70] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300 border border-gray-100 dark:border-gray-800">
            <h3 className="text-2xl font-black dark:text-white tracking-tight mb-8">Edit Member Roster</h3>
            
            <div className="space-y-6 mb-10">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className={`w-24 h-24 rounded-[2rem] overflow-hidden flex items-center justify-center font-black text-3xl shadow-lg border-4 border-white dark:border-gray-800 ${memberToEdit.imageUrl ? '' : memberToEdit.color}`}>
                    {memberToEdit.imageUrl ? <img src={memberToEdit.imageUrl} className="w-full h-full object-cover" /> : memberToEdit.initial}
                  </div>
                  <button 
                    onClick={() => memberPhotoInputRef.current?.click()}
                    className="absolute -bottom-2 -right-2 p-2 bg-indigo-600 text-white rounded-xl shadow-lg hover:scale-110 transition-transform"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  <input type="file" ref={memberPhotoInputRef} className="hidden" accept="image/*" onChange={handleMemberPhotoChange} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-300 uppercase tracking-widest ml-1">Full Name</label>
                <input 
                  value={memberToEdit.name}
                  onChange={(e) => setMemberToEdit({...memberToEdit, name: e.target.value})}
                  className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-sm font-bold dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-300 uppercase tracking-widest ml-1">Operational Role</label>
                <select 
                  value={memberToEdit.role}
                  onChange={(e) => setMemberToEdit({...memberToEdit, role: e.target.value as any})}
                  className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-sm font-bold dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  disabled={memberToEdit.role === 'Owner'}
                >
                  <option value="Owner">Owner</option>
                  <option value="Manager">Manager</option>
                  <option value="Staff">Staff</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={handleUpdateMember} 
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
              >
                <Save className="w-4 h-4" />
                Commit Changes
              </button>
              <button 
                onClick={() => setMemberToEdit(null)} 
                className="w-full py-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white rounded-2xl font-black hover:bg-gray-200 transition-all uppercase tracking-widest text-xs"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Member Confirmation */}
      {memberToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[70] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300 border border-gray-100 dark:border-gray-800 text-center">
            <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-white rounded-3xl flex items-center justify-center mx-auto mb-6">
              <UserMinus className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black dark:text-white tracking-tight mb-2">Revoke Access?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-200 font-medium mb-8">
              Remove <span className="font-bold text-gray-900 dark:text-white">{memberToDelete.name}</span> from the organization roster?
            </p>
            <div className="flex flex-col gap-3">
              <button onClick={handleRemoveMember} className="w-full py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-red-200 dark:shadow-none">Revoke Access</button>
              <button onClick={() => setMemberToDelete(null)} className="w-full py-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white rounded-2xl font-black uppercase tracking-widest text-xs">Maintain</button>
            </div>
          </div>
        </div>
      )}

      {/* Print Labels Modal */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[80] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-900 w-full max-w-5xl max-h-[90vh] rounded-[3rem] overflow-hidden shadow-2xl flex flex-col border border-gray-100 dark:border-gray-800 animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b dark:border-gray-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-white rounded-xl">
                  <Printer className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-black dark:text-white tracking-tight">Label Studio</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-300 font-medium uppercase tracking-widest">Asset Identification Hub</p>
                </div>
              </div>
              <button onClick={() => setIsPrintModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Controls */}
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-300 uppercase tracking-[0.2em]">Manifest Scope</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {(['all', 'recent', 'custom'] as const).map((s) => (
                        <button key={s} onClick={() => setPrintSelection(s)} className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${printSelection === s ? 'border-indigo-600 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-white' : 'border-gray-50 dark:border-gray-800 text-gray-400 dark:text-gray-500 hover:border-gray-200'}`}>{s}</button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-300 uppercase tracking-[0.2em]">Identification Protocol</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {(['qr', 'barcode', 'tag'] as const).map((f) => (
                        <button key={f} onClick={() => setPrintFormat(f)} className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${printFormat === f ? 'border-amber-600 bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-white' : 'border-gray-50 dark:border-gray-800 text-gray-400 dark:text-gray-500 hover:border-gray-200'}`}>{f}</button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-300 uppercase tracking-[0.2em]">Studio Template</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {(['modern', 'industrial', 'compact'] as const).map((t) => (
                        <button key={t} onClick={() => setPrintTemplate(t)} className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${printTemplate === t ? 'border-indigo-600 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-white' : 'border-gray-50 dark:border-gray-800 text-gray-400 dark:text-gray-500 hover:border-gray-200'}`}>{t}</button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-300 uppercase tracking-[0.2em]">Dimensions</h4>
                      <div className="flex bg-gray-50 dark:bg-gray-800 p-1 rounded-xl">
                        {(['sm', 'md', 'lg'] as const).map((sz) => (
                          <button key={sz} onClick={() => setPrintSize(sz)} className={`flex-1 py-2 text-[10px] font-black rounded-lg uppercase transition-all ${printSize === sz ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm' : 'text-gray-400 dark:text-gray-500'}`}>{sz}</button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-300 uppercase tracking-[0.2em]">Replication</h4>
                      <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded-xl">
                        <button onClick={() => setPrintCopies(Math.max(1, printCopies - 1))} className="p-1.5 bg-white dark:bg-gray-700 rounded-lg text-gray-400 dark:text-white"><Minus className="w-4 h-4" /></button>
                        <span className="text-sm font-black dark:text-white">{printCopies}x</span>
                        <button onClick={() => setPrintCopies(printCopies + 1)} className="p-1.5 bg-white dark:bg-gray-700 rounded-lg text-gray-400 dark:text-white"><PlusIcon className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t dark:border-gray-800">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-300 uppercase tracking-[0.2em]">Metadata Options</h4>
                      <div className="flex items-center gap-2">
                        <Palette className="w-3.5 h-3.5 text-gray-400 dark:text-white" />
                        <div className="flex gap-1.5">
                          {['bg-white', 'bg-yellow-50', 'bg-blue-50', 'bg-black'].map(c => (
                            <button 
                              key={c} 
                              onClick={() => setPrintOptions({...printOptions, labelColor: c})}
                              className={`w-5 h-5 rounded-full border border-gray-200 transition-all ${c} ${printOptions.labelColor === c ? 'scale-125 ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-gray-900' : 'hover:scale-110 shadow-sm'}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-10 gap-y-4">
                      {Object.entries(printOptions).map(([key, value]) => {
                         if (typeof value !== 'boolean') return null;
                         return (
                          <div 
                            key={key} 
                            onClick={() => setPrintOptions({...printOptions, [key]: !value})}
                            className="flex items-center justify-between cursor-pointer group"
                          >
                            <span className="text-xs font-bold text-gray-500 dark:text-white capitalize group-hover:text-indigo-500 transition-colors">{key.replace(/([A-Z])/g, ' $1')}</span>
                            <div 
                              className={`w-9 h-5 rounded-full transition-all flex items-center px-0.5 ${value ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                            >
                              <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${value ? 'translate-x-4' : 'translate-x-0'}`} />
                            </div>
                          </div>
                         )
                      })}
                    </div>
                  </div>
                </div>

                {/* Preview Area */}
                <div className="flex flex-col gap-6">
                  <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-300 uppercase tracking-[0.2em] px-1">Studio Visual Context</h4>
                  <LabelPreview />
                  <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-[2rem] shadow-xl">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-indigo-600 text-white rounded-xl shrink-0 shadow-[0_0_15px_rgba(79,70,229,0.4)]"><CheckCircle2 className="w-4 h-4" /></div>
                      <div>
                        <h5 className="text-sm font-black text-zinc-100">Live Render Feed</h5>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-medium leading-relaxed">System using {printFormat === 'qr' ? 'Vector SVG' : 'Bilinear Scaling'} for industrial thermal clarity.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 border-t dark:border-gray-800 flex gap-4 shrink-0 bg-gray-50/50 dark:bg-gray-900/50">
              <button onClick={() => setIsPrintModalOpen(false)} className="flex-1 py-4 bg-white dark:bg-gray-800 text-gray-600 dark:text-white rounded-2xl font-black uppercase tracking-widest text-[10px] border border-gray-100 dark:border-gray-700 transition-all hover:bg-gray-100 dark:hover:bg-gray-700">Abeyance</button>
              <button 
                onClick={() => {
                  alert(`Executing print for ${printCopies} copies...`);
                  setIsPrintModalOpen(false);
                }} 
                className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                <Printer className="w-4 h-4" />
                Commit to Output
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Bar - Responsive centering */}
      {!isScanning && (
        <div className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none p-4 flex justify-center">
          <nav className="w-full max-w-2xl bg-white dark:bg-gray-900/90 backdrop-blur-xl border border-gray-100 dark:border-gray-800 px-8 py-4 flex justify-between items-center shadow-2xl rounded-[2.5rem] pointer-events-auto">
            <button onClick={() => setCurrentView(View.DASHBOARD)} className={`flex flex-col items-center gap-1.5 transition-all ${currentView === View.DASHBOARD ? 'text-indigo-600 dark:text-indigo-400 scale-110' : 'text-gray-400 dark:text-gray-300 hover:text-white'}`}>
              <LayoutDashboard className="w-6 h-6" />
              <span className="text-[10px] font-black tracking-widest uppercase">Home</span>
            </button>
            
            <button onClick={() => setCurrentView(View.INVENTORY)} className={`flex flex-col items-center gap-1.5 transition-all ${currentView === View.INVENTORY ? 'text-indigo-600 dark:text-indigo-400 scale-110' : 'text-gray-400 dark:text-gray-300 hover:text-white'}`}>
              <Package className="w-6 h-6" />
              <span className="text-[10px] font-black tracking-widest uppercase">Stock</span>
            </button>

            <button 
              onClick={() => { setIsScanning(true); setEditingProduct(undefined); }}
              className="flex items-center justify-center w-16 h-16 bg-indigo-600 text-white rounded-[1.5rem] shadow-2xl shadow-indigo-400/40 dark:shadow-none -mt-14 border-4 border-gray-50 dark:border-gray-950 active:scale-95 transition-all hover:bg-indigo-700 z-50"
            >
              <Scan className="w-8 h-8" />
            </button>

            <button onClick={() => setCurrentView(View.TEAMS)} className={`flex flex-col items-center gap-1.5 transition-all ${currentView === View.TEAMS ? 'text-indigo-600 dark:text-indigo-400 scale-110' : 'text-gray-400 dark:text-gray-300 hover:text-white'}`}>
              <Users className="w-6 h-6" />
              <span className="text-[10px] font-black tracking-widest uppercase">Team</span>
            </button>

            <button onClick={() => setCurrentView(View.SETTINGS)} className={`flex flex-col items-center gap-1.5 transition-all ${currentView === View.SETTINGS ? 'text-indigo-600 dark:text-indigo-400 scale-110' : 'text-gray-400 dark:text-gray-300 hover:text-white'}`}>
              <Settings className="w-6 h-6" />
              <span className="text-[10px] font-black tracking-widest uppercase">Ops</span>
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default App;
