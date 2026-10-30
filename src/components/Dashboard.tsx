import React from 'react';
import { useApp } from '../context/AppContext';
import { GestaoOrcamentos } from './GestaoOrcamentos';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Wallet,
  Receipt,
  FileCheck2,
  Calendar,
  AlertCircle,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  Building,
  RefreshCw,
  PlusCircle,
  FileSpreadsheet,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (section: string) => void;
  onOpenNovoLancamento: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigate,
  onOpenNovoLancamento,
}) => {
  const {
    empresa,
    funcionarios,
    folhas,
    lancamentos,
    ferias,
    transacoesBancarias,
    obterDRE,
    obterBalancete,
    obterSaldosContas,
    sincronizarExtratoBancario,
    obterResumoOrcamentos,
  } = useApp();

  const dre = obterDRE();
  const balancete = obterBalancete();
  const saldos = obterSaldosContas();
  const resumoOrcamentos = obterResumoOrcamentos();
  const totalGastoRealConsolidado = resumoOrcamentos.reduce((acc, o) => acc + o.gastoReal, 0);

  // Disponibilidades (Caixa 1.1 + Bancos 1.2)
  const saldoCaixa = saldos.find(s => s.codigoConta === '1.1.1')?.saldoActual || 0;
  const saldoBim = saldos.find(s => s.codigoConta === '1.2.1')?.saldoActual || 0;
  const saldoStb = saldos.find(s => s.codigoConta === '1.2.2')?.saldoActual || 0;
  const totalDisponibilidades = saldoCaixa + saldoBim + saldoStb;

  // Última folha processada
  const ultimaFolha = folhas[0];
  const totalCustoFolha = ultimaFolha
    ? ultimaFolha.linhas.reduce((acc, l) => acc + l.salarioBase + l.inssEmpresa + l.subsidioAlimentacao + l.subsidioTransporte, 0)
    : 0;
  const totalSalarioLiquido = ultimaFolha
    ? ultimaFolha.linhas.reduce((acc, l) => acc + l.liquido, 0)
    : 0;

  // Métricas de colaboradores
  const totalFuncionariosAtivos = funcionarios.filter(f => f.activo).length;
  const feriasPendentes = ferias.filter(f => f.status === 'pendente').length;

  // Conciliação bancária
  const totalTx = transacoesBancarias.length;
  const conciliadasTx = transacoesBancarias.filter(t => t.conciliado).length;
  const percentualConciliado = totalTx > 0 ? Math.round((conciliadasTx / totalTx) * 100) : 100;

  return (
    <div className="space-y-6 text-slate-800">
      {/* Top Banner de Boas-Vindas e Ações Rápidas (Vermelho & Branco) */}
      <div className="bg-gradient-to-r from-red-700 via-red-600 to-red-800 border border-red-800 rounded-2xl p-5 sm:p-6 shadow-md relative overflow-hidden text-white">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-white/20 text-white border border-white/30 text-xs font-bold uppercase tracking-wider">
                Painel Executivo em Tempo Real
              </span>
              <span className="text-xs text-red-100">
                Moeda Base: <strong className="text-white">{empresa.moeda}</strong>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white mt-1.5 tracking-tight">
              Gestão Contábil, Financeira & Recursos Humanos
            </h1>
            <p className="text-xs sm:text-sm text-red-100 mt-1 max-w-2xl leading-relaxed">
              Monitoramento integrado de partidas dobradas PGC-NIRF, tetos orçamentários departamentais, apuramento de folha e conciliação bancária.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                document.getElementById('modulo-orcamentos')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-red-50 text-red-700 font-bold text-xs transition-all shadow-md shadow-red-950/20 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-red-600" /> Gestão de Orçamentos
            </button>
            <button
              onClick={onOpenNovoLancamento}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-800/90 hover:bg-red-900 text-white font-semibold text-xs border border-red-500 transition-colors cursor-pointer shadow-xs"
            >
              <PlusCircle className="w-4 h-4 text-white" /> Novo Lançamento
            </button>
            <button
              onClick={sincronizarExtratoBancario}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-800/90 hover:bg-red-900 text-white font-semibold text-xs border border-red-500 transition-colors cursor-pointer shadow-xs"
              title="Consultar Webhooks bancários via Open Banking"
            >
              <RefreshCw className="w-4 h-4 text-white" /> Sync Bancário
            </button>
          </div>
        </div>
      </div>

      {/* Grid de KPIs Principais (Branco com Detalhes em Vermelho) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Disponibilidades Bancárias */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-red-300 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tesouraria & Bancos</span>
            <div className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-100">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-slate-900 tracking-tight">
              {totalDisponibilidades.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}{' '}
              <span className="text-xs font-semibold text-slate-400">{empresa.moeda}</span>
            </p>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1 text-red-600 font-bold">
                <ArrowUpRight className="w-3.5 h-3.5" /> +14.2% mês
              </span>
              <span className="font-medium text-slate-600">BIM + STB</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Volume de Negócios / Facturação */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-red-300 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Volume de Negócios (DRE)</span>
            <div className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-100">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-slate-900 tracking-tight">
              {dre.volumeNegocios.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}{' '}
              <span className="text-xs font-semibold text-slate-400">{empresa.moeda}</span>
            </p>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
              <span className="text-slate-700 font-medium">
                Margem Bruta: {dre.volumeNegocios > 0 ? Math.round((dre.margemBruta / dre.volumeNegocios) * 100) : 0}%
              </span>
              <span className="text-red-700 bg-red-50 px-1.5 py-0.5 rounded border border-red-200 font-mono text-[10px] font-bold">
                PGC Cl. 7
              </span>
            </div>
          </div>
        </div>

        {/* KPI 3: Custo Mensal da Folha & Encargos */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-red-300 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Custo de Folha & INSS</span>
            <div className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-100">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-slate-900 tracking-tight">
              {totalCustoFolha.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}{' '}
              <span className="text-xs font-semibold text-slate-400">{empresa.moeda}</span>
            </p>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
              <span>{totalFuncionariosAtivos} Colaboradores</span>
              <span className="text-red-600 font-semibold">Líquido: {totalSalarioLiquido.toLocaleString()} MT</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Conciliação Bancária & Conformidade */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-red-300 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Conciliação Automática</span>
            <div className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-100">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-slate-900 tracking-tight">
              {percentualConciliado}%{' '}
              <span className="text-xs font-semibold text-slate-400">Conciliado</span>
            </p>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
              <span>{conciliadasTx} de {totalTx} transações</span>
              <span
                className="text-red-600 font-bold cursor-pointer hover:underline"
                onClick={() => onNavigate('bancos')}
              >
                Ver Pendentes
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* MÓDULO DE GESTÃO DE ORÇAMENTOS E ALERTAS DE VARIAÇÃO */}
      <GestaoOrcamentos />

      {/* Painel Central: Gráficos e Distribuição */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico 1: Demonstração Sintética do Resultado (DRE) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-red-600" />
                Estrutura de Resultados & Margens (PGC-NIRF)
              </h2>
              <p className="text-xs text-slate-500">
                Apuramento consolidado de vendas, custos com pessoal e margem operacional
              </p>
            </div>
            <button
              onClick={() => onNavigate('contabilidade')}
              className="text-xs text-red-600 hover:text-red-700 font-bold cursor-pointer"
            >
              Ver DRE Completa →
            </button>
          </div>

          <div className="mt-5 space-y-4">
            {/* Barra 1: Volume de Negócios */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-700 font-semibold">1. Volume de Negócios (Vendas + Serviços)</span>
                <span className="text-red-700 font-black">
                  {dre.volumeNegocios.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT
                </span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div className="bg-red-600 h-full rounded-full" style={{ width: '100%' }} />
              </div>
            </div>

            {/* Barra 2: Gastos com Pessoal */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-700 font-semibold">2. Gastos com o Pessoal (Salários + INSS 4% + Subsídios)</span>
                <span className="text-slate-800 font-bold">
                  - {dre.gastosPessoal.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT
                </span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-slate-700 h-full rounded-full"
                  style={{
                    width: dre.volumeNegocios > 0 ? `${Math.min(100, (dre.gastosPessoal / dre.volumeNegocios) * 100)}%` : '0%',
                  }}
                />
              </div>
            </div>

            {/* Barra 3: Fornecimentos e Serviços de Terceiros (FST) */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-700 font-semibold">3. Fornecimentos e Serviços de Terceiros (FST)</span>
                <span className="text-slate-800 font-bold">
                  - {dre.fst.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT
                </span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-slate-500 h-full rounded-full"
                  style={{
                    width: dre.volumeNegocios > 0 ? `${Math.min(100, (dre.fst / dre.volumeNegocios) * 100)}%` : '0%',
                  }}
                />
              </div>
            </div>

            {/* Resultado Operacional */}
            <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between bg-red-50/60 p-4 rounded-xl border border-red-100">
              <div>
                <span className="text-xs text-slate-600 block font-medium">Resultado Operacional (EBIT)</span>
                <span className="text-lg font-black text-red-700 font-mono">
                  {dre.resultadoOperacional.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-600 block font-medium">Resultado Líquido Estimado</span>
                <span className="text-lg font-black text-slate-900 font-mono">
                  {dre.resultadoLiquido.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Gráfico 2: Despesas Reais de RH por Departamento */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-red-600" />
                Custos de Pessoal por Departamento
              </h2>
              <span className="text-xs text-slate-500">{funcionarios.length} Colaboradores</span>
            </div>

            <div className="mt-4 space-y-3">
              {resumoOrcamentos.map(item => {
                const totalGeral = totalGastoRealConsolidado;
                const perc = totalGeral > 0 ? Math.round((item.gastoReal / totalGeral) * 100) : 0;
                return (
                  <div key={item.departamento} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-700 truncate max-w-[170px] font-medium">{item.departamento}</span>
                      <span className="text-slate-900 font-bold">{item.gastoReal.toLocaleString()} MT ({perc}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-red-600 to-red-800 h-full rounded-full"
                        style={{ width: `${perc}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-200">
            <button
              onClick={() => onNavigate('folha')}
              className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-800 hover:text-red-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
            >
              Gerenciar Colaboradores & Folha →
            </button>
          </div>
        </div>
      </div>

      {/* Seção Inferior: Indicadores de Auditoria, eSocial e Alertas Críticos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Conformidade eSocial & Fisco */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">
              Conformidade eSocial / Fisco
            </span>
            <FileCheck2 className="w-4 h-4 text-red-600" />
          </div>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">S-1000 (Empregador):</span>
              <span className="text-red-700 font-bold bg-red-50 px-2 py-0.5 rounded border border-red-200">
                Transmitido
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">S-1200 (Remunerações):</span>
              <span className="text-red-700 font-bold bg-red-50 px-2 py-0.5 rounded border border-red-200">
                Transmitido
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">S-1210 (Pagamentos IRPS):</span>
              <span className="text-red-700 font-bold bg-red-50 px-2 py-0.5 rounded border border-red-200">
                Validado
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Auditoria Mensal Pronta:</span>
              <span className="text-slate-900 font-bold">100% Conforme</span>
            </div>
          </div>
          <button
            onClick={() => onNavigate('esocial')}
            className="mt-4 w-full py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold text-center block transition-colors cursor-pointer border border-red-200"
          >
            Aceder ao Módulo eSocial →
          </button>
        </div>

        {/* Card 2: Férias & Benefícios Corporativos */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">
              Férias & Benefícios
            </span>
            <Calendar className="w-4 h-4 text-red-600" />
          </div>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Pedidos de Férias Pendentes:</span>
              <span className="text-red-700 font-bold bg-red-50 px-2 py-0.5 rounded border border-red-200">
                {feriasPendentes} Requerimentos
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Férias Aprovadas Próximas:</span>
              <span className="text-slate-800 font-semibold">1 em Nov/2026</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Benefícios Ativos:</span>
              <span className="text-slate-800 font-semibold">Saúde, Seguro & Pensões</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Abono Pecuniário Solicitado:</span>
              <span className="text-slate-800 font-semibold">1 Colaborador</span>
            </div>
          </div>
          <button
            onClick={() => onNavigate('ferias')}
            className="mt-4 w-full py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold text-center block transition-colors cursor-pointer border border-red-200"
          >
            Gerenciar Escala de Férias →
          </button>
        </div>

        {/* Card 3: Auditoria & Partidas Dobradas */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">
              Integridade do Razão Contábil
            </span>
            <ShieldCheck className="w-4 h-4 text-red-600" />
          </div>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Balanço Débitos:</span>
              <span className="text-slate-900 font-mono font-bold">
                {balancete.totalDebitos.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Balanço Créditos:</span>
              <span className="text-slate-900 font-mono font-bold">
                {balancete.totalCreditos.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Partidas Dobradas:</span>
              <span className={`font-bold ${!balancete.desbalanceado ? 'text-emerald-600' : 'text-red-600'}`}>
                {!balancete.desbalanceado ? '✓ Equilibradas (D = C)' : '⚠️ Desbalanceadas!'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Lançamentos no Razão:</span>
              <span className="text-red-700 font-bold">{lancamentos.length} Registros</span>
            </div>
          </div>
          <button
            onClick={() => onNavigate('contabilidade')}
            className="mt-4 w-full py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold text-center block transition-colors cursor-pointer border border-red-200"
          >
            Ver Balancete de Verificação →
          </button>
        </div>
      </div>
    </div>
  );
};
