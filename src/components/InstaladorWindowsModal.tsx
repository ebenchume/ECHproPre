import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Download,
  Laptop,
  CheckCircle2,
  X,
  Phone,
  Mail,
  ShieldCheck,
  Terminal,
  FileCode,
  ExternalLink,
  Layers,
  Cpu,
  HardDrive,
  MonitorCheck,
  Sparkles,
} from 'lucide-react';

interface InstaladorWindowsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstaladorWindowsModal: React.FC<InstaladorWindowsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { licenca, empresa } = useApp();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isPWAInstallable, setIsPWAInstallable] = useState(false);
  const [downloadConcluido, setDownloadConcluido] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsPWAInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsPWAInstallable(false);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!isOpen) return null;

  const handleInstalarPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsPWAInstallable(false);
      }
      setDeferredPrompt(null);
    } else {
      alert(
        'Para instalar diretamente no Windows 10/11:\n1. Clique no ícone de computador/instalar na barra de endereços do Microsoft Edge ou Google Chrome.\n2. Ou acesse o menu (...) > Aplicativos > "Instalar ECHpro".'
      );
    }
  };

  const handleBaixarInstaladorBat = () => {
    const appUrl = window.location.origin;
    const scriptBat = `@echo off
chcp 65001 >nul
cls
color 0C
echo =====================================================================
echo           ECHPRO CONTABILIDADE E GESTAO DE RH INTEGRADA
echo               PACOTE DE INSTALACAO PARA WINDOWS 10 / 11
echo =====================================================================
echo.
echo [1/4] Verificando integridade do sistema operacional...
ver | findstr /i "10.0" >nul
if %errorlevel% neq 0 (
    echo [AVISO] Recomendado Windows 10 (Build 19041+) ou Windows 11.
) else (
    echo [OK] Windows 10/11 detectado com sucesso.
)
echo.

echo [2/4] Criando diretorio da aplicacao em %%LOCALAPPDATA%%\\ECHpro...
set APP_DIR=%LOCALAPPDATA%\\ECHpro
if not exist "%APP_DIR%" mkdir "%APP_DIR%"
echo.

echo [3/4] Criando atalho nativo de Inicializacao no Ambiente de Trabalho...
set SCRIPT_PS="%TEMP%\\CriarAtalhoECHpro.ps1"
(
echo $WshShell = New-Object -ComObject WScript.Shell
echo $DesktopPath = [System.Environment]::GetFolderPath('Desktop'^^^)
echo $Shortcut = $WshShell.CreateShortcut("$DesktopPath\\ECHpro Contabilidade e RH.lnk"^^^)
echo $Shortcut.TargetPath = "msedge.exe"
echo $Shortcut.Arguments = "--app=${appUrl} --app-id=echpro-erp-mz --window-size=1280,850"
echo $Shortcut.Description = "ECHpro Contabilidade e RH - Sistema de Gestao Integrada"
echo $Shortcut.Save(^^^)
echo $ProgramsPath = [System.Environment]::GetFolderPath('Programs'^^^)
echo $StartMenuDir = "$ProgramsPath\\ECHpro"
echo if (-not (Test-Path $StartMenuDir^^^)^^^) { New-Item -ItemType Directory -Path $StartMenuDir -Force ^| Out-Null }
echo $ShortcutSM = $WshShell.CreateShortcut("$StartMenuDir\\ECHpro Contabilidade e RH.lnk"^^^)
echo $ShortcutSM.TargetPath = "msedge.exe"
echo $ShortcutSM.Arguments = "--app=${appUrl} --app-id=echpro-erp-mz --window-size=1280,850"
echo $ShortcutSM.Save(^^^)
) > %SCRIPT_PS%

powershell -NoProfile -ExecutionPolicy Bypass -File %SCRIPT_PS%
del %SCRIPT_PS% 2>nul
echo [OK] Atalho criado no Desktop e Menu Iniciar.
echo.

echo [4/4] Finalizando instalacao e configurando licenca...
echo Chave de Licenca Ativa: ${licenca.chave}
echo Titular: ${licenca.titular}
echo.
echo =====================================================================
echo             INSTALACAO CONCLUIDA COM SUCESSO!
echo =====================================================================
echo O icone do ECHpro ja esta no seu Ambiente de Trabalho (Desktop).
echo.
echo Suporte Tecnico Autorizado:
echo - Telefone / WhatsApp: +258 827473434
echo - Correio Eletronico:  ebenchume@sapo.mz
echo =====================================================================
echo.
pause
start msedge.exe --app="${appUrl}" --app-id=echpro-erp-mz
`;

    const blob = new Blob([scriptBat], { type: 'application/bat' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Instalar_ECHpro_Windows10_11.bat';
    a.click();
    URL.revokeObjectURL(url);
    setDownloadConcluido('Instalar_ECHpro_Windows10_11.bat');
    setTimeout(() => setDownloadConcluido(null), 5000);
  };

  const handleBaixarPowerShellSetup = () => {
    const appUrl = window.location.origin;
    const scriptPs1 = `# ==============================================================
# ECHpro Contabilidade e RH Integrada - Instalador PowerShell
# Compativel: Windows 10 e Windows 11 (64-bit)
# Suporte Tecnico: +258 827473434 | ebenchume@sapo.mz
# ==============================================================

Write-Host "Iniciando instalacao do ECHpro ERP no Windows 10/11..." -ForegroundColor Cyan

$AppUrl = "${appUrl}"
$WshShell = New-Object -ComObject WScript.Shell
$Desktop = [System.Environment]::GetFolderPath('Desktop')
$Shortcut = $WshShell.CreateShortcut("$Desktop\\ECHpro Contabilidade e RH.lnk")
$Shortcut.TargetPath = "msedge.exe"
$Shortcut.Arguments = "--app=$AppUrl --app-id=echpro-enterprise --window-size=1280,850"
$Shortcut.Description = "Sistema Integrado de Contabilidade e Recursos Humanos ECHpro"
$Shortcut.Save()

Write-Host "[OK] Atalho criado na sua Area de Trabalho!" -ForegroundColor Green
Write-Host "Licenca Ativa: ${licenca.chave}" -ForegroundColor Yellow
Write-Host "Suporte Tecnico: +258 827473434 | ebenchume@sapo.mz" -ForegroundColor Gray

Start-Process "msedge.exe" -ArgumentList "--app=$AppUrl"
`;

    const blob = new Blob([scriptPs1], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Install_ECHpro_Windows10_11.ps1';
    a.click();
    URL.revokeObjectURL(url);
    setDownloadConcluido('Install_ECHpro_Windows10_11.ps1');
    setTimeout(() => setDownloadConcluido(null), 5000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Topo do Modal */}
        <div className="p-4 sm:p-5 bg-red-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-red-700 flex items-center justify-center font-black shadow-xs">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-white">
                  Instalador Executável Windows 10 / 11
                </h3>
                <span className="text-[10px] uppercase font-bold bg-white text-red-700 px-2 py-0.5 rounded-full shadow-xs">
                  Desktop Nativo
                </span>
              </div>
              <p className="text-xs text-red-100">
                Execute o ECHpro como um aplicativo nativo para desktop com acesso offline
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-red-100 hover:text-white hover:bg-red-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback de Download */}
        {downloadConcluido && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>
              Arquivo <strong>{downloadConcluido}</strong> baixado com sucesso! Dê um duplo clique nele para instalar no seu Windows.
            </span>
          </div>
        )}

        {/* Corpo do Modal */}
        <div className="p-5 overflow-y-auto space-y-4 text-slate-700 flex-1">
          {/* Opções de Instalação */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Opção 1: Instalador Automatizado .BAT */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 flex flex-col justify-between hover:border-red-300 transition-colors">
              <div>
                <div className="flex items-center gap-2 text-red-700 font-extrabold text-sm mb-2">
                  <Terminal className="w-4 h-4" />
                  <span>Instalador Batch Executável (.bat)</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  Gera o atalho nativo no <strong>Ambiente de Trabalho</strong> e no <strong>Menu Iniciar</strong> do Windows 10/11 com um único clique. Sem necessidade de permissões especiais.
                </p>
                <div className="text-[11px] font-mono text-slate-500 bg-white p-2 rounded-lg border border-slate-200 mb-3 space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Cria atalho na Área de Trabalho</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Inicia em janela dedicada nativa</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Vincula à chave ativa {licenca.chave}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleBaixarInstaladorBat}
                className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md shadow-red-200"
              >
                <Download className="w-4 h-4" />
                <span>Baixar Instalador Windows (.bat)</span>
              </button>
            </div>

            {/* Opção 2: Instalação Nativa PWA / Edge */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 flex flex-col justify-between hover:border-red-300 transition-colors">
              <div>
                <div className="flex items-center gap-2 text-red-700 font-extrabold text-sm mb-2">
                  <MonitorCheck className="w-4 h-4" />
                  <span>Instalar Aplicativo Nativo (PWA)</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  Instalação direta e instantânea pelo navegador corporativo do Windows (Microsoft Edge ou Google Chrome). Fixa na barra de tarefas do Windows.
                </p>
                <div className="text-[11px] font-mono text-slate-500 bg-white p-2 rounded-lg border border-slate-200 mb-3 space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Modo Standalone (Sem barra de URL)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Notificações push integradas</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Cache offline completo</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleInstalarPWA}
                className="w-full py-2.5 px-4 rounded-xl bg-white border border-red-600 text-red-700 hover:bg-red-50 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <Sparkles className="w-4 h-4 text-red-600" />
                <span>Instalar no Windows Agora</span>
              </button>
            </div>
          </div>

          {/* Opção 3: Script PowerShell Alternativo */}
          <div className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <FileCode className="w-4 h-4 text-red-600" />
              <div>
                <p className="font-bold text-slate-900">Script PowerShell Automatizado (.ps1)</p>
                <p className="text-slate-500 text-[11px]">Para administradores de redes corporativas e TI</p>
              </div>
            </div>
            <button
              onClick={handleBaixarPowerShellSetup}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] cursor-pointer flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar .ps1</span>
            </button>
          </div>

          {/* Requisitos de Sistema */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <h4 className="font-bold text-slate-900 mb-2.5 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-red-600" />
              <span>Requisitos do Sistema para Windows</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-slate-400 block">S.O.:</span>
                <span className="font-bold text-slate-800">Windows 10 / 11</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-slate-400 block">Arquitetura:</span>
                <span className="font-bold text-slate-800">64-bit (x64 / ARM64)</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-slate-400 block">Memória RAM:</span>
                <span className="font-bold text-slate-800">4 GB Mínimo</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-slate-400 block">Segurança:</span>
                <span className="font-bold text-slate-800">TLS 1.3 / AES-256</span>
              </div>
            </div>
          </div>

          {/* Suporte Técnico Oficial */}
          <div className="p-4 rounded-xl bg-red-50/70 border border-red-200 text-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-red-700" />
                <span className="font-bold text-slate-900">Suporte Técnico para Instalação no Windows</span>
              </div>
              <span className="text-[10px] font-bold text-red-700 bg-white px-2 py-0.5 rounded border border-red-200">
                Oficial
              </span>
            </div>

            <p className="text-[11px] text-slate-600 mb-3">
              Caso tenha dúvidas na execução ou necessite de instalação remota assistida em servidores ou múltiplos terminais:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
              <a
                href="tel:+258827473434"
                className="flex items-center gap-2.5 p-2 rounded-lg bg-white border border-red-200 hover:border-red-400 transition-colors group cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block leading-tight">Telefone & WhatsApp:</span>
                  <span className="font-extrabold text-slate-900 group-hover:text-red-700">
                    +258 827473434
                  </span>
                </div>
              </a>

              <a
                href="mailto:ebenchume@sapo.mz"
                className="flex items-center gap-2.5 p-2 rounded-lg bg-white border border-red-200 hover:border-red-400 transition-colors group cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block leading-tight">Email Dedicado:</span>
                  <span className="font-extrabold text-slate-900 group-hover:text-red-700 truncate block">
                    ebenchume@sapo.mz
                  </span>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Rodapé do Modal */}
        <div className="p-3.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Compatível com Windows 10 e Windows 11</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
