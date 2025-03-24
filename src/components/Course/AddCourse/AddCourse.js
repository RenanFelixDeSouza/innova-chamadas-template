/**
 * Componente AddCourse
 * Gerencia a criação de novas turmas com seleção de professores e alunos
 */

import React, { useState, useEffect } from "react";
import {
  FaChalkboardTeacher,
  FaTimes,
  FaUsers,
} from "react-icons/fa";
import "./AddCourse.css";

function AddCourse() {
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [selectedProfessors, setSelectedProfessors] = useState([]);
  const [professors, setProfessors] = useState([
    { id: 1, name: "Prof. João", categories: [1, 2] },
    { id: 2, name: "Prof. Ana", categories: [2, 3] },
    { id: 3, name: "Prof. Carlos", categories: [3] },
  ]); // Professores fictícios com oficinas relacionadas
  const [students, setStudents] = useState([
    { id: 1, first_name: "João", last_name: "Silva", categories: [1, 2] },
    { id: 2, first_name: "Ana", last_name: "Santos", categories: [2, 3] },
    { id: 3, first_name: "Pedro", last_name: "Oliveira", categories: [3] },
    { id: 4, first_name: "Clara", last_name: "Mendes", categories: [1] },
    { id: 5, first_name: "Lucas", last_name: "Almeida", categories: [2] },
  ]); // Alunos fictícios com oficinas relacionadas
  const [categories, setCategories] = useState([
    { id: 1, name: "Matemática" },
    { id: 2, name: "Português" },
    { id: 3, name: "História" },
  ]); // Categorias fictícias
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage, setStudentsPerPage] = useState(15);
  const [totalStudents, setTotalStudents] = useState(0);
  const [FilteredStudentsByCategory, setFilteredStudentsByCategory] = useState([]); // eslint-disable-line
  const [selectedProfessorCategories, setSelectedProfessorCategories] = useState({});
  const [selectedDays, setSelectedDays] = useState([]);

  const daysOfWeek = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"];
  const daysOfWeekMapping = {
    "Segunda-feira": 1,
    "Terça-feira": 2,
    "Quarta-feira": 3,
    "Quinta-feira": 4,
    "Sexta-feira": 5,
    "Sábado": 6,
    "Domingo": 7,
  };

  const filteredStudents = students.filter((student) => {
    const fullName = `${student.first_name} ${student.last_name}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  useEffect(() => {
    setFilteredStudentsByCategory(
      students.filter((student) =>
        `${student.first_name} ${student.last_name}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
    );
  }, [students, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  /**
   * Busca dados iniciais (professores e alunos)
   */
  useEffect(() => {
    // Simula carregamento inicial de dados fictícios
    setTimeout(() => {
      setProfessors([
        { id: 1, name: "Prof. João", categories: [1, 2] },
        { id: 2, name: "Prof. Ana", categories: [2, 3] },
        { id: 3, name: "Prof. Carlos", categories: [3] },
      ]);

      setStudents([
        { id: 1, first_name: "João", last_name: "Silva", categories: [1, 2] },
        { id: 2, first_name: "Ana", last_name: "Santos", categories: [2, 3] },
        { id: 3, first_name: "Pedro", last_name: "Oliveira", categories: [3] },
        { id: 4, first_name: "Clara", last_name: "Mendes", categories: [1] },
        { id: 5, first_name: "Lucas", last_name: "Almeida", categories: [2] },
      ]);

      setCategories([
        { id: 1, name: "Matemática" },
        { id: 2, name: "Português" },
        { id: 3, name: "História" },
      ]);
    }, 500);
  }, []);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  useEffect(() => {
    // Filter students based on search term (now applied to the already category-filtered data)
    const filteredBySearch = students.filter((student) => {
      const fullName = `${student.first_name} ${student.last_name}`.toLowerCase();
      return fullName.includes(searchTerm.toLowerCase());
    });
    setFilteredStudentsByCategory(filteredBySearch);
  }, [students, searchTerm]);

  const loadCategoriesForProfessor = React.useCallback((professorId) => {
    const mockCategories = [
        { id: 1, name: "Categoria 1" },
        { id: 2, name: "Categoria 2" },
        { id: 3, name: "Categoria 3" },
    ];

    setSelectedProfessorCategories((prevCategories) => ({
        ...prevCategories,
        [professorId]: mockCategories,
    }));

    if (mockCategories.length > 0 && !categoryId) {
        setCategoryId(mockCategories[0].id);
    }
}, [categoryId]);

  useEffect(() => {
    selectedProfessors.forEach((professorId) => {
      loadCategoriesForProfessor(professorId);
    });
  }, [selectedProfessors, loadCategoriesForProfessor]);

  useEffect(() => {
    // Atualiza as oficinas disponíveis com base nos professores selecionados
    const selectedCategories = selectedProfessors.flatMap((professorId) => {
      const professor = professors.find((p) => p.id === professorId);
      return professor ? professor.categories : [];
    });

    if (selectedCategories.length === 1) {
      setCategoryId(selectedCategories[0]); // Marca automaticamente a oficina se houver apenas uma
    } else {
      setCategoryId(""); // Reseta a oficina selecionada se houver mais de uma
    }
  }, [selectedProfessors]);

  const handleProfessorChange = (professorId) => {
    setSelectedProfessors((prevSelected) => {
      if (prevSelected.includes(professorId)) {
        return prevSelected.filter((id) => id !== professorId);
      } else {
        return [...prevSelected, professorId];
      }
    });
  };

  const handleStudentChange = (student) => {
    setSelectedStudents((prevSelected) => {
      const alreadySelected = prevSelected.some((s) => s.id === student.id);
      if (alreadySelected) {
        return prevSelected.filter((s) => s.id !== student.id);
      } else {
        return [...prevSelected, student];
      }
    });
  };

  const handleDayChange = (day) => {
    setSelectedDays((prevSelected) => {
      if (prevSelected.includes(day)) {
        return prevSelected.filter((d) => d !== day);
      } else {
        return [...prevSelected, day];
      }
    });
  };

  useEffect(() => {
    if (categoryId) {
      setFilteredStudentsByCategory(
        students.filter((student) => student.categories.includes(parseInt(categoryId)))
      );
    } else {
      setFilteredStudentsByCategory(students);
    }
  }, [categoryId]);

  /**
   * Salva nova turma
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Este template é apenas para demonstração das funcionalidades. Não é possível criar turmas.");
  };

  const resetForm = () => {
    setName("");
    setCategoryId("");
    setSelectedProfessors([]);
    setSelectedStudents([]);
    setSelectedProfessorCategories({});
    setSearchTerm("");
    setSelectedDays([]);
    setSuccess("");
  };

  const removeStudentFromPreview = (studentId) => {
    setSelectedStudents((prevSelected) =>
      prevSelected.filter((student) => student.id !== studentId)
    );
  };

  const handleDeselectAllStudents = () => {
    setSelectedStudents([]);
  };

  const categoryOptions = Array.from(
    new Set(
      selectedProfessors.flatMap((professorId) =>
        selectedProfessorCategories[professorId]?.map((category) =>
          JSON.stringify({ id: category.id, name: category.name })
        ) || []
      )
    )
  ).map((categoryStr) => {
    try {
      return JSON.parse(categoryStr);
    } catch {
      return null;
    }
  }).filter(Boolean);

  return (
    <div className="create-course-container">
      <h2>Criar Nova Turma</h2>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group-inline">
          <div className="form-group">
            <label htmlFor="course-name">Nome da Oficina:</label>
            <input
              type="text"
              id="course-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="category">Oficina:</label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                setCurrentPage(1);
              }}
              required
            >
              <option value="">Selecione uma Oficina</option>
              {categories
                .filter((category) =>
                  selectedProfessors.some((professorId) =>
                    professors.find((p) => p.id === professorId)?.categories.includes(category.id)
                  )
                )
                .map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <fieldset>
            <legend className="color:black;">
              {" "}
              <FaChalkboardTeacher /> Professores:
            </legend>
            <div className="checkbox-group" style={{ textAlign: "center" }}>
              {professors.map((professor) => (
                <div key={professor.id}>
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedProfessors.includes(
                        professor.id
                      )}
                      onChange={() =>
                        handleProfessorChange(professor.id)
                      }
                    />
                    {professor.name}
                  </label>

                  {/* Render categories only if professor is selected */}

                </div>
              ))}
            </div>
          </fieldset>
        </div>

        <fieldset>
          <legend>Dias da Semana:</legend>
          <div className="category-checkbox-item">
            {daysOfWeek.map((day) => (
              <label key={day}>
                <input
                  type="checkbox"
                  checked={selectedDays.includes(day)}
                  onChange={() => handleDayChange(day)}
                />
                {day}
              </label>
            ))}
          </div>
        </fieldset>
        
        <fieldset>
          <div className="form-group">
            <legend>
              <FaUsers /> Alunos:
            </legend>
            <label htmlFor="student-search">Buscar Aluno:</label>
            <input
              type="text"
              id="student-search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Digite para buscar..."
            />
          </div>

          <div className="form-group">
            <label>Alunos:</label>
            <div className="students-list">
              {filteredStudents.map((student) => (
                <label key={student.id} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedStudents.some((s) => s.id === student.id)}
                    onChange={() => handleStudentChange(student)}
                  />
                  {student.first_name} {student.last_name}
                </label>
              ))}
            </div>
          </div>

          {/* Controles de Paginação */}
          <div className="pagination">
            <button 
              onClick={() => handlePageChange(currentPage - 1)} 
              disabled={currentPage <= 1}
              className="pagination-button"
              type="button"
            >
              {"<"}
            </button>
            <span>
              Página {currentPage} de {Math.ceil(totalStudents / studentsPerPage)}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= Math.ceil(totalStudents / studentsPerPage)}
              className="pagination-button"
              type="button"
            >
              {">"}
            </button>
          </div>

          <div className="items-per-page-selector">
            <label htmlFor="itemsPerPage">Itens por página: </label>
            <select
              id="itemsPerPage"
              value={studentsPerPage}
              onChange={(e) => setStudentsPerPage(Number(e.target.value))}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
            </select>
          </div>

          {/* Selected Students Preview */}
          <div className="form-group">
            <div className="modal-buttons">
            <button type="button" onClick={handleDeselectAllStudents}>
              Remover Todos
            </button>
            </div>
            <label>Alunos Selecionados:</label>
            <div className="selected-students-preview-create">
              {selectedStudents.length > 0 ? (
                selectedStudents.map((student) => (
                  <div key={student.id} className="student-name">
                    <span>
                      {student.first_name} {student.last_name}
                    </span>
                    <button
                      className="remove-student"
                      onClick={() => removeStudentFromPreview(student.id)}
                    >
                      Remover <FaTimes />
                    </button>
                  </div>
                ))
              ) : (
                <p>Nenhum aluno selecionado.</p>
              )}
            </div>
          </div>
        </fieldset>

        <button type="submit">Criar Oficina</button>
      </form>
    </div>
  );
}

export default AddCourse;