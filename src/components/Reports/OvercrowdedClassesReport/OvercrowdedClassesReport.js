import React, { forwardRef, useImperativeHandle } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Componente para gerar relatórios de turmas lotadas.
 * @param {Object} props - Propriedades do componente.
 * @param {Function} props.onGenerateReport - Função chamada ao gerar o relatório.
 */
const OvercrowdedClassesReport = forwardRef(({ onGenerateReport }, ref) => {
  const data = [
    { className: 'Turma A', capacity: 30, enrolled: 35 },
    { className: 'Turma B', capacity: 25, enrolled: 28 },
    { className: 'Turma C', capacity: 20, enrolled: 22 },
  ];

  const generateReport = async () => {
    const doc = new jsPDF();

    // Adiciona cabeçalho
    doc.text('Relatório de Turmas Lotadas', 14, 20);

    // Adiciona a tabela ao PDF
    doc.autoTable({
      head: [['Turma', 'Capacidade', 'Matriculados']],
      body: data.map(item => [item.className, item.capacity, item.enrolled]),
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
      <p>Este é o filtro para o Relatório de Turmas Lotadas.</p>
    </div>
  );
});

export default OvercrowdedClassesReport;
