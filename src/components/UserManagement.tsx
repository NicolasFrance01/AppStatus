"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Plus, 
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Pencil
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  getUsers, 
  createUser, 
  deleteUser, 
  updateUserRole,
  updateUser 
} from "@/lib/user-actions";
import { Role } from "@/generated/client";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  createdAt: Date;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Form state
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("READER");

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await getUsers();
      setUsers(data as any);
    } catch (err) {
      setError("No se pudieron cargar los usuarios.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsActionLoading(true);
    setError(null);
    try {
      if (editingUserId) {
        await updateUser(editingUserId, { email, name, password, role });
        setSuccess("Usuario actualizado correctamente.");
      } else {
        await createUser({ email, name, password, role });
        setSuccess("Usuario creado correctamente.");
      }
      setShowAddModal(false);
      resetForm();
      loadUsers();
    } catch (err: any) {
      setError(err.message || "Error al guardar usuario.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    setIsActionLoading(true);
    setError(null);
    try {
      await deleteUser(id);
      setSuccess("Usuario eliminado.");
      setConfirmDeleteId(null);
      loadUsers();
    } catch (err: any) {
      setError(err.message || "Error al eliminar usuario.");
      setConfirmDeleteId(null);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleUpdateRole = async (id: string, newRole: Role) => {
    setIsActionLoading(true);
    try {
      await updateUserRole(id, newRole);
      setSuccess("Rol actualizado.");
      loadUsers();
    } catch (err: any) {
      setError(err.message || "Error al actualizar rol.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const openEditModal = (user: User) => {
    setEditingUserId(user.id);
    setEmail(user.email);
    setName(user.name || "");
    setPassword(""); 
    setRole(user.role);
    setShowAddModal(true);
    setError(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
    setError(null);
  };

  const resetForm = () => {
    setEmail("");
    setName("");
    setPassword("");
    setRole("READER");
    setEditingUserId(null);
  };

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Users size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Usuarios del Sistema</h2>
            <p className="text-sm text-slate-500 font-medium">Gestiona quién puede acceder y sus niveles de permiso.</p>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-200 transition-all hover:bg-slate-800 active:scale-[0.98]"
        >
          <UserPlus size={18} />
          <span>Nuevo Usuario</span>
        </button>
      </div>

      {/* Notifications */}
      <div className="fixed top-20 right-8 z-[100] space-y-2 pointer-events-none">
        {success && (
          <div className="flex items-center gap-2 bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-xl shadow-emerald-100 animate-in slide-in-from-right-4 duration-300">
            <CheckCircle2 size={18} />
            <span className="font-bold">{success}</span>
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 bg-rose-500 text-white px-6 py-3 rounded-2xl shadow-xl shadow-rose-100 animate-in slide-in-from-right-4 duration-300">
            <AlertCircle size={18} />
            <span className="font-bold">{error}</span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Usuario</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Email</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Rol de Acceso</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <Loader2 className="animate-spin mx-auto text-blue-600 mb-2" size={32} />
                    <p className="text-slate-400 font-medium tracking-tight">Cargando usuarios...</p>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <Users className="mx-auto text-slate-200 mb-4" size={48} />
                    <h3 className="text-lg font-bold text-slate-900">No hay usuarios</h3>
                    <p className="text-slate-500">Comienza agregando el primer usuario.</p>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  confirmDeleteId === user.id ? (
                    /* --- Inline Delete Confirmation Row --- */
                    <tr key={user.id} className="bg-rose-50 border-y border-rose-100">
                      <td colSpan={3} className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <AlertTriangle size={18} className="text-rose-500 shrink-0" />
                          <p className="text-sm font-bold text-rose-700">
                            ¿Eliminar a <span className="underline">{user.name || user.email}</span>? Esta acción no se puede deshacer.
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-3 py-1.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={isActionLoading}
                            className="px-3 py-1.5 text-sm font-bold bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-colors disabled:opacity-60 flex items-center gap-1.5"
                          >
                            {isActionLoading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    /* --- Normal User Row --- */
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors text-lg font-black text-slate-400 uppercase">
                            {(user.name?.[0] || user.email[0])}
                          </div>
                          <span className="font-bold text-slate-900">{user.name || "—"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">{user.email}</td>
                      <td className="px-6 py-4">
                        <select
                          value={user.role}
                          onChange={(e) => handleUpdateRole(user.id, e.target.value as Role)}
                          className={cn(
                            "appearance-none bg-transparent font-bold py-1 px-3 rounded-full border-2 transition-all focus:outline-none cursor-pointer",
                            user.role === "ADMIN" && "border-blue-100 text-blue-700 hover:bg-blue-50",
                            user.role === "DEVELOPER" && "border-emerald-100 text-emerald-700 hover:bg-emerald-50",
                            user.role === "READER" && "border-slate-200 text-slate-600 hover:bg-slate-50"
                          )}
                        >
                          <option value="ADMIN">ADMIN</option>
                          <option value="DEVELOPER">DEVELOPER</option>
                          <option value="READER">READER</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(user)}
                            className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                            title="Editar Usuario"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(user.id)}
                            className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                            title="Eliminar Usuario"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Añadir Usuario */}
      {showAddModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => { setShowAddModal(false); setError(null); resetForm(); }} />
          <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
                    {editingUserId ? "Editar Usuario" : "Registrar Usuario"}
                  </h3>
                  <p className="text-slate-500 text-sm font-medium">
                    {editingUserId ? "Modifica los datos o permisos del usuario." : "Asigna un nuevo integrante al equipo."}
                  </p>
                </div>
                <button 
                  onClick={() => { setShowAddModal(false); setError(null); resetForm(); }}
                  className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {error && (
                <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-sm">
                  <AlertCircle size={16} />
                  <span className="font-bold">{error}</span>
                </div>
              )}

              <form onSubmit={handleSaveUser} className="space-y-5">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Nombre Completo</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                      placeholder="Juan Pérez"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                      placeholder="usuario@algeiba.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Contraseña</label>
                    <input
                      type="password"
                      required={!editingUserId}
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium placeholder:text-slate-400"
                      placeholder={editingUserId ? "Dejar en blanco para conservar" : "Mínimo 6 caracteres"}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Rol de Permisos</label>
                    <div className="grid grid-cols-3 gap-3">
                      {(["ADMIN", "DEVELOPER", "READER"] as Role[]).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRole(r)}
                          className={cn(
                            "py-2.5 rounded-xl border-2 font-bold text-xs transition-all",
                            role === r 
                              ? (r === "ADMIN" ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100" : 
                                 r === "DEVELOPER" ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-100" :
                                 "bg-slate-900 border-slate-900 text-white")
                              : "border-slate-200 text-slate-500 hover:border-slate-300 bg-white"
                          )}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-400 ml-1 mt-1">
                      {role === "ADMIN" && "👑 Acceso total + gestión de usuarios"}
                      {role === "DEVELOPER" && "💻 Dashboard completo + sincronización de APIs"}
                      {role === "READER" && "👁 Solo estadísticas y resumen ejecutivo"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setShowAddModal(false); setError(null); resetForm(); }}
                    className="flex-1 px-5 py-3.5 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 border border-slate-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isActionLoading}
                    className="flex-[1.5] bg-blue-600 text-white px-5 py-3.5 rounded-2xl font-bold shadow-lg shadow-blue-100 transition-all hover:bg-blue-700 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {isActionLoading ? (
                      <><Loader2 className="animate-spin" size={18} /> <span>Guardando...</span></>
                    ) : (
                      <><Plus size={18} /><span>{editingUserId ? "Guardar Cambios" : "Crear Usuario"}</span></>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
