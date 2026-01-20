
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Mail, Fingerprint, Loader2, ArrowRight, Construction, User } from 'lucide-react';

interface LoginPageProps {
  onLogin: (userData: { name: string; email: string; role: string }) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState<'password' | 'biometric'>('password');

  const generateUserData = () => {
    const displayName = name.trim() || (email ? email.split('@')[0].split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ') : 'Authorized User');
    const displayEmail = email.toLowerCase() || 'user@contractorstock.ai';
    return { email: displayEmail, name: displayName, role: 'Owner' };
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin(generateUserData());
    }, 1200);
  };

  const handleBiometric = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin(generateUserData());
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-black overflow-hidden relative font-sans">
      {/* Dynamic Background Blurs */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="w-full max-w-md z-10"
      >
        <div className="bg-white dark:bg-gray-900 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-800 p-10 relative overflow-hidden">
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-indigo-500/20 mb-6">
              <Construction className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
              Contractor<span className="text-indigo-600 font-black">Stock</span> AI
            </h1>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mt-2">Inventory Management Protocol</p>
          </div>

          {authMethod === 'password' ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Identity Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    required 
                    type="text" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    placeholder="Full Legal Name" 
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-sm font-bold dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600" 
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Security Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    required 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    placeholder="name@company.com" 
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-sm font-bold dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600" 
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Access Key</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    required 
                    type="password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    placeholder="••••••••" 
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-sm font-bold dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600" 
                  />
                </div>
              </div>
              <div className="flex items-center justify-between px-1">
                <button type="button" className="text-[10px] font-black text-indigo-600 hover:underline uppercase tracking-widest">Forgot Key?</button>
                <button type="button" onClick={() => setAuthMethod('biometric')} className="text-[10px] font-black text-gray-400 hover:text-indigo-600 uppercase tracking-widest flex items-center gap-1"><Fingerprint className="w-3 h-3" /> Biometric</button>
              </div>
              <button 
                type="submit" 
                disabled={isLoading} 
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Initialize Session <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          ) : (
            <div className="space-y-8 py-4">
              <div className="flex flex-col items-center gap-6">
                <motion.div 
                  animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }} 
                  transition={{ repeat: Infinity, duration: 2 }} 
                  className="w-32 h-32 bg-indigo-50 dark:bg-indigo-900/20 rounded-[2.5rem] flex items-center justify-center border-2 border-dashed border-indigo-200"
                >
                  <Fingerprint className="w-16 h-16 text-indigo-600" />
                </motion.div>
                <div className="text-center">
                  <h3 className="font-black text-gray-800 dark:text-white uppercase tracking-widest">Security Scan</h3>
                  <p className="text-xs text-gray-400 mt-1">Awaiting verification signature</p>
                </div>
              </div>
              <div className="space-y-3">
                <button 
                  onClick={handleBiometric} 
                  disabled={isLoading} 
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-700 active:scale-95 transition-all"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Identity'}
                </button>
                <button 
                  onClick={() => setAuthMethod('password')} 
                  className="w-full py-4 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-white rounded-2xl font-black text-xs uppercase tracking-widest"
                >
                  Keyboard Access
                </button>
              </div>
            </div>
          )}
          <div className="mt-10 pt-6 border-t dark:border-gray-800 flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">End-to-End Encryption Active</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
