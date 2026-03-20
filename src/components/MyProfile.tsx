"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { 
  UserCircle, 
  Mail, 
  Lock, 
  Save, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck
} from "lucide-react";
import { updateMyProfile } from "@/lib/user-actions";
import { cn } from "@/lib/utils";

interface MyProfileProps {
  user: {
    id: string;
    email: string;
    name: string | null;
    username?: string;
    role?: string;
  };
  onUpdate?: () => void;
}

function MyProfile({ user, onUpdate }: MyProfileProps) {
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password && password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setIsLoading(true);
    try {
      await updateMyProfile({ email, password });
      setSuccess("Perfil actualizado con éxito.");
      setPassword("");
      setConfirmPassword("");
      if (onUpdate) {
        setTimeout(onUpdate, 2000);
      }
    } catch (err: any) {
      setError(err.message || "Error al actualizar el perfil.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
          <UserCircle size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Mi Perfil</h2>
          <p className="text-sm text-slate-500 font-medium">Gestiona tu información personal y credenciales de acceso.</p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 sm:p-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 gap-6">
              {/* Info Group */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck size={18} className="text-slate-400" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Información de Cuenta</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Nombre</label>
                    <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 text-slate-400 font-bold">
                      {user.name || "—"}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Usuario</label>
                    <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 text-blue-600 font-black">
                      {user.username}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email de Contacto</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 ml-1">Este es el correo donde recibirás alertas del sistema.</p>
                </div>
              </div>

              {/* Password Group */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <Lock size={18} className="text-slate-400" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Seguridad</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Nueva Contraseña</label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                        <Lock size={18} />
                      </div>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Confirmar</label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                        <Lock size={18} />
                      </div>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                      />
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 ml-1">Al cambiar tu contraseña se eliminará cualquier restricción de expiración temporal.</p>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-bold animate-in zoom-in-95">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm font-bold animate-in zoom-in-95">
                <CheckCircle2 size={18} />
                <span>{success}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 text-white rounded-2xl py-4 font-bold shadow-lg shadow-slate-200 hover:bg-blue-600 hover:shadow-blue-100 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <><Loader2 className="animate-spin" size={20} /> <span>Guardando...</span></>
              ) : (
                <><Save size={20} /> <span>Actualizar Perfil</span></>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default MyProfile;
