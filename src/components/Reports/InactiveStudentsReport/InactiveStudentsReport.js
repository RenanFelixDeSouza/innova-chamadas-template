import React, { forwardRef, useImperativeHandle } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Componente para gerar relatórios de alunos inativos.
 * @param {Object} props - Propriedades do componente.
 * @param {Function} props.onGenerateReport - Função chamada ao gerar o relatório.
 */
const InactiveStudentsReport = forwardRef(({ onGenerateReport }, ref) => {
  const data = [
    { name: 'João Silva', lastAttendance: '01/10/2023', reason: 'Mudança de cidade' },
    { name: 'Ana Santos', lastAttendance: '15/09/2023', reason: 'Problemas de saúde' },
    { name: 'Pedro Oliveira', lastAttendance: '20/08/2023', reason: 'Desistência' },
  ];

  const generateReport = async () => {
    const doc = new jsPDF();

    // Adiciona cabeçalho
    doc.text('Relatório de Alunos Inativos', 14, 20);

    // Adiciona a tabela ao PDF
    doc.autoTable({
      head: [['Nome', 'Última Presença', 'Motivo']],
      body: data.map(item => [item.name, item.lastAttendance, item.reason]),
      startY: 30,
      styles: { fontSize: 10, cellPadding: 4 },
      headStyles: { fillColor: [48, 65, 98], textColor: [255, 255, 255] },
    });

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
      <p>Este é o filtro para o Relatório de Alunos Inativos.</p>
    </div>
  );
});

export default InactiveStudentsReport;
