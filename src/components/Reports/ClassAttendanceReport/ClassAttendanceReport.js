import React, { forwardRef, useImperativeHandle } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Componente para gerar relatórios de frequência de turmas.
 * @param {Object} props - Propriedades do componente.
 * @param {Function} props.onGenerateReport - Função chamada ao gerar o relatório.
 */
const ClassAttendanceReport = forwardRef(({ onGenerateReport }, ref) => {
  const generateReport = () => {
    const doc = new jsPDF();
    doc.text('Relatório de Frequência de Turmas', 14, 20);

    const data = [
      { turma: 'Turma A', presencas: '90%', faltas: '10%' },
      { turma: 'Turma B', presencas: '85%', faltas: '15%' },
      { turma: 'Turma C', presencas: '88%', faltas: '12%' },
    ];

    doc.autoTable({
      head: [['Turma', 'Presenças', 'Faltas']],
      body: data.map(item => [item.turma, item.presencas, item.faltas]),
      startY: 30,
      styles: {
        fontSize: 10,
        cellPadding: 4,
        textColor: '#212529', // var(--text-color)
        lineColor: '#ced4da', // var(--border-color)
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: '#304162', // var(--primary-color)
        textColor: '#fff', // var(--header-color)
        fontSize: 12,
      },
      alternateRowStyles: {
        fillColor: '#f8f9fa', // var(--background-color)
      },
    });

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
      <p>Este é o filtro para o Relatório de Frequência de Turmas.</p>
    </div>
  );
});

export default ClassAttendanceReport;
