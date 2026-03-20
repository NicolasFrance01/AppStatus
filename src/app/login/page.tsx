"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { User, Lock, Loader2, AlertCircle, Send, X, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Help Modal State
  const [showHelp, setShowHelp] = useState(false);
  const [helpUser, setHelpUser] = useState("");
  const [helpMessage, setHelpMessage] = useState("");
  const [isHelpLoading, setIsHelpLoading] = useState(false);
  const [helpSuccess, setHelpSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error || "Credenciales inválidas. Por favor, reintente.");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError("Ocurrió un error inesperado.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleHelpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsHelpLoading(true);
    setError("");
    try {
      const res = await fetch('/api/help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: helpUser, message: helpMessage })
      });
      if (!res.ok) throw new Error();
      setHelpSuccess(true);
      setTimeout(() => {
        setShowHelp(false);
        setHelpSuccess(false);
        setHelpUser("");
        setHelpMessage("");
      }, 3000);
    } catch (e) {
      setError("No se pudo enviar el reporte. Inténtalo más tarde.");
    } finally {
      setIsHelpLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100/50 rounded-full blur-3xl" />

      <div className="w-full max-w-md px-4 relative z-10">
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-2xl p-8 sm:p-10">
          <div className="flex flex-col items-center mb-10">
            <div className="mb-4 transform transition-transform hover:scale-110">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="AppStatus Logo"
                width={88}
                height={88}
                className="drop-shadow-lg"
              />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Bienvenido</h1>
            <p className="text-slate-500 mt-2 text-center text-sm">
              Inicia sesión en <strong>GP-Pasajes AppStatus</strong>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-2 p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-sm animate-in fade-in zoom-in duration-300">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
                  Usuario
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-blue-500 transition-colors">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="@usuario"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
                  Contraseña
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-blue-500 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full bg-slate-900 text-white rounded-2xl py-4 font-bold shadow-lg shadow-slate-200 transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none group relative overflow-hidden",
                !isLoading && "hover:bg-blue-600 hover:shadow-blue-200"
              )}
            >
              <div className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Iniciando sesión...</span>
                  </>
                ) : (
                  <span>Entrar al Dashboard</span>
                )}
              </div>
            </button>

            <div className="text-center mt-4">
              <button 
                type="button" 
                onClick={() => setShowHelp(true)}
                className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors underline decoration-slate-300 hover:decoration-blue-600 underline-offset-4"
              >
                ¿Problemas para ingresar / Olvidé mi contraseña?
              </button>
            </div>
          </form>

          <div className="mt-10 text-center">
            <p className="text-xs text-slate-400 font-medium">
              GP-Pasaje - Algeiba - Nicolas France
            </p>
          </div>
        </div>
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowHelp(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-black text-slate-900">Solicitar Ayuda</h3>
                <p className="text-sm text-slate-500 mt-1">Enviaremos una alerta prioritaria a los administradores.</p>
              </div>
              <button onClick={() => setShowHelp(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full">
                <X size={20} />
              </button>
            </div>

            {helpSuccess ? (
              <div className="flex flex-col items-center justify-center py-8 text-center animate-in slide-in-from-bottom-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 size={32} />
                </div>
                <h4 className="text-lg font-bold text-slate-900">Alerta enviada</h4>
                <p className="text-slate-500 text-sm mt-2">Un administrador revisará tu caso pronto.</p>
              </div>
            ) : (
              <form onSubmit={handleHelpSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Tu Usuario</label>
                  <input
                    type="text"
                    required
                    value={helpUser}
                    onChange={(e) => setHelpUser(e.target.value)}
                    placeholder="@usuario"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Problema</label>
                  <textarea
                    required
                    rows={3}
                    value={helpMessage}
                    onChange={(e) => setHelpMessage(e.target.value)}
                    placeholder="Ej: Olvidé mi contraseña o me dice que expiró..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isHelpLoading}
                  className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl py-3.5 font-bold transition-all disabled:opacity-70 mt-4"
                >
                  {isHelpLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  <span>Enviar Alerta al Admin</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
