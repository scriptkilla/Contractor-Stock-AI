
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
  Ruler,
  Maximize2,
  Check,
  Minus,
  Plus as PlusIcon,
  ToggleRight,
  Eye,
  Type,
  Palette,
  Layout,
  Calendar,
  ShieldAlert as ShieldIcon,
  Droplets
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

  // Teams State
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: '1', name: 'Sarah Wilson', email: 'sarah@contractorstock.ai', role: 'Owner', status: 'online', lastActive: 'Now', initial: 'SW', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400' },
    { id: '2', name: 'Michael Chen', email: 'm.chen@contractorstock.ai', role: 'Manager', status: 'online', lastActive: '2m ago', initial: 'MC', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400' },
    { id: '3', name: 'James Rodriguez', email: 'james.r@contractorstock.ai', role: 'Staff', status: 'offline', lastActive: 'Yesterday', initial: 'JR', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400' },
    { id: '4', name: 'Alex Thompson', email: 'alex.t@contractorstock.ai', role: 'Staff', status: 'online', lastActive: 'Now', initial: 'AT', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-indigo-400' }
  ]);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);
  const [memberToEdit, setMemberToEdit] = useState<TeamMember | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'Manager' | 'Staff'>('Staff');

  // Pending Invites State
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([
    { id: 'p1', email: 'david.l@contractorstock.ai', role: 'Staff', sentAt: '2 days ago' },
    { id: 'p2', email: 'kelly.m@contractorstock.ai', role: 'Manager', sentAt: '5 hours ago' }
  ]);
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
    highContrast: true,
    labelColor: 'bg-white',
    securityMark: false
  });

  const memberPhotoInputRef = useRef<HTMLInputElement>(null);

  // Lifted Theme State - Default to 'dark'
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
    return (localStorage.getItem('scanventory_theme') as 'light' | 'dark' | 'system') || 'dark';
  });

  useEffect(() => {
    setProducts(db.getProducts());
  }, []);

  // Global Theme Syncing Effect
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

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        e.matches ? root.classList.add('dark') : root.classList.remove('dark');
      }
    };
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
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
    <div className="space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-3xl text-white shadow-xl">
        <h1 className="text-2xl font-bold mb-1">Welcome Back</h1>
        <p className="text-indigo-100 mb-6">Your inventory is healthy.</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
            <Package className="w-6 h-6 mb-2 text-indigo-200" />
            <div className="text-2xl font-bold">{products.length}</div>
            <div className="text-sm text-indigo-100">Total Products</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
            <TrendingUp className="w-6 h-6 mb-2 text-indigo-200" />
            <div className="text-2xl font-bold">
              ${products.reduce((acc, p) => acc + (p.price * p.quantity), 0).toLocaleString()}
            </div>
            <div className="text-sm text-indigo-100">Inventory Value</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <button 
          onClick={() => {
            setIsScanning(true);
            setEditingProduct(undefined);
          }}
          className="flex items-center gap-4 p-5 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:border-indigo-300 transition-all group"
        >
          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl group-hover:bg-indigo-100 transition-colors">
            <Scan className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="text-left flex-1">
            <h3 className="font-bold text-gray-800 dark:text-gray-100">Quick Scan</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Scan barcodes to add or lookup</p>
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
            <Plus className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-left flex-1">
            <h3 className="font-bold text-gray-800 dark:text-gray-100">Manual Entry</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Add product without scanning</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-emerald-400" />
        </button>

        <button 
          onClick={() => setIsPrintModalOpen(true)}
          className="flex items-center gap-4 p-5 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:border-amber-300 transition-all group"
        >
          <div className="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-xl group-hover:bg-amber-100 transition-colors">
            <Printer className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-left flex-1">
            <h3 className="font-bold text-gray-800 dark:text-gray-100">Print Labels</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Batch print QR codes and asset tags</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-amber-400" />
        </button>
      </div>

      <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 px-1">Recent Activity</h2>
      <div className="space-y-3">
        {products.slice(-3).reverse().map(p => (
          <div key={p.id} className="flex items-center gap-4 bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center overflow-hidden">
              {p.imageUrl ? <img src={p.imageUrl} className="w-full h-full object-cover" /> : <Box className="text-gray-400 dark:text-gray-600" />}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800 dark:text-gray-100">{p.name}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">Modified {new Date(p.lastUpdated).toLocaleDateString()}</p>
            </div>
            <div className="text-right flex items-center gap-2">
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mr-2">Qty: {p.quantity}</span>
              <div className="flex gap-1.5">
                <button 
                  onClick={() => handleEditClick(p)}
                  className="p-2 text-indigo-600 hover:text-indigo-700 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setProductToDelete(p)}
                  className="p-2 text-red-600 hover:text-red-700 bg-red-50 dark:bg-red-900/30 dark:text-red-400 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {products.length === 0 && <p className="text-sm text-gray-400 italic px-1">No recent activity found.</p>}
      </div>
    </div>
  );

  const renderInventory = () => (
    <div className="space-y-4 pb-24 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black dark:text-white tracking-tight">Current Inventory</h1>
          <button 
            onClick={() => {
              setEditingProduct(undefined);
              setCurrentView(View.ADD_PRODUCT);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 dark:shadow-none active:scale-95 transition-all"
          >
            <PlusIcon className="w-4 h-4" />
            Add Asset
          </button>
        </div>
        <div className="relative group">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
          <input 
            value={inventorySearch}
            onChange={(e) => setInventorySearch(e.target.value)}
            placeholder="Search by name, SKU, or category..." 
            className="w-full pl-11 pr-10 py-3.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm dark:text-white transition-all outline-none"
          />
          {inventorySearch && (
            <button 
              onClick={() => setInventorySearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {filteredInventory.map(product => (
          <div key={product.id} className="bg-white dark:bg-gray-900 p-4 rounded-[1.5rem] shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4 hover:border-indigo-100 dark:hover:border-indigo-900/30 transition-all group">
             <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800/50 rounded-2xl flex items-center justify-center border border-gray-100 dark:border-gray-700/50 overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
              {product.imageUrl ? <img src={product.imageUrl} className="w-full h-full object-cover" /> : <Box className="w-7 h-7 text-gray-300 dark:text-gray-600" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-[9px] font-mono px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-gray-500 dark:text-gray-400 truncate max-w-[120px] font-bold tracking-wider">{product.sku}</span>
                <span className="text-[9px] font-bold px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded uppercase tracking-tighter">{product.category}</span>
              </div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100 truncate text-sm">{product.name}</h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5 line-clamp-1">{product.description}</p>
            </div>
            <div className="text-right flex flex-col items-end gap-1.5 shrink-0">
              <div className="text-base font-black text-gray-900 dark:text-white">${product.price.toFixed(2)}</div>
              <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${product.quantity < 5 ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                {product.quantity} Units
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <button 
                  onClick={() => handleEditClick(product)}
                  className="p-2.5 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded-xl transition-all shadow-sm active:scale-95"
                  title="Edit Product"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setProductToDelete(product)}
                  className="p-2.5 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl transition-all shadow-sm active:scale-95"
                  title="Delete Product"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredInventory.length === 0 && (
          <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-gray-800 animate-in fade-in duration-700">
            <Package className="w-16 h-16 text-gray-200 dark:text-gray-800 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 font-bold px-6">
              {inventorySearch ? `No matches found for "${inventorySearch}"` : 'Your inventory is currently empty'}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderTeams = () => (
    <div className="space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col gap-1 px-1">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black dark:text-white tracking-tight">Organization Team</h1>
          <button 
            onClick={() => setIsInviteModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 dark:shadow-none active:scale-95 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            Invite
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Manage access and roles for your warehouse staff.</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total', count: teamMembers.length, icon: Users, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' },
          { label: 'Admins', count: teamMembers.filter(m => m.role !== 'Staff').length, icon: ShieldCheck, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Online', count: teamMembers.filter(m => m.status === 'online').length, icon: Activity, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' }
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 p-3 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center gap-1">
            <stat.icon className={`w-4 h-4 ${stat.color} p-1 rounded-lg`} />
            <div className="text-lg font-black dark:text-white">{stat.count}</div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <h2 className="text-xs font-bold text-gray-400 tracking-widest uppercase px-1">Active Members</h2>
        <div className="space-y-3">
          {teamMembers.map((member) => (
            <div key={member.id} className="bg-white dark:bg-gray-900 p-4 rounded-[1.5rem] border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4 hover:border-indigo-100 transition-all group">
              <div className="relative">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl overflow-hidden ${member.imageUrl ? '' : member.color}`}>
                  {member.imageUrl ? (
                    <img src={member.imageUrl} className="w-full h-full object-cover" />
                  ) : (
                    member.initial
                  )}
                </div>
                {member.status === 'online' && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-gray-900 rounded-full">
                    <div className="w-full h-full bg-emerald-500 rounded-full animate-ping opacity-75" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-bold text-gray-800 dark:text-gray-100 truncate">{member.name}</h3>
                  {member.role === 'Owner' && <Shield className="w-3 h-3 text-indigo-500" />}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter ${
                    member.role === 'Owner' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' :
                    member.role === 'Manager' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                    'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                  }`}>
                    {member.role}
                  </span>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500">• {member.lastActive}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all"
                  onClick={() => setMemberToEdit({ ...member })}
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                {member.role !== 'Owner' && (
                  <button 
                    onClick={() => setMemberToDelete(member)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                  >
                    <UserMinus className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-indigo-50 dark:bg-indigo-900/20 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 flex items-start gap-4">
        <div className="p-2.5 bg-white dark:bg-gray-800 rounded-xl text-indigo-600 dark:text-indigo-400 shadow-sm">
          <Mail className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-indigo-900 dark:text-indigo-300">Pending Invites</h4>
            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-white dark:bg-gray-800 px-2 py-0.5 rounded-full">
              {pendingInvites.length} Active
            </span>
          </div>
          <p className="text-xs text-indigo-700 dark:text-indigo-400 mt-1 leading-relaxed">
            Invitations sent to warehouse staff are awaiting acceptance.
          </p>
          <button 
            onClick={() => setIsPendingInvitesModalOpen(true)}
            className="mt-3 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            Manage Queue <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );

  /* Added missing LabelPreview component for live preview of label templates */
  const LabelPreview = () => {
    const previewProduct = products[0] || {
      name: 'Industrial Valve 400 Series',
      sku: 'SKU-9921-X',
      price: 1240.50,
      lastUpdated: new Date().toISOString()
    };

    const labelSizeClasses = {
      sm: 'w-32 h-32',
      md: 'w-64 h-32',
      lg: 'w-full h-40'
    }[printSize];

    return (
      <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Live Template Preview</span>
        </div>
        
        <div className={`${labelSizeClasses} ${printOptions.labelColor} rounded-xl shadow-2xl border border-gray-100 dark:border-gray-800 p-6 flex items-center gap-6 relative overflow-hidden transition-all duration-500`}>
          {printOptions.securityMark && (
            <div className="absolute -top-4 -right-4 w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center opacity-20 rotate-12">
              <ShieldIcon className="w-6 h-6 text-gray-400" />
            </div>
          )}
          
          <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
            <div>
              {printOptions.showName && (
                <h4 className="text-sm font-black text-gray-900 truncate uppercase tracking-tight">{previewProduct.name}</h4>
              )}
              {printOptions.showSku && (
                <div className="flex items-center gap-1.5 mt-1">
                  <Hash className="w-3 h-3 text-gray-400" />
                  <p className="text-[9px] font-mono text-gray-500 font-bold">{previewProduct.sku}</p>
                </div>
              )}
            </div>
            
            <div className="space-y-1">
              {printOptions.showPrice && (
                <div className="text-lg font-black text-indigo-600">${previewProduct.price.toLocaleString()}</div>
              )}
              {printOptions.showDate && (
                <div className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">
                  {new Date(previewProduct.lastUpdated).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>

          <div className="shrink-0 flex flex-col items-center justify-center gap-2">
            {printFormat === 'qr' ? (
              <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-50">
                <QrCode className="w-16 h-16 text-gray-900" />
              </div>
            ) : printFormat === 'barcode' ? (
              <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-50 flex items-end gap-[2px] h-20">
                {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3].map((w, i) => (
                  <div key={i} className="bg-gray-900" style={{ width: `${w}px`, height: '100%' }} />
                ))}
              </div>
            ) : (
              <div className="w-20 h-20 bg-gray-900 rounded-lg flex flex-col items-center justify-center text-white p-2">
                <Hash className="w-6 h-6 mb-1 opacity-50" />
                <span className="text-[10px] font-black tracking-tighter truncate w-full text-center">
                  {previewProduct.sku.split('-')[0]}
                </span>
              </div>
            )}
            <span className="text-[8px] font-bold text-gray-300 uppercase tracking-widest">{printFormat}</span>
          </div>
          
          {printTemplate === 'industrial' && (
            <div className="absolute inset-x-0 bottom-0 h-1.5 bg-gray-900/10" />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div className="max-w-lg mx-auto p-4 pt-8">
        {isScanning ? (
          <Scanner 
            onScan={handleScan} 
            onClose={() => setIsScanning(false)} 
          />
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

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-900 w-full max-sm rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300 border border-gray-100 dark:border-gray-800 text-center">
            <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-500" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Delete Asset?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
              Are you sure you want to remove <span className="font-bold text-gray-900 dark:text-gray-200">{productToDelete.name}</span>? This action is permanent and cannot be reversed.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={confirmDelete}
                className="w-full py-4 bg-red-600 text-white rounded-2xl font-bold shadow-xl shadow-red-200 dark:shadow-none hover:bg-red-700 active:scale-[0.98] transition-all"
              >
                Permanently Delete
              </button>
              <button 
                onClick={() => setProductToDelete(null)}
                className="w-full py-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-[0.98] transition-all"
              >
                Keep Asset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pending Invites Queue Modal */}
      {isPendingInvitesModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-gray-100 dark:border-gray-800 flex flex-col max-h-[80vh]">
            <div className="p-6 border-b dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                  <Mail className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white">Invitation Queue</h3>
              </div>
              <button onClick={() => setIsPendingInvitesModalOpen(false)} className="p-2 text-gray-400 rounded-xl hover:bg-gray-50 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {pendingInvites.length === 0 ? (
                <div className="text-center py-12">
                  <Mail className="w-12 h-12 text-gray-200 dark:text-gray-800 mx-auto mb-3" />
                  <p className="text-sm text-gray-400 font-medium">No pending invitations found.</p>
                </div>
              ) : (
                pendingInvites.map((invite) => (
                  <div key={invite.id} className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center justify-between group">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-sm text-gray-800 dark:text-gray-100 truncate">{invite.email}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/40 px-2 py-0.5 rounded">
                          {invite.role}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium italic">Sent {invite.sentAt}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-4">
                      <button 
                        onClick={() => handleResendInvite(invite.email)}
                        className="p-2.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-xl transition-all"
                        title="Resend Invite"
                      >
                        <RefreshCcw className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleCancelInvite(invite.id)}
                        className="p-2.5 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl transition-all"
                        title="Cancel Invite"
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-6 border-t dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
              <button 
                onClick={() => {
                  setIsPendingInvitesModalOpen(false);
                  setIsInviteModalOpen(true);
                }}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Invite New Member
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {memberToEdit && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300 border border-gray-100 dark:border-gray-800 flex flex-col items-center">
            <div className="relative group mb-6">
              <div className="w-24 h-24 rounded-3xl flex items-center justify-center font-bold text-3xl shadow-xl relative overflow-hidden">
                {memberToEdit.imageUrl ? (
                  <img src={memberToEdit.imageUrl} className="w-full h-full object-cover" />
                ) : (
                  <>
                    <div className={`absolute inset-0 opacity-10 ${memberToEdit.color.split(' ')[0]}`} />
                    <div className={`${memberToEdit.color} w-full h-full flex items-center justify-center`}>
                      {memberToEdit.name.substring(0, 2).toUpperCase()}
                    </div>
                  </>
                )}
              </div>
              <button 
                onClick={() => memberPhotoInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-100 dark:border-gray-700 text-indigo-600 hover:scale-110 transition-transform z-10"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input 
                type="file" 
                ref={memberPhotoInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleMemberPhotoChange} 
              />
            </div>
            
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-1">Edit Profile</h3>
            <p className="text-xs text-gray-500 font-medium mb-8 uppercase tracking-widest">Team Management Panel</p>

            <div className="w-full space-y-5 mb-8">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Employee ID</label>
                <div className="relative">
                  <Hash className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    value={memberToEdit.id}
                    onChange={(e) => setMemberToEdit({ ...memberToEdit, id: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 dark:text-white text-sm font-mono"
                    placeholder="E-001"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    value={memberToEdit.name}
                    onChange={(e) => setMemberToEdit({ ...memberToEdit, name: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 dark:text-white text-sm"
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Work Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    value={memberToEdit.email}
                    onChange={(e) => setMemberToEdit({ ...memberToEdit, email: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 dark:text-white text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Permission Role</label>
                <div className="flex gap-2">
                  {memberToEdit.role === 'Owner' ? (
                    <div className="w-full py-3 bg-indigo-50 dark:bg-indigo-900/30 border-2 border-indigo-100 dark:border-indigo-800 rounded-2xl flex items-center justify-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
                      <Shield className="w-4 h-4" /> Owner (Protected)
                    </div>
                  ) : (
                    (['Manager', 'Staff'] as const).map(role => (
                      <button 
                        key={role}
                        onClick={() => setMemberToEdit({ ...memberToEdit, role })}
                        className={`flex-1 py-3 rounded-2xl text-xs font-bold transition-all border-2 ${
                          memberToEdit.role === role 
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30' 
                            : 'border-gray-50 bg-gray-50 text-gray-400 dark:bg-gray-800 dark:border-gray-700'
                        }`}
                      >
                        {role}
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full">
              <button 
                onClick={handleUpdateMember}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
              <button 
                onClick={() => setMemberToEdit(null)}
                className="w-full py-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-[0.98] transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-900 w-full max-sm rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white">Invite Member</h3>
                <p className="text-xs text-gray-500 font-medium">Add a new collaborator to team.</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                <input 
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 dark:text-white text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Permission Role</label>
                <div className="flex gap-2">
                  {(['Manager', 'Staff'] as const).map(role => (
                    <button 
                      key={role}
                      onClick={() => setInviteRole(role)}
                      className={`flex-1 py-3 rounded-2xl text-xs font-bold transition-all border-2 ${
                        inviteRole === role 
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30' 
                          : 'border-gray-50 bg-gray-50 text-gray-400 dark:bg-gray-800 dark:border-gray-700'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full">
              <button 
                onClick={handleInvite}
                disabled={!inviteEmail}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                Send Invitation
              </button>
              <button 
                onClick={() => setIsInviteModalOpen(false)}
                className="w-full py-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-[0.98] transition-all"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Member Modal */}
      {memberToDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-900 w-full max-sm rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300 border border-gray-100 dark:border-gray-800 text-center">
            <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-500" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Remove Member?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
              Are you sure you want to revoke access for <span className="font-bold text-gray-900 dark:text-gray-200">{memberToDelete.name}</span>? They will lose all permissions instantly.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleRemoveMember}
                className="w-full py-4 bg-red-600 text-white rounded-2xl font-bold shadow-xl shadow-red-200 dark:shadow-none hover:bg-red-700 active:scale-[0.98] transition-all"
              >
                Confirm Removal
              </button>
              <button 
                onClick={() => setMemberToDelete(null)}
                className="w-full py-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-[0.98] transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Labels Modal */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-6 animate-in fade-in duration-300 overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 w-full max-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300 border border-gray-100 dark:border-gray-800 my-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center">
                <Printer className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white">Label Print Studio</h3>
                <p className="text-xs text-gray-500 font-medium">Configure batch asset labels.</p>
              </div>
            </div>

            <div className="space-y-6 mb-8">
              {/* Live Preview Section */}
              <LabelPreview />

              {/* Design Settings Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Design Template</label>
                  <select 
                    value={printTemplate}
                    onChange={(e) => setPrintTemplate(e.target.value as any)}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 border-2 border-gray-50 dark:border-gray-700 rounded-2xl text-[10px] font-bold text-gray-500 outline-none focus:border-indigo-500 transition-colors"
                  >
                    <option value="modern">Modern Professional</option>
                    <option value="industrial">Heavy Duty Industrial</option>
                    <option value="compact">Space Saving</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Label Background</label>
                  <div className="flex items-center gap-2 p-1.5 bg-gray-50 dark:bg-gray-800 rounded-2xl border-2 border-gray-50 dark:border-gray-700">
                    {[
                      { color: 'bg-white', label: 'White' },
                      { color: 'bg-yellow-100', label: 'Yellow' },
                      { color: 'bg-blue-50', label: 'Blue' },
                      { color: 'bg-red-50', label: 'Red' }
                    ].map((opt) => (
                      <button 
                        key={opt.color}
                        onClick={() => setPrintOptions(prev => ({...prev, labelColor: opt.color}))}
                        className={`w-6 h-6 rounded-full border-2 transition-all ${opt.color} ${printOptions.labelColor === opt.color ? 'border-indigo-600 scale-110' : 'border-transparent'}`}
                        title={opt.label}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Code Format Selection */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Label Code Format</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'qr', label: 'QR Code', icon: QrCode },
                    { id: 'barcode', label: 'Barcode', icon: Maximize2 },
                    { id: 'tag', label: 'Asset Tag', icon: Hash }
                  ].map((fmt) => (
                    <button 
                      key={fmt.id}
                      onClick={() => setPrintFormat(fmt.id as any)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all ${
                        printFormat === fmt.id 
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600' 
                          : 'border-gray-50 bg-gray-50 text-gray-400 dark:bg-gray-800 dark:border-gray-700'
                      }`}
                    >
                      <fmt.icon className="w-4 h-4" />
                      <span className="text-[10px] font-bold">{fmt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Asset Selection */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Asset Scope</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'all', label: 'All', icon: FileStack },
                    { id: 'recent', label: 'Recent', icon: RefreshCcw },
                    { id: 'custom', label: 'Filter', icon: Search }
                  ].map((opt) => (
                    <button 
                      key={opt.id}
                      onClick={() => setPrintSelection(opt.id as any)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all ${
                        printSelection === opt.id 
                          ? 'border-amber-600 bg-amber-50 dark:bg-amber-900/30 text-amber-600' 
                          : 'border-gray-50 bg-gray-50 text-gray-400 dark:bg-gray-800 dark:border-gray-700'
                      }`}
                    >
                      <opt.icon className="w-4 h-4" />
                      <span className="text-[10px] font-bold">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Advanced Options Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Copies</label>
                  <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 p-2 rounded-2xl border dark:border-gray-700">
                    <button 
                      onClick={() => setPrintCopies(Math.max(1, printCopies - 1))}
                      className="p-1.5 bg-white dark:bg-gray-700 rounded-lg text-gray-500 shadow-sm"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="flex-1 text-center font-black text-sm dark:text-white">{printCopies}</span>
                    <button 
                      onClick={() => setPrintCopies(printCopies + 1)}
                      className="p-1.5 bg-white dark:bg-gray-700 rounded-lg text-gray-500 shadow-sm"
                    >
                      <PlusIcon className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Size</label>
                  <select 
                    value={printSize}
                    onChange={(e) => setPrintSize(e.target.value as any)}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 border-2 border-gray-50 dark:border-gray-700 rounded-2xl text-[10px] font-bold text-gray-500 outline-none focus:border-indigo-500 transition-colors"
                  >
                    <option value="sm">1" x 1" (Small)</option>
                    <option value="md">2" x 1" (Standard)</option>
                    <option value="lg">4" x 2" (Large)</option>
                  </select>
                </div>
              </div>

              {/* Detail Toggles */}
              <div className="grid grid-cols-2 gap-2 bg-gray-50/50 dark:bg-gray-800/50 p-4 rounded-3xl border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between col-span-1">
                  <div className="flex items-center gap-2">
                    <Type className="w-3 h-3 text-gray-400" />
                    <span className="text-[9px] font-bold text-gray-500 uppercase">Name</span>
                  </div>
                  <button 
                    onClick={() => setPrintOptions(prev => ({...prev, showName: !prev.showName}))}
                    className={`w-9 h-4.5 rounded-full flex items-center px-0.5 transition-colors ${printOptions.showName ? 'bg-indigo-600' : 'bg-gray-300'}`}
                  >
                    <div className={`w-3.5 h-3.5 bg-white rounded-full transition-transform ${printOptions.showName ? 'translate-x-4.5' : 'translate-x-0'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between col-span-1">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-3 h-3 text-gray-400" />
                    <span className="text-[9px] font-bold text-gray-500 uppercase">Price</span>
                  </div>
                  <button 
                    onClick={() => setPrintOptions(prev => ({...prev, showPrice: !prev.showPrice}))}
                    className={`w-9 h-4.5 rounded-full flex items-center px-0.5 transition-colors ${printOptions.showPrice ? 'bg-indigo-600' : 'bg-gray-300'}`}
                  >
                    <div className={`w-3.5 h-3.5 bg-white rounded-full transition-transform ${printOptions.showPrice ? 'translate-x-4.5' : 'translate-x-0'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between col-span-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    <span className="text-[9px] font-bold text-gray-500 uppercase">Date</span>
                  </div>
                  <button 
                    onClick={() => setPrintOptions(prev => ({...prev, showDate: !prev.showDate}))}
                    className={`w-9 h-4.5 rounded-full flex items-center px-0.5 transition-colors ${printOptions.showDate ? 'bg-indigo-600' : 'bg-gray-300'}`}
                  >
                    <div className={`w-3.5 h-3.5 bg-white rounded-full transition-transform ${printOptions.showDate ? 'translate-x-4.5' : 'translate-x-0'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between col-span-1">
                  <div className="flex items-center gap-2">
                    <ShieldIcon className="w-3 h-3 text-gray-400" />
                    <span className="text-[9px] font-bold text-gray-500 uppercase">Secure</span>
                  </div>
                  <button 
                    onClick={() => setPrintOptions(prev => ({...prev, securityMark: !prev.securityMark}))}
                    className={`w-9 h-4.5 rounded-full flex items-center px-0.5 transition-colors ${printOptions.securityMark ? 'bg-indigo-600' : 'bg-gray-300'}`}
                  >
                    <div className={`w-3.5 h-3.5 bg-white rounded-full transition-transform ${printOptions.securityMark ? 'translate-x-4.5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={() => {
                  alert(`Queueing ${products.length} labels for printing (x${printCopies} copies)...`);
                  setIsPrintModalOpen(false);
                }}
                disabled={products.length === 0}
                className="w-full py-4 bg-amber-600 text-white rounded-2xl font-bold shadow-xl shadow-amber-200 dark:shadow-none hover:bg-amber-700 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Generate {products.length * printCopies} Labels
              </button>
              <button 
                onClick={() => setIsPrintModalOpen(false)}
                className="w-full py-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-[0.98] transition-all"
              >
                Close Studio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Bar */}
      {!isScanning && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-4 py-3 flex justify-around items-center shadow-[0_-4px_20px_rgba(0,0,0,0.05)] dark:shadow-none z-30 max-w-lg mx-auto">
          <button 
            onClick={() => setCurrentView(View.DASHBOARD)}
            className={`flex flex-col items-center gap-1 transition-all ${currentView === View.DASHBOARD ? 'text-indigo-600 dark:text-indigo-400 scale-110' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600'}`}
          >
            <LayoutDashboard className="w-6 h-6" />
            <span className="text-[9px] font-bold tracking-tight">DASHBOARD</span>
          </button>
          
          <button 
            onClick={() => setCurrentView(View.INVENTORY)}
            className={`flex flex-col items-center gap-1 transition-all ${currentView === View.INVENTORY ? 'text-indigo-600 dark:text-indigo-400 scale-110' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600'}`}
          >
            <Package className="w-6 h-6" />
            <span className="text-[9px] font-bold tracking-tight">INVENTORY</span>
          </button>

          <button 
            onClick={() => {
              setIsScanning(true);
              setEditingProduct(undefined);
            }}
            className="flex items-center justify-center w-14 h-14 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none -mt-10 border-4 border-gray-50 dark:border-gray-950 active:scale-95 transition-all hover:bg-indigo-700 z-50"
          >
            <Scan className="w-7 h-7" />
          </button>

          <button 
            onClick={() => setCurrentView(View.TEAMS)}
            className={`flex flex-col items-center gap-1 transition-all ${currentView === View.TEAMS ? 'text-indigo-600 dark:text-indigo-400 scale-110' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600'}`}
          >
            <Users className="w-6 h-6" />
            <span className="text-[9px] font-bold tracking-tight">TEAMS</span>
          </button>

          <button 
            onClick={() => setCurrentView(View.SETTINGS)}
            className={`flex flex-col items-center gap-1 transition-all ${currentView === View.SETTINGS ? 'text-indigo-600 dark:text-indigo-400 scale-110' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600'}`}
          >
            <Settings className="w-6 h-6" />
            <span className="text-[9px] font-bold tracking-tight">SETTINGS</span>
          </button>
        </nav>
      )}
    </div>
  );
};

export default App;
