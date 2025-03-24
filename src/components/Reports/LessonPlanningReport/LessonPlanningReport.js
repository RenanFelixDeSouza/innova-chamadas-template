import React, { forwardRef, useImperativeHandle } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Componente para gerar relatórios de planejamento de aula por professores.
 * @param {Object} props - Propriedades do componente.
 * @param {Function} props.onGenerateReport - Função chamada ao gerar o relatório.
 */
const LessonPlanningReport = forwardRef(({ onGenerateReport }, ref) => {
  const data = [
    {
      professor: 'Prof. João',
      course: 'Matemática',
      date: '01/10/2023',
      topic: 'Introdução à Álgebra',
      objectives: 'Ensinar conceitos básicos de álgebra.',
      materials: 'Livro de Matemática, Quadro Branco, Marcadores.',
    },
    {
      professor: 'Prof. Ana',
      course: 'Português',
      date: '02/10/2023',
      topic: 'Análise Sintática',
      objectives: 'Identificar os elementos de uma oração.',
      materials: 'Livro de Português, Projetor.',
    },
    {
      professor: 'Prof. Carlos',
      course: 'História',
      date: '03/10/2023',
      topic: 'Revolução Industrial',
      objectives: 'Compreender o impacto da Revolução Industrial.',
      materials: 'Slides, Documentários.',
    },
  ];

  const generateReport = async () => {
    const doc = new jsPDF();

    // Adiciona cabeçalho
    doc.text('Relatório de Planejamento de Aula por Professores', 14, 20);

    // Adiciona a tabela ao PDF
    doc.autoTable({
      head: [['Professor', 'Curso', 'Data', 'Tópico', 'Objetivos', 'Materiais']],
      body: data.map(item => [
        item.professor,
        item.course,
        item.date,
        item.topic,
        item.objectives,
        item.materials,
      ]),
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
      <p>Este é o filtro para o Relatório de Planejamento de Aula por Professores.</p>
    </div>
  );
});

export default LessonPlanningReport;
