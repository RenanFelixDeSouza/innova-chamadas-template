import React, { useState, useEffect, forwardRef, useImperativeHandle, useMemo } from 'react';
import jsPDF from 'jspdf';
import CustomDatePicker from '../../../Shared/CustomDatePicker/CustomDatePicker';
import { addPagination } from '../../../Shared/ReportGeneratorLandscape';

/**
* Componente para gerar relatórios de presença.
* @param {Object} props - Propriedades do componente.
* @param {Function} props.onGenerateReport - Função chamada ao gerar o relatório.
* @param {Object} props.filters - Filtros aplicados.
* @param {Function} props.setFilters - Função para definir os filtros.
*/
const AttendanceReport = forwardRef(({ onGenerateReport }, ref) => {
  const [courses, setCourses] = useState([
    { id: 1, name: "Turma A" },
    { id: 2, name: "Turma B" },
    { id: 3, name: "Turma C" }
  ]);
  const [filters, setFilters] = useState({
    student: '',
    startDate: '',
    endDate: '',
    studentNameFilter: '',
    category: '',
    professor: '',
    course: ""
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

    // Corrige a validação do mesmo mês
    if (startDateObj && endDateObj && startDateObj.getMonth() !== endDateObj.getMonth()) {
      setDateError('A data inicial e final devem estar no mesmo mês');
      return;
    }

    setDateError('');
  };

  const handleClearFilters = () => {
    setFilters({
      student: '',
      startDate: '',
      endDate: '',
      studentNameFilter: '',
      category: '',
      professor: '',
      course: ""
    });
    setDateError('');
    setFilteredStudents([]);
  };

  const generateTable = async (doc, reportData, userName, filters, recordCount, reportTitle) => {
    const groupedData = reportData.reduce((acc, item) => {
      if (!acc[item.course]) {
        acc[item.course] = [];
      }
      acc[item.course].push(item);
      return acc;
    }, {});

    let startY = 50; 

    Object.keys(groupedData).forEach((className) => {
      const classData = groupedData[className];

      // Ordena os estudantes por nome em ordem alfabética
       classData.sort((a, b) => a.name.localeCompare(b.name));

      const dates = classData[0].dates;
      const professor = classData[0].professor;
      const category = classData[0].category;
      let headers = ['#', 'Nome do Aluno', ...dates, 'Total P', 'Total PA', 'Total F', 'Total FJ'];

      const body = classData.map((item, index) => {
        const status = item.status.concat(Array(dates.length - item.status.length).fill(''));
        return [index + 1, item.name, ...status, item.totalP, item.totalPA, item.totalF, item.totalFJ];
      });

      doc.setFontSize(12);
      doc.setTextColor(40);
      doc.text(`Turma: ${className} | Professor: ${professor} | Categoria: ${category}`, 14, startY);
      startY += 2

      doc.autoTable({
        head: [headers],
        body: body,
        startY: startY,
        margin: { top: 40 },
        styles: { fontSize: 8, cellPadding: 0.5, valign: 'middle' },
        headStyles: {
          fillColor: [48, 65, 98], // (RGB  #304162)
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
          halign: 'center', 
        },

        columnStyles: {
          0: {
            cellWidth: 10,
            halign: 'center',
            lineWidth: 0.1,
            lineColor: [0, 0, 0],
          },
          1: {
            cellWidth: 30,
            halign: 'left',
            lineWidth: 0.1,
            lineColor: [0, 0, 0],
          },
          ...dates.reduce((acc, _, index) => {
            acc[index + 2] = {
              halign: 'center',
              lineWidth: 0.1,
              lineColor: [0, 0, 0],
            };
            return acc;
          }, {}),
          [dates.length + 2]: {
            halign: 'center',
            lineWidth: 0.1,
            lineColor: [0, 0, 0],
          },
          [dates.length + 3]: {
            halign: 'center',
            lineWidth: 0.1,
            lineColor: [0, 0, 0],
          },
          [dates.length + 4]: {
            halign: 'center',
            lineWidth: 0.1,
            lineColor: [0, 0, 0],
          },
          [dates.length + 5]: {
            halign: 'center',
            lineWidth: 0.1,
            lineColor: [0, 0, 0],
          },
        },
        didDrawCell: function (data) {
          const doc = data.doc;
          const cell = data.cell;

          // Desenha bordas laterais
          doc.setLineWidth(0.1);
          doc.setDrawColor(0, 0, 0);
          doc.line(cell.x, cell.y, cell.x, cell.y + cell.height);
          doc.line(cell.x + cell.width, cell.y, cell.x + cell.width, cell.y + cell.height);
        },
        didParseCell: function (data) {
          if (data.row.section === 'head') {
            if (data.column.index === 0) {
              data.cell.styles.halign = 'center';
            } else if (data.column.index === 1) {
              data.cell.styles.halign = 'left';
            } else {
              data.cell.styles.halign = 'center';
            }
          }
        },
      });
      startY = doc.autoTable.previous.finalY + 25;
    });
  };

  const generateReport = async () => {
    if (!filters.startDate || !filters.endDate) {
      setDateError("Por favor, preencha o período de datas antes de gerar o relatório.");
      return;
    }
    try {
      const doc = new jsPDF({ format: 'a4', orientation: 'landscape' });

      // Atualiza os filtros antes de gerar o relatório
      const updatedFilters = { ...filters };

      const reportData = await getReportData(updatedFilters);
      const userName = "Nome do Usuário";
      const filtersString = getFilters(updatedFilters);
      const recordCount = reportData.length;
      const totalPagesExp = "{total_pages_count_string}";

      // Gera a tabela que será replicada em todas as páginas
      await generateTable(doc, reportData, userName, filtersString, recordCount, 'Relatório de Presença');

      // Adiciona a paginação em todas as páginas
      addPagination(doc, userName, filtersString, recordCount, 'Relatório de Presença', totalPagesExp);

      // Atualiza o total de páginas no final
      if (typeof doc.putTotalPages === 'function') {
        doc.putTotalPages(totalPagesExp);
      }

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

  const getReportData = async (currentFilters) => {
    const allDates = Array.from({ length: 12 }, (_, month) =>
      Array.from({ length: 10 }, (_, day) => `${String(day + 1).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}/2025`)
    ).flat();

    const data = [
      {
        course: "Turma A",
        professor: "Prof. João",
        category: "Matemática",
        name: "João Silva",
        status: Array(allDates.length).fill("P"),
        dates: allDates,
        totalP: allDates.length,
        totalF: 0,
        totalPA: 0,
        totalFJ: 0
      },
      {
        course: "Turma A",
        professor: "Prof. João",
        category: "Matemática",
        name: "Ana Santos",
        status: Array(allDates.length).fill("F"),
        dates: allDates,
        totalP: 0,
        totalF: allDates.length,
        totalPA: 0,
        totalFJ: 0
      },
      {
        course: "Turma B",
        professor: "Prof. Ana",
        category: "Português",
        name: "Pedro Oliveira",
        status: Array(allDates.length).fill("P").map((_, i) => (i % 2 === 0 ? "P" : "F")),
        dates: allDates,
        totalP: Math.ceil(allDates.length / 2),
        totalF: Math.floor(allDates.length / 2),
        totalPA: 0,
        totalFJ: 0
      }
    ];

    // Aplica os filtros
    return data
      .map((item) => {
        const startDate = currentFilters.startDate ? new Date(currentFilters.startDate) : null;
        const endDate = currentFilters.endDate ? new Date(currentFilters.endDate) : null;

        // Ajusta o ano das datas para corresponder ao ano do filtro
        const adjustedDates = item.dates.map(date => {
          const [day, month, year] = date.split('/');
          const filterYear = startDate ? startDate.getFullYear() : 2025;
          return `${day}/${month}/${filterYear}`;
        });

        // Filtra as datas dentro do intervalo
        const filteredDates = startDate && endDate
          ? adjustedDates.filter(date => {
              const [day, month, year] = date.split('/');
              const itemDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
              return itemDate >= startDate && itemDate <= endDate;
            })
          : adjustedDates;

        // Ajusta os status para corresponder às datas filtradas
        const filteredStatus = item.status.slice(0, filteredDates.length);

        return {
          ...item,
          dates: filteredDates,
          status: filteredStatus,
          totalP: filteredStatus.filter(s => s === "P").length,
          totalF: filteredStatus.filter(s => s === "F").length,
          totalPA: filteredStatus.filter(s => s === "PA").length,
          totalFJ: filteredStatus.filter(s => s === "FJ").length
        };
      })
      .filter((item) => {
        const matchesCourse = currentFilters.course ? item.course === courses.find(c => c.id === parseInt(currentFilters.course))?.name : true;
        const matchesCategory = currentFilters.category ? item.category === categories.find(c => c.id === parseInt(currentFilters.category))?.name : true;
        const matchesProfessor = currentFilters.professor ? item.professor === professors.find(p => p.id === parseInt(currentFilters.professor))?.name : true;
        const matchesStudent = currentFilters.student ? item.name === filteredStudents.find(s => s.id === parseInt(currentFilters.student))?.first_name + " " + filteredStudents.find(s => s.id === parseInt(currentFilters.student))?.last_name : true;

        return matchesCourse && matchesCategory && matchesProfessor && matchesStudent;
      });
  };

  /**
   * Retorna os filtros aplicados.
   * @returns {string} - Filtros aplicados.
   */
  const getFilters = (currentFilters) => {
    const formatDate = (date) => {
      if (!date) return '';
      const [year, month, day] = date.split('-');
      return `${day}/${month}/${year}`;
    };

    const formattedStartDate = formatDate(currentFilters.startDate);
    const formattedEndDate = formatDate(currentFilters.endDate);

    const filtersArray = [];

    if (currentFilters.student) filtersArray.push(`Estudante: ${currentFilters.studentNameFilter}`);
    if (formattedStartDate) filtersArray.push(`Data Inicial: ${formattedStartDate}`);
    if (formattedEndDate) filtersArray.push(`Data Final: ${formattedEndDate}`);

    return filtersArray.join(', ');
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

  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesCategory = filters.category ? course.category === filters.category : true;
      const matchesProfessor = filters.professor ? course.professor === filters.professor : true;
      const matchesStudent = filters.student ? course.students.some(student => student.id === filters.student) : true;
      return matchesCategory && matchesProfessor && matchesStudent;
    });
  }, [courses, filters]);

  return (
    <div className="report-filters">
      <div className="filter-group">
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
            <legend>
              turma:
            </legend>
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
      </div>
      <div className="filter-group" >
        <fieldset>
          <legend>Período: *</legend>
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
      <div className='filter-group'>
        <div className="filter-group">
          <fieldset>
            <legend>Categoria:</legend>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <option value="">Selecione</option>
              {categories && categories.length > 0 ? (
                categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))
              ) : (
                <option value="" disabled>Carregando categorias...</option>
              )}
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
              {professors && professors.length > 0 ? (
                professors.map((professor) => (
                  <option key={professor.id} value={professor.id}>
                    {professor.name}
                  </option>
                ))
              ) : (
                <option value="" disabled>Carregando professores...</option>
              )}
            </select>
          </fieldset>
        </div>
      </div>
    </div>
  );
});

export default AttendanceReport;