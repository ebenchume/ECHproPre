import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TransacaoBancaria } from '../types';
import {
  Landmark,
  RefreshCw,
  CheckCircle2,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Filter,
  Sparkles,
  Link,
  ShieldCheck,
  Building,
} from 'lucide-react';

export const BancosView: React.FC = () => {
  const {
    empresa,
    transacoesBancarias,
    sincronizarExtratoBancario,
    conciliarTransacao,
    desconciliarTransacao,
    obterSaldosContas,
    planoContas,
  } = useApp();

  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'pendentes' | 'conciliados'>('todos');
  const [busca, setBusca] = useState('');
  const [modalConciliar, setModalConciliar] = useState<TransacaoBancaria | null>(null);
  const [contaContrapartida, setContaContrapartida] = useState('2.1.1');
  const [isSincronizando, setIsSincronizando] = useState(false);

  const saldos = obterSaldosContas();
  const saldoBim = saldos.find(s => s.codigoConta === '1.2.1')?.saldoActual || 0;
  const saldoStb = saldos.find(s => s.codigoConta === '1.2.2')?.saldoActual || 0;
  const saldoCaixa = saldos.find(s => s.codigoConta === '1.1.1')?.saldoActual || 0;

  const handleSincronizar = () => {
    setIsSincronizando(true);
    setTimeout(() => {
      sincronizarExtratoBancario();
      setIsSincronizando(false);
    }, 800);
  };

  const handleConfirmarConciliacao = () => {
    if (!modalConciliar) return;
    const res = conciliarTransacao(modalConciliar.id, contaContrapartida);
    if (res.sucesso) {
      setModalConciliar(null);
    } else {
      alert(res.mensagem);
    }
  };

  const transacoesFiltradas = transacoesBancarias.filter(t => {
    const matchStatus =
      filtroStatus === 'todos'
        ? true
        : filtroStatus === 'conciliados'
        ? t.conciliado
        : !t.conciliado;

    const matchBusca =
      !busca ||
      t.descricao.toLowerCase().includes(busca.toLowerCase()) ||
      t.bancoNome.toLowerCase().includes(busca.toLowerCase()) ||
      t.id.toLowerCase().includes(busca.toLowerCase());

    return matchStatus && matchBusca;
  });

  const totalConciliadas = transacoesBancarias.filter(t => t.conciliado).length;
  const totalPendentes = transacoesBancarias.filter(t => !t.conciliado).length;

  return (
    <div className="space-y-6 text-slate-800">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2.5">
          <span className="p-2.5 rounded-xl bg-red-50 text-red-600 border border-red-100">
            <Landmark className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Integração Bancária & Conciliação em Tempo Real
            </h1>
            <p className="text-xs text-slate-500">
              Conexão via APIs abertas com Millennium BIM e Standard Bank, sincronização de fluxo de caixa e reconciliação contábil automática
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            disabled={isSincronizando}
            onClick={handleSincronizar}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs transition-colors shadow-md shadow-red-200 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isSincronizando ? 'animate-spin' : ''}`} />
            {isSincronizando ? 'Sincronizando APIs...' : 'Sincronizar Extratos'}
          </button>
        </div>
      </div>

      {/* Cards de Saldos Bancários em Tempo Real */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2 shadow-xs hover:border-red-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-600 font-bold">Millennium BIM (Conta D.O.)</span>
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono text-[10px] font-bold border border-emerald-200">
              Online 24/7
            </span>
          </div>
          <p className="text-xl font-black text-slate-900 font-mono">
            {saldoBim.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}{' '}
            <span className="text-xs text-slate-400 font-semibold">{empresa.moeda}</span>
          </p>
          <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-1.5 font-medium">
            <span>Conta 1.2.1</span>
            <span className="text-red-700 font-semibold">API Open Banking</span>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2 shadow-xs hover:border-red-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-600 font-bold">Standard Bank (Conta D.O.)</span>
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono text-[10px] font-bold border border-emerald-200">
              Online 24/7
            </span>
          </div>
          <p className="text-xl font-black text-slate-900 font-mono">
            {saldoStb.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}{' '}
            <span className="text-xs text-slate-400 font-semibold">{empresa.moeda}</span>
          </p>
          <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-1.5 font-medium">
            <span>Conta 1.2.2</span>
            <span className="text-red-700 font-semibold">API Open Banking</span>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2 shadow-xs hover:border-red-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-600 font-bold">Caixa Geral Meticais</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] font-bold border border-slate-200">
              Físico
            </span>
          </div>
          <p className="text-xl font-black text-slate-900 font-mono">
            {saldoCaixa.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}{' '}
            <span className="text-xs text-slate-400 font-semibold">{empresa.moeda}</span>
          </p>
          <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-1.5 font-medium">
            <span>Conta 1.1.1</span>
            <span>Fundo de Maneio</span>
          </div>
        </div>
      </div>

      {/* Tabela de Transações e Conciliação */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs space-y-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 ml-1" />
            <input
              type="text"
              placeholder="Pesquisar transação bancária..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-600 font-medium"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setFiltroStatus('todos')}
              className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors ${
                filtroStatus === 'todos' ? 'bg-red-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Todas ({transacoesBancarias.length})
            </button>
            <button
              onClick={() => setFiltroStatus('pendentes')}
              className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors ${
                filtroStatus === 'pendentes' ? 'bg-amber-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Pendentes ({totalPendentes})
            </button>
            <button
              onClick={() => setFiltroStatus('conciliados')}
              className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-colors ${
                filtroStatus === 'conciliados' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Conciliadas ({totalConciliadas})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-red-50 text-red-900 border-b border-red-200 text-[11px] font-bold">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Data</th>
                <th className="py-2.5 px-3 font-semibold">Instituição Bancária</th>
                <th className="py-2.5 px-3 font-semibold">Histórico / Descrição da Transação</th>
                <th className="py-2.5 px-3 font-semibold">Categoria</th>
                <th className="py-2.5 px-3 text-right font-semibold">Valor</th>
                <th className="py-2.5 px-3 font-semibold text-center">Estado</th>
                <th className="py-2.5 px-3 text-center font-semibold">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transacoesFiltradas.map(t => (
                <tr key={t.id} className="hover:bg-red-50/30 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-slate-500 font-medium">{t.data}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">{t.bancoNome}</td>
                  <td className="py-2.5 px-3 text-slate-700">
                    <p className="font-semibold text-slate-900">{t.descricao}</p>
                    {t.idLancamentoAssociado && (
                      <p className="text-[10px] text-red-700 font-mono font-bold mt-0.5">
                        Razão: Lançamento #{t.idLancamentoAssociado}
                      </p>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 text-[11px] font-medium">{t.categoria}</td>
                  <td
                    className={`py-2.5 px-3 text-right font-mono font-black ${
                      t.tipo === 'credito' ? 'text-emerald-600' : 'text-red-600'
                    }`}
                  >
                    {t.tipo === 'credito' ? '+' : '-'} {t.valor.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase font-mono ${
                        t.conciliado
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {t.conciliado ? 'Conciliado ✓' : 'Pendente ⏱'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {!t.conciliado ? (
                      <button
                        onClick={() => setModalConciliar(t)}
                        className="px-2.5 py-1 rounded-lg bg-red-50 text-red-700 hover:bg-red-600 hover:text-white border border-red-200 text-[11px] font-bold transition-colors cursor-pointer shadow-2xs"
                      >
                        Conciliar Auto
                      </button>
                    ) : (
                      <button
                        onClick={() => desconciliarTransacao(t.id)}
                        className="text-[11px] text-slate-400 hover:text-red-600 font-medium cursor-pointer"
                      >
                        Desfazer
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: CONCILIAÇÃO AUTOMÁTICA */}
      {modalConciliar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-md shadow-2xl p-5 space-y-4 text-slate-800">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2.5">
              <Link className="w-4 h-4 text-red-600" /> Conciliação Contábil Automática
            </h3>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
              <p className="text-slate-500">Banco: <strong className="text-slate-900">{modalConciliar.bancoNome}</strong></p>
              <p className="text-slate-500">Descrição: <span className="text-slate-800 font-medium">{modalConciliar.descricao}</span></p>
              <p className="text-slate-500">
                Valor:{' '}
                <strong className={`font-mono font-bold ${modalConciliar.tipo === 'credito' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {modalConciliar.valor.toLocaleString()} MT ({modalConciliar.tipo.toUpperCase()})
                </strong>
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <label className="text-slate-700 block font-bold">
                Conta de Contrapartida no Plano de Contas (PGC-NIRF):
              </label>
              <select
                value={contaContrapartida}
                onChange={e => setContaContrapartida(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono text-xs focus:outline-none focus:border-red-600 font-medium"
              >
                <optgroup label="Clientes & Vendas">
                  <option value="2.1.1">2.1.1 - Clientes Nacionais - C/C</option>
                  <option value="7.1">7.1 - Vendas de Mercadorias e Produtos</option>
                  <option value="7.2">7.2 - Prestações de Serviços Especializados</option>
                </optgroup>
                <optgroup label="Fornecedores & Gastos">
                  <option value="2.2.1">2.2.1 - Fornecedores Nacionais - C/C</option>
                  <option value="6.3">6.3 - Fornecimentos e Serviços de Terceiros (FST)</option>
                  <option value="6.8">6.8 - Outros Gastos Operacionais</option>
                </optgroup>
                <optgroup label="Pessoal & Estado">
                  <option value="2.6.1">2.6.1 - Remunerações a Pagar aos Colaboradores</option>
                  <option value="2.4.5">2.4.5 - Segurança Social (INSS a Pagar)</option>
                  <option value="2.4.6.1">2.4.6.1 - IRPS a Pagar</option>
                </optgroup>
              </select>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                onClick={() => setModalConciliar(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs hover:bg-slate-200 font-medium cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarConciliacao}
                className="px-4 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 cursor-pointer shadow-md shadow-red-200"
              >
                Confirmar Lançamento de Conciliação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
