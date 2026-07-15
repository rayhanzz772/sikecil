import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  MapPin, 
  Building2, 
  Baby, 
  FileText,
  Activity,
  LogOut,
  BrainCircuit,
  ShieldCheck
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  
  const adminLinks = [
    { to: '/admin/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/admin/roles', icon: <ShieldCheck size={20} />, label: 'Role Management' },
    { to: '/admin/users', icon: <Users size={20} />, label: 'User Management' },
    { to: '/admin/villages', icon: <MapPin size={20} />, label: 'Master Desa' },
    { to: '/admin/posyandu', icon: <Building2 size={20} />, label: 'Master Posyandu' },
    { to: '/admin/children', icon: <Baby size={20} />, label: 'Data Anak' },
    { to: '/admin/reports', icon: <FileText size={20} />, label: 'Laporan' },
  ];

  const nakesLinks = [
    { to: '/nakes/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/nakes/children', icon: <Baby size={20} />, label: 'Data Anak' },
    { to: '/nakes/measurements', icon: <Activity size={20} />, label: 'Input Pengukuran' },
    { to: '/nakes/history', icon: <FileText size={20} />, label: 'Riwayat & Grafik' },
    { to: '/nakes/prediction', icon: <BrainCircuit size={20} />, label: 'Prediksi AI' },
  ];

  const links = user?.role === 'admin' ? adminLinks : nakesLinks;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-screen flex flex-col fixed left-0 top-0">
      <div className="p-6 border-b border-slate-100 flex items-center gap-3">
        <div className="w-8 h-8 bg-sky-600 rounded-lg flex items-center justify-center">
          <Baby className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-extrabold text-xl text-slate-800 tracking-tight">SiKecil</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{user?.role === 'admin' ? 'Admin Panel' : 'Posyandu Panel'}</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => 
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive 
                ? 'bg-sky-50 text-sky-700' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`
            }
          >
            {link.icon}
            {link.label}
          </NavLink>
        ))}
      </div>

      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-3 px-3 py-3 bg-slate-50 rounded-xl mb-3">
          <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-bold uppercase">
            {user?.name?.charAt(0) || user?.username?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-bold text-slate-800 truncate">{user?.name || user?.username || 'User'}</p>
            <p className="text-[10px] font-semibold text-slate-500 uppercase">{user?.role}</p>
          </div>
        </div>
        <button 
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
        >
          <LogOut size={16} />
          Keluar
        </button>
      </div>
    </aside>
  );
};
