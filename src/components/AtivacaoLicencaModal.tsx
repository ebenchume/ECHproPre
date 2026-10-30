import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  AlertCircle,
  X,
  Laptop,
  Phone,
  Mail,
  RefreshCw,
  Sparkles,
  Download,
  Lock,
} from 'lucide-react';

interface AtivacaoLicencaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AtivacaoLicencaModal: React.FC<AtivacaoLicencaModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { licenca, validarChaveAtivacao, ativarSistema, gerarChaveLicencaOficial, empresa } = useApp();

  const [inputChave, setInputChave] = useState('');
  const [inputTitular, setInputTitular] = useState('Eng. E. Benchume');
  const [inputEmail, setInputEmail] = useState('ebenchume@sapo.mz');
  const [mensagemStatus, setMensagemStatus] = useState<{ tipo: 'sucesso' | 'erro' | 'info'; texto: string } | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<'status' | 'ativar' | 'gerador'>('status');

  if (!isOpen) return null;

  const handleCopiarChave = (texto: string) => {
    navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const handleAtivar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputChave.trim()) {
      setMensagemStatus({ tipo: 'erro', texto: 'Informe a chave de ativação para prosseguir.' });
      return;
    }

    const resultado = ativarSistema(inputChave, inputTitular, inputEmail);
    if (resultado.sucesso) {
      setMensagemStatus({ tipo: 'sucesso', texto: resultado.mensagem });
      setInputChave('');
      setTimeout(() => {
        setAbaAtiva('status');
      }, 1200);
    } else {
      setMensagemStatus({ tipo: 'erro', texto: resultado.mensagem });
    }
  };

  const handleGerarNovaChave = () => {
    const novaChave = gerarChaveLicencaOficial(inputTitular, inputEmail);
    setInputChave(novaChave);
    setMensagemStatus({
      tipo: 'info',
      texto: `Nova chave gerada para teste de ativação: ${novaChave}`,
    });
  };

  const handleExportarCertificado = () => {
    const certificadoJson = {
      produto: 'ECHpro ERP - Contabilidade e RH Integrada',
      versao: '2.8 Enterprise Windows 10/11 & Web',
      licenca: licenca,
      empresa: {
        nome: empresa.nome,
        nuit: empresa.nuit,
      },
      suporteTecnico: {
        responsavel: 'Eng. E. Benchume',
        telefone: '+258 827473434',
        email: 'ebenchume@sapo.mz',
      },
      emitidoEm: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(certificadoJson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Certificado_Licenca_ECHpro_${licenca.chave.replace(/-/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Topo do Modal */}
        <div className="p-4 sm:p-5 bg-red-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-red-700 flex items-center justify-center font-black shadow-xs">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-white">
                  Chave de Ativação & Licenciamento
                </h3>
                <span className="text-[10px] uppercase font-bold bg-white text-red-700 px-2 py-0.5 rounded-full shadow-xs">
                  {licenca.status === 'activa' ? 'Ativada' : 'Pendente'}
                </span>
              </div>
              <p className="text-xs text-red-100">
                Licença Oficial para Windows 10, Windows 11 e Servidor Cloud ECHpro
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

        {/* Abas de Navegação */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 pt-3 gap-2">
          <button
            onClick={() => setAbaAtiva('status')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              abaAtiva === 'status'
                ? 'border-red-600 text-red-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Certificado da Licença
          </button>

          <button
            onClick={() => setAbaAtiva('ativar')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              abaAtiva === 'ativar'
                ? 'border-red-600 text-red-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Inserir Nova Chave
          </button>

          <button
            onClick={() => setAbaAtiva('gerador')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              abaAtiva === 'gerador'
                ? 'border-red-600 text-red-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Gerador / Administração
          </button>
        </div>

        {/* Mensagens de Feedback */}
        {mensagemStatus && (
          <div
            className={`mx-5 mt-4 p-3 rounded-xl text-xs flex items-center justify-between border ${
              mensagemStatus.tipo === 'sucesso'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : mensagemStatus.tipo === 'erro'
                ? 'bg-red-50 text-red-800 border-red-200'
                : 'bg-blue-50 text-blue-800 border-blue-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {mensagemStatus.tipo === 'sucesso' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              )}
              <span>{mensagemStatus.texto}</span>
            </div>
            <button
              onClick={() => setMensagemStatus(null)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Conteúdo Principal */}
        <div className="p-5 overflow-y-auto space-y-4 text-slate-700 flex-1">
          {abaAtiva === 'status' && (
            <div className="space-y-4">
              {/* Cartão de Licença */}
              <div className="bg-red-50/60 border border-red-200 rounded-2xl p-4 sm:p-5 relative overflow-hidden">
                <div className="absolute -right-6 -bottom-6 opacity-5 pointer-events-none">
                  <KeyRound className="w-48 h-48 text-red-900" />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-red-100 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-red-700">
                      Licença Oficial Registrada
                    </span>
                    <h4 className="text-base font-extrabold text-slate-900">
                      {licenca.tipo}
                    </h4>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Autêntica & Válida</span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Titular da Licença:</span>
                    <span className="font-bold text-slate-900">{licenca.titular}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Email Associado:</span>
                    <span className="font-bold text-slate-900">{licenca.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Data de Ativação:</span>
                    <span className="font-bold text-slate-900">{licenca.dataAtivacao}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Validade:</span>
                    <span className="font-bold text-emerald-700">{licenca.dataExpiracao}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-400 block text-[11px]">ID de Hardware Windows:</span>
                    <span className="font-mono text-slate-700 bg-white px-2 py-1 rounded border border-red-200 block mt-0.5 text-[11px]">
                      {licenca.idDispositivo}
                    </span>
                  </div>
                </div>

                {/* Chave de Ativação Exibida */}
                <div className="mt-4 pt-3 border-t border-red-100">
                  <span className="text-slate-500 block text-[11px] mb-1 font-bold">
                    Chave do Produto (Product Key):
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-white border border-red-300 px-3 py-2 rounded-xl font-mono text-sm font-black text-red-700 tracking-wider select-all shadow-inner">
                      {licenca.chave}
                    </div>
                    <button
                      onClick={() => handleCopiarChave(licenca.chave)}
                      className="px-3 py-2 rounded-xl bg-white border border-slate-300 hover:border-red-600 text-slate-700 hover:text-red-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      title="Copiar Chave"
                    >
                      {copiado ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span>Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  onClick={handleExportarCertificado}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:border-red-600 text-slate-700 hover:text-red-700 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar Certificado Digital (.json)</span>
                </button>

                <button
                  onClick={() => setAbaAtiva('ativar')}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md shadow-red-200"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Alterar / Reativar Chave</span>
                </button>
              </div>
            </div>
          )}

          {abaAtiva === 'ativar' && (
            <form onSubmit={handleAtivar} className="space-y-4">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
                <p className="font-semibold text-slate-900 mb-1">
                  Instruções para Ativação do ECHpro:
                </p>
                <p>
                  Insira a chave oficial fornecida pelo suporte técnico ou no comprovativo de aquisição da licença.
                  O padrão de chave é <span className="font-mono font-bold text-red-700">ECHPRO-XXXX-XXXX-XXXX-XXXX</span>.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Chave de Ativação (Product Key):
                </label>
                <input
                  type="text"
                  placeholder="ex: ECHPRO-2026-MZ98-SAPO-7434"
                  value={inputChave}
                  onChange={e => setInputChave(e.target.value.toUpperCase())}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-mono text-sm font-bold text-slate-900 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 uppercase"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nome do Titular / Organização:
                  </label>
                  <input
                    type="text"
                    value={inputTitular}
                    onChange={e => setInputTitular(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-red-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email de Registro:
                  </label>
                  <input
                    type="email"
                    value={inputEmail}
                    onChange={e => setInputEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-red-600"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAbaAtiva('status')}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md shadow-red-200"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Validar & Ativar Sistema</span>
                </button>
              </div>
            </form>
          )}

          {abaAtiva === 'gerador' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-slate-700">
                <div className="flex items-center gap-2 text-red-700 font-bold mb-1">
                  <Sparkles className="w-4 h-4" />
                  <span>Módulo Administrativo de Emissão de Licenças</span>
                </div>
                <p>
                  Esta ferramenta permite ao administrador oficial ou suporte técnico emitir chaves de ativação adicionais
                  para novas estações de trabalho Windows 10/11 ou servidores locais.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                <button
                  onClick={handleGerarNovaChave}
                  className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md shadow-red-200"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Gerar Nova Chave Enterprise Oficial</span>
                </button>

                {inputChave && (
                  <div className="pt-2">
                    <span className="text-[11px] font-bold text-slate-500 block mb-1">
                      Chave Gerada Pronta para Ativação:
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-50 border border-slate-300 px-3 py-2 rounded-xl font-mono text-sm font-black text-slate-800">
                        {inputChave}
                      </div>
                      <button
                        onClick={() => handleCopiarChave(inputChave)}
                        className="px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-red-700 font-bold text-xs cursor-pointer hover:bg-red-100"
                      >
                        Copiar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Banner de Suporte Técnico Oficial Obrigatório */}
          <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-red-600" />
                <span className="font-bold text-slate-900">Suporte Técnico Autorizado ECHpro</span>
              </div>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Linha Ativa 24/7
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-600">
              <a
                href="tel:+258827473434"
                className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 hover:border-red-300 hover:bg-red-50/50 transition-colors group cursor-pointer"
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
                className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 hover:border-red-300 hover:bg-red-50/50 transition-colors group cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block leading-tight">Email de Suporte:</span>
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
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Validação Criptográfica Assinada</span>
          </div>
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
