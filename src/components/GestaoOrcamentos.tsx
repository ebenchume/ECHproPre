import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Target,
  Sliders,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Edit3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  PlusCircle,
  ArrowRight,
  Filter,
  X,
  FileSpreadsheet,
} from 'lucide-react';

export const GestaoOrcamentos: React.FC = () => {
  const {
    empresa,
    obterResumoOrcamentos,
    atualizarOrcamento,
    funcionarios,
  } = useApp();

  const resumo = obterResumoOrcamentos();

  // Estados locais
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'conforme' | 'alerta' | 'estourado'>('todos');
  const [modalEditar, setModalEditar] = useState<{
    departamento: string;
    limite: number;
    observacoes: string;
  } | null>(null);

  // Totais consolidados
  const totalOrcado = resumo.reduce((acc, r) => acc + r.limite, 0);
  const totalGasto = resumo.reduce((acc, r) => acc + r.gastoReal, 0);
  const saldoGlobal = totalOrcado - totalGasto;
  const taxaExecucaoGlobal = totalOrcado > 0 ? Math.round((totalGasto / totalOrcado) * 100) : 0;

  // Filtragem
  const departamentosFiltrados = resumo.filter(item => {
    if (filtroStatus === 'todos') return true;
    if (filtroStatus === 'conforme') return item.status === 'normal';
    if (filtroStatus === 'alerta') return item.status === 'alerta';
    if (filtroStatus === 'estourado') return item.status === 'estourado';
    return true;
  });

  const totalEstourados = resumo.filter(r => r.status === 'estourado').length;
  const totalAlertas = resumo.filter(r => r.status === 'alerta').length;

  const handleSalvarEdicao = () => {
    if (!modalEditar || modalEditar.limite <= 0) return;
    atualizarOrcamento(modalEditar.departamento, Number(modalEditar.limite), modalEditar.observacoes);
    setModalEditar(null);
  };

  const exportarRelatorioOrcamentosCSV = () => {
    let csv = 'data:text/csv;charset=utf-8,Departamento;Limite_Mensal;Gasto_Real;Variacao_Saldo;Percentual_Consumido;Status\n';
    resumo.forEach(r => {
      csv += `"${r.departamento}";${r.limite};${r.gastoReal};${r.diferenca};${r.percentualUsado}%;${r.status.toUpperCase()}\n`;
    });
    const uri = encodeURI(csv);
    const link = document.createElement('a');
    link.setAttribute('href', uri);
    link.setAttribute('download', `orcamentos_departamentos_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="modulo-orcamentos" className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-6 text-slate-800">
      {/* Topo do Módulo */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-50 text-red-600 border border-red-100">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Gestão de Orçamentos Departamentais
              </h2>
              <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 text-[10px] font-bold border border-red-200 uppercase font-mono">
                Planejamento & Variação
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Defina tetos de gastos mensais por departamento e acompanhe desvios orçamentários em tempo real
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {totalEstourados > 0 && (
            <span className="px-3 py-1.5 rounded-xl bg-red-100 border border-red-300 text-red-800 text-xs font-bold flex items-center gap-1.5 animate-pulse">
              <AlertCircle className="w-4 h-4 text-red-600" />
              {totalEstourados} Departamento{totalEstourados > 1 ? 's' : ''} Excederam o Teto!
            </span>
          )}

          {totalAlertas > 0 && totalEstourados === 0 && (
            <span className="px-3 py-1.5 rounded-xl bg-amber-100 border border-amber-300 text-amber-800 text-xs font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              {totalAlertas} em Alerta (&gt;85%)
            </span>
          )}

          {totalEstourados === 0 && totalAlertas === 0 && (
            <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Todos Dentro da Meta
            </span>
          )}

          <button
            onClick={exportarRelatorioOrcamentosCSV}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Exportar dados de orçamentos para CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-red-600" /> Exportar CSV
          </button>

          <button
            onClick={() => {
              setModalEditar({
                departamento: resumo[0]?.departamento || 'Finanças e Contabilidade',
                limite: resumo[0]?.limite || 150000,
                observacoes: resumo[0]?.observacoes || '',
              });
            }}
            className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md shadow-red-200 flex items-center gap-1.5 cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" /> Definir Limites
          </button>
        </div>
      </div>

      {/* Cards de Métricas Consolidadas do Orçamento */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
          <span className="text-[11px] text-slate-500 block font-medium">Orçamento Global Aprovado:</span>
          <p className="text-lg font-black text-slate-900 font-mono mt-0.5">
            {totalOrcado.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} {empresa.moeda}
          </p>
          <span className="text-[10px] text-slate-500">{resumo.length} Departamentos parametrizados</span>
        </div>

        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
          <span className="text-[11px] text-slate-500 block font-medium">Despesa Real Consumida:</span>
          <p className="text-lg font-black text-red-700 font-mono mt-0.5">
            {totalGasto.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} {empresa.moeda}
          </p>
          <span className="text-[10px] text-slate-500">Folha + Encargos + Benefícios</span>
        </div>

        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
          <span className="text-[11px] text-slate-500 block font-medium">Saldo / Margem Remanescente:</span>
          <p
            className={`text-lg font-black font-mono mt-0.5 ${
              saldoGlobal >= 0 ? 'text-emerald-600' : 'text-red-600'
            }`}
          >
            {saldoGlobal >= 0 ? '+' : ''}{saldoGlobal.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} {empresa.moeda}
          </p>
          <span className="text-[10px] text-slate-500">
            {saldoGlobal >= 0 ? 'Superávit disponível para o mês' : 'Déficit orçamentário agregado'}
          </span>
        </div>

        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
          <span className="text-[11px] text-slate-500 block font-medium">Índice Médio de Execução:</span>
          <p
            className={`text-lg font-black font-mono mt-0.5 ${
              taxaExecucaoGlobal >= 100
                ? 'text-red-600'
                : taxaExecucaoGlobal >= 85
                ? 'text-amber-600'
                : 'text-slate-900'
            }`}
          >
            {taxaExecucaoGlobal}%
          </p>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1.5">
            <div
              className={`h-full rounded-full transition-all ${
                taxaExecucaoGlobal >= 100
                  ? 'bg-red-600'
                  : taxaExecucaoGlobal >= 85
                  ? 'bg-amber-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(100, taxaExecucaoGlobal)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Barra de Filtro Rápido por Status de Alerta */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 mr-1 flex items-center gap-1 font-medium">
            <Filter className="w-3.5 h-3.5" /> Filtrar:
          </span>
          <button
            onClick={() => setFiltroStatus('todos')}
            className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
              filtroStatus === 'todos' ? 'bg-red-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos ({resumo.length})
          </button>
          <button
            onClick={() => setFiltroStatus('conforme')}
            className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
              filtroStatus === 'conforme' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Conformes ({resumo.filter(r => r.status === 'normal').length})
          </button>
          <button
            onClick={() => setFiltroStatus('alerta')}
            className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
              filtroStatus === 'alerta' ? 'bg-amber-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Atenção ({resumo.filter(r => r.status === 'alerta').length})
          </button>
          <button
            onClick={() => setFiltroStatus('estourado')}
            className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
              filtroStatus === 'estourado' ? 'bg-red-700 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Excedidos ({resumo.filter(r => r.status === 'estourado').length})
          </button>
        </div>

        <span className="text-[11px] text-slate-400 font-mono">
          Alíquota base: Salários + INSS Patronal (4%) + Benefícios
        </span>
      </div>

      {/* Grade de Departamentos com Variação e Alertas Visuais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departamentosFiltrados.map(item => {
          const isEstourado = item.status === 'estourado';
          const isAlerta = item.status === 'alerta';
          const colaboradoresNoDepto = funcionarios.filter(f => f.activo && f.departamento === item.departamento).length;

          return (
            <div
              key={item.departamento}
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                isEstourado
                  ? 'bg-red-50/70 border-red-300 hover:border-red-500 shadow-sm shadow-red-100'
                  : isAlerta
                  ? 'bg-amber-50/60 border-amber-300 hover:border-amber-500'
                  : 'bg-white border-slate-200 hover:border-red-200 hover:shadow-xs'
              }`}
            >
              <div>
                {/* Cabeçalho do Card */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs">{item.departamento}</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {colaboradoresNoDepto} colaborador{colaboradoresNoDepto !== 1 ? 'es' : ''} ativo{colaboradoresNoDepto !== 1 ? 's' : ''}
                    </p>
                  </div>

                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase font-mono flex items-center gap-1 ${
                      isEstourado
                        ? 'bg-red-100 text-red-800 border border-red-300 animate-pulse'
                        : isAlerta
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {isEstourado && <AlertCircle className="w-3 h-3 text-red-600" />}
                    {isAlerta && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                    {isEstourado ? 'Excedido!' : isAlerta ? 'Alerta >85%' : 'Conforme'}
                  </span>
                </div>

                {/* Justificativa se houver */}
                {item.observacoes && (
                  <p className="text-[11px] text-slate-600 mt-2 p-1.5 rounded bg-slate-50 border border-slate-200 italic">
                    "{item.observacoes}"
                  </p>
                )}

                {/* Comparativo Limite x Real x Variação */}
                <div className="mt-3.5 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Teto Mensal Definido:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {item.limite.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>Despesa Real Consumida:</span>
                    <span
                      className={`font-mono font-bold ${
                        isEstourado ? 'text-red-700' : isAlerta ? 'text-amber-700' : 'text-slate-900'
                      }`}
                    >
                      {item.gastoReal.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT
                    </span>
                  </div>

                  <div className="flex justify-between text-[11px] pt-1.5 border-t border-slate-200">
                    <span className="text-slate-500 font-medium">Variação / Saldo:</span>
                    <span
                      className={`font-mono font-bold ${
                        item.diferenca >= 0 ? 'text-emerald-600' : 'text-red-600'
                      }`}
                    >
                      {item.diferenca >= 0 ? '+' : ''}{item.diferenca.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT
                    </span>
                  </div>
                </div>

                {/* Barra de Progresso com Alertas Visuais */}
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-500">Execução do Teto</span>
                    <span
                      className={`font-bold font-mono ${
                        isEstourado ? 'text-red-700' : isAlerta ? 'text-amber-700' : 'text-slate-700'
                      }`}
                    >
                      {item.percentualUsado}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isEstourado
                          ? 'bg-red-600'
                          : isAlerta
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(100, item.percentualUsado)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Rodapé com Ação */}
              <div className="mt-4 pt-2.5 border-t border-slate-200 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">Competência 10/2026</span>
                <button
                  onClick={() => {
                    setModalEditar({
                      departamento: item.departamento,
                      limite: item.limite,
                      observacoes: item.observacoes || '',
                    });
                  }}
                  className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Ajustar Limite
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Interativo para Definir/Ajustar Limites */}
      {modalEditar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl p-5 space-y-4 text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Target className="w-4 h-4 text-red-600" />
                Definir Limite de Gastos Departamental
              </h3>
              <button
                onClick={() => setModalEditar(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-600 block mb-1 font-medium">Departamento Selecionado:</label>
                <select
                  value={modalEditar.departamento}
                  onChange={e => {
                    const depto = e.target.value;
                    const orc = resumo.find(o => o.departamento === depto);
                    setModalEditar({
                      departamento: depto,
                      limite: orc ? orc.limite : 100000,
                      observacoes: orc?.observacoes || '',
                    });
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-medium focus:outline-none focus:border-red-600"
                >
                  {resumo.map(o => (
                    <option key={o.departamento} value={o.departamento}>
                      {o.departamento} (Gasto Atual: {o.gastoReal.toLocaleString()} MT)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-medium">
                  Novo Teto Mensal de Despesas ({empresa.moeda}):
                </label>
                <input
                  type="number"
                  step="5000"
                  min="1000"
                  value={modalEditar.limite}
                  onChange={e =>
                    setModalEditar({
                      ...modalEditar,
                      limite: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 font-mono font-bold focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-medium">
                  Justificativa / Motivo da Alteração:
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Ampliação do quadro de equipe técnica e infraestrutura..."
                  value={modalEditar.observacoes}
                  onChange={e =>
                    setModalEditar({
                      ...modalEditar,
                      observacoes: e.target.value,
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-600 text-xs"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                onClick={() => setModalEditar(null)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs hover:bg-slate-200 font-medium cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvarEdicao}
                className="px-4 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 cursor-pointer shadow-md shadow-red-200"
              >
                Salvar Limite Orçamentário
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
