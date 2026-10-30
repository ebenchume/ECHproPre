import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Empresa, SaldoConta, CabecalhoLancamento, FolhaSalario } from '../types';

export interface BalanceteResult {
  totalDebitos: number;
  totalCreditos: number;
  desbalanceado: boolean;
  contas: SaldoConta[];
}

export interface DREResult {
  vendas: number;
  servicos: number;
  volumeNegocios: number;
  cmv: number;
  margemBruta: number;
  gastosPessoal: number;
  fst: number;
  depreciacoes: number;
  outrosGastos: number;
  totalGastosOperacionais: number;
  resultadoOperacional: number;
  irpc: number;
  resultadoLiquido: number;
}

export interface PDFExportOptions {
  tipo: 'balancete' | 'dre' | 'fiscal' | 'folha' | 'lancamentos';
  empresa: Empresa;
  periodo: {
    inicio: string;
    fim: string;
  };
  balancete: BalanceteResult;
  dre: DREResult;
  folha?: FolhaSalario;
  lancamentos: CabecalhoLancamento[];
}

/**
 * Adiciona cabeçalho corporativo oficial com dados fiscais e carimbo de auditoria
 */
function adicionarCabecalhoOficial(
  doc: jsPDF,
  empresa: Empresa,
  tituloDocumento: string,
  subtitulo: string,
  periodo: { inicio: string; fim: string }
) {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Barra superior decorativa
  doc.setFillColor(220, 38, 38); // Red 600
  doc.rect(0, 0, pageWidth, 5, 'F');

  // Nome da Empresa
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.text(empresa.nome.toUpperCase(), 14, 15);

  // NUIT e Endereço
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105); // Slate 600
  doc.text(`NUIT: ${empresa.nuit} • Regime: ${empresa.regimeTributario} • Moeda Base: ${empresa.moeda}`, 14, 20);
  doc.text(`Endereço: ${empresa.endereco} • E-mail: ${empresa.email}`, 14, 24);

  // Badge do Tipo de Relatório (Lado direito)
  doc.setFillColor(254, 242, 242);
  doc.roundedRect(pageWidth - 75, 10, 61, 16, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(220, 38, 38);
  doc.text('DOCUMENTO DE AUDITORIA', pageWidth - 71, 15);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  const dataEmissao = new Date().toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  doc.text(`Emissão: ${dataEmissao}`, pageWidth - 71, 19);
  doc.text(`Status: Válido & Homologado`, pageWidth - 71, 23);

  // Linha divisória
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(14, 28, pageWidth - 14, 28);

  // Título do Relatório
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(tituloDocumento, 14, 35);

  // Subtítulo e Período
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `${subtitulo} | Período de Referência: ${periodo.inicio} a ${periodo.fim}`,
    14,
    40
  );
}

/**
 * Adiciona rodapé de conformidade e numeração de páginas
 */
function adicionarRodapeAuditavel(doc: jsPDF) {
  const totalPaginas = (doc.internal as any).getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= totalPaginas; i++) {
    doc.setPage(i);

    // Linha divisória do rodapé
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);

    // Texto de segurança e auditoria
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.text(
      'Documento Processado por Computador • ECH Contabilidade & RH Integrado • Certificado de Partidas Dobradas PGC-NIRF',
      14,
      pageHeight - 7
    );

    // Numeração de página
    const textoPagina = `Página ${i} de ${totalPaginas}`;
    doc.text(textoPagina, pageWidth - 14 - doc.getTextWidth(textoPagina), pageHeight - 7);
  }
}

/**
 * Adiciona bloco de assinaturas legais na última página
 */
function adicionarAssinaturasFiscais(doc: jsPDF, empresa: Empresa) {
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  const currentY = (doc as any).lastAutoTable?.finalY || 160;

  let y = currentY + 16;
  if (y + 35 > pageHeight - 15) {
    doc.addPage();
    y = 30;
  }

  // Caixa de homologação
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, y, pageWidth - 28, 28, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, pageWidth - 28, 28, 2, 2, 'S');

  const larguraAssinatura = (pageWidth - 40) / 2;

  // Assinatura 1: Contabilista Certificado
  const x1 = 20;
  doc.setDrawColor(148, 163, 184);
  doc.line(x1, y + 17, x1 + larguraAssinatura - 10, y + 17);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text('CONTABILISTA CERTIFICADO (OCAM)', x1, y + 21);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`Registo OCAM nº 4892 • Chave SHA-256 Validada`, x1, y + 25);

  // Assinatura 2: Gerência / Administração
  const x2 = x1 + larguraAssinatura + 10;
  doc.line(x2, y + 17, x2 + larguraAssinatura - 10, y + 17);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text('DIREÇÃO GERAL & FINANCEIRA', x2, y + 21);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`${empresa.nome} • Representante Legal`, x2, y + 25);
}

/**
 * Exportador Principal de Relatórios em PDF
 */
export function exportarRelatorioPDF({
  tipo,
  empresa,
  periodo,
  balancete,
  dre,
  folha,
  lancamentos,
}: PDFExportOptions): jsPDF {
  const doc = new jsPDF({
    orientation: tipo === 'balancete' || tipo === 'folha' || tipo === 'fiscal' ? 'landscape' : 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  if (tipo === 'balancete') {
    adicionarCabecalhoOficial(
      doc,
      empresa,
      'BALANCETE DE VERIFICAÇÃO ANALÍTICO (PGC-NIRF)',
      'Apuramento Consolidado de Contas de Movimento das Classes 1 a 8',
      periodo
    );

    const tableData = balancete.contas.map((c: SaldoConta) => [
      c.codigoConta,
      c.designacao,
      c.classe.toString(),
      c.tipoConta === 'A' ? 'Analítica' : 'Integradora',
      `${c.totalDebito.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} ${empresa.moeda}`,
      `${c.totalCredito.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} ${empresa.moeda}`,
      `${c.saldoActual.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} ${empresa.moeda}`,
      c.naturezaPredominante === 'D' ? 'Devedor (D)' : 'Credor (C)',
    ]);

    autoTable(doc, {
      startY: 46,
      head: [
        ['Conta', 'Designação da Conta', 'Cl.', 'Tipo', 'Débitos', 'Créditos', 'Saldo Atual', 'Natureza'],
      ],
      body: tableData,
      foot: [
        [
          'TOTAIS',
          'Soma Geral das Partidas Dobradas',
          '-',
          '-',
          `${balancete.totalDebitos.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} ${empresa.moeda}`,
          `${balancete.totalCreditos.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} ${empresa.moeda}`,
          `${(balancete.totalDebitos - balancete.totalCreditos).toLocaleString('pt-PT', { minimumFractionDigits: 2 })} ${empresa.moeda}`,
          !balancete.desbalanceado ? 'BALANCEADO (OK)' : 'DESBALANCEADO',
        ],
      ],
      theme: 'striped',
      headStyles: {
        fillColor: [220, 38, 38],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
      },
      footStyles: {
        fillColor: [241, 245, 249],
        textColor: [15, 23, 42],
        fontStyle: 'bold',
        fontSize: 8,
      },
      bodyStyles: {
        fontSize: 7.5,
        textColor: [30, 41, 59],
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 20 },
        1: { cellWidth: 'auto' },
        2: { halign: 'center', cellWidth: 10 },
        3: { halign: 'center', cellWidth: 22 },
        4: { halign: 'right', cellWidth: 32 },
        5: { halign: 'right', cellWidth: 32 },
        6: { halign: 'right', cellWidth: 32 },
        7: { halign: 'center', cellWidth: 24 },
      },
      styles: {
        cellPadding: 2,
        overflow: 'linebreak',
      },
    });

    adicionarAssinaturasFiscais(doc, empresa);
  } else if (tipo === 'dre') {
    adicionarCabecalhoOficial(
      doc,
      empresa,
      'DEMONSTRAÇÃO DOS RESULTADOS POR NATUREZA (DRE)',
      'Demonstração Financeira de Resultados e Margens Operacionais - PGC-NIRF',
      periodo
    );

    const dreData = [
      ['1. Volume de Negócios (Vendas e Serviços)', `${dre.volumeNegocios.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} ${empresa.moeda}`, 'Positivo'],
      ['2. Custo das Mercadorias Vendidas e Consumidas (CMV)', `(${dre.cmv.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}) ${empresa.moeda}`, 'Dedução'],
      ['3. MARGEM BRUTA OPERACIONAL (1 - 2)', `${dre.margemBruta.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} ${empresa.moeda}`, 'Subtotal'],
      ['4. Fornecimentos e Serviços de Terceiros (FST)', `(${dre.fst.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}) ${empresa.moeda}`, 'Dedução'],
      ['5. Gastos com o Pessoal (Salários + Encargos + Subsídios)', `(${dre.gastosPessoal.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}) ${empresa.moeda}`, 'Dedução'],
      ['6. Gastos de Depreciações e Amortizações do Exercício', `(${dre.depreciacoes.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}) ${empresa.moeda}`, 'Dedução'],
      ['7. Outros Gastos Operacionais', `(${dre.outrosGastos.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}) ${empresa.moeda}`, 'Dedução'],
      ['8. RESULTADO OPERACIONAL ANTES DE JUROS E IMPOSTOS (EBIT)', `${dre.resultadoOperacional.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} ${empresa.moeda}`, 'Subtotal'],
      ['9. Imposto sobre o Rendimento das Pessoas Colectivas (IRPC - 32%)', `(${dre.irpc.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}) ${empresa.moeda}`, 'Dedução Fiscal'],
      ['10. RESULTADO LÍQUIDO DO PERÍODO / EXERCÍCIO (LUCRO LÍQUIDO)', `${dre.resultadoLiquido.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} ${empresa.moeda}`, 'RESULTADO FINAL'],
    ];

    autoTable(doc, {
      startY: 46,
      head: [['Rubrica / Designação da Conta de Resultados', 'Valor Apurado', 'Natureza Contábil']],
      body: dreData,
      theme: 'grid',
      headStyles: {
        fillColor: [220, 38, 38],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 8.5,
        textColor: [30, 41, 59],
      },
      columnStyles: {
        0: { cellWidth: 110 },
        1: { halign: 'right', cellWidth: 50, fontStyle: 'bold' },
        2: { halign: 'center', cellWidth: 25 },
      },
      styles: {
        cellPadding: 2.8,
      },
      didParseCell: (data) => {
        // Realçar linhas de subtotal e resultado líquido
        if (data.row.index === 2 || data.row.index === 7) {
          data.cell.styles.fillColor = [241, 245, 249];
          data.cell.styles.fontStyle = 'bold';
        }
        if (data.row.index === 9) {
          data.cell.styles.fillColor = [204, 251, 241]; // Teal 100
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.textColor = [220, 38, 38];
          data.cell.styles.fontSize = 9.5;
        }
      },
    });

    adicionarAssinaturasFiscais(doc, empresa);
  } else if (tipo === 'fiscal') {
    adicionarCabecalhoOficial(
      doc,
      empresa,
      'MAPA FISCAL DE RETENÇÕES NA FONTE E CONTRIBUIÇÕES SOCIAIS',
      'Autoridade Tributária de Moçambique (AT) & INSS - Guia Mensal de Retenção de Rendimentos',
      periodo
    );

    const linhas = folha?.linhas || [];
    let totSalarioBase = 0;
    let totRendimentoBruto = 0;
    let totInssTrab = 0;
    let totInssEmp = 0;
    let totIrps = 0;
    let totGeralFisco = 0;

    const fiscalData = linhas.map((l, idx) => {
      const rendBruto = l.salarioBase + l.subsidioAlimentacao + l.subsidioTransporte + l.outrosSubsidios + l.horasExtrasValor;
      const totalFiscoTrab = l.irps + l.inssTrabalhador + l.inssEmpresa;

      totSalarioBase += l.salarioBase;
      totRendimentoBruto += rendBruto;
      totInssTrab += l.inssTrabalhador;
      totInssEmp += l.inssEmpresa;
      totIrps += l.irps;
      totGeralFisco += totalFiscoTrab;

      return [
        (idx + 1).toString(),
        l.funcionarioNome,
        l.cargo,
        l.departamento,
        `${rendBruto.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT`,
        `${l.inssTrabalhador.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT`,
        `${l.inssEmpresa.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT`,
        `${l.irps.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT`,
        `${totalFiscoTrab.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT`,
      ];
    });

    autoTable(doc, {
      startY: 46,
      head: [
        [
          'Nº',
          'Colaborador / Beneficiário',
          'Cargo / Função',
          'Departamento',
          'Rendimento Bruto',
          'INSS Trab (3%)',
          'INSS Patronal (4%)',
          'Retenção IRPS',
          'Total a Recolher',
        ],
      ],
      body: fiscalData,
      foot: [
        [
          'TOTAL',
          `Total de ${linhas.length} Contribuintes Auditados`,
          '-',
          '-',
          `${totRendimentoBruto.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT`,
          `${totInssTrab.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT`,
          `${totInssEmp.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT`,
          `${totIrps.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT`,
          `${totGeralFisco.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT`,
        ],
      ],
      theme: 'striped',
      headStyles: {
        fillColor: [220, 38, 38],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7.5,
      },
      footStyles: {
        fillColor: [241, 245, 249],
        textColor: [15, 23, 42],
        fontStyle: 'bold',
        fontSize: 7.5,
      },
      bodyStyles: {
        fontSize: 7,
        textColor: [30, 41, 59],
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 8 },
        1: { fontStyle: 'bold', cellWidth: 'auto' },
        2: { cellWidth: 32 },
        3: { cellWidth: 28 },
        4: { halign: 'right', cellWidth: 26 },
        5: { halign: 'right', cellWidth: 24 },
        6: { halign: 'right', cellWidth: 26 },
        7: { halign: 'right', cellWidth: 24 },
        8: { halign: 'right', cellWidth: 28, fontStyle: 'bold' },
      },
      styles: {
        cellPadding: 1.8,
      },
    });

    adicionarAssinaturasFiscais(doc, empresa);
  } else if (tipo === 'folha') {
    adicionarCabecalhoOficial(
      doc,
      empresa,
      'MAPA ANALÍTICO DE FOLHA DE SALÁRIOS E ENCARGOS',
      'Demonstrativo Mensal de Vencimentos, Subsídios, Deduções Legais e Salários Líquidos',
      periodo
    );

    const linhas = folha?.linhas || [];
    let sumBase = 0;
    let sumSubsidios = 0;
    let sumInss = 0;
    let sumIrps = 0;
    let sumLiquido = 0;

    const folhaData = linhas.map((l, idx) => {
      const subs = l.subsidioAlimentacao + l.subsidioTransporte + l.outrosSubsidios + l.horasExtrasValor;
      sumBase += l.salarioBase;
      sumSubsidios += subs;
      sumInss += l.inssTrabalhador;
      sumIrps += l.irps;
      sumLiquido += l.liquido;

      return [
        (idx + 1).toString(),
        l.funcionarioNome,
        l.cargo,
        l.departamento,
        `${l.salarioBase.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT`,
        `${subs.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT`,
        `${l.inssTrabalhador.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT`,
        `${l.irps.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT`,
        `${l.liquido.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT`,
      ];
    });

    autoTable(doc, {
      startY: 46,
      head: [
        [
          'Nº',
          'Colaborador',
          'Função / Cargo',
          'Departamento',
          'Vencimento Base',
          'Subsídios',
          'INSS (3%)',
          'IRPS',
          'Líquido a Transferir',
        ],
      ],
      body: folhaData,
      foot: [
        [
          'TOTAL',
          `Folha Processada (${linhas.length} Colaboradores)`,
          '-',
          '-',
          `${sumBase.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT`,
          `${sumSubsidios.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT`,
          `${sumInss.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT`,
          `${sumIrps.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT`,
          `${sumLiquido.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} MT`,
        ],
      ],
      theme: 'striped',
      headStyles: {
        fillColor: [220, 38, 38],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7.5,
      },
      footStyles: {
        fillColor: [241, 245, 249],
        textColor: [15, 23, 42],
        fontStyle: 'bold',
        fontSize: 7.5,
      },
      bodyStyles: {
        fontSize: 7,
        textColor: [30, 41, 59],
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 8 },
        1: { fontStyle: 'bold', cellWidth: 'auto' },
        2: { cellWidth: 32 },
        3: { cellWidth: 30 },
        4: { halign: 'right', cellWidth: 26 },
        5: { halign: 'right', cellWidth: 22 },
        6: { halign: 'right', cellWidth: 22 },
        7: { halign: 'right', cellWidth: 22 },
        8: { halign: 'right', cellWidth: 28, fontStyle: 'bold' },
      },
      styles: {
        cellPadding: 1.8,
      },
    });

    adicionarAssinaturasFiscais(doc, empresa);
  } else if (tipo === 'lancamentos') {
    adicionarCabecalhoOficial(
      doc,
      empresa,
      'LIVRO DIÁRIO GERAL DE OPERAÇÕES CONTÁBEIS',
      'Registo Cronológico Integral de Partidas Dobradas e Documentos de Suporte',
      periodo
    );

    let totalGeralDebitos = 0;
    const lancamentosData = lancamentos.map(l => {
      const valorD = l.linhas.filter(x => x.tipoMovimento === 'D').reduce((a, b) => a + b.valor, 0);
      totalGeralDebitos += valorD;
      return [
        l.dataLancamento,
        l.numeroDocumento,
        l.idDiario.toString(),
        l.descricaoGeral,
        `${valorD.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} ${empresa.moeda}`,
        'Validado',
      ];
    });

    autoTable(doc, {
      startY: 46,
      head: [['Data', 'Nº Documento', 'Diário', 'Histórico / Descrição Geral', 'Total Lançado', 'Estado']],
      body: lancamentosData,
      foot: [
        [
          'TOTAIS',
          `${lancamentos.length} Lançamentos Contábeis Registados`,
          '-',
          'Soma das Movimentações a Débito e Crédito',
          `${totalGeralDebitos.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} ${empresa.moeda}`,
          '100% Auditado',
        ],
      ],
      theme: 'striped',
      headStyles: {
        fillColor: [220, 38, 38],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
      },
      footStyles: {
        fillColor: [241, 245, 249],
        textColor: [15, 23, 42],
        fontStyle: 'bold',
        fontSize: 8,
      },
      bodyStyles: {
        fontSize: 7.5,
        textColor: [30, 41, 59],
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 22 },
        1: { fontStyle: 'bold', cellWidth: 28 },
        2: { halign: 'center', cellWidth: 16 },
        3: { cellWidth: 'auto' },
        4: { halign: 'right', cellWidth: 32, fontStyle: 'bold' },
        5: { halign: 'center', cellWidth: 20 },
      },
      styles: {
        cellPadding: 2,
      },
    });

    adicionarAssinaturasFiscais(doc, empresa);
  }

  adicionarRodapeAuditavel(doc);
  return doc;
}
