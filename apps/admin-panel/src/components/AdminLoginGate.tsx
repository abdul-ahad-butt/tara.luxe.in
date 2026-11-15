import React, { useState } from 'react';
import { useAdmin } from '../context/AdminRealtimeContext';
import { BrandLogo } from './BrandLogo';
import { Lock, Mail, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';

export const AdminLoginGate: React.FC = () => {
  const { login } = useAdmin();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    const result = await login(username, password);
    setIsLoading(false);

    if (!result.success) {
      setErrorMsg(result.message);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-obsidian via-espresso to-obsidian text-ivory p-4 relative overflow-hidden font-sans">
      {/* Background luxury glow circles */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-gold/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md rounded-3xl glass-card border border-gold/30 shadow-luxury p-8 sm:p-10 space-y-8 animate-in fade-in zoom-in-95 duration-300">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <BrandLogo size={64} showText={false} />
          </div>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gold tracking-wide">
              Tara Luxe Admin Center
            </h1>
            <p className="text-xs font-mono text-ivory/60 uppercase tracking-widest mt-1">
              Authorized Access Only
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-ruby-stock/20 border border-ruby-stock/50 text-ruby-stock text-xs flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-ivory/70 mb-1.5">
              Admin Email / Username
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gold/60 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                required
                placeholder="Enter admin email or username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-obsidian border border-gold/30 rounded-xl pl-10 pr-4 py-2.5 text-xs text-ivory placeholder-ivory/30 focus:outline-none focus:border-gold transition-colors font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-ivory/70 mb-1.5">
              Admin Master Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gold/60 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter master password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-obsidian border border-gold/30 rounded-xl pl-10 pr-10 py-2.5 text-xs text-ivory placeholder-ivory/30 focus:outline-none focus:border-gold transition-colors font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-2.5 text-ivory/50 hover:text-gold p-0.5"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold-brushed via-gold to-gold-light hover:from-gold hover:to-gold-light text-obsidian font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-gold-glow transition-all disabled:opacity-50 cursor-pointer"
          >
            <span>{isLoading ? 'Authenticating...' : 'Enter Admin Center'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 text-center text-[10px] text-ivory/40">
          Protected by Tara Luxe 18k Security Layer • Real-Time SSE Connected
        </div>
      </div>
    </div>
  );
};
