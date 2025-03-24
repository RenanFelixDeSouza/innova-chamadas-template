/**
 * Componente AddStudentsIntoCourseModal
 * Modal para adicionar alunos a uma turma existente
 */

import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import "./AddStudentsIntoCourseModal.css";

function AddStudentsIntoCourseModal({ course, onClose, onSave }) {
  const [students, setStudents] = useState([
    { id: 1, first_name: "João", last_name: "Silva" },
    { id: 2, first_name: "Ana", last_name: "Santos" },
    { id: 3, first_name: "Pedro", last_name: "Oliveira" },
    { id: 4, first_name: "Clara", last_name: "Mendes" },
    { id: 5, first_name: "Lucas", last_name: "Almeida" },
  ]); // Alunos fictícios
  const [selectedStudents, setSelectedStudents] = useState(course.students || []);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 15,
  });

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  const paginateData = (data) => {
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const filteredStudents = students.filter((student) =>
    `${student.first_name} ${student.last_name}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredStudents.length / pagination.itemsPerPage);
  const paginatedStudents = paginateData(filteredStudents);

  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      totalPages: totalPages,
      totalItems: filteredStudents.length,
      currentPage: 1, // Reset para página 1 quando filtrar
    }));
  }, [filteredStudents.length, totalPages]);

  const handleStudentChange = (student) => {
    setSelectedStudents((prevSelected) => {
      const alreadySelected = prevSelected.some((s) => s.id === student.id);
      const isExistingStudent = course.students.some((s) => s.id === student.id);

      if (alreadySelected && !isExistingStudent) {
        return prevSelected.filter((s) => s.id !== student.id);
      } else if (!alreadySelected) {
        return [...prevSelected, student];
      } else {
        return prevSelected;
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Este template é apenas para demonstração das funcionalidades. Não é possível modificar os dados.");
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
          <h2>Adicionar Alunos</h2>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
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
              <label>Alunos: </label>
              <div className="students-list">
                {paginatedStudents.map((student) => (
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

            <div className="pagination">
              <button
                type="button"
                onClick={() => handlePageChange(1)}
                disabled={pagination.currentPage === 1}
              >
                {"<<"}
              </button>
              <button
                type="button"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
              >
                {"<"}
              </button>
              <span>
                Página {pagination.currentPage} de {pagination.totalPages}
              </span>
              <button
                type="button"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === totalPages}
              >
                {">"}
              </button>
              <button
                type="button"
                onClick={() => handlePageChange(totalPages)}
                disabled={pagination.currentPage === totalPages}
              >
                {">>"}
              </button>
            </div>

            <div className="selected-students-add-preview">
              <h3>Alunos Selecionados:</h3>
              {selectedStudents.length > 0 ? (
                selectedStudents.map((student) => (
                  <div key={student.id} className="student-name">
                    <span>
                      {student.first_name} {student.last_name}
                    </span>
                    {!course.students.some((s) => s.id === student.id) && (
                      <button
                        className="remove-student"
                        onClick={() => handleStudentChange(student)}
                      >
                        <FaTimes />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p>Nenhum aluno selecionado.</p>
              )}
            </div>
            <div className="modal-buttons">
              <button type="button" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit">Salvar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddStudentsIntoCourseModal;