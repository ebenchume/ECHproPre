/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ContabilidadeView } from './components/ContabilidadeView';
import { PayrollView } from './components/PayrollView';
import { FeriasBeneficiosView } from './components/FeriasBeneficiosView';
import { ESocialFiscalView } from './components/ESocialFiscalView';
import { BancosView } from './components/BancosView';
import { RelatoriosView } from './components/RelatoriosView';
import { AuditoriaSegurancaView } from './components/AuditoriaSegurancaView';
import { SuporteChatView } from './components/SuporteChatView';
import { TwoFactorModal } from './components/TwoFactorModal';
import { AtivacaoLicencaModal } from './components/AtivacaoLicencaModal';
import { InstaladorWindowsModal } from './components/InstaladorWindowsModal';
import { LoginModal } from './components/LoginModal';
import {
  LayoutDashboard,
  Calculator,
  Users,
  Landmark,
  Headphones,
  UserCheck,
  ShieldAlert,
  WifiOff,
} from 'lucide-react';

function AppContent() {
  const { estaAutenticado, usuarioAtual } = useApp();
  const [currentSection, setCurrentSection] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [isLicencaModalOpen, setIsLicencaModalOpen] = useState(false);
  const [isWindowsModalOpen, setIsWindowsModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isNovoLancamentoOpen, setIsNovoLancamentoOpen] = useState(false);

  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-blue-950 dark:text-slate-100 flex flex-col font-sans selection:bg-red-600 selection:text-white transition-colors duration-200">
      {/* Header Fixo no Topo */}
      <Header
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onNavigate={section => setCurrentSection(section)}
        onOpen2FAModal={() => setIs2FAModalOpen(true)}
        onOpenLicencaModal={() => setIsLicencaModalOpen(true)}
        onOpenWindowsModal={() => setIsWindowsModalOpen(true)}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
      />

      {/* Layout Principal: Sidebar + Conteúdo */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          currentSection={currentSection}
          onNavigate={section => setCurrentSection(section)}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onOpenLicencaModal={() => setIsLicencaModalOpen(true)}
          onOpenWindowsModal={() => setIsWindowsModalOpen(true)}
          onOpenLoginModal={() => setIsLoginModalOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-20 lg:pb-8">
          {currentSection === 'dashboard' && (
            <Dashboard
              onNavigate={section => setCurrentSection(section)}
              onOpenNovoLancamento={() => {
                setCurrentSection('contabilidade');
                setIsNovoLancamentoOpen(true);
              }}
            />
          )}

          {currentSection === 'contabilidade' && (
            <ContabilidadeView
              isNovoLancamentoModalOpen={isNovoLancamentoOpen}
              onCloseNovoLancamentoModal={() => setIsNovoLancamentoOpen(false)}
            />
          )}

          {currentSection === 'folha' && <PayrollView />}

          {currentSection === 'ferias' && <FeriasBeneficiosView />}

          {currentSection === 'esocial' && <ESocialFiscalView />}

          {currentSection === 'bancos' && <BancosView />}

          {currentSection === 'relatorios' && <RelatoriosView />}

          {currentSection === 'auditoria' && <AuditoriaSegurancaView />}

          {currentSection === 'suporte' && <SuporteChatView />}
        </main>
      </div>

      {/* Barra de Navegação Rápida para Dispositivos Móveis */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 lg:hidden flex items-center justify-around py-2 px-1 shadow-lg">
        <button
          onClick={() => setCurrentSection('dashboard')}
          className={`flex flex-col items-center gap-1 p-1 text-[10px] ${
            currentSection === 'dashboard' ? 'text-red-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Painel</span>
        </button>

        <button
          onClick={() => setCurrentSection('contabilidade')}
          className={`flex flex-col items-center gap-1 p-1 text-[10px] ${
            currentSection === 'contabilidade' ? 'text-red-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Contab.</span>
        </button>

        <button
          onClick={() => setCurrentSection('folha')}
          className={`flex flex-col items-center gap-1 p-1 text-[10px] ${
            currentSection === 'folha' ? 'text-red-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Folha/RH</span>
        </button>

        <button
          onClick={() => setCurrentSection('bancos')}
          className={`flex flex-col items-center gap-1 p-1 text-[10px] ${
            currentSection === 'bancos' ? 'text-red-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Landmark className="w-4 h-4" />
          <span>Bancos</span>
        </button>

        <button
          onClick={() => setCurrentSection('suporte')}
          className={`flex flex-col items-center gap-1 p-1 text-[10px] ${
            currentSection === 'suporte' ? 'text-red-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Headphones className="w-4 h-4" />
          <span>Suporte</span>
        </button>
      </nav>

      {/* Modal 2FA */}
      <TwoFactorModal
        isOpen={is2FAModalOpen}
        onClose={() => setIs2FAModalOpen(false)}
      />

      {/* Modal Chave de Ativação & Licenciamento */}
      <AtivacaoLicencaModal
        isOpen={isLicencaModalOpen}
        onClose={() => setIsLicencaModalOpen(false)}
      />

      {/* Modal Instalador Windows 10/11 Executável & PWA */}
      <InstaladorWindowsModal
        isOpen={isWindowsModalOpen}
        onClose={() => setIsWindowsModalOpen(false)}
      />

      {/* Modal de Login & Troca de Utilizador (Multi-Contas) */}
      <LoginModal
        isOpen={isLoginModalOpen || !estaAutenticado}
        onClose={() => setIsLoginModalOpen(false)}
        isBloqueado={!estaAutenticado}
      />

      {/* Indicador Flutuante de Modo Offline */}
      {!isOnline && (
        <div className="fixed bottom-14 lg:bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-xl bg-amber-500 text-slate-950 px-3.5 py-2 text-xs font-bold shadow-2xl border border-amber-300 animate-pulse">
          <WifiOff className="w-4 h-4 text-slate-950 flex-shrink-0" />
          <span>Modo Offline Ativo — Operando localmente sem internet. Todos os lançamentos e dados de contabilidade/RH estão seguros no dispositivo.</span>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
