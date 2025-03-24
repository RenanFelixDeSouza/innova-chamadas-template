/**
 * Dashboard Principal
 * Exibe métricas, estatísticas e informações relevantes do sistema
 */

import React, { useState, useEffect, useMemo } from 'react';
import { FaUsers, FaCalendarAlt, FaExclamationTriangle, FaUserPlus, FaEye } from 'react-icons/fa';
import Modal from 'react-modal';
import './Dashboard.css';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import { useNavigate } from 'react-router-dom';

function Dashboard({ isSidebarOpen }) {
  const [dashboardData, setDashboardData] = useState({
    students_overview: {
      active_students: 120,
      inactive_students: 30,
      without_courses: 10
    },
    classes_today: 5,
    recent_enrollments: 15,
    students_with_absences: {
      total: 3,
      students: [
        {
          student_name: "João Silva",
          absences_count: 2,
          responsible_phone: "123456789",
          responsible_name: "Maria Silva",
          courses: ["Matemática", "Português"]
        },
        {
          student_name: "Ana Santos",
          absences_count: 3,
          responsible_phone: "987654321",
          responsible_name: "Carlos Santos",
          courses: ["História"]
        },
        {
          student_name: "Pedro Oliveira",
          absences_count: 1,
          responsible_phone: "456789123",
          responsible_name: "Fernanda Oliveira",
          courses: ["Geografia", "Ciências"]
        }
      ]
    },
    attendance_statistics: {
      total_calls: 50,
      total_present: "45",
      total_absent: "5",
      presence_percentage: 90
    },
    last_month_attendance: { 
      total_calls: 40,
      total_present: "35",
      total_absent: "5",
      presence_percentage: 87.5
    },
    daily_sessions: {
      upcoming: [
        { time: "10:00", course_name: "Matemática", professor: "Prof. João", total_students: 20 },
        { time: "14:00", course_name: "Português", professor: "Prof. Ana", total_students: 25 }
      ],
      past: [
        { time: "08:00", course_name: "História", professor: "Prof. Carlos", total_students: 18 }
      ],
      total_today: 3
    },
    period_distribution: {
      morning: 50,
      afternoon: 40,
      night: 30
    },
    top_categories: [
      { name: "Matemática", percentage: "40%" },
      { name: "Português", percentage: "30%" },
      { name: "História", percentage: "20%" }
    ],
    requests: true
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAlert, setShowAlert] = useState(true);
  const [alertMessage, setAlertMessage] = useState("3 alunos com faltas precisam de atenção");
  const [alertStudents, setAlertStudents] = useState(dashboardData.students_with_absences.students);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');
  const navigate = useNavigate();

  const handleAlertClick = () => {
    if (showAlert) {
      setIsAlertModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsAlertModalOpen(false);
  };

  const formatDate = (date) => {
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };

    const dateStr = date.toLocaleDateString('pt-BR', options);
    const [weekday, ...rest] = dateStr.split(', ');
    const formattedDate = rest.join(', ');

    return {
      weekday: weekday.charAt(0).toUpperCase() + weekday.slice(1),
      fullDate: formattedDate
    };
  };

  const attendancePercentage = useMemo(() => {
    return dashboardData?.attendance_statistics?.presence_percentage ?? 0;
  }, [dashboardData?.attendance_statistics]);

  const lastMonthAttendancePercentage = useMemo(() => {
    return dashboardData?.last_month_attendance?.presence_percentage ?? 0;
  }, [dashboardData?.last_month_attendance]);

  const formatHourFromTime = (time) => {
    return time ? time.split(':').slice(0, 2).join(':') : '00:00';
  };

  const sortSessionsByTime = (sessions) => {
    return [...sessions].sort((a, b) => {
      const timeA = formatHourFromTime(a.time);
      const timeB = formatHourFromTime(b.time);
      return activeTab === 'past' ?
        timeB.localeCompare(timeA) :
        timeA.localeCompare(timeB);
    });
  };

  const handleStudentDetail = (studentName) => {
    navigate(`/alunos?name=${encodeURIComponent(studentName)}`);
    closeModal();
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="error-state">Erro ao carregar dados</div>;

  return (
    <div  className={`dashboard-modern ${!isSidebarOpen ? 'sidebar-closed' : ''}`}>
      <header className="dashboard-header">
        <span className="date-display">
          <span>{formatDate(new Date()).weekday}, </span>
          <span>{formatDate(new Date()).fullDate}</span>
        </span>
      </header>

      <div  className="dashboard-grid">
        <section className="metrics-alerts-section">
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-header">
                <FaUsers className="metric-icon" />
              </div>
              <div className="metric-content">
                <h3>{dashboardData.students_overview.active_students}</h3>
                <p>Total de Alunos</p>
                <div className="metric-details">
                  <span className="metric-sub">Ativos: {dashboardData.students_overview.active_students}</span>
                  <span className="metric-sub">Sem Oficinas: {dashboardData.students_overview.without_courses}</span>
                </div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <FaCalendarAlt className="metric-icon" />
              </div>
              <div className="metric-content">
                <h3>{dashboardData.daily_sessions.total_today}</h3>
                <p>Aulas Hoje</p>
                <div className="metric-details">
                  {dashboardData.daily_sessions.upcoming?.length > 0 ? (
                    dashboardData.daily_sessions.upcoming
                      .filter((session, index, self) => 
                        index === self.findIndex(s => s.time === session.time)
                      )
                      .slice(0, 1)
                      .map((session, index) => {
                        const sameTimeClasses = dashboardData.daily_sessions.upcoming
                          .filter(s => s.time === session.time);
                        return (
                          <div key={index} className="multiple-classes">
                            <span className="class-time">
                              Próxima: {session.time}
                            </span>
                            <div className="class-list">
                              {sameTimeClasses.map((cls, idx) => (
                                <div key={idx} className="class-item">
                                  {cls.course_name}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })
                  ) : (
                    <span className="metric-sub">Sem aula</span>
                  )}
                </div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <FaUserPlus className="metric-icon enrollment-icon" />
              </div>
              <div className="metric-content">
                <h3>{dashboardData.recent_enrollments}</h3>
                <p>Matrículas Recentes</p>
              </div>
            </div>

            {showAlert && (
              <div className="metric-card alert-card" onClick={handleAlertClick}>
                <div className="metric-header">
                  <FaExclamationTriangle className="metric-icon" />
                </div>
                <div className="metric-content">
                  <h3>{alertStudents.length}</h3>
                  <p>Alunos com Faltas</p>
                  <div className="metric-details">
                    <span className="metric-sub">Clique para detalhes</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="main-section">
          <div className="classes-grid">
            <div className="attendance-container">
              <div className="attendance-card">
                <div className="attendance-section current-month">
                  <div className="attendance-card-header">
                    <h2>Resumo de Frequência</h2>
                    <div className="attendance-period">Mês Atual</div>
                  </div>
                  <div className="attendance-card-body">
                    <div className="attendance-circle">
                      <svg viewBox="0 0 36 36" className="circular-chart">
                        <path className="circle-bg"
                          d="M18 2.0845
                              a 15.9155 15.9155 0 0 1 0 31.831
                              a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path className="circle"
                          strokeDasharray={`${attendancePercentage}, 100`}
                          d="M18 2.0845
                              a 15.9155 15.9155 0 0 1 0 31.831
                              a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <text x="18" y="20.35" className="percentage">{attendancePercentage}%</text>
                      </svg>
                    </div>
                    <div className="attendance-stats-grid">
                      <div className="stat-item total-classes">
                        <span className="stat-value">{dashboardData.attendance_statistics.total_calls}</span>
                        <span className="stat-label">Total de Chamadas</span>
                      </div>
                      <div className="stat-item present">
                        <span className="stat-value">{dashboardData.attendance_statistics.total_present}</span>
                        <span className="stat-label">Presenças</span>
                      </div>
                      <div className="stat-item absent">
                        <span className="stat-value">{dashboardData.attendance_statistics.total_absent}</span>
                        <span className="stat-label">Faltas</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="attendance-divider"></div>

                <div className="attendance-section past-month">
                  <div className="attendance-card-header">
                    <h2> </h2>
                    <div className="attendance-period">Mês Passado</div>
                  </div>
                  <div className="attendance-card-body">
                    <div className="attendance-circle">
                      <svg viewBox="0 0 36 36" className="circular-chart">
                        <path className="circle-bg"
                          d="M18 2.0845
                              a 15.9155 15.9155 0 0 1 0 31.831
                              a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path className="circle"
                          strokeDasharray={`${lastMonthAttendancePercentage}, 100`}
                          d="M18 2.0845
                              a 15.9155 15.9155 0 0 1 0 31.831
                              a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <text x="18" y="20.35" className="percentage">{lastMonthAttendancePercentage}%</text>
                      </svg>
                    </div>
                    <div className="attendance-stats-grid">
                      <div className="stat-item total-classes">
                        <span className="stat-value">{dashboardData.last_month_attendance.total_calls}</span>
                        <span className="stat-label">Total de Chamadas</span>
                      </div>
                      <div className="stat-item present">
                        <span className="stat-value">{dashboardData.last_month_attendance.total_present}</span>
                        <span className="stat-label">Presenças</span>
                      </div>
                      <div className="stat-item absent">
                        <span className="stat-value">{dashboardData.last_month_attendance.total_absent}</span>
                        <span className="stat-label">Faltas</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="classes-container">
              <div className="classes-tabs">
                <button
                  className={`tab-button-dashboard ${activeTab === 'upcoming' ? 'active' : ''}`}
                  onClick={() => setActiveTab('upcoming')}
                >
                  Próximas Aulas
                  <span className="tab-count">{dashboardData.daily_sessions.upcoming?.length || 0}</span>
                </button>
                <button
                  className={`tab-button-dashboard ${activeTab === 'past' ? 'active' : ''}`}
                  onClick={() => setActiveTab('past')}
                >
                  Aulas Realizadas
                  <span className="tab-count">{dashboardData.daily_sessions.past?.length || 0}</span>
                </button>
              </div>

              <div className="classes-content">
                {activeTab === 'upcoming' ? (
                  <div className="past-classes-card">
                    <div className={`past-classes-grid ${dashboardData.daily_sessions.upcoming.length === 0 ? 'no-scroll' : ''}`}>
                      {sortSessionsByTime(dashboardData.daily_sessions.upcoming ?? []).map((classItem, index) => (
                        <div key={index} className="past-class-item">
                          <div className="past-class-time">
                            <span className="time-icon"></span>
                            {classItem.time}
                          </div>
                          <div className="past-class-content">
                            <h4>{classItem.course_name}</h4>
                            <div className="past-class-details">
                              <span className="professor">
                                <i className="fas fa-user"></i> {classItem.professor}
                              </span>
                              <span className="students">
                                <i className="fas fa-users"></i> {classItem.total_students} alunos
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {dashboardData.daily_sessions.upcoming.length === 0 && (
                        <div className="no-classes-message">
                          <i className="fas fa-calendar-times fa-3x"></i>
                          <p>Não há mais aulas programadas para hoje</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="past-classes-card">
                    <div className={`past-classes-grid ${dashboardData.daily_sessions.past.length === 0 ? 'no-scroll' : ''}`}>
                      {sortSessionsByTime(dashboardData.daily_sessions.past ?? []).map((classItem, index) => (
                        <div key={index} className="past-class-item">
                          <div className="past-class-time">
                            <span className="time-icon"></span>
                            {classItem.time}
                          </div>
                          <div className="past-class-content">
                            <h4>{classItem.course_name}</h4>
                            <div className="past-class-details">
                              <span className="professor">
                                <i className="fas fa-user"></i> {classItem.professor}
                              </span>
                              <span className="students">
                                <i className="fas fa-users"></i> {classItem.total_students} alunos
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {dashboardData.daily_sessions.past.length === 0 && (
                        <div className="no-classes-message">
                          <i className="fas fa-calendar-check"></i>
                          <p>Nenhuma aula realizada hoje ainda</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="performance-section">
          <div className="performance-grid">
            <div className="performance-card">
              <h3>Oficinas com mais Alunos </h3>
              <div className="performance-list">
                {dashboardData.top_categories.map((category, index) => (
                  <div key={index} className="performance-item">
                    <span className="course-name">{category.name}</span>
                    <div className="progress-bar">
                      <div 
                        className="progress" 
                        style={{ width: category.percentage }}
                      ></div>
                    </div>
                    <span className="percentage">{category.percentage}</span>
                  </div>
                ))}
                {dashboardData.top_categories.length === 0 && (
                  <div className="no-data-message">
                    <p>Nenhuma oficina cadastrada</p>
                  </div>
                )}
              </div>
            </div>

            <div className="performance-card">
              <h3>Distribuição de alunos por Período</h3>
              <div className="distribution-grid">
                <div className="distribution-item">
                  <span className="period">Manhã</span>
                  <span className="count">{dashboardData.period_distribution.morning}</span>
                  <span className="label">alunos</span>
                </div>
                <div className="distribution-item">
                  <span className="period">Tarde</span>
                  <span className="count">{dashboardData.period_distribution.afternoon}</span>
                  <span className="label">alunos</span>
                </div>
                <div className="distribution-item">
                  <span className="period">Noite</span>
                  <span className="count">{dashboardData.period_distribution.night}</span>
                  <span className="label">alunos</span>
                </div>
              </div>
            </div>

            <div className="performance-card notifications-card">
              <div className="notifications-header">
                <h3>Últimas Notificações</h3>
                <span className="notification-counter">7 novas</span>
              </div>
              <div className="notifications-list">
                <div className="notification-item unread">
                  <div className="notification-icon warning">
                    <i className="fas fa-exclamation-triangle"></i>
                  </div>
                  <div className="notification-content">
                    <p>João Silva faltou 2 aulas consecutivas</p>
                    <span className="notification-time">Há 30 min</span>
                  </div>
                </div>
                <div className="notification-item unread">
                  <div className="notification-icon info">
                    <i className="fas fa-info-circle"></i>
                  </div>
                  <div className="notification-content">
                    <p>Nova matrícula realizada: Maria Santos</p>
                    <span className="notification-time">Há 1 hora</span>
                  </div>
                </div>
                <div className="notification-item unread">
                  <div className="notification-icon warning">
                    <i className="fas fa-exclamation-circle"></i>
                  </div>
                  <div className="notification-content">
                    <p>Alerta de capacidade: Turma de Violão</p>
                    <span className="notification-time">Há 2 horas</span>
                  </div>
                </div>
                <div className="notification-item">
                  <div className="notification-icon success">
                    <i className="fas fa-check-circle"></i>
                  </div>
                  <div className="notification-content">
                    <p>Chamada finalizada: Violão Turma 2</p>
                    <span className="notification-time">Há 3 horas</span>
                  </div>
                </div>
                <div className="notification-item">
                  <div className="notification-icon info">
                    <i className="fas fa-user-plus"></i>
                  </div>
                  <div className="notification-content">
                    <p>Novo aluno cadastrado: Pedro Oliveira</p>
                    <span className="notification-time">Há 4 horas</span>
                  </div>
                </div>
                <div className="notification-item">
                  <div className="notification-icon warning">
                    <i className="fas fa-calendar-times"></i>
                  </div>
                  <div className="notification-content">
                    <p>Aula cancelada: Teatro (15:00)</p>
                    <span className="notification-time">Há 5 horas</span>
                  </div>
                </div>
                <div className="notification-item">
                  <div className="notification-icon info">
                    <i className="fas fa-bell"></i>
                  </div>
                  <div className="notification-content">
                    <p>Lembrete: Reunião de professores amanhã</p>
                    <span className="notification-time">Há 6 horas</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Modal
        isOpen={isAlertModalOpen}
        onRequestClose={closeModal}
        className="modal-content-alert"
        overlayClassName="modal-overlay"
      >
        <div className="modal-body">
          <div className="modal-header">
            <h2>Alerta de Faltas</h2>
            <button onClick={closeModal}>X</button>
          </div>
          <p>{alertMessage}</p>
          <table className="data-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Faltas</th>
                <th>Telefone</th>
                <th>Responsável</th>
                <th>Oficinas Ausentes</th>
                <th>Detalhar</th>
              </tr>
            </thead>
            <tbody>
              {alertStudents.map((student, index) => (
                <tr key={index}>
                  <td>{student.name}</td>
                  <td>{student.absences_count}</td>
                  <td>{student.responsible_phone}</td>
                  <td>{student.responsible_name}</td>
                  <td>{Array.isArray(student.courses) ? student.courses.join(", ") : "N/A"}</td>
                  <td>
                    <button onClick={() => handleStudentDetail(student.name)}>
                      <FaEye style={{color: 'white'}}  />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>
    </div>
  );
}

export default Dashboard;