/**
 * Componente EditAttendanceModal
 * Modal para edição de chamadas, permitindo alterar presença e adicionar comentários
 */

import React, { useState, useEffect, useRef } from 'react';
import './EditAttendanceModal.css';

// Adicionar função utilitária no início do arquivo
const formatDateToBR = (dateString) => {
    if (!dateString) return 'N/A';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
};

function EditAttendanceModal({ session, onClose, onSave }) {
  const [attendanceData, setAttendanceData] = useState({});
  const [sessionInfo, setSessionInfo] = useState({});
  const [comments, setComments] = useState({});
  const [error, setError] = useState(null);
  const [students, setStudents] = useState([]);
  const [focusedStudentIndex, setFocusedStudentIndex] = useState(0);
  const selectRefs = useRef([]);

  /**
   * Busca dados de presença e alunos ao inicializar
   */
  useEffect(() => {
    const fetchAttendanceAndStudents = async () => {
      try {
        // Verifique se session.course está definido antes de acessar name
        const sessionData = {
            date: session.date, // Data correta
            course_name: session.course?.name || "Turma Desconhecida", // Nome da turma ou valor padrão
            attendances: [
                { student_id: 1, student_first_name: "João", student_last_name: "Silva", status: "", comments: "" },
                { student_id: 2, student_first_name: "Ana", student_last_name: "Santos", status: "", comments: "" },
                { student_id: 3, student_first_name: "Pedro", student_last_name: "Oliveira", status: "", comments: "" },
            ],
        };

        setSessionInfo(sessionData);

        const studentList = sessionData.attendances.map(attendance => ({
            id: attendance.student_id,
            first_name: attendance.student_first_name,
            last_name: attendance.student_last_name,
        }));

        const sortedStudents = studentList.sort((a, b) => {
            const nameA = `${a.first_name} ${a.last_name}`.toLowerCase();
            const nameB = `${b.first_name} ${b.last_name}`.toLowerCase();
            return nameA.localeCompare(nameB);
        });
        setStudents(sortedStudents);

        const attendanceMap = {};
        const commentMap = {};
        sessionData.attendances.forEach(attendance => {
            attendanceMap[attendance.student_id] = attendance.status || '';
            commentMap[attendance.student_id] = attendance.comments || '';
        });
        setAttendanceData(attendanceMap);
        setComments(commentMap);
      } catch (error) {
        console.error('Erro ao buscar dados fictícios de presença e alunos:', error);
        setError('Erro ao carregar dados fictícios de presença e alunos.');
      }
    };

    if (session) {
      fetchAttendanceAndStudents();
    }
  }, [session]);

  /**
   * Handlers de navegação e interação
   */
  const handleKeyDown = (e, index) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const nextIndex = (index + 1) % students.length;
      setFocusedStudentIndex(nextIndex);
      selectRefs.current[nextIndex]?.focus();
    }
  };

  const handleSelectKeyDown = (e, studentId) => {
    const statusOptions = ['P', 'F', 'FJ', 'PA'];
    const currentStatus = attendanceData[studentId] || 'P';
    const currentIndex = statusOptions.indexOf(currentStatus);

    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + statusOptions.length) % statusOptions.length;
      handleAttendanceChange(studentId, statusOptions[prevIndex]);
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % statusOptions.length;
      handleAttendanceChange(studentId, statusOptions[nextIndex]);
    }
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleCommentChange = (studentId, comment) => {
    setComments(prev => ({
      ...prev,
      [studentId]: comment
    }));
  };

  /**
   * Handlers de submissão
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Este é apenas um rascunho. Não é possível salvar, editar ou excluir os dados.");
    onClose();
  };

  const editAttedanceSave = (e) => {
    e.preventDefault();
    alert("Este é apenas um rascunho. Não é possível salvar, editar ou excluir os dados.");
    onClose();
  };

  return (
    <div className="attendance-modal-overlay" onClick={onClose}>
      <div className="attendance-modal" onClick={(e) => e.stopPropagation()}>
        <div className="attendance-modal-header">
          <h2>Editar Chamada</h2>
          <div className="attendance-form-group">
            <label>Data: {formatDateToBR(sessionInfo.date)}</label>
          </div>
          <div className="attendance-form-group">
            <label>Oficina: {sessionInfo.course_name}</label>
          </div>
        </div>
        <div className="attendance-modal-body">
          {error && <div className="attendance-error-message">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="attendance-form-group">
              <label>Alunos:</label>
              <table className="attendance-students-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Status</th>
                    <th>Comentários</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, index) => (
                    <tr
                      key={student.id}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                    >
                      <td className="attendance-student-name">{student.first_name} {student.last_name}</td>
                      <td>
                        <select
                          ref={(el) => (selectRefs.current[index] = el)}
                          value={attendanceData[student.id] || ''}
                          onChange={(e) => handleAttendanceChange(student.id, e.target.value)}
                          onKeyDown={(e) => handleSelectKeyDown(e, student.id)}
                          className="attendance-attendance-select"
                          tabIndex={focusedStudentIndex === index ? 0 : -1}
                        >
                          <option value="">Selecione</option>
                          <option value="P">Presente</option>
                          <option value="F">Falta</option>
                          <option value="FJ">Falta Justificada</option>
                          <option value="PA">Presente com Atraso</option>
                        </select>
                      </td>
                      <td>
                        <input
                          type="text"
                          placeholder="Comentários (opcional)"
                          value={comments[student.id] || ''}
                          onChange={(e) => handleCommentChange(student.id, e.target.value)}
                          className="attendance-comment-input"
                          tabIndex={focusedStudentIndex === index ? 0 : -1}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="modal-buttons">
              <button type="submit" className="attendance-save-button">Finalizar</button>
              <button type="button" onClick={editAttedanceSave} className="attendance-save-button">Salvar edição</button>
              <button type="button" onClick={onClose} className="attendance-cancel-button">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditAttendanceModal;