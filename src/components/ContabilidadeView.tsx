import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ContaContabil, LinhaLancamento } from '../types';
import {
  Calculator,
  PlusCircle,
  FileText,
  Layers,
  ArrowRightLeft,
  CheckCircle2,
  AlertTriangle,
  Search,
  Lock,
  Sparkles,
  Printer,
} from 'lucide-react';

interface ContabilidadeViewProps {
  initialTab?: 'lancamentos' | 'plano' | 'balancete' | 'dre' | 'fecho';
  isNovoLancamentoModalOpen?: boolean;
  onCloseNovoLancamentoModal?: () => void;
}

export const ContabilidadeView: React.FC<ContabilidadeViewProps> = ({
  initialTab = 'lancamentos',
  isNovoLancamentoModalOpen = false,
  onCloseNovoLancamentoModal,
}) => {
  const {
    empresa,
    planoContas,
    diarios,
    lancamentos,
    adicionarConta,
    criarLancamento,
    obterBalancete,
    obterDRE,
    executarFechoExercicio,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'lancamentos' | 'plano' | 'balancete' | 'dre' | 'fecho'>(initialTab);
  const [showModal, setShowModal] = useState<boolean>(isNovoLancamentoModalOpen);
  const [showNovaContaModal, setShowNovaContaModal] = useState<boolean>(false);

  const [filtroDiario, setFiltroDiario] = useState<number | 'todos'>('todos');
  const [buscaDoc, setBuscaDoc] = useState<string>('');

  const [filtroClasse, setFiltroClasse] = useState<number | 'todas'>('todas');
  const [buscaConta, setBuscaConta] = useState<string>('');

  const [formLancamento, setFormLancamento] = useState<{
    data: string;
    numeroDoc: string;
    idDiario: number;
    descricao: string;
    linhas: { codigoConta: string; tipoMovimento: 'D' | 'C'; valor: number; historico: string }[];
  }>({
    data: new Date().toISOString().substring(0, 10),
    numeroDoc: `DOC-${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
    idDiario: 1,
    descricao: '',
    linhas: [
      { codigoConta: '1.2.1', tipoMovimento: 'D', valor: 0, historico: '' },
      { codigoConta: '7.2', tipoMovimento: 'C', valor: 0, historico: '' },
    ],
  });

  const [mensagemModal, setMensagemModal] = useState<{ tipo: 'erro' | 'sucesso'; texto: string } | null>(null);

  const [novaConta, setNovaConta] = useState<ContaContabil>({
    codigoConta: '',
    designacao: '',
    tipoConta: 'A',
    naturezaPredominante: 'D',
    classe: 1,
    activa: true,
  });

  const [anoFecho, setAnoFecho] = useState<number>(new Date().getFullYear());
  const [taxaIrpcFecho, setTaxaIrpcFecho] = useState<number>(32);
  const [resultadoFechoModal, setResultadoFechoModal] = useState<any>(null);

  const totalDebitoModal = formLancamento.linhas
    .filter(l => l.tipoMovimento === 'D')
    .reduce((acc, l) => acc + (Number(l.valor) || 0), 0);
  const totalCreditoModal = formLancamento.linhas
    .filter(l => l.tipoMovimento === 'C')
    .reduce((acc, l) => acc + (Number(l.valor) || 0), 0);
  const diferencaModal = totalDebitoModal - totalCreditoModal;
  const isPartidaDobradaEquilibrada = Math.abs(diferencaModal) < 0.05 && totalDebitoModal > 0;

  const handleSalvarLancamento = () => {
    if (!formLancamento.descricao.trim()) {
      setMensagemModal({ tipo: 'erro', texto: 'Por favor preencha a descrição geral do lançamento.' });
      return;
    }
    if (!isPartidaDobradaEquilibrada) {
      setMensagemModal({
        tipo: 'erro',
        texto: `Partidas dobradas desequilibradas! Débito (${totalDebitoModal.toFixed(2)}) ≠ Crédito (${totalCreditoModal.toFixed(2)}).`,
      });
      return;
    }

    const res = criarLancamento(
      formLancamento.data,
      formLancamento.numeroDoc,
      formLancamento.idDiario,
      formLancamento.descricao,
      formLancamento.linhas.map(l => ({
        codigoConta: l.codigoConta,
        tipoMovimento: l.tipoMovimento,
        valor: Number(l.valor),
        historicoEspecifico: l.historico,
      })),
      'manual'
    );

    if (res.sucesso) {
      setMensagemModal({ tipo: 'sucesso', texto: res.mensagem });
      setTimeout(() => {
        setShowModal(false);
        if (onCloseNovoLancamentoModal) onCloseNovoLancamentoModal();
        setMensagemModal(null);
        setFormLancamento({
          data: new Date().toISOString().substring(0, 10),
          numeroDoc: `DOC-${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
          idDiario: 1,
          descricao: '',
          linhas: [
            { codigoConta: '1.2.1', tipoMovimento: 'D', valor: 0, historico: '' },
            { codigoConta: '7.2', tipoMovimento: 'C', valor: 0, historico: '' },
          ],
        });
      }, 1000);
    } else {
      setMensagemModal({ tipo: 'erro', texto: res.mensagem });
    }
  };

  const handleAdicionarLinha = () => {
    setFormLancamento(prev => ({
      ...prev,
      linhas: [...prev.linhas, { codigoConta: '6.3', tipoMovimento: 'D', valor: 0, historico: '' }],
    }));
  };

  const handleRemoverLinha = (idx: number) => {
    if (formLancamento.linhas.length <= 2) return;
    setFormLancamento(prev => ({
      ...prev,
      linhas: prev.linhas.filter((_, i) => i !== idx),
    }));
  };

  const handleSalvarNovaConta = () => {
    if (!novaConta.codigoConta || !novaConta.designacao) return;
    adicionarConta(novaConta);
    setShowNovaContaModal(false);
    setNovaConta({
      codigoConta: '',
      designacao: '',
      tipoConta: 'A',
      naturezaPredominante: 'D',
      classe: 1,
      activa: true,
    });
  };

  const handleExecutarFecho = () => {
    const res = executarFechoExercicio(anoFecho, taxaIrpcFecho / 100);
    if (res.sucesso) {
      setResultadoFechoModal(res.resultado);
    } else {
      alert(res.mensagem);
    }
  };

  const balancete = obterBalancete();
  const dre = obterDRE();

  const lancamentosFiltrados = lancamentos.filter(l => {
    const matchDiario = filtroDiario === 'todos' || l.idDiario === filtroDiario;
    const matchBusca =
      !buscaDoc ||
      l.numeroDocumento.toLowerCase().includes(buscaDoc.toLowerCase()) ||
      l.descricaoGeral.toLowerCase().includes(buscaDoc.toLowerCase());
    return matchDiario && matchBusca;
  });

  const contasFiltradas = planoContas.filter(c => {
    const matchClasse = filtroClasse === 'todas' || c.classe === filtroClasse;
    const matchBusca =
      !buscaConta ||
      c.codigoConta.toLowerCase().includes(buscaConta.toLowerCase()) ||
      c.designacao.toLowerCase().includes(buscaConta.toLowerCase());
    return matchClasse && matchBusca;
  });

  return (
    <div className="space-y-6 text-slate-800">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2.5">
          <span className="p-2.5 rounded-xl bg-red-50 text-red-600 border border-red-100">
            <Calculator className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Módulo Contábil & PGC-NIRF</h1>
            <p className="text-xs text-slate-500">
              Lançamentos por partidas dobradas, balancetes de verificação, DRE e apuramento fiscal de fecho
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors shadow-md shadow-red-200 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" /> Novo Lançamento
          </button>
          <button
            onClick={() => setShowNovaContaModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 transition-colors cursor-pointer"
          >
            <Layers className="w-4 h-4 text-red-600" /> Nova Conta
          </button>
        </div>
      </div>

      {/* Navegação de Abas */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setActiveTab('lancamentos')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer ${
            activeTab === 'lancamentos'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4" /> Diários & Lançamentos ({lancamentos.length})
        </button>

        <button
          onClick={() => setActiveTab('plano')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer ${
            activeTab === 'plano'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" /> Plano de Contas ({planoContas.length})
        </button>

        <button
          onClick={() => setActiveTab('balancete')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer ${
            activeTab === 'balancete'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" /> Balancete de Verificação
        </button>

        <button
          onClick={() => setActiveTab('dre')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer ${
            activeTab === 'dre'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4" /> DRE por Natureza
        </button>

        <button
          onClick={() => setActiveTab('fecho')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer ${
            activeTab === 'fecho'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Lock className="w-4 h-4" /> Fecho de Exercício Fiscal
        </button>
      </div>

      {/* ABA 1: LANÇAMENTOS E DIÁRIOS */}
      {activeTab === 'lancamentos' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs">
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 ml-1" />
              <input
                type="text"
                placeholder="Pesquisar por documento ou histórico..."
                value={buscaDoc}
                onChange={e => setBuscaDoc(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Diário:</span>
              <select
                value={filtroDiario}
                onChange={e => setFiltroDiario(e.target.value === 'todos' ? 'todos' : Number(e.target.value))}
                className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
              >
                <option value="todos">Todos os Diários</option>
                {diarios.map(d => (
                  <option key={d.idDiario} value={d.idDiario}>
                    [{d.codigoDiario}] {d.nomeDiario}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {lancamentosFiltrados.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 text-xs shadow-xs">
                Nenhum lançamento encontrado.
              </div>
            ) : (
              lancamentosFiltrados.map(l => {
                const diario = diarios.find(d => d.idDiario === l.idDiario);
                const totalD = l.linhas
                  .filter(lin => lin.tipoMovimento === 'D')
                  .reduce((acc, lin) => acc + lin.valor, 0);

                return (
                  <div
                    key={l.idLancamento}
                    className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:border-red-200 transition-all space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-red-50 text-red-700 font-mono font-bold text-[11px] border border-red-200">
                          {diario?.codigoDiario || 'OD'}
                        </span>
                        <span className="font-bold text-slate-900">{l.numeroDocumento}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-500">{l.dataLancamento}</span>
                        {l.origem && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 uppercase font-mono border border-slate-200">
                            {l.origem}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-slate-500">
                          Total:{' '}
                          <strong className="text-red-700 font-mono text-sm font-bold">
                            {totalD.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} {empresa.moeda}
                          </strong>
                        </span>
                        <span className="text-[10px] text-slate-400">ID #{l.idLancamento}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 italic">{l.descricaoGeral}</p>

                    <div className="bg-slate-50/70 rounded-xl overflow-hidden border border-slate-200">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-red-50/60 text-red-900 border-b border-red-200/80 text-[11px]">
                          <tr>
                            <th className="py-2 px-3 font-bold">Conta</th>
                            <th className="py-2 px-3 font-bold">Designação</th>
                            <th className="py-2 px-3 font-bold">Histórico Específico</th>
                            <th className="py-2 px-3 text-right font-bold">Débito</th>
                            <th className="py-2 px-3 text-right font-bold">Crédito</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200/60 bg-white">
                          {l.linhas.map((linha, idx) => {
                            const conta = planoContas.find(c => c.codigoConta === linha.codigoConta);
                            return (
                              <tr key={idx} className="hover:bg-red-50/30 transition-colors">
                                <td className="py-2 px-3 font-mono font-bold text-red-700">
                                  {linha.codigoConta}
                                </td>
                                <td className="py-2 px-3 text-slate-800 font-medium">
                                  {conta?.designacao || 'Conta Movimento'}
                                </td>
                                <td className="py-2 px-3 text-slate-500 text-[11px]">
                                  {linha.historicoEspecifico || '-'}
                                </td>
                                <td className="py-2 px-3 text-right font-mono font-bold text-slate-800">
                                  {linha.tipoMovimento === 'D'
                                    ? linha.valor.toLocaleString('pt-PT', { minimumFractionDigits: 2 })
                                    : '-'}
                                </td>
                                <td className="py-2 px-3 text-right font-mono font-bold text-slate-800">
                                  {linha.tipoMovimento === 'C'
                                    ? linha.valor.toLocaleString('pt-PT', { minimumFractionDigits: 2 })
                                    : '-'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ABA 2: PLANO DE CONTAS */}
      {activeTab === 'plano' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs">
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 ml-1" />
              <input
                type="text"
                placeholder="Pesquisar conta por código ou designação..."
                value={buscaConta}
                onChange={e => setBuscaConta(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="text-slate-500 font-medium mr-1">Classe:</span>
              <button
                onClick={() => setFiltroClasse('todas')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  filtroClasse === 'todas'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Todas
              </button>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(cl => (
                <button
                  key={cl}
                  onClick={() => setFiltroClasse(cl)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    filtroClasse === cl
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Cl. {cl}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-red-50 text-red-900 border-b border-red-200 text-[11px]">
                <tr>
                  <th className="py-2.5 px-4 font-bold">Código</th>
                  <th className="py-2.5 px-4 font-bold">Designação</th>
                  <th className="py-2.5 px-4 font-bold">Classe</th>
                  <th className="py-2.5 px-4 font-bold">Tipo</th>
                  <th className="py-2.5 px-4 font-bold">Natureza</th>
                  <th className="py-2.5 px-4 font-bold">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contasFiltradas.map(c => (
                  <tr
                    key={c.codigoConta}
                    className={`hover:bg-red-50/30 transition-colors ${
                      c.tipoConta === 'I' ? 'bg-slate-50 font-bold text-slate-900' : 'text-slate-700'
                    }`}
                  >
                    <td className="py-2.5 px-4 font-mono font-bold text-red-700">{c.codigoConta}</td>
                    <td className={`py-2.5 px-4 ${c.tipoConta === 'I' ? 'text-slate-900' : 'text-slate-800'}`}>
                      {c.tipoConta === 'I' ? c.designacao.toUpperCase() : c.designacao}
                    </td>
                    <td className="py-2.5 px-4 text-slate-500">Classe {c.classe}</td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                          c.tipoConta === 'A'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {c.tipoConta === 'A' ? 'Analítica (Mov)' : 'Integradora'}
                      </span>
                    </td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                          c.naturezaPredominante === 'D'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {c.naturezaPredominante === 'D' ? 'Devedora' : 'Credora'}
                      </span>
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Activa
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 3: BALANCETE DE VERIFICAÇÃO */}
      {activeTab === 'balancete' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-red-600" />
                  Balancete de Verificação Analítico
                </h2>
                <p className="text-xs text-slate-500">
                  Validação e equilíbrio do Razão Contábil (Somatório de Débitos vs Créditos)
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                    !balancete.desbalanceado
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {!balancete.desbalanceado ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Partidas Equilibradas
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-rose-600" /> Desbalanceado
                    </>
                  )}
                </span>

                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-red-600" /> Imprimir
                </button>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-red-50 text-red-900 border-b border-red-200 text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3 font-bold">Conta</th>
                    <th className="py-2.5 px-3 font-bold">Designação da Conta</th>
                    <th className="py-2.5 px-3 font-bold text-center">Cl.</th>
                    <th className="py-2.5 px-3 text-right font-bold">Total Débito</th>
                    <th className="py-2.5 px-3 text-right font-bold">Total Crédito</th>
                    <th className="py-2.5 px-3 text-right font-bold">Saldo Atual</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {balancete.contas.map(c => (
                    <tr key={c.codigoConta} className="hover:bg-red-50/20 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-red-700">{c.codigoConta}</td>
                      <td className="py-2.5 px-3 text-slate-800 font-medium">{c.designacao}</td>
                      <td className="py-2.5 px-3 text-center text-slate-500 font-mono">{c.classe}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800">
                        {c.totalDebito > 0 ? c.totalDebito.toLocaleString('pt-PT', { minimumFractionDigits: 2 }) : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800">
                        {c.totalCredito > 0 ? c.totalCredito.toLocaleString('pt-PT', { minimumFractionDigits: 2 }) : '-'}
                      </td>
                      <td
                        className={`py-2.5 px-3 text-right font-mono font-bold ${
                          c.saldoActual >= 0 ? 'text-emerald-700' : 'text-rose-600'
                        }`}
                      >
                        {c.saldoActual.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} ({c.naturezaPredominante})
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 font-bold text-slate-900 border-t-2 border-red-300">
                  <tr>
                    <td colSpan={3} className="py-3 px-3 uppercase text-slate-800 text-xs font-black">
                      TOTAIS CONSOLIDADOS (PARTIDAS DOBRADAS)
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-red-700 font-black text-sm">
                      {balancete.totalDebitos.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-red-700 font-black text-sm">
                      {balancete.totalCreditos.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT
                    </td>
                    <td className="py-3 px-3 text-right text-xs text-slate-600 font-medium">
                      Diferença: {(balancete.totalDebitos - balancete.totalCreditos).toFixed(2)} MT
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ABA 4: DRE POR NATUREZA */}
      {activeTab === 'dre' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs uppercase font-bold text-red-600 tracking-wider">
                  Demonstrações Financeiras Oficiais
                </span>
                <h2 className="text-lg font-black text-slate-900 tracking-tight mt-0.5">
                  Demonstração dos Resultados por Natureza (PGC-NIRF)
                </h2>
                <p className="text-xs text-slate-500">
                  Exercício findo em 31 de Dezembro • Expressa em Meticais ({empresa.moeda})
                </p>
              </div>

              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4 text-red-600" /> Exportar / Imprimir DRE
              </button>
            </div>

            <div className="mt-5 space-y-2 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>1. Vendas e Prestações de Serviços</span>
                  <span className="font-mono text-red-700 font-bold">
                    {dre.volumeNegocios.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT
                  </span>
                </div>
                <div className="flex justify-between pl-4 text-slate-600">
                  <span>Vendas de Mercadorias (Conta 7.1)</span>
                  <span className="font-mono">{dre.vendas.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT</span>
                </div>
                <div className="flex justify-between pl-4 text-slate-600">
                  <span>Prestações de Serviços (Conta 7.2)</span>
                  <span className="font-mono">{dre.servicos.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50/60 border border-slate-200 rounded-xl flex justify-between text-slate-700 font-medium">
                <span>2. Custo das Mercadorias Vendidas e Matérias Consumidas (Conta 6.1)</span>
                <span className="font-mono text-rose-600 font-bold">
                  - {dre.cmv.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT
                </span>
              </div>

              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex justify-between font-bold text-red-800">
                <span>MARGEM BRUTA</span>
                <span className="font-mono text-sm font-black">
                  {dre.margemBruta.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT
                </span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>3. Gastos com o Pessoal (Contas 6.2.x)</span>
                  <span className="font-mono text-rose-600 font-bold">
                    - {dre.gastosPessoal.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT
                  </span>
                </div>
                <div className="flex justify-between pl-4 text-slate-600">
                  <span>Fornecimentos e Serviços de Terceiros - FST (Conta 6.3)</span>
                  <span className="font-mono text-rose-600 font-bold">
                    - {dre.fst.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-100 border border-slate-300 rounded-xl flex justify-between font-bold text-slate-900">
                <span className="uppercase">RESULTADO OPERACIONAL (EBIT)</span>
                <span className="font-mono text-slate-900 text-sm font-black">
                  {dre.resultadoOperacional.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT
                </span>
              </div>

              <div className="p-3 bg-slate-50/60 border border-slate-200 rounded-xl flex justify-between text-slate-700 font-medium">
                <span>Imposto sobre o Rendimento das Pessoas Colectivas - IRPC (Conta 8.8)</span>
                <span className="font-mono text-rose-600 font-bold">
                  - {dre.irpc.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT
                </span>
              </div>

              <div className="p-4 bg-gradient-to-r from-red-600 to-red-700 border border-red-700 rounded-xl flex justify-between font-bold text-white text-sm shadow-md">
                <span className="uppercase tracking-wide font-black">RESULTADO LÍQUIDO DO EXERCÍCIO (LUCRO / PREJUÍZO)</span>
                <span className="font-mono text-base font-black">
                  {dre.resultadoLiquido.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 5: FECHO DE EXERCÍCIO FISCAL */}
      {activeTab === 'fecho' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="p-2.5 rounded-xl bg-red-50 text-red-600 border border-red-100">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Fecho Automático de Exercício Contabilístico
                </h2>
                <p className="text-xs text-slate-500">
                  Conforme PGC-NIRF: zera saldos das Classes 6 (Gastos) e 7 (Rendimentos), transfere para a Classe 8 e apura IRPC
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <label className="text-xs font-bold text-slate-800 block">Ano Fiscal de Fecho:</label>
                <input
                  type="number"
                  value={anoFecho}
                  onChange={e => setAnoFecho(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 font-mono font-bold"
                />

                <label className="text-xs font-bold text-slate-800 block mt-3">Taxa Oficial de IRPC (%):</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={taxaIrpcFecho}
                    onChange={e => setTaxaIrpcFecho(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 font-mono font-bold"
                  />
                  <span className="text-xs text-slate-600 font-bold">%</span>
                </div>

                <button
                  onClick={handleExecutarFecho}
                  className="w-full mt-4 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-md shadow-red-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lock className="w-4 h-4" /> Executar Fecho do Exercício {anoFecho}
                </button>
              </div>

              <div className="md:col-span-2 p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Etapas Executadas Automaticamente:
                </h3>
                <ul className="text-xs text-slate-600 space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-slate-800">1. Anulação de Gastos (Classe 6):</strong> Todas as contas com saldo devedor recebem lançamento a Crédito.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-slate-800">2. Anulação de Rendimentos (Classe 7):</strong> Todas as contas com saldo credor recebem lançamento a Débito.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-slate-800">3. Centralização em Resultados (Conta 8.1):</strong> Apuramento do lucro ou prejuízo do exercício antes de impostos.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-slate-800">4. Apuramento de IRPC ({taxaIrpcFecho}%):</strong> Débito em 8.8 (Imposto sobre Rendimento) e Crédito em 2.4.6.2 (IRPC a pagar).
                    </span>
                  </li>
                </ul>

                {resultadoFechoModal && (
                  <div className="mt-4 p-4 bg-emerald-50 border border-emerald-300 rounded-xl space-y-2">
                    <p className="text-xs font-bold text-emerald-800">
                      Fecho do Exercício {resultadoFechoModal.anoFiscal} Finalizado com Sucesso!
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-700">
                      <div>Total Gastos Transferidos: {resultadoFechoModal.totalGastos.toLocaleString()} MT</div>
                      <div>Total Rendimentos: {resultadoFechoModal.totalRendimentos.toLocaleString()} MT</div>
                      <div>Lucro Antes de Imposto: {resultadoFechoModal.lucroAntesImposto.toLocaleString()} MT</div>
                      <div>IRPC Calculado ({taxaIrpcFecho}%): {resultadoFechoModal.irpcDevido.toLocaleString()} MT</div>
                      <div className="col-span-2 font-bold text-emerald-800 text-sm">
                        Resultado Líquido Final: {resultadoFechoModal.resultadoLiquido.toLocaleString()} MT
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NOVO LANÇAMENTO EM PARTIDAS DOBRADAS */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-8">
            <div className="p-4 bg-red-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-red-100" />
                <h3 className="font-bold text-sm text-white">
                  Novo Lançamento Contábil (Partidas Dobradas)
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  if (onCloseNovoLancamentoModal) onCloseNovoLancamentoModal();
                }}
                className="text-red-100 hover:text-white cursor-pointer font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {mensagemModal && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    mensagemModal.tipo === 'sucesso'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                      : 'bg-rose-50 text-rose-800 border border-rose-300'
                  }`}
                >
                  {mensagemModal.tipo === 'sucesso' ? (
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                  )}
                  <span className="font-semibold">{mensagemModal.texto}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Data:</label>
                  <input
                    type="date"
                    value={formLancamento.data}
                    onChange={e => setFormLancamento({ ...formLancamento, data: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Nº Documento:</label>
                  <input
                    type="text"
                    value={formLancamento.numeroDoc}
                    onChange={e => setFormLancamento({ ...formLancamento, numeroDoc: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Diário Contábil:</label>
                  <select
                    value={formLancamento.idDiario}
                    onChange={e => setFormLancamento({ ...formLancamento, idDiario: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                  >
                    {diarios.map(d => (
                      <option key={d.idDiario} value={d.idDiario}>
                        [{d.codigoDiario}] {d.nomeDiario}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Descrição Geral / Histórico do Movimento:</label>
                <input
                  type="text"
                  placeholder="Ex: Aquisição de material de escritório com IVA suportado..."
                  value={formLancamento.descricao}
                  onChange={e => setFormLancamento({ ...formLancamento, descricao: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                />
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Linhas do Lançamento (Débito & Crédito)
                  </span>
                  <button
                    onClick={handleAdicionarLinha}
                    className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    + Adicionar Linha
                  </button>
                </div>

                <div className="space-y-2">
                  {formLancamento.linhas.map((linha, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-12 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 items-center text-xs"
                    >
                      <div className="col-span-5 sm:col-span-4">
                        <select
                          value={linha.codigoConta}
                          onChange={e => {
                            const val = e.target.value;
                            setFormLancamento(prev => ({
                              ...prev,
                              linhas: prev.linhas.map((l, i) => (i === idx ? { ...l, codigoConta: val } : l)),
                            }));
                          }}
                          className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-red-700 font-mono font-bold focus:outline-none focus:border-red-600"
                        >
                          {planoContas
                            .filter(c => c.tipoConta === 'A')
                            .map(c => (
                              <option key={c.codigoConta} value={c.codigoConta}>
                                {c.codigoConta} - {c.designacao}
                              </option>
                            ))}
                        </select>
                      </div>

                      <div className="col-span-3 sm:col-span-2">
                        <select
                          value={linha.tipoMovimento}
                          onChange={e => {
                            const val = e.target.value as 'D' | 'C';
                            setFormLancamento(prev => ({
                              ...prev,
                              linhas: prev.linhas.map((l, i) => (i === idx ? { ...l, tipoMovimento: val } : l)),
                            }));
                          }}
                          className={`w-full font-bold font-mono rounded-lg px-2 py-1.5 text-xs border focus:outline-none ${
                            linha.tipoMovimento === 'D'
                              ? 'bg-red-50 border-red-300 text-red-700'
                              : 'bg-slate-100 border-slate-300 text-slate-800'
                          }`}
                        >
                          <option value="D">Débito (D)</option>
                          <option value="C">Crédito (C)</option>
                        </select>
                      </div>

                      <div className="col-span-4 sm:col-span-3">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Valor"
                          value={linha.valor || ''}
                          onChange={e => {
                            const val = parseFloat(e.target.value) || 0;
                            setFormLancamento(prev => ({
                              ...prev,
                              linhas: prev.linhas.map((l, i) => (i === idx ? { ...l, valor: val } : l)),
                            }));
                          }}
                          className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-mono font-bold text-right focus:outline-none focus:border-red-600"
                        />
                      </div>

                      <div className="col-span-11 sm:col-span-2">
                        <input
                          type="text"
                          placeholder="Histórico..."
                          value={linha.historico}
                          onChange={e => {
                            const val = e.target.value;
                            setFormLancamento(prev => ({
                              ...prev,
                              linhas: prev.linhas.map((l, i) => (i === idx ? { ...l, historico: val } : l)),
                            }));
                          }}
                          className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-[11px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-600"
                        />
                      </div>

                      <div className="col-span-1 text-right">
                        {formLancamento.linhas.length > 2 && (
                          <button
                            onClick={() => handleRemoverLinha(idx)}
                            className="text-slate-400 hover:text-red-600 text-sm font-bold cursor-pointer"
                            title="Remover linha"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-slate-600 font-medium">Total Débito: </span>
                  <span className="font-mono font-bold text-red-700">{totalDebitoModal.toFixed(2)} MT</span>
                  <span className="text-slate-300 mx-2">|</span>
                  <span className="text-slate-600 font-medium">Total Crédito: </span>
                  <span className="font-mono font-bold text-slate-800">{totalCreditoModal.toFixed(2)} MT</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-600 font-medium">Diferença:</span>
                  <span
                    className={`font-mono font-bold ${
                      isPartidaDobradaEquilibrada ? 'text-emerald-700' : 'text-rose-600'
                    }`}
                  >
                    {diferencaModal.toFixed(2)} MT
                  </span>
                  {isPartidaDobradaEquilibrada ? (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Equilibrado ✓
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[10px] font-bold">
                      Desbalanceado ✕
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => {
                  setShowModal(false);
                  if (onCloseNovoLancamentoModal) onCloseNovoLancamentoModal();
                }}
                className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-300 transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                disabled={!isPartidaDobradaEquilibrada}
                onClick={handleSalvarLancamento}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                  isPartidaDobradaEquilibrada
                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-200 cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                Gravar Lançamento no Razão
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NOVA CONTA NO PLANO DE CONTAS */}
      {showNovaContaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-md shadow-2xl p-5 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2.5">
              <Layers className="w-4 h-4 text-red-600" /> Cadastrar Conta no PGC-NIRF
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Código da Conta (Ex: 2.1.3):</label>
                <input
                  type="text"
                  placeholder="2.1.3"
                  value={novaConta.codigoConta}
                  onChange={e => setNovaConta({ ...novaConta, codigoConta: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-mono font-bold focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Designação / Nome:</label>
                <input
                  type="text"
                  placeholder="Ex: Clientes Governamentais..."
                  value={novaConta.designacao}
                  onChange={e => setNovaConta({ ...novaConta, designacao: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Classe (1-8):</label>
                  <select
                    value={novaConta.classe}
                    onChange={e => setNovaConta({ ...novaConta, classe: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 focus:outline-none focus:border-red-600"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(cl => (
                      <option key={cl} value={cl}>
                        Classe {cl}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Tipo de Conta:</label>
                  <select
                    value={novaConta.tipoConta}
                    onChange={e => setNovaConta({ ...novaConta, tipoConta: e.target.value as 'A' | 'I' })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 focus:outline-none focus:border-red-600"
                  >
                    <option value="A">Analítica (Movimento)</option>
                    <option value="I">Integradora (Agrupadora)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Natureza Predominante:</label>
                <select
                  value={novaConta.naturezaPredominante}
                  onChange={e => setNovaConta({ ...novaConta, naturezaPredominante: e.target.value as 'D' | 'C' })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 focus:outline-none focus:border-red-600"
                >
                  <option value="D">Devedora (Débitos aumentam saldo)</option>
                  <option value="C">Credora (Créditos aumentam saldo)</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowNovaContaModal(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvarNovaConta}
                className="px-4 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 shadow-md shadow-red-200 cursor-pointer"
              >
                Salvar Conta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
