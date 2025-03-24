import React, { useState, forwardRef, useImperativeHandle } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import CustomDatePicker from '../../Shared/CustomDatePicker/CustomDatePicker';
import { addPagination } from '../../Shared/ReportGeneratorLandscape';

/**
 * Componente para gerar relatórios de notas.
 * @param {Object} props - Propriedades do componente.
 * @param {Function} props.onGenerateReport - Função chamada ao gerar o relatório.
 */
const GradesReport = forwardRef(({ onGenerateReport }, ref) => {
  const [filters, setFilters] = useState({
    student: '',
    startDate: '',
    endDate: '',
    studentNameFilter: '',
    category: '',
    professor: '',
    course: ''
  });
  const [dateError, setDateError] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [categories, setCategories] = useState([
    { id: 1, name: "Matemática" },
    { id: 2, name: "Português" },
    { id: 3, name: "História" }
  ]);
  const [professors, setProfessors] = useState([
    { id: 1, name: "Prof. João" },
    { id: 2, name: "Prof. Ana" },
    { id: 3, name: "Prof. Carlos" }
  ]);
  const [courses, setCourses] = useState([
    { id: 1, name: "Turma A" },
    { id: 2, name: "Turma B" },
    { id: 3, name: "Turma C" }
  ]);

  const handleDateChange = (date, isStartDate) => {
    if (!date) return;

    const parts = date.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);

    const selectedDate = new Date(year, month, day);

    let startDateObj, endDateObj;

    if (filters.startDate) {
      const startParts = filters.startDate.split('-');
      startDateObj = new Date(parseInt(startParts[0], 10), parseInt(startParts[1], 10) - 1, parseInt(startParts[2], 10));
    }
    if (filters.endDate) {
      const endParts = filters.endDate.split('-');
      endDateObj = new Date(parseInt(endParts[0], 10), parseInt(endParts[1], 10) - 1, parseInt(endParts[2], 10));
    }

    if (isStartDate) {
      if (endDateObj && selectedDate > endDateObj) {
        setDateError('A data inicial não pode ser maior que a data final');
        return;
      }
      setFilters({ ...filters, startDate: date });
    } else {
      if (startDateObj && selectedDate < startDateObj) {
        setDateError('A data final não pode ser menor que a data inicial');
        return;
      }
      setFilters({ ...filters, endDate: date });
    }

    setDateError('');
  };

  const handleStudentNameFilterChange = (e) => {
    const studentNameFilter = e.target.value;
    setFilters({ ...filters, studentNameFilter });
    if (studentNameFilter.length >= 3) {
      setFilteredStudents([
        { id: 1, first_name: "João", last_name: "Silva" },
        { id: 2, first_name: "Ana", last_name: "Santos" },
        { id: 3, first_name: "Pedro", last_name: "Oliveira" }
      ]);
    } else {
      setFilteredStudents([]);
    }
  };

  const handleStudentSelect = (student) => {
    setFilters({ ...filters, student: student.id, studentNameFilter: `${student.first_name} ${student.last_name}` });
    setFilteredStudents([]);
  };

  const handleClearFilters = () => {
    setFilters({
      student: '',
      startDate: '',
      endDate: '',
      studentNameFilter: '',
      category: '',
      professor: '',
      course: ''
    });
    setDateError('');
    setFilteredStudents([]);
  };

  const generateTable = (doc, groupedData) => {
    let startY = 50; // Ajuste para descer um pouco mais

    Object.keys(groupedData).forEach((groupKey) => {
      const { professor, category, data } = groupedData[groupKey];

      // Adiciona cabeçalho da turma
      doc.setFontSize(12);
      doc.setTextColor('#304162'); // var(--primary-color)
      doc.text(`Turma: ${groupKey} | Professor: ${professor} | Categoria: ${category}`, 14, startY);
      startY += 15; // Adiciona mais espaço após o cabeçalho

      // Adiciona tabela de notas
      const headers = ['Data da Prova', 'Aluno', 'Nota'];
      const body = data.map(item => [
        formatDate(item.date),
        item.student,
        item.grade
      ]);

      doc.autoTable({
        head: [headers],
        body: body,
        startY: startY,
        styles: {
          fontSize: 10,
          cellPadding: 4,
          textColor: '#212529', // var(--text-color)
          lineColor: '#ced4da', // var(--border-color)
          lineWidth: 0.1
        },
        headStyles: {
          fillColor: '#304162', // var(--primary-color)
          textColor: '#fff',
          fontSize: 12
        },
        alternateRowStyles: {
          fillColor: '#f8f9fa' // var(--background-color)
        }
      });

      startY = doc.autoTable.previous.finalY + 15; // Adiciona mais espaço entre grupos
    });
  };

  const formatDate = (date) => {
    if (!date) return '';
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  };

  const generateReport = async () => {
    try {
      const reportData = getReportData();
      const filteredData = reportData.filter(item => {
        const itemDate = new Date(item.date);
        const startDate = filters.startDate ? new Date(filters.startDate) : null;
        const endDate = filters.endDate ? new Date(filters.endDate) : null;
        const matchesCourse = filters.course ? item.course === courses.find(c => c.id === parseInt(filters.course))?.name : true;
        const matchesCategory = filters.category ? item.category === categories.find(c => c.id === parseInt(filters.category))?.name : true;
        const matchesProfessor = filters.professor ? item.professor === professors.find(p => p.id === parseInt(filters.professor))?.name : true;
        const matchesStudent = filters.studentNameFilter
          ? item.student.toLowerCase().includes(filters.studentNameFilter.toLowerCase())
          : true;

        return (
          (!startDate || itemDate >= startDate) &&
          (!endDate || itemDate <= endDate) &&
          matchesCourse &&
          matchesCategory &&
          matchesProfessor &&
          matchesStudent
        );
      });

      // Agrupa os dados por turma, professor e categoria
      const groupedData = filteredData.reduce((acc, item) => {
        const groupKey = item.course;
        if (!acc[groupKey]) {
          acc[groupKey] = {
            professor: item.professor,
            category: item.category,
            data: []
          };
        }
        acc[groupKey].data.push(item);
        return acc;
      }, {});

      const doc = new jsPDF({ format: 'a4' });

      // Adiciona cabeçalho e paginação
      const userName = "Nome do Usuário";
      const filtersString = `Período: ${filters.startDate ? formatDate(filters.startDate) : ''} - ${filters.endDate ? formatDate(filters.endDate) : ''}`;
      addPagination(doc, userName, filtersString, filteredData.length, 'Relatório de Notas', 1);

      // Gera tabela
      generateTable(doc, groupedData);

      // Salva o PDF
      const pdfBytes = doc.output('arraybuffer');
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      onGenerateReport(url);
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      alert("Erro ao gerar relatório. Por favor, tente novamente mais tarde.");
    }
  };

  useImperativeHandle(ref, () => ({
    generateReport,
    clearFilters: handleClearFilters,
  }));

  const getReportData = () => {
    return [
      { date: '2025-10-01', student: 'João Silva', subject: 'Matemática', grade: '8.5', course: 'Turma A', professor: 'Prof. João', category: 'Matemática' },
      { date: '2025-10-05', student: 'Ana Santos', subject: 'Português', grade: '9.0', course: 'Turma A', professor: 'Prof. João', category: 'Matemática' },
      { date: '2025-10-10', student: 'Pedro Oliveira', subject: 'História', grade: '7.5', course: 'Turma B', professor: 'Prof. Ana', category: 'Português' },
      { date: '2025-10-15', student: 'Maria Souza', subject: 'Geografia', grade: '8.0', course: 'Turma B', professor: 'Prof. Ana', category: 'Português' },
      { date: '2025-10-20', student: 'Carlos Lima', subject: 'Ciências', grade: '9.2', course: 'Turma C', professor: 'Prof. Carlos', category: 'História' },
      { date: '2025-11-01', student: 'João Silva', subject: 'Física', grade: '7.8', course: 'Turma C', professor: 'Prof. Carlos', category: 'História' },
      { date: '2025-11-10', student: 'Ana Santos', subject: 'Química', grade: '8.7', course: 'Turma A', professor: 'Prof. João', category: 'Matemática' },
      { date: '2025-11-15', student: 'Pedro Oliveira', subject: 'Biologia', grade: '6.5', course: 'Turma B', professor: 'Prof. Ana', category: 'Português' },
      // Nova turma adicionada
    ];
  };

  return (
    <div className="grades-report-filters">
      <div className="example-message">
        <p>
          Este relatório é apenas um exemplo ilustrativo, criado para demonstrar funcionalidades adicionais que podem ser implementadas no sistema. Ele não faz parte do projeto principal.
        </p>
      </div>
      <div className="filter-group">
        <fieldset>
          <legend>Aluno:</legend>
          <input
            type="text"
            placeholder="Nome do Aluno"
            value={filters.studentNameFilter}
            onChange={handleStudentNameFilterChange}
          />
          {filteredStudents.length > 0 && (
            <ul className="student-list">
              {filteredStudents.map((student) => (
                <li key={student.id} onClick={() => handleStudentSelect(student)}>
                  {`${student.first_name} ${student.last_name}`}
                </li>
              ))}
            </ul>
          )}
        </fieldset>
      </div>
      <div className="filter-group">
        <fieldset>
          <legend>Turma:</legend>
          <select value={filters.course} onChange={(e) => setFilters({ ...filters, course: e.target.value })}>
            <option value="">Selecione</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
        </fieldset>
      </div>
      <div className="filter-group">
        <fieldset>
          <legend>Período:</legend>
          <div className="date-range">
            <CustomDatePicker
              value={filters.startDate}
              onChange={(date) => handleDateChange(date, true)}
              placeholder="Inicial"
              className="date-picker-compact"
            />
            <span className="date-separator">até</span>
            <CustomDatePicker
              value={filters.endDate}
              onChange={(date) => handleDateChange(date, false)}
              placeholder="Final"
              className="date-picker-compact"
            />
          </div>
          {dateError && <div className="date-error">{dateError}</div>}
        </fieldset>
      </div>
      <div className="filter-group">
        <fieldset>
          <legend>Categoria:</legend>
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          >
            <option value="">Selecione</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </fieldset>
      </div>
      <div className="filter-group">
        <fieldset>
          <legend>Professor:</legend>
          <select
            value={filters.professor}
            onChange={(e) => setFilters({ ...filters, professor: e.target.value })}
          >
            <option value="">Selecione</option>
            {professors.map((professor) => (
              <option key={professor.id} value={professor.id}>
                {professor.name}
              </option>
            ))}
          </select>
        </fieldset>
      </div>
    </div>
  );
});

export default GradesReport;
