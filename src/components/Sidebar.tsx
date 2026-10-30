import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Calculator,
  Users,
  Palmtree,
  FileCheck2,
  Landmark,
  FileSpreadsheet,
  ShieldAlert,
  Headphones,
  X,
  ChevronRight,
  Sparkles,
  KeyRound,
  Laptop,
  Phone,
  Mail,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

interface SidebarProps {
  currentSection: string;
  onNavigate: (section: string) => void;
  isOpen: boolean;
  onClose: () => void;
  onOpenLicencaModal?: () => void;
  onOpenWindowsModal?: () => void;
  onOpenLoginModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentSection,
  onNavigate,
  isOpen,
  onClose,
  onOpenLicencaModal,
  onOpenWindowsModal,
  onOpenLoginModal,
}) => {
  const { usuarioAtual } = useApp();
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Painel Executivo',
      icon: LayoutDashboard,
      badge: null,
      desc: 'Métricas e Visão Geral',
    },
    {
      id: 'contabilidade',
      label: 'Contabilidade & PGC-NIRF',
      icon: Calculator,
      badge: 'Classes 1-8',
      desc: 'Lançamentos, Balancete, DRE & Fecho',
    },
    {
      id: 'folha',
      label: 'Folha & RH Automatizado',
      icon: Users,
      badge: 'Auto',
      desc: 'Processamento, INSS (7%), IRPS, Recibos',
    },
    {
      id: 'ferias',
      label: 'Férias & Benefícios',
      icon: Palmtree,
      badge: null,
      desc: 'Escalas, Abono 1/3, Saúde & Planos',
    },
    {
      id: 'esocial',
      label: 'eSocial & Fiscal',
      icon: FileCheck2,
      badge: 'Oficial',
      desc: 'Eventos S-1000 a S-2230, XML & Guias',
    },
    {
      id: 'bancos',
      label: 'Bancos & Fluxo de Caixa',
      icon: Landmark,
      badge: 'Tempo Real',
      desc: 'APIs Bancárias, Conciliação Auto',
    },
    {
      id: 'relatorios',
      label: 'Relatórios Personalizados',
      icon: FileSpreadsheet,
      badge: 'PDF',
      desc: 'Auditorias Mensais & Exportações',
    },
    {
      id: 'auditoria',
      label: 'Auditoria & Backups Auto',
      icon: ShieldAlert,
      badge: 'JSON/CSV',
      desc: 'Rotina Automática, 2FA & Exportações',
    },
    {
      id: 'suporte',
      label: 'Suporte Técnico Dedicado',
      icon: Headphones,
      badge: 'Chat Online',
      desc: 'Assistente Fiscal e Contábil',
    },
  ];

  return (
    <>
      {/* Overlay Mobile */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static shadow-sm ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Topo do Sidebar (visível no mobile) */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 lg:hidden bg-red-700 text-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white text-red-700 flex items-center justify-center font-black text-sm shadow-sm">
              E
            </div>
            <span className="font-bold text-white text-base">ECHpro ERP</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-red-100 hover:text-white hover:bg-red-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status de Conexão Segura & Banco em Tempo Real */}
        <div className="px-3.5 py-2.5 mx-3 my-2.5 rounded-xl bg-red-50/70 border border-red-100">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              <span className="text-slate-800 font-semibold">APIs Sincronizadas</span>
            </div>
            <span className="text-[10px] text-red-700 font-bold font-mono bg-white px-1.5 py-0.5 rounded border border-red-200">
              BIM / STB
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-600">
            <span>Criptografia:</span>
            <span className="text-slate-800 font-mono font-medium">AES-256-GCM</span>
          </div>
        </div>

        {/* Lista de Navegação */}
        <nav className="flex-1 px-3 py-1 space-y-1 overflow-y-auto">
          {menuItems.map(item => {
            const isActive = currentSection === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onClose();
                }}
                className={`w-full group text-left px-3 py-2.5 rounded-xl transition-all flex items-center justify-between relative cursor-pointer ${
                  isActive
                    ? 'bg-red-600 text-white shadow-md shadow-red-200 font-bold'
                    : 'text-slate-700 hover:bg-red-50/60 hover:text-red-700'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`p-1.5 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-500 group-hover:text-red-600 group-hover:bg-red-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="truncate text-left">
                    <p className="text-xs truncate leading-tight font-medium">{item.label}</p>
                    <p
                      className={`text-[10px] truncate leading-normal ${
                        isActive ? 'text-red-100' : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    >
                      {item.desc}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-red-100 text-red-700 border border-red-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight
                    className={`w-3.5 h-3.5 transition-transform ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-red-600'
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </nav>

        {/* Card do Utilizador Conectado */}
        <div className="px-3 pt-2.5 pb-1 border-t border-slate-200 bg-slate-50/70">
          <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Conta Conectada</span>
              <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-red-100 text-red-800 font-bold border border-red-200">
                {usuarioAtual.perfil.replace('_', ' ')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-xl ${usuarioAtual.avatarCor || 'bg-red-700'} text-white flex items-center justify-center font-bold text-xs flex-shrink-0`}>
                {usuarioAtual.nome.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-slate-900 text-xs truncate leading-tight">{usuarioAtual.nome}</p>
                <p className="text-[10px] text-slate-500 truncate">{usuarioAtual.cargo}</p>
              </div>
            </div>
            {onOpenLoginModal && (
              <button
                onClick={() => {
                  onOpenLoginModal();
                  onClose();
                }}
                className="w-full py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-700 text-[11px] font-bold border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Users className="w-3.5 h-3.5 text-red-600" /> Alternar Conta / Login
              </button>
            )}
          </div>
        </div>

        {/* Acesso Rápido: Ativação & Instalador Windows 10/11 */}
        <div className="px-3 py-2 border-t border-slate-200 bg-slate-50/50 space-y-1.5">
          {onOpenLicencaModal && (
            <button
              onClick={() => {
                onOpenLicencaModal();
                onClose();
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-red-300 hover:bg-red-50/50 text-slate-700 hover:text-red-700 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
            >
              <div className="flex items-center gap-2">
                <KeyRound className="w-3.5 h-3.5 text-red-600" />
                <span>Chave de Ativação</span>
              </div>
              <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                Ativada
              </span>
            </button>
          )}

          {onOpenWindowsModal && (
            <button
              onClick={() => {
                onOpenWindowsModal();
                onClose();
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-red-300 hover:bg-red-50/50 text-slate-700 hover:text-red-700 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
            >
              <div className="flex items-center gap-2">
                <Laptop className="w-3.5 h-3.5 text-red-600" />
                <span>Instalador Windows 10/11</span>
              </div>
              <span className="text-[9px] font-mono text-red-700 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                .EXE / .BAT
              </span>
            </button>
          )}
        </div>

        {/* Rodapé do Sidebar com Suporte Técnico Dedicado */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 space-y-2">
          {/* Card de Suporte Técnico Oficial Obrigatório */}
          <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-[11px] shadow-2xs">
            <div className="flex items-center justify-between text-slate-800 font-bold mb-1">
              <span className="flex items-center gap-1.5 text-red-700">
                <Phone className="w-3 h-3" /> Suporte Técnico
              </span>
              <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-1 rounded">24/7</span>
            </div>
            <a
              href="tel:+258827473434"
              className="font-extrabold text-slate-900 hover:text-red-700 block truncate"
            >
              +258 827473434
            </a>
            <a
              href="mailto:ebenchume@sapo.mz"
              className="text-slate-500 hover:text-red-700 block truncate text-[10px]"
            >
              ebenchume@sapo.mz
            </a>
          </div>

          <div className="p-2 rounded-xl bg-red-50/60 border border-red-100 flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-red-600" />
              <span className="font-bold text-slate-800">PGC-NIRF & eSocial</span>
            </div>
            <span className="font-mono font-bold text-red-700 bg-white px-1.5 py-0.5 rounded border border-red-200">
              v2.8 PRO
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
