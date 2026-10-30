import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Bell,
  ShieldCheck,
  Building2,
  Menu,
  X,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  Sparkles,
  KeyRound,
  Laptop,
} from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
  onNavigate: (section: string) => void;
  onOpen2FAModal: () => void;
  onOpenLicencaModal?: () => void;
  onOpenWindowsModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onNavigate,
  onOpen2FAModal,
  onOpenLicencaModal,
  onOpenWindowsModal,
}) => {
  const {
    empresa,
    notificacoes,
    marcarNotificacaoLida,
    marcarTodasNotificacoesLidas,
    doisFatoresAtivo,
    usuarioAtual,
    licenca,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notificacoes.filter(n => !n.lida).length;

  const solicitarPushNotification = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification('ECHpro Notificações Ativadas', {
            body: 'Você receberá alertas críticos de folha, tributos e conciliação bancária em tempo real.',
            icon: '/vite.svg',
          });
        }
      });
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-red-700 border-b border-red-800 text-white shadow-md">
      <div className="px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex items-center justify-between gap-4">
          {/* Esquerda: Logo + Botão Menu Mobile */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-lg text-red-100 hover:text-white hover:bg-red-800 focus:outline-none lg:hidden cursor-pointer"
              aria-label="Abrir Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div
              onClick={() => onNavigate('dashboard')}
              className="cursor-pointer flex items-center gap-2.5 group"
            >
              <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-md font-black text-red-700 tracking-wider text-base">
                E
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg tracking-tight text-white">
                    ECHpro
                  </span>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-red-800 text-white border border-red-600">
                    ERP & RH
                  </span>
                </div>
                <p className="text-[11px] text-red-100 hidden sm:block leading-none">
                  Contabilidade & Recursos Humanos Integrados
                </p>
              </div>
            </div>
          </div>

          {/* Centro: Informações da Empresa Ativa */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-800/90 border border-red-600/80 text-xs text-white shadow-inner">
            <Building2 className="w-4 h-4 text-red-200 flex-shrink-0" />
            <div className="truncate max-w-[280px]">
              <span className="font-semibold text-white">{empresa.nome}</span>
              <span className="text-red-200 ml-1.5">NUIT: {empresa.nuit}</span>
            </div>
            <span className="ml-1 px-1.5 py-0.5 rounded bg-white text-red-700 font-bold font-mono text-[10px] shadow-xs">
              {empresa.moeda}
            </span>
          </div>

          {/* Direita: Instalador Windows, Chave Ativação, Segurança 2FA, Notificações */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Botão Instalador Windows 10/11 */}
            {onOpenWindowsModal && (
              <button
                onClick={onOpenWindowsModal}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all bg-red-800/80 hover:bg-red-800 text-white border border-red-600/80 shadow-xs cursor-pointer"
                title="Baixar Instalador para Windows 10 e Windows 11"
              >
                <Laptop className="w-3.5 h-3.5 text-red-200" />
                <span className="hidden md:inline">Instalar Windows 10/11</span>
                <span className="md:hidden">Win 10/11</span>
              </button>
            )}

            {/* Chave de Ativação */}
            {onOpenLicencaModal && (
              <button
                onClick={onOpenLicencaModal}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all bg-red-800/80 hover:bg-red-800 text-white border border-red-600/80 shadow-xs cursor-pointer"
                title={`Chave de Licença: ${licenca.chave} (${licenca.status})`}
              >
                <KeyRound className="w-3.5 h-3.5 text-red-200" />
                <span className="hidden lg:inline">{licenca.chave.slice(0, 11)}...</span>
                <span className="lg:hidden text-[11px]">Licença</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </button>
            )}

            {/* Status de Segurança 2FA */}
            <button
              onClick={onOpen2FAModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-white text-red-700 hover:bg-red-50 shadow-xs cursor-pointer"
              title="Status de Segurança 2FA e Criptografia"
            >
              <ShieldCheck className="w-4 h-4 text-red-600" />
              <span className="hidden sm:inline">
                {doisFatoresAtivo ? '2FA Ativo' : 'Ativar 2FA'}
              </span>
              <Lock className="w-3 h-3 text-red-500 ml-0.5" />
            </button>

            {/* Sino de Notificações */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg text-red-100 hover:text-white hover:bg-red-800 transition-colors cursor-pointer"
                aria-label="Notificações"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-extrabold text-red-700 bg-white rounded-full shadow-md animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Popover de Notificações */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 text-slate-900 overflow-hidden z-50">
                  <div className="p-3 bg-red-50 border-b border-red-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-red-600" />
                      <span className="font-bold text-sm text-slate-800">
                        Central de Alertas & Notificações
                      </span>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-100 text-red-700 rounded border border-red-200">
                          {unreadCount} pendente{unreadCount > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={marcarTodasNotificacoesLidas}
                        className="text-xs text-red-600 hover:text-red-700 font-semibold cursor-pointer"
                      >
                        Marcar lidas
                      </button>
                    )}
                  </div>

                  <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
                    {notificacoes.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 text-xs">
                        Nenhuma notificação no momento.
                      </div>
                    ) : (
                      notificacoes.map(n => (
                        <div
                          key={n.id}
                          onClick={() => {
                            marcarNotificacaoLida(n.id);
                            if (n.linkAcao) {
                              onNavigate(n.linkAcao);
                              setShowNotifications(false);
                            }
                          }}
                          className={`p-3 text-xs cursor-pointer transition-colors hover:bg-red-50/60 ${
                            !n.lida ? 'bg-red-50/30 font-medium' : 'text-slate-500'
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            {n.tipo === 'critico' && (
                              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                            )}
                            {n.tipo === 'aviso' && (
                              <Clock className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                            )}
                            {n.tipo === 'sucesso' && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                            )}
                            {n.tipo === 'info' && (
                              <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-slate-800">
                                  {n.titulo}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {n.data.slice(11, 16)}
                                </span>
                              </div>
                              <p className="mt-1 text-slate-600 leading-relaxed text-[11px]">
                                {n.mensagem}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px]">
                    <button
                      onClick={solicitarPushNotification}
                      className="text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Ativar Push no Navegador
                    </button>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Perfil do Usuário */}
            <div className="flex items-center gap-2 pl-2 border-l border-red-600">
              <div className="w-8 h-8 rounded-full bg-white text-red-700 flex items-center justify-center font-black text-xs shadow-xs ring-2 ring-red-800">
                {usuarioAtual.nome
                  .split(' ')
                  .map(n => n[0])
                  .slice(0, 2)
                  .join('')}
              </div>
              <div className="hidden xl:block text-left">
                <p className="text-xs font-semibold text-white leading-none truncate max-w-[130px]">
                  {usuarioAtual.nome}
                </p>
                <p className="text-[10px] text-red-200 mt-0.5 truncate max-w-[130px]">
                  {usuarioAtual.cargo}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
