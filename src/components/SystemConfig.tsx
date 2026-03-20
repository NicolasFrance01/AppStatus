/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { X, Save, Clock, Power, Loader2, Info } from "lucide-react";

interface SystemConfigProps {
  onClose: () => void;
  onUpdate?: () => void;
}

export function SystemConfig({ onClose, onUpdate }: SystemConfigProps) {
  const [config, setConfig] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/config');
      const data = await res.json();
      if (res.ok) setConfig(data);
    } catch (err) {
      console.error(err);
      setError("Error al cargar configuración");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          syncIntervalMinutes: config.syncIntervalMinutes,
          autoSyncEnabled: config.autoSyncEnabled
        })
      });

      if (!res.ok) throw new Error("Error al guardar");
      
      setSuccess(true);
      if (onUpdate) onUpdate();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-900 text-white rounded-xl">
              <Clock size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Configuración de Tareas</h2>
              <p className="text-xs text-slate-500 font-medium">Programación interna de sincronización</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-6">
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3">
            <Info className="text-blue-600 shrink-0" size={20} />
            <p className="text-xs text-blue-800 leading-relaxed font-medium">
              Debido a las limitaciones del plan Hobby, el sistema utiliza <b>"Lazy Sync"</b>. La sincronización se activará automáticamente al ingresar al Dashboard si ha pasado el tiempo configurado.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-lg transition-colors",
                  config.autoSyncEnabled ? "bg-emerald-100 text-emerald-600" : "bg-slate-200 text-slate-500"
                )}>
                  <Power size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Sincronización Automática</p>
                  <p className="text-[10px] text-slate-500 font-medium uppercase">Activar/Desactivar tarea</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setConfig({ ...config, autoSyncEnabled: !config.autoSyncEnabled })}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                  config.autoSyncEnabled ? "bg-blue-600" : "bg-slate-300"
                )}
              >
                <span 
                  className={cn(
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                    config.autoSyncEnabled ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Frecuencia de Sincronización</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <Clock size={18} />
                </div>
                <select
                  value={config.syncIntervalMinutes}
                  onChange={(e) => setConfig({ ...config, syncIntervalMinutes: parseInt(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 block p-3 px-10 transition-all outline-none appearance-none font-medium"
                >
                  <option value={15}>Cada 15 minutos</option>
                  <option value={30}>Cada 30 minutos</option>
                  <option value={60}>Cada 1 hora</option>
                  <option value={120}>Cada 2 horas</option>
                  <option value={240}>Cada 4 horas</option>
                  <option value={360}>Cada 6 horas</option>
                  <option value={720}>Cada 12 horas</option>
                  <option value={1440}>Cada 24 horas</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                  <span className="text-[10px] font-black uppercase">Frecuencia</span>
                </div>
              </div>
            </div>
          </div>

          {error && <p className="text-rose-600 text-xs font-bold text-center animate-shake">{error}</p>}
          {success && <p className="text-emerald-600 text-xs font-bold text-center">✅ Configuración guardada</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all outline-none"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-[2] px-6 py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-70 active:scale-[0.98] outline-none"
            >
              {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              <span>{isSaving ? "Guardando..." : "Guardar Cambios"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Helper function for cn
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
