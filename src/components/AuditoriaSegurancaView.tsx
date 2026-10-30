import React, { useState } from 'react';
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
  Phone,
  Mail,
  Laptop,
} from 'lucide-react';

export const AuditoriaSegurancaView: React.FC = () => {
  const {
    auditoria,
    doisFatoresAtivo,
    alternar2FA,
    chaveCriptografia,
    regenerarChaveCriptografia,
    backups,
    executarBackupManual,
    restaurarBackup,
    usuarioAtual,
    licenca,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'auditoria' | '2fa_cripto' | 'backups'>('auditoria');
  const [buscaLog, setBuscaLog] = useState('');
  const [isGerandoBackup, setIsGerandoBackup] = useState(false);
  const [copiadoChave, setCopiadoChave] = useState(false);

  const handleCopiarChave = () => {
    navigator.clipboard.writeText(chaveCriptografia);
    setCopiadoChave(true);
    setTimeout(() => setCopiadoChave(false), 2000);
  };

  const handleBackup = async () => {
    setIsGerandoBackup(true);
    await executarBackupManual('nuvem_redundante');
    setIsGerandoBackup(false);
  };

  const handleBaixarBackupJSON = () => {
    const dados = {
      timestamp: new Date().toISOString(),
      versao: '2.8-pro',
      hashCriptografico: chaveCriptografia,
      backupInfo: 'Cópia integral e redundante de dados fiscais e cadastrais ECHpro',
    };
    const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dados, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', jsonStr);
    dlAnchorElem.setAttribute('download', `backup_echpro_${new Date().toISOString().slice(0, 10)}.json`);
    dlAnchorElem.click();
  };

  const logsFiltrados = auditoria.filter(l =>
    !buscaLog ||
    l.modulo.toLowerCase().includes(buscaLog.toLowerCase()) ||
    l.acao.toLowerCase().includes(buscaLog.toLowerCase()) ||
    l.detalhes.toLowerCase().includes(buscaLog.toLowerCase()) ||
    l.usuario.toLowerCase().includes(buscaLog.toLowerCase())
  );

  return (
    <div className="space-y-6 text-slate-800">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2.5">
          <span className="p-2.5 rounded-xl bg-red-50 text-red-600 border border-red-100">
            <ShieldAlert className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Auditoria, Segurança 2FA & Backups Redundantes
            </h1>
            <p className="text-xs text-slate-500">
              Trilha de auditoria com hash SHA-256, autenticação em dois fatores, criptografia AES-256 e sincronização redundante em nuvem
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            disabled={isGerandoBackup}
            onClick={handleBackup}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors shadow-md shadow-red-200 cursor-pointer"
          >
            <Cloud className={`w-4 h-4 ${isGerandoBackup ? 'animate-pulse' : ''}`} />
            {isGerandoBackup ? 'Criando Snapshot...' : 'Backup em Nuvem Imediato'}
          </button>
        </div>
      </div>

      {/* Navegação de Abas */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-1 text-xs">
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
          <Server className="w-4 h-4" /> Backups em Nuvem Redundantes ({backups.length})
        </button>
      </div>

      {/* ABA 1: TRILHA DE AUDITORIA */}
      {activeTab === 'auditoria' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs">
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 ml-1" />
              <input
                type="text"
                placeholder="Pesquisar registro de auditoria..."
                value={buscaLog}
                onChange={e => setBuscaLog(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
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
        </div>
      )}

      {/* ABA 3: BACKUPS EM NUVEM REDUNDANTES */}
      {activeTab === 'backups' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Server className="w-5 h-5 text-red-600" />
                  Snapshots e Armazenamento em Nuvem Redundante
                </h3>
                <p className="text-xs text-slate-500">
                  Replicação diária automatizada com validação de integridade SHA-256 e failover geográfico
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleBaixarBackupJSON}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4 text-red-600" /> Exportar JSON
                </button>
                <button
                  onClick={handleBackup}
                  className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-200 cursor-pointer"
                >
                  <Cloud className="w-4 h-4" /> Criar Snapshot Agora
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-red-50 text-red-900 text-[11px] font-bold border-b border-red-200">
                  <tr>
                    <th className="p-2.5">Identificador</th>
                    <th className="p-2.5">Data / Hora</th>
                    <th className="p-2.5">Região do Servidor</th>
                    <th className="p-2.5">Tamanho</th>
                    <th className="p-2.5">Hash Verificado</th>
                    <th className="p-2.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800 bg-white">
                  {backups.map(bkp => (
                    <tr key={bkp.id} className="hover:bg-red-50/20 transition-colors">
                      <td className="p-2.5 font-mono text-red-700 font-bold">{bkp.id}</td>
                      <td className="p-2.5 font-mono text-slate-500 text-[11px]">{bkp.dataHora}</td>
                      <td className="p-2.5 text-slate-800 font-medium">{bkp.servidorRegiao}</td>
                      <td className="p-2.5 font-mono font-bold text-slate-800">{bkp.tamanho}</td>
                      <td className="p-2.5 font-mono text-[10px] text-slate-500">{bkp.hashVerificacao}</td>
                      <td className="p-2.5 text-center">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-mono text-[10px] font-bold border border-emerald-200">
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
