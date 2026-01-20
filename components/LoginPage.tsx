
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Mail, Fingerprint, Loader2, ArrowRight, Construction } from 'lucide-react';

interface LoginPageProps {
  onLogin: (userData: any) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState<'password' | 'biometric'>('password');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API Auth Latency
    setTimeout(() => {
      setIsLoading(false);
      onLogin({ email, name: 'Sarah Wilson', role: 'Owner' });
    }, 1500);
  };

  const handleBiometric = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin({ email: 'sarah@contractorstock.ai', name: 'Sarah Wilson', role: 'Owner' });
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-black overflow-hidden relative">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-gray-900 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-800 p-10 relative overflow-hidden">
          {/* Logo Section */}
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center shadow-xl shadow-indigo-500/20 mb-6">
              <Construction className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
              Contractor<span className="text-indigo-600 font-black">Stock</span> AI
            </h1>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mt-2">
              Secure Inventory Authority
            </p>
          </div>

          {authMethod === 'password' ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Employee ID / Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sarah@contractorstock.ai"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-sm font-bold dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Access Key
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    required
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-sm font-bold dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between px-1">
                <button type="button" className="text-[10px] font-black text-indigo-600 hover:underline uppercase tracking-widest">
                  Reset Key
                </button>
                <button 
                  type="button" 
                  onClick={() => setAuthMethod('biometric')}
                  className="text-[10px] font-black text-gray-400 hover:text-indigo-600 uppercase tracking-widest flex items-center gap-1"
                >
                  <Fingerprint className="w-3 h-3" /> Biometric
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>Authorize Access <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-8 py-4">
              <div className="flex flex-col items-center gap-6">
                <motion.div 
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-32 h-32 bg-indigo-50 dark:bg-indigo-900/20 rounded-[2.5rem] flex items-center justify-center border-2 border-dashed border-indigo-200 dark:border-indigo-800"
                >
                  <Fingerprint className="w-16 h-16 text-indigo-600" />
                </motion.div>
                <div className="text-center">
                  <h3 className="font-black text-gray-800 dark:text-white uppercase tracking-widest">Awaiting Biometrics</h3>
                  <p className="text-xs text-gray-400 font-medium mt-1">Simulated FaceID / TouchID Protocol</p>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleBiometric}
                  disabled={isLoading}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Simulate Match'}
                </button>
                <button
                  onClick={() => setAuthMethod('password')}
                  className="w-full py-4 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-gray-100 transition-all"
                >
                  Back to Password
                </button>
              </div>
            </div>
          )}

          {/* Footer Info */}
          <div className="mt-10 pt-6 border-t border-gray-50 dark:border-gray-800 flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
              End-to-End Encrypted Data Core
            </span>
          </div>
        </div>
        
        <p className="text-center mt-6 text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">
          Powered by Contractor Stock AI v2.1.0
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
