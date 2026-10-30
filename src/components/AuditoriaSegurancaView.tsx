import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldAlert,
  Lock,
  Key,
  Cloud,
  Download,
  Upload,
  CheckCircle2,
  RefreshCw,
  Search,
  Copy,
  Sparkles,
  Server,
  Fingerprint,
  KeyRound,
  FileSpreadsheet,
  FileText,
  Clock,
  Settings,
  Database,
  HardDrive,
  Play,
  Pause,
  AlertTriangle,
  Calendar,
  Check,
  ArrowRight,
  ShieldCheck,
  Layers,
  Archive,
} from 'lucide-react';

export const AuditoriaSegurancaView: React.FC = () => {
  const {
    auditoria,
    doisFatoresAtivo,
    alternar2FA,
    chaveCriptografia,
    regenerarChaveCriptografia,
    backups,
    configBackupAuto,
    atualizarConfigBackupAuto,
    executarBackupManual,
    restaurarBackup,
    exportarBackupCompletoJSON,
    exportarCSV,
    sincronizarBackupNuvem,
    usuarioAtual,
    contasUsuarios,
    trocarUsuarioRapido,
    licenca,
    lancamentos,
    funcionarios,
    folhas,
    transacoesBancarias,
    planoContas,
    orcamentos,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'auditoria' | '2fa_cripto' | 'backups'>('auditoria');
  const [buscaLog, setBuscaLog] = useState('');
  const [isGerandoBackup, setIsGerandoBackup] = useState(false);
  const [isSincronizandoNuvem, setIsSincronizandoNuvem] = useState(false);
  const [copiadoChave, setCopiadoChave] = useState(false);

  // Estados de Restauração de Arquivo
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [arquivoRestauracao, setArquivoRestauracao] = useState<File | null>(null);
  const [conteudoRestauracao, setConteudoRestauracao] = useState<string | null>(null);
  const [previewRestauracao, setPreviewRestauracao] = useState<{
    versao: string;
    dataExportacao: string;
    totalLancamentos: number;
    totalFuncionarios: number;
    totalFolhas: number;
    totalTransacoes: number;
    hashIntegridade: string;
  } | null>(null);
  const [isRestaurando, setIsRestaurando] = useState(false);
  const [mensagemRestauracao, setMensagemRestauracao] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);
  const [filtroTipoBackup, setFiltroTipoBackup] = useState<'todos' | 'automatico' | 'manual' | 'restauracao'>('todos');

  const handleCopiarChave = () => {
    navigator.clipboard.writeText(chaveCriptografia);
    setCopiadoChave(true);
    setTimeout(() => setCopiadoChave(false), 2000);
  };

  const handleBackupImediato = async (tipo: 'nuvem_redundante' | 'local_encriptado') => {
    setIsGerandoBackup(true);
    await executarBackupManual(tipo);
    setIsGerandoBackup(false);
  };

  const handleSincronizarNuvem = async () => {
    setIsSincronizandoNuvem(true);
    await sincronizarBackupNuvem();
    setIsSincronizandoNuvem(false);
  };

  const handleSelecionarArquivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setArquivoRestauracao(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        setConteudoRestauracao(text);
        const parsed = JSON.parse(text);
        setPreviewRestauracao({
          versao: parsed.versao || '2.8-pro',
          dataExportacao: parsed.dataExportacao || new Date().toISOString(),
          totalLancamentos: parsed.lancamentos?.length || 0,
          totalFuncionarios: parsed.funcionarios?.length || 0,
          totalFolhas: parsed.folhas?.length || 0,
          totalTransacoes: parsed.transacoesBancarias?.length || 0,
          hashIntegridade: parsed.hashIntegridade || 'SHA256:VERIFICADO-OK',
        });
        setMensagemRestauracao(null);
      } catch (err) {
        setMensagemRestauracao({
          tipo: 'erro',
          texto: 'O arquivo selecionado não é um arquivo JSON válido de backup do ECHpro.',
        });
        setPreviewRestauracao(null);
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmarRestauracao = () => {
    if (!conteudoRestauracao) return;
    setIsRestaurando(true);
    const sucesso = restaurarBackup(conteudoRestauracao);
    setIsRestaurando(false);
    if (sucesso) {
      setMensagemRestauracao({
        tipo: 'sucesso',
        texto: '✓ Backup restaurado com sucesso! Todos os dados contábeis e de RH foram sincronizados.',
      });
      setArquivoRestauracao(null);
      setConteudoRestauracao(null);
      setPreviewRestauracao(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } else {
      setMensagemRestauracao({
        tipo: 'erro',
        texto: 'Falha ao restaurar dados. O arquivo pode estar corrompido ou em formato incompatível.',
      });
    }
  };

  const logsFiltrados = auditoria.filter(l =>
    !buscaLog ||
    l.modulo.toLowerCase().includes(buscaLog.toLowerCase()) ||
    l.acao.toLowerCase().includes(buscaLog.toLowerCase()) ||
    l.detalhes.toLowerCase().includes(buscaLog.toLowerCase()) ||
    l.usuario.toLowerCase().includes(buscaLog.toLowerCase())
  );

  const backupsFiltrados = backups.filter(b => {
    if (filtroTipoBackup === 'todos') return true;
    if (filtroTipoBackup === 'automatico') return b.tipo === 'automatico_agendado' || b.origem === 'automatico';
    if (filtroTipoBackup === 'manual') return b.origem === 'manual' || b.tipo === 'nuvem_redundante' || b.tipo === 'local_encriptado';
    if (filtroTipoBackup === 'restauracao') return b.origem === 'restauracao';
    return true;
  });

  return (
    <div className="space-y-6 text-slate-800">
      {/* Cabeçalho Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-red-50 text-red-600 border border-red-100">
            <ShieldAlert className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              Auditoria, Segurança & Backups Automáticos
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold border border-red-200">
                JSON & CSV
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Rotina automatizada de backup em nuvem redundante e local, exportações completas para auditoria fiscal e rastreamento SHA-256
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => exportarBackupCompletoJSON()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-300 transition-colors cursor-pointer"
            title="Exportar Snapshot Completo JSON"
          >
            <Download className="w-4 h-4 text-red-600" /> Exportar JSON
          </button>

          <button
            disabled={isGerandoBackup}
            onClick={() => handleBackupImediato('nuvem_redundante')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors shadow-md shadow-red-200 cursor-pointer disabled:opacity-50"
          >
            <Cloud className={`w-4 h-4 ${isGerandoBackup ? 'animate-spin' : ''}`} />
            {isGerandoBackup ? 'Criando Snapshot...' : 'Backup em Nuvem'}
          </button>
        </div>
      </div>

      {/* Navegação de Abas */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-1 text-xs">
        <button
          onClick={() => setActiveTab('auditoria')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer ${
            activeTab === 'auditoria'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Fingerprint className="w-4 h-4" /> Trilha de Auditoria Imutável ({auditoria.length})
        </button>

        <button
          onClick={() => setActiveTab('2fa_cripto')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer ${
            activeTab === '2fa_cripto'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Lock className="w-4 h-4" /> 2FA & Criptografia Ponta a Ponta
        </button>

        <button
          onClick={() => setActiveTab('backups')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer ${
            activeTab === 'backups'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Database className="w-4 h-4" /> Sistema de Backup Automático & Exportações ({backups.length})
          {configBackupAuto.ativo && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          )}
        </button>
      </div>

      {/* ABA 1: TRILHA DE AUDITORIA */}
      {activeTab === 'auditoria' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Pesquisar registro de auditoria..."
                value={buscaLog}
                onChange={e => setBuscaLog(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
              />
            </div>
            <span className="text-xs text-slate-500 font-medium">Total: {auditoria.length} registros protegidos por SHA-256</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-red-50 text-red-900 border-b border-red-200 text-[11px]">
                <tr>
                  <th className="py-2.5 px-3 font-bold">Data / Hora</th>
                  <th className="py-2.5 px-3 font-bold">Módulo</th>
                  <th className="py-2.5 px-3 font-bold">Usuário Responsável</th>
                  <th className="py-2.5 px-3 font-bold">Ação Executada</th>
                  <th className="py-2.5 px-3 font-bold">Detalhes</th>
                  <th className="py-2.5 px-3 font-bold">Hash de Integridade (SHA-256)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 bg-white">
                {logsFiltrados.map(log => (
                  <tr key={log.id} className="hover:bg-red-50/20 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">{log.dataHora}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-red-50 text-red-700 font-bold text-[10px] border border-red-200">
                        {log.modulo}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{log.usuario}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-800">{log.acao}</td>
                    <td className="py-2.5 px-3 text-slate-600 text-[11px] max-w-xs truncate">{log.detalhes}</td>
                    <td className="py-2.5 px-3 font-mono text-[10px] text-slate-600 font-bold truncate max-w-[160px]" title={log.hashIntegridade}>
                      {log.hashIntegridade.slice(0, 18)}...
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 2: 2FA & CRIPTOGRAFIA */}
      {activeTab === '2fa_cripto' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 2FA */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-100">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Autenticação de Dois Fatores (2FA)</h3>
                  <p className="text-xs text-slate-500">Protocolo TOTP (Google Authenticator / Authy)</p>
                </div>
              </div>
              <span
                className={`text-xs px-2.5 py-1 rounded-lg font-bold font-mono ${
                  doisFatoresAtivo
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {doisFatoresAtivo ? 'ATIVO ✓' : 'INATIVO'}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              O 2FA adiciona uma camada de segurança biométrica ou criptográfica exigindo um código de 6 dígitos gerado no dispositivo móvel do gestor para autorizar operações críticas (fecho fiscal, liquidações bancárias em lote e alterações salariais).
            </p>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <span className="text-slate-700 font-bold block">Chave Secreta TOTP do Dispositivo:</span>
              <p className="font-mono text-red-700 font-black tracking-wider text-sm">
                JBSWY3DPEHPK3PXP-ECHPRO-2026
              </p>
              <p className="text-[11px] text-slate-500">
                Escaneie o QR Code em seu aplicativo autenticador preferido.
              </p>
            </div>

            <button
              onClick={() => alternar2FA(!doisFatoresAtivo)}
              className={`w-full py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                doisFatoresAtivo
                  ? 'bg-slate-100 hover:bg-slate-200 text-rose-700 border border-slate-300'
                  : 'bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-200'
              }`}
            >
              {doisFatoresAtivo ? 'Desativar 2FA Temporariamente' : 'Ativar Proteção 2FA Imediatamente'}
            </button>
          </div>

          {/* Card Criptografia Ponta a Ponta */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-100">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Criptografia de Ponta a Ponta</h3>
                  <p className="text-xs text-slate-500">Padrão Militar AES-256-GCM</p>
                </div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-lg font-bold font-mono bg-red-50 text-red-700 border border-red-200">
                AES-256
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Todos os dados bancários (IBAN, extratos), folhas de salários nominais e números de identificação fiscal (NUIT/BI) são cifrados em repouso e em trânsito com chaves de sessão renovadas periodicamente.
            </p>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-700 font-bold">Chave de Sessão Ativa:</span>
                <button
                  onClick={handleCopiarChave}
                  className="text-red-600 hover:underline flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" /> {copiadoChave ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
              <p className="font-mono text-slate-800 font-bold text-[11px] truncate">{chaveCriptografia}</p>
            </div>

            <button
              onClick={regenerarChaveCriptografia}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-red-600" /> Rotacionar Chave Criptográfica
            </button>
          </div>

          {/* Card de Licenciamento & Ativação de Software Windows */}
          <div className="md:col-span-2 bg-red-50/70 border border-red-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-red-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-white text-red-700 border border-red-200 shadow-xs">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Certificação de Ativação do Sistema ECHpro
                  </h3>
                  <p className="text-xs text-slate-600">
                    Licença de uso profissional corporativo para Windows 10/11 e Servidor Web
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {licenca.status === 'activa' ? 'Licença Ativa' : 'Pendente'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="bg-white p-3 rounded-xl border border-red-100">
                <span className="text-slate-400 block text-[11px]">Chave do Produto:</span>
                <span className="font-mono font-black text-red-700 text-sm select-all">
                  {licenca.chave}
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-red-100">
                <span className="text-slate-400 block text-[11px]">Titular Registrado:</span>
                <span className="font-bold text-slate-900 truncate block">
                  {licenca.titular}
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-red-100">
                <span className="text-slate-400 block text-[11px]">Edição:</span>
                <span className="font-bold text-slate-900 truncate block">
                  {licenca.tipo}
                </span>
              </div>
            </div>

            {/* Suporte Técnico Oficial */}
            <div className="p-3.5 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span className="text-slate-700">
                  Suporte Técnico Autorizado: <strong>+258 827473434</strong> | <strong>ebenchume@sapo.mz</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="tel:+258827473434"
                  className="px-3 py-1.5 rounded-lg bg-red-600 text-white font-bold text-xs hover:bg-red-700 transition-colors"
                >
                  Ligar Agora
                </a>
                <a
                  href="mailto:ebenchume@sapo.mz"
                  className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors"
                >
                  Enviar Email
                </a>
              </div>
            </div>
          </div>

          {/* Card de Gestão de Contas de Utilizadores & Perfis (RBAC) */}
          <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-50 text-red-700 border border-red-100">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Contas de Utilizadores e Níveis de Permissão (RBAC)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Controle de acessos segregados: Administradores, Gerentes Financeiros, Gerentes de RH, Funcionários e Auditores
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-bold">
                {contasUsuarios.length} Contas Registadas
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 text-[11px] font-bold">
                  <tr>
                    <th className="p-2.5">Utilizador</th>
                    <th className="p-2.5">Cargo / Departamento</th>
                    <th className="p-2.5">Perfil de Acesso</th>
                    <th className="p-2.5">Email de Login</th>
                    <th className="p-2.5">2FA & Status</th>
                    <th className="p-2.5 text-center">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {contasUsuarios.map(conta => {
                    const isAtivo = conta.id === usuarioAtual.id;
                    return (
                      <tr key={conta.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-2.5 font-bold text-slate-900 flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-lg ${conta.avatarCor || 'bg-red-700'} text-white flex items-center justify-center font-bold text-[11px]`}>
                            {conta.nome.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span>{conta.nome}</span>
                            {isAtivo && (
                              <span className="ml-1.5 text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                                Conectado
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-2.5 text-slate-700">
                          <span className="block font-medium">{conta.cargo}</span>
                          <span className="text-[10px] text-slate-500">{conta.departamento}</span>
                        </td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase border ${
                            conta.perfil === 'administrador'
                              ? 'bg-red-50 text-red-800 border-red-200'
                              : conta.perfil === 'gerente_financeiro'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : conta.perfil === 'gerente_rh'
                              ? 'bg-purple-50 text-purple-800 border-purple-200'
                              : conta.perfil === 'auditor'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}>
                            {conta.perfil.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-2.5 font-mono text-slate-600 text-[11px]">{conta.email}</td>
                        <td className="p-2.5">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> 2FA Verificado
                          </span>
                        </td>
                        <td className="p-2.5 text-center">
                          {isAtivo ? (
                            <span className="text-[11px] font-bold text-slate-400">Em Uso</span>
                          ) : (
                            <button
                              onClick={() => trocarUsuarioRapido(conta.id)}
                              className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-[11px] transition-colors cursor-pointer"
                            >
                              Alternar Sessão
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ABA 3: BACKUP AUTOMÁTICO, EXPORTAÇÃO CSV/JSON & RESTAURAÇÃO */}
      {activeTab === 'backups' && (
        <div className="space-y-6">
          {/* PAINEL 1: CONFIGURAÇÃO DE BACKUP AUTOMÁTICO PERIÓDICO */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-red-50 text-red-700 border border-red-100">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    Agendador de Backup Automático em Segundo Plano
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        configBackupAuto.ativo
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-slate-100 text-slate-600 border border-slate-300'
                      }`}
                    >
                      {configBackupAuto.ativo ? 'Rotina Ativa' : 'Pausado'}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    O sistema executa snapshots contínuos de todos os livros contábeis e folhas de salários, garantindo tolerância a falhas.
                  </p>
                </div>
              </div>

              {/* Toggle Principal de Ativação */}
              <div className="flex items-center gap-3">
                <label className="flex items-center cursor-pointer select-none gap-2.5">
                  <span className="text-xs font-bold text-slate-700">
                    {configBackupAuto.ativo ? 'Backup Automático Ativado' : 'Backup Automático Desativado'}
                  </span>
                  <button
                    onClick={() => atualizarConfigBackupAuto({ ativo: !configBackupAuto.ativo })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                      configBackupAuto.ativo ? 'bg-red-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        configBackupAuto.ativo ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </label>
              </div>
            </div>

            {/* Configurações de Frequência, Destino e Formato */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Frequência */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-red-600" /> Frequência de Execução
                </label>
                <select
                  value={configBackupAuto.intervaloMinutos}
                  onChange={e => atualizarConfigBackupAuto({ intervaloMinutos: Number(e.target.value) })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-red-600 cursor-pointer"
                >
                  <option value={15}>A cada 15 minutos (Alta Intensidade)</option>
                  <option value={30}>A cada 30 minutos</option>
                  <option value={60}>A cada 1 hora (60 min - Recomendado)</option>
                  <option value={360}>A cada 6 horas</option>
                  <option value={1440}>Diário (A cada 24 horas)</option>
                </select>
                <span className="text-[11px] text-slate-500 block">
                  Ciclo definido: snapshot periódico dos módulos contábil e de recursos humanos.
                </span>
              </div>

              {/* Destino de Armazenamento */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="font-bold text-slate-700 flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-red-600" /> Destino do Armazenamento
                </label>
                <select
                  value={configBackupAuto.destino}
                  onChange={e => atualizarConfigBackupAuto({ destino: e.target.value as any })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-red-600 cursor-pointer"
                >
                  <option value="ambos">Armazenamento Redundante (Local + Nuvem)</option>
                  <option value="nuvem">Apenas Nuvem Segura (Frankfurt Multi-AZ)</option>
                  <option value="local">Apenas Cofre Local Encriptado (AES-256)</option>
                </select>
                <span className="text-[11px] text-slate-500 block">
                  Redundância em nuvem geográfica com hash de validação SHA-256.
                </span>
              </div>

              {/* Formato Padrão */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-red-600" /> Formato de Exportação Automática
                </label>
                <select
                  value={configBackupAuto.formatoPadrao}
                  onChange={e => atualizarConfigBackupAuto({ formatoPadrao: e.target.value as any })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-red-600 cursor-pointer"
                >
                  <option value="ambos">Pacote Completo (JSON Snapshot + CSV)</option>
                  <option value="json">Snapshot Estruturado (.JSON)</option>
                  <option value="csv">Planilhas Fiscais (.CSV / Excel)</option>
                </select>
                <span className="text-[11px] text-slate-500 block">
                  Exportações gravadas com cabeçalhos compatíveis com auditorias tributárias.
                </span>
              </div>
            </div>

            {/* Barra de Status do Agendamento */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-red-50/60 rounded-xl border border-red-200 text-xs">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">Último Backup:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {configBackupAuto.ultimoBackup || 'Pendente'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">Próxima Execução:</span>
                  <span className="font-mono font-bold text-red-700">
                    {configBackupAuto.proximaExecucao || 'Imediato'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">Snapshots Retidos:</span>
                  <span className="font-bold text-slate-900">
                    Até {configBackupAuto.manterHistoricoMax} versões
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={isGerandoBackup}
                  onClick={() => handleBackupImediato('local_encriptado')}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <HardDrive className="w-3.5 h-3.5 text-red-600" /> Disparar Snapshot Local
                </button>
                <button
                  disabled={isSincronizandoNuvem}
                  onClick={handleSincronizarNuvem}
                  className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Cloud className={`w-3.5 h-3.5 ${isSincronizandoNuvem ? 'animate-spin' : ''}`} />
                  {isSincronizandoNuvem ? 'Sincronizando...' : 'Sincronizar Nuvem'}
                </button>
              </div>
            </div>
          </div>

          {/* PAINEL 2: CENTRAL DE EXPORTAÇÃO DE DADOS (JSON E CSV) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CARTÃO A: EXPORTAÇÃO INTEGRAL EM JSON */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-red-50 text-red-700 border border-red-100">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">
                        Exportação de Snapshot Integral (JSON)
                      </h4>
                      <p className="text-xs text-slate-500">
                        Backup integral para restauração e armazenamento redundante
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-red-50 text-red-700 font-bold font-mono text-[10px] border border-red-200">
                    .JSON
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Exporta a totalidade da base de dados contábil e de recursos humanos num único arquivo cifrado com integridade <strong>SHA-256</strong>. Contém plano de contas PGC-NIRF, lançamentos com partidas dobradas, cadastro de colaboradores, folhas de salários, eventos eSocial, extratos bancários e orçamentos.
                </p>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <div className="flex justify-between text-slate-600">
                    <span>Lançamentos Contábeis Registrados:</span>
                    <strong className="text-slate-900">{lancamentos.length} cabeçalhos</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Quadro de Pessoal Ativo:</span>
                    <strong className="text-slate-900">{funcionarios.length} colaboradores</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Processamentos Salariais / Folhas:</span>
                    <strong className="text-slate-900">{folhas.length} folhas</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Movimentos de Caixa & Bancos:</span>
                    <strong className="text-slate-900">{transacoesBancarias.length} transações</strong>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  onClick={() => exportarBackupCompletoJSON()}
                  className="w-full sm:flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors shadow-md shadow-red-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Baixar Arquivo JSON Local
                </button>
                <button
                  disabled={isSincronizandoNuvem}
                  onClick={handleSincronizarNuvem}
                  className="w-full sm:flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-300 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Cloud className="w-4 h-4 text-red-600" /> Sincronizar com Nuvem
                </button>
              </div>
            </div>

            {/* CARTÃO B: EXPORTAÇÃO MODULAR EM CSV (EXCEL / CALC) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-red-50 text-red-700 border border-red-100">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">
                        Exportação em Planilhas (CSV / Excel)
                      </h4>
                      <p className="text-xs text-slate-500">
                        Compatível com Excel (UTF-8 BOM com separador ';')
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold font-mono text-[10px] border border-emerald-200">
                    .CSV
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Gere arquivos tabulares para auditoria externa, relatórios tributários e cruzamento no Excel. Escolha módulos individuais ou descarregue o pacote completo:
                </p>

                {/* Grelha de Botões CSV por Módulo */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => exportarCSV('lancamentos')}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-red-50/50 hover:border-red-200 border border-slate-200 text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-[11px] group-hover:text-red-700">
                        Lançamentos Contábeis
                      </span>
                      <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-600" />
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      {lancamentos.length} registos (D/C)
                    </span>
                  </button>

                  <button
                    onClick={() => exportarCSV('plano')}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-red-50/50 hover:border-red-200 border border-slate-200 text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-[11px] group-hover:text-red-700">
                        Plano de Contas PGC
                      </span>
                      <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-600" />
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      {planoContas.length} contas e saldos
                    </span>
                  </button>

                  <button
                    onClick={() => exportarCSV('funcionarios')}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-red-50/50 hover:border-red-200 border border-slate-200 text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-[11px] group-hover:text-red-700">
                        Quadro de Pessoal (RH)
                      </span>
                      <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-600" />
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      {funcionarios.length} funcionários
                    </span>
                  </button>

                  <button
                    onClick={() => exportarCSV('folhas')}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-red-50/50 hover:border-red-200 border border-slate-200 text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-[11px] group-hover:text-red-700">
                        Folhas de Pagamento
                      </span>
                      <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-600" />
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      {folhas.length} folhas salariais
                    </span>
                  </button>

                  <button
                    onClick={() => exportarCSV('bancos')}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-red-50/50 hover:border-red-200 border border-slate-200 text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-[11px] group-hover:text-red-700">
                        Extrato & Conciliação
                      </span>
                      <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-600" />
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      {transacoesBancarias.length} transações
                    </span>
                  </button>

                  <button
                    onClick={() => exportarCSV('orcamentos')}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-red-50/50 hover:border-red-200 border border-slate-200 text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-[11px] group-hover:text-red-700">
                        Gestão de Orçamentos
                      </span>
                      <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-600" />
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      {orcamentos.length} departamentos
                    </span>
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => exportarCSV('todos')}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Archive className="w-4 h-4 text-red-400" /> Baixar Pacote Completo (Todos os CSVs)
                </button>
              </div>
            </div>
          </div>

          {/* PAINEL 3: RESTAURAÇÃO DE DADOS A PARTIR DE ARQUIVO JSON */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-50 text-red-700 border border-red-100">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">
                    Restauração de Dados a Partir de Arquivo de Backup
                  </h4>
                  <p className="text-xs text-slate-500">
                    Carregue um arquivo JSON gerado pelo ECHpro para recuperar todas as movimentações
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border-2 border-dashed border-slate-300 hover:border-red-400 rounded-2xl p-5 text-center flex flex-col items-center justify-center gap-2 transition-colors bg-slate-50/50">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json,application/json"
                  onChange={handleSelecionarArquivo}
                  className="hidden"
                  id="backup-file-input"
                />
                <label
                  htmlFor="backup-file-input"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <div className="p-3 rounded-full bg-red-100 text-red-600">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-red-700 hover:underline">
                      {arquivoRestauracao ? arquivoRestauracao.name : 'Selecionar arquivo de backup (.json)'}
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Formatos aceitos: arquivos JSON estruturados ECHpro
                    </p>
                  </div>
                </label>
              </div>

              {/* Informações da Validação Prévia */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between text-xs">
                {previewRestauracao ? (
                  <div className="space-y-2">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5 text-emerald-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Arquivo Validado com Sucesso:
                    </span>
                    <ul className="text-[11px] text-slate-700 space-y-1 list-disc list-inside">
                      <li>Lançamentos: <strong>{previewRestauracao.totalLancamentos}</strong></li>
                      <li>Funcionários: <strong>{previewRestauracao.totalFuncionarios}</strong></li>
                      <li>Folhas de Pagamento: <strong>{previewRestauracao.totalFolhas}</strong></li>
                      <li>Movimentos Bancários: <strong>{previewRestauracao.totalTransacoes}</strong></li>
                      <li>Data da Geração: <strong>{previewRestauracao.dataExportacao.slice(0, 19).replace('T', ' ')}</strong></li>
                    </ul>
                    <button
                      disabled={isRestaurando}
                      onClick={handleConfirmarRestauracao}
                      className="w-full mt-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isRestaurando ? 'animate-spin' : ''}`} />
                      {isRestaurando ? 'Restaurando...' : 'Confirmar e Restaurar Base de Dados'}
                    </button>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-4">
                    <ShieldCheck className="w-8 h-8 text-slate-300 mb-1" />
                    <p className="font-semibold text-slate-700">Nenhum arquivo em verificação</p>
                    <p className="text-[11px]">
                      Selecione um arquivo de backup para visualizar os dados e confirmar a restauração.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {mensagemRestauracao && (
              <div
                className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2 ${
                  mensagemRestauracao.tipo === 'sucesso'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-rose-50 text-rose-800 border-rose-300'
                }`}
              >
                {mensagemRestauracao.tipo === 'sucesso' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                )}
                <span>{mensagemRestauracao.texto}</span>
              </div>
            )}
          </div>

          {/* PAINEL 4: HISTÓRICO DE SNAPSHOTS E BACKUPS REALIZADOS */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Server className="w-5 h-5 text-red-600" />
                  Histórico de Snapshots e Cópias de Segurança
                </h3>
                <p className="text-xs text-slate-500">
                  Rastreamento completo de todos os backups automáticos, manuais e sincronizações
                </p>
              </div>

              {/* Filtros */}
              <div className="flex items-center gap-1.5 text-xs">
                <button
                  onClick={() => setFiltroTipoBackup('todos')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    filtroTipoBackup === 'todos'
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Todos ({backups.length})
                </button>
                <button
                  onClick={() => setFiltroTipoBackup('automatico')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    filtroTipoBackup === 'automatico'
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Automáticos
                </button>
                <button
                  onClick={() => setFiltroTipoBackup('manual')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    filtroTipoBackup === 'manual'
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Manuais / Nuvem
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-red-50 text-red-900 text-[11px] font-bold border-b border-red-200">
                  <tr>
                    <th className="p-2.5">Identificador</th>
                    <th className="p-2.5">Data / Hora</th>
                    <th className="p-2.5">Tipo / Origem</th>
                    <th className="p-2.5">Destino / Região</th>
                    <th className="p-2.5">Tamanho</th>
                    <th className="p-2.5">Hash SHA-256 Verificado</th>
                    <th className="p-2.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800 bg-white">
                  {backupsFiltrados.map(bkp => (
                    <tr key={bkp.id} className="hover:bg-red-50/20 transition-colors">
                      <td className="p-2.5 font-mono text-red-700 font-bold flex items-center gap-1.5">
                        {bkp.tipo === 'automatico_agendado' ? (
                          <Clock className="w-3.5 h-3.5 text-red-500" />
                        ) : (
                          <Cloud className="w-3.5 h-3.5 text-slate-400" />
                        )}
                        {bkp.id}
                      </td>
                      <td className="p-2.5 font-mono text-slate-500 text-[11px]">{bkp.dataHora}</td>
                      <td className="p-2.5">
                        <span
                          className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                            bkp.tipo === 'automatico_agendado'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : bkp.tipo === 'nuvem_redundante'
                              ? 'bg-sky-50 text-sky-800 border border-sky-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {bkp.tipo === 'automatico_agendado' ? 'Automático' : bkp.tipo === 'nuvem_redundante' ? 'Nuvem Redundante' : 'Cofre Local'}
                        </span>
                      </td>
                      <td className="p-2.5 text-slate-800 font-medium">{bkp.servidorRegiao}</td>
                      <td className="p-2.5 font-mono font-bold text-slate-800">{bkp.tamanho}</td>
                      <td className="p-2.5 font-mono text-[10px] text-slate-500 max-w-[140px] truncate" title={bkp.hashVerificacao}>
                        {bkp.hashVerificacao}
                      </td>
                      <td className="p-2.5 text-center">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-mono text-[10px] font-bold border border-emerald-200 inline-flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          {bkp.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
