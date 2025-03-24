import React, { forwardRef, useImperativeHandle } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { addPagination } from '../../Shared/ReportGeneratorLandscape';

/**
 * Componente para gerar relatórios de desempenho de turmas com tabelas.
 * @param {Object} props - Propriedades do componente.
 * @param {Function} props.onGenerateReport - Função chamada ao gerar o relatório.
 */
const ClassPerformanceReport = forwardRef(({ onGenerateReport }, ref) => {
  const data = [
    { turma: 'Turma A', desempenho: '85%' },
    { turma: 'Turma B', desempenho: '78%' },
    { turma: 'Turma C', desempenho: '92%' },
  ];

  const generateReport = async () => {
    const doc = new jsPDF();

    // Adiciona cabeçalho
    const userName = "Nome do Usuário";
    const filters = "Nenhum filtro aplicado";
    const recordCount = data.length;
    const totalPagesExp = "{total_pages_count_string}";
    addPagination(doc, userName, filters, recordCount, 'Relatório de Desempenho de Turmas', totalPagesExp);

    // Adiciona a tabela ao PDF
    doc.autoTable({
      head: [['Turma', 'Desempenho']],
      body: data.map(item => [item.turma, item.desempenho]),
      startY: 50,
      styles: { fontSize: 10, cellPadding: 4 },
      headStyles: { fillColor: [48, 65, 98], textColor: [255, 255, 255] },
    });

    // Atualiza o total de páginas no final
    if (typeof doc.putTotalPages === 'function') {
      doc.putTotalPages(totalPagesExp);
    }

    // Gera o PDF
    const pdfBytes = doc.output('arraybuffer');
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    onGenerateReport(url);
  };

  useImperativeHandle(ref, () => ({
    generateReport,
    clearFilters: () => {},
  }));

  return (
    <div>
      <div className="example-message">
        <p>
          Este relatório é apenas um exemplo ilustrativo, criado para demonstrar funcionalidades adicionais que podem ser implementadas no sistema. Ele não faz parte do projeto principal.
        </p>
      </div>
      <p>Este é o filtro para o Relatório de Desempenho de Turmas.</p>
    </div>
  );
});

export default ClassPerformanceReport;
