import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { exportarRelatorioPDF } from '../utils/pdfReports';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  Filter,
  CheckCircle2,
  Table,
  FileDown,
  Eye,
  X,
  ShieldCheck,
  Receipt,
  Landmark,
  Check,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export const RelatoriosView: React.FC = () => {
  const {
    empresa,
    lancamentos,
    planoContas,
    funcionarios,
    folhas,
    obterBalancete,
    obterDRE,
  } = useApp();

  const [tipoRelatorio, setTipoRelatorio] = useState<'balancete' | 'dre' | 'fiscal' | 'folha' | 'lancamentos'>('balancete');
  const [dataInicio, setDataInicio] = useState('2026-01-01');
  const [dataFim, setDataFim] = useState('2026-12-31');
  const [gerandoPDF, setGerandoPDF] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

  const balancete = obterBalancete();
  const dre = obterDRE();

  // Exportação para PDF (Download direto do arquivo oficial)
  const handleExportarPDF = () => {
    try {
      setGerandoPDF(true);
      const doc = exportarRelatorioPDF({
        tipo: tipoRelatorio,
        empresa,
        periodo: { inicio: dataInicio, fim: dataFim },
        balancete,
        dre,
        folha: folhas[0],
        lancamentos,
      });

      const nomeLimpoEmpresa = empresa.nome.replace(/[^a-zA-Z0-9]/g, '_');
      const nomeArquivo = `Relatorio_${tipoRelatorio.toUpperCase()}_${nomeLimpoEmpresa}_${dataInicio}_a_${dataFim}.pdf`;
      doc.save(nomeArquivo);

      setMensagemSucesso(`Relatório PDF oficial "${nomeArquivo}" gerado e descarregado com sucesso!`);
      setTimeout(() => setMensagemSucesso(null), 5000);
    } catch (error) {
      console.error('Erro ao gerar relatório PDF:', error);
    } finally {
      setGerandoPDF(false);
    }
  };

  // Pré-visualização do PDF em modal
  const handlePrevisualizarPDF = () => {
    try {
      setGerandoPDF(true);
      const doc = exportarRelatorioPDF({
        tipo: tipoRelatorio,
        empresa,
        periodo: { inicio: dataInicio, fim: dataFim },
        balancete,
        dre,
        folha: folhas[0],
        lancamentos,
      });

      const blobUrl = doc.output('bloburl');
      setPdfPreviewUrl(blobUrl.toString());
    } catch (error) {
      console.error('Erro ao pré-visualizar PDF:', error);
    } finally {
      setGerandoPDF(false);
    }
  };

  // Exportação para CSV estruturado
  const handleExportarCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';

    if (tipoRelatorio === 'balancete') {
      csvContent += 'Codigo;Designacao;Classe;Tipo;Debito;Credito;Saldo;Natureza\n';
      balancete.contas.forEach(c => {
        csvContent += `${c.codigoConta};${c.designacao};${c.classe};${c.tipoConta};${c.totalDebito};${c.totalCredito};${c.saldoActual};${c.naturezaPredominante}\n`;
      });
    } else if (tipoRelatorio === 'dre') {
      csvContent += 'Rubrica;Valor;Natureza\n';
      csvContent += `Volume de Negocios;${dre.volumeNegocios};Positivo\n`;
      csvContent += `CMV;${dre.cmv};Deducao\n`;
      csvContent += `Margem Bruta;${dre.margemBruta};Subtotal\n`;
      csvContent += `Gastos com Pessoal;${dre.gastosPessoal};Deducao\n`;
      csvContent += `FST;${dre.fst};Deducao\n`;
      csvContent += `Depreciacoes;${dre.depreciacoes};Deducao\n`;
      csvContent += `EBIT;${dre.resultadoOperacional};Subtotal\n`;
      csvContent += `IRPC;${dre.irpc};Deducao\n`;
      csvContent += `Resultado Liquido;${dre.resultadoLiquido};Final\n`;
    } else if (tipoRelatorio === 'fiscal') {
      csvContent += 'Item;Colaborador;Cargo;Departamento;RendimentoBruto;INSS_Trab_3perc;INSS_Patronal_4perc;Retencao_IRPS;Total_Fisco\n';
      const f = folhas[0];
      if (f) {
        f.linhas.forEach((l, idx) => {
          const rendBruto = l.salarioBase + l.subsidioAlimentacao + l.subsidioTransporte + l.outrosSubsidios + l.horasExtrasValor;
          const totalFisco = l.irps + l.inssTrabalhador + l.inssEmpresa;
          csvContent += `${idx + 1};"${l.funcionarioNome}";"${l.cargo}";"${l.departamento}";${rendBruto};${l.inssTrabalhador};${l.inssEmpresa};${l.irps};${totalFisco}\n`;
        });
      }
    } else if (tipoRelatorio === 'folha') {
      csvContent += 'Nome;Cargo;Departamento;SalarioBase;INSS_Trab;INSS_Empresa;IRPS;Liquido\n';
      const f = folhas[0];
      if (f) {
        f.linhas.forEach(l => {
          csvContent += `${l.funcionarioNome};${l.cargo};${l.departamento};${l.salarioBase};${l.inssTrabalhador};${l.inssEmpresa};${l.irps};${l.liquido}\n`;
        });
      }
    } else if (tipoRelatorio === 'lancamentos') {
      csvContent += 'Data;Documento;Diario;Descricao;ValorTotal\n';
      lancamentos.forEach(l => {
        const total = l.linhas.filter(x => x.tipoMovimento === 'D').reduce((a, b) => a + b.valor, 0);
        csvContent += `${l.dataLancamento};${l.numeroDocumento};${l.idDiario};"${l.descricaoGeral}";${total}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorio_${tipoRelatorio}_${empresa.nome.slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 text-slate-800">
      {/* Toast de Notificação de Sucesso */}
      {mensagemSucesso && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-center justify-between shadow-md animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-red-600 shrink-0" />
            <span className="font-bold">{mensagemSucesso}</span>
          </div>
          <button
            onClick={() => setMensagemSucesso(null)}
            className="text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Cabeçalho com Ações de Exportação (Vermelho & Branco) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-red-50 text-red-600 border border-red-100">
            <FileSpreadsheet className="w-5 h-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                Relatórios Contábeis & Fiscais Oficiais
              </h1>
              <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 border border-red-200 text-[10px] font-bold uppercase font-mono">
                Exportação PDF & CSV
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Emissão homologada de Balancetes PGC-NIRF, DRE, Retenções Fiscais (IRPS/INSS) e Livros Diários para partilha e auditoria
            </p>
          </div>
        </div>

        {/* Grupo de Ações de Exportação */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Botão Exportar PDF */}
          <button
            onClick={handleExportarPDF}
            disabled={gerandoPDF}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-md shadow-red-200 cursor-pointer"
            title="Descarregar relatório formatado em arquivo PDF oficial"
          >
            {gerandoPDF ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileDown className="w-4 h-4" />
            )}
            <span>Exportar PDF</span>
          </button>

          {/* Botão Pré-visualizar PDF */}
          <button
            onClick={handlePrevisualizarPDF}
            disabled={gerandoPDF}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-red-50 text-red-700 font-bold text-xs border border-slate-200 transition-colors cursor-pointer"
            title="Visualizar documento PDF antes de transferir"
          >
            <Eye className="w-4 h-4 text-red-600" />
            <span>Ver PDF</span>
          </button>

          {/* Botão Exportar CSV */}
          <button
            onClick={handleExportarCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors cursor-pointer"
            title="Exportar dados tabulares para folha de cálculo"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>CSV</span>
          </button>

          {/* Botão Imprimir */}
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors cursor-pointer"
            title="Imprimir relatório na impressora ou salvar via navegador"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      {/* Painel de Filtros e Personalização */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div>
            <label className="text-slate-600 block mb-1 font-semibold">Modelo de Relatório:</label>
            <select
              value={tipoRelatorio}
              onChange={e => setTipoRelatorio(e.target.value as any)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-bold focus:outline-none focus:border-red-600 cursor-pointer"
            >
              <option value="balancete">📊 Balancete de Verificação Analítico (PGC-NIRF)</option>
              <option value="dre">📈 DRE - Demonstração dos Resultados por Natureza</option>
              <option value="fiscal">🏛️ Mapa Fiscal de Retenções na Fonte (IRPS & INSS)</option>
              <option value="folha">💼 Mapa Analítico de Folha de Salários & Encargos</option>
              <option value="lancamentos">📖 Livro Diário Geral de Operações Contábeis</option>
            </select>
          </div>

          <div>
            <label className="text-slate-600 block mb-1 font-semibold">Data Início:</label>
            <input
              type="date"
              value={dataInicio}
              onChange={e => setDataInicio(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-red-600 font-mono text-xs font-semibold"
            />
          </div>

          <div>
            <label className="text-slate-600 block mb-1 font-semibold">Data Fim:</label>
            <input
              type="date"
              value={dataFim}
              onChange={e => setDataFim(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-red-600 font-mono text-xs font-semibold"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Razão em Partidas Dobradas
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-red-600" /> Certificado OCAM
          </span>
        </div>
      </div>

      {/* Pré-visualização Tabular do Relatório Selecionado */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              {tipoRelatorio === 'balancete' && 'Balancete de Verificação de Todas as Contas de Movimento'}
              {tipoRelatorio === 'dre' && 'Demonstração dos Resultados por Natureza (PGC-NIRF)'}
              {tipoRelatorio === 'fiscal' && 'Mapa Fiscal de Retenções na Fonte e Guias de Imposto (IRPS & INSS)'}
              {tipoRelatorio === 'folha' && 'Mapa Analítico de Folha de Salários e Retenções Fiscais'}
              {tipoRelatorio === 'lancamentos' && 'Livro Diário Geral de Operações Contábeis'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Entidade: <strong className="text-slate-800">{empresa.nome}</strong> • NUIT: <strong className="text-slate-800">{empresa.nuit}</strong> • Moeda: <strong className="text-red-700">{empresa.moeda}</strong>
            </p>
          </div>

          <button
            onClick={handleExportarPDF}
            className="self-start sm:self-auto text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5" /> Descarregar Versão PDF Oficial
          </button>
        </div>

        {/* 1. Tabela do Balancete */}
        {tipoRelatorio === 'balancete' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-red-50 text-red-900 text-[11px] font-bold border-b border-red-200">
                <tr>
                  <th className="p-2.5">Conta</th>
                  <th className="p-2.5">Designação</th>
                  <th className="p-2.5 text-center">Classe</th>
                  <th className="p-2.5 text-center">Tipo</th>
                  <th className="p-2.5 text-right">Débitos</th>
                  <th className="p-2.5 text-right">Créditos</th>
                  <th className="p-2.5 text-right">Saldo Atual</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {balancete.contas.map(c => (
                  <tr key={c.codigoConta} className="hover:bg-red-50/30">
                    <td className="p-2.5 font-mono text-red-700 font-black">{c.codigoConta}</td>
                    <td className="p-2.5 font-medium text-slate-800">{c.designacao}</td>
                    <td className="p-2.5 text-center font-mono font-bold text-slate-600">{c.classe}</td>
                    <td className="p-2.5 text-center">
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 font-semibold">
                        {c.tipoConta === 'A' ? 'Analítica' : 'Integradora'}
                      </span>
                    </td>
                    <td className="p-2.5 text-right font-mono text-slate-800">{c.totalDebito.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT</td>
                    <td className="p-2.5 text-right font-mono text-slate-800">{c.totalCredito.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT</td>
                    <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                      {c.saldoActual.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT ({c.naturezaPredominante})
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-300">
                <tr>
                  <td colSpan={4} className="p-2.5 text-right uppercase">Totais Gerais:</td>
                  <td className="p-2.5 text-right font-mono text-red-700">
                    {balancete.totalDebitos.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT
                  </td>
                  <td className="p-2.5 text-right font-mono text-red-700">
                    {balancete.totalCreditos.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT
                  </td>
                  <td className="p-2.5 text-right font-mono text-emerald-700">
                    {!balancete.desbalanceado ? '✓ Balanceado' : '⚠️ Desbalanceado'}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* 2. Demonstração de Resultados (DRE) */}
        {tipoRelatorio === 'dre' && (
          <div className="space-y-3 text-xs max-w-3xl">
            <div className="flex justify-between py-2 border-b border-slate-200 font-bold text-slate-900">
              <span>1. Volume de Negócios (Vendas e Serviços Prestados)</span>
              <span className="font-mono text-red-700 font-black">{dre.volumeNegocios.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-200 text-slate-600">
              <span>2. Custo das Mercadorias Vendidas e Matérias Consumidas (CMV)</span>
              <span className="font-mono text-slate-800 font-bold">- {dre.cmv.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT</span>
            </div>
            <div className="flex justify-between py-2.5 border-b border-slate-200 font-black text-red-700 bg-red-50/60 px-3 rounded-lg border border-red-100">
              <span>3. MARGEM BRUTA OPERACIONAL (1 - 2)</span>
              <span className="font-mono">{dre.margemBruta.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-200 text-slate-600">
              <span>4. Gastos com o Pessoal (Salários, Encargos INSS 4% e Subsídios)</span>
              <span className="font-mono text-slate-800 font-bold">- {dre.gastosPessoal.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-200 text-slate-600">
              <span>5. Fornecimentos e Serviços de Terceiros (FST - Eletricidade, Rendas, Auditorias)</span>
              <span className="font-mono text-slate-800 font-bold">- {dre.fst.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-200 text-slate-600">
              <span>6. Amortizações e Depreciações do Exercício</span>
              <span className="font-mono text-slate-800 font-bold">- {dre.depreciacoes.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT</span>
            </div>
            <div className="flex justify-between py-3 border-b-2 border-slate-300 font-black text-slate-900 text-sm bg-slate-50 px-3 rounded-lg border border-slate-200">
              <span>7. RESULTADO OPERACIONAL ANTES DE JUROS E IMPOSTOS (EBIT)</span>
              <span className="font-mono text-red-700">{dre.resultadoOperacional.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT</span>
            </div>
            <div className="flex justify-between py-2 text-slate-600">
              <span>8. Estimativa de Imposto sobre o Rendimento (IRPC - 32%)</span>
              <span className="font-mono text-slate-800 font-bold">- {dre.irpc.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT</span>
            </div>
            <div className="flex justify-between py-3 bg-red-600 p-3.5 rounded-xl font-black text-white text-base shadow-md shadow-red-200">
              <span>9. RESULTADO LÍQUIDO DO EXERCÍCIO (LUCRO LÍQUIDO)</span>
              <span className="font-mono">{dre.resultadoLiquido.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT</span>
            </div>
          </div>
        )}

        {/* 3. Mapa Fiscal de Retenções na Fonte e Guias de Imposto */}
        {tipoRelatorio === 'fiscal' && folhas[0] && (
          <div className="overflow-x-auto space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="p-2.5">
                <span className="text-[10px] text-slate-500 block font-bold uppercase">Rendimento Bruto:</span>
                <span className="text-sm font-black text-slate-900 font-mono">
                  {folhas[0].linhas
                    .reduce((acc, l) => acc + l.salarioBase + l.subsidioAlimentacao + l.subsidioTransporte + l.outrosSubsidios + l.horasExtrasValor, 0)
                    .toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT
                </span>
                <span className="text-[10px] text-slate-400 block">Base de incidência fiscal</span>
              </div>
              <div className="p-2.5">
                <span className="text-[10px] text-slate-500 block font-bold uppercase">Retenção IRPS (Mod. 19/20):</span>
                <span className="text-sm font-black text-red-700 font-mono">
                  {folhas[0].linhas
                    .reduce((acc, l) => acc + l.irps, 0)
                    .toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT
                </span>
                <span className="text-[10px] text-slate-400 block">A recolher até dia 20</span>
              </div>
              <div className="p-2.5">
                <span className="text-[10px] text-slate-500 block font-bold uppercase">INSS Total (3% + 4%):</span>
                <span className="text-sm font-black text-slate-900 font-mono">
                  {folhas[0].linhas
                    .reduce((acc, l) => acc + l.inssTrabalhador + l.inssEmpresa, 0)
                    .toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT
                </span>
                <span className="text-[10px] text-slate-400 block">Previdência obrigatória</span>
              </div>
              <div className="p-2.5">
                <span className="text-[10px] text-slate-500 block font-bold uppercase">Total a Entregar ao Estado:</span>
                <span className="text-sm font-black text-red-700 font-mono">
                  {folhas[0].linhas
                    .reduce((acc, l) => acc + l.irps + l.inssTrabalhador + l.inssEmpresa, 0)
                    .toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT
                </span>
                <span className="text-[10px] text-slate-400 block">IRPS + INSS Consolidado</span>
              </div>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-red-50 text-red-900 text-[11px] font-bold border-b border-red-200">
                <tr>
                  <th className="p-2.5">Colaborador / Beneficiário</th>
                  <th className="p-2.5">Cargo / Departamento</th>
                  <th className="p-2.5 text-right">Rendimento Bruto</th>
                  <th className="p-2.5 text-right">INSS Trab (3%)</th>
                  <th className="p-2.5 text-right">INSS Pat (4%)</th>
                  <th className="p-2.5 text-right">Retenção IRPS</th>
                  <th className="p-2.5 text-right">Total Guia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {folhas[0].linhas.map(l => {
                  const rend = l.salarioBase + l.subsidioAlimentacao + l.subsidioTransporte + l.outrosSubsidios + l.horasExtrasValor;
                  const guia = l.irps + l.inssTrabalhador + l.inssEmpresa;
                  return (
                    <tr key={l.id} className="hover:bg-red-50/30">
                      <td className="p-2.5 font-bold text-slate-900">{l.funcionarioNome}</td>
                      <td className="p-2.5 text-slate-500">{l.cargo} • {l.departamento}</td>
                      <td className="p-2.5 text-right font-mono font-medium text-slate-800">{rend.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT</td>
                      <td className="p-2.5 text-right font-mono text-slate-800">{l.inssTrabalhador.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT</td>
                      <td className="p-2.5 text-right font-mono text-slate-800">{l.inssEmpresa.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT</td>
                      <td className="p-2.5 text-right font-mono text-red-700 font-bold">{l.irps.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT</td>
                      <td className="p-2.5 text-right font-mono font-black text-red-700">{guia.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. Mapa de Folha de Salários */}
        {tipoRelatorio === 'folha' && folhas[0] && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-red-50 text-red-900 text-[11px] font-bold border-b border-red-200">
                <tr>
                  <th className="p-2.5">Nome</th>
                  <th className="p-2.5">Cargo</th>
                  <th className="p-2.5 text-right">Salário Base</th>
                  <th className="p-2.5 text-right">INSS (3%)</th>
                  <th className="p-2.5 text-right">INSS Emp (4%)</th>
                  <th className="p-2.5 text-right">IRPS Retido</th>
                  <th className="p-2.5 text-right">Salário Líquido</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {folhas[0].linhas.map(l => (
                  <tr key={l.id} className="hover:bg-red-50/30">
                    <td className="p-2.5 font-bold text-slate-900">{l.funcionarioNome}</td>
                    <td className="p-2.5 text-slate-500">{l.cargo}</td>
                    <td className="p-2.5 text-right font-mono font-medium text-slate-800">{l.salarioBase.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT</td>
                    <td className="p-2.5 text-right font-mono text-slate-700">{l.inssTrabalhador.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT</td>
                    <td className="p-2.5 text-right font-mono text-slate-700">{l.inssEmpresa.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT</td>
                    <td className="p-2.5 text-right font-mono text-red-700 font-bold">{l.irps.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT</td>
                    <td className="p-2.5 text-right font-mono font-black text-slate-900">
                      {l.liquido.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. Livro Diário Geral */}
        {tipoRelatorio === 'lancamentos' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-red-50 text-red-900 text-[11px] font-bold border-b border-red-200">
                <tr>
                  <th className="p-2.5">Data</th>
                  <th className="p-2.5">Documento</th>
                  <th className="p-2.5">Descrição</th>
                  <th className="p-2.5 text-right">Total Partidas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {lancamentos.map(l => {
                  const valor = l.linhas.filter(x => x.tipoMovimento === 'D').reduce((a, b) => a + b.valor, 0);
                  return (
                    <tr key={l.idLancamento} className="hover:bg-red-50/30">
                      <td className="p-2.5 font-mono text-slate-500">{l.dataLancamento}</td>
                      <td className="p-2.5 font-bold text-red-700 font-mono">{l.numeroDocumento}</td>
                      <td className="p-2.5 font-medium text-slate-800">{l.descricaoGeral}</td>
                      <td className="p-2.5 text-right font-mono font-black text-slate-900">
                        {valor.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Caixa de Conformidade e Auditoria Legal */}
      <div className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-100">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-xs">Conformidade e Integridade de Auditoria Fiscal</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Todos os relatórios exportados em PDF incluem numeração sequencial de páginas, carimbo de responsabilidade técnica (OCAM) e hash criptográfico de validação.
            </p>
          </div>
        </div>

        <button
          onClick={handleExportarPDF}
          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-md shadow-red-200 shrink-0"
        >
          <FileDown className="w-4 h-4" /> Descarregar PDF do Relatório
        </button>
      </div>

      {/* Modal de Pré-Visualização Oficial do PDF */}
      {pdfPreviewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-5xl h-[88vh] flex flex-col shadow-2xl overflow-hidden text-slate-800">
            {/* Barra de Topo do Modal */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200">
                  <FileDown className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Pré-Visualização do Documento PDF Oficial
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {tipoRelatorio.toUpperCase()} • {empresa.nome} • NUIT: {empresa.nuit}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportarPDF}
                  className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm shadow-red-200"
                >
                  <Download className="w-3.5 h-3.5" /> Descarregar PDF
                </button>
                <button
                  onClick={() => setPdfPreviewUrl(null)}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  title="Fechar Pré-visualização"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Visualizador de PDF (iFrame seguro com Blob URL) */}
            <div className="flex-1 bg-slate-100 p-2 overflow-hidden">
              <iframe
                src={pdfPreviewUrl}
                title="Pré-visualização do Relatório Contábil e Fiscal PDF"
                className="w-full h-full rounded-xl border border-slate-300 bg-white"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
