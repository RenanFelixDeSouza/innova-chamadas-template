/**
 * Componente AttendanceRecords
 * Responsável pela gestão completa dos registros de chamada.
 * Funcionalidades principais:
 * - Listagem de chamadas com filtros avançados
 * - Edição de registros de presença
 * - Geração de relatórios em PDF
 * - Gestão de solicitações de reabertura
 * - Integração com planejamentos de aula
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './AttendanceRecords.css';
import EditAttendanceModal from '../Modal/EditAttendanceModal/EditAttendanceModal';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Table from '../../Shared/Table.js';
import { FaSync } from 'react-icons/fa';
import LoadingSpinner from '../../LoadingSpinner/LoadingSpinner';
import CustomDatePicker from '../../Shared/CustomDatePicker/CustomDatePicker';
import Modal from 'react-modal';
import Cookies from 'js-cookie';

// Adicione esta função utilitária no início do componente
const formatDateToBR = (dateString) => {
    if (!dateString) return 'N/A';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
};

function AttendanceRecords() {
    const [attendanceSessions, setAttendanceSessions] = useState([
        {
            id: 1,
            course: { id: 1, name: "Turma A", professor_id: 1 },
            date: "2023-10-01",
            start_time: "08:00:00",
            end_time: "10:00:00",
            status: "open",
            checklist: true,
            has_open_plan: true,
            reopen_attendance_request: [],
            delete_planning_request: [],
        },
        {
            id: 2,
            course: { id: 2, name: "Turma B", professor_id: 2 },
            date: "2023-10-02",
            start_time: "10:00:00",
            end_time: "12:00:00",
            status: "closed",
            checklist: false,
            has_open_plan: false,
            reopen_attendance_request: [],
            delete_planning_request: [],
        },
        {
            id: 3,
            course: { id: 3, name: "Turma C", professor_id: 3 },
            date: "2023-10-03",
            start_time: "14:00:00",
            end_time: "16:00:00",
            status: "open",
            checklist: true,
            has_open_plan: true,
            reopen_attendance_request: [],
            delete_planning_request: [],
        },
    ]); // Sessões fictícias

    const [originalAttendanceSessions, setOriginalAttendanceSessions] = useState([]); // Adicione este estado para armazenar os dados originais

    useEffect(() => {
        // Simula o carregamento inicial dos dados fictícios
        const fetchInitialData = () => {
            const initialData = [
                {
                    id: 1,
                    course: { id: 1, name: "Turma A", professor_id: 1 },
                    date: "2023-10-01",
                    start_time: "08:00:00",
                    end_time: "10:00:00",
                    status: "open",
                    checklist: true,
                    has_open_plan: true,
                    reopen_attendance_request: [],
                    delete_planning_request: [],
                },
                {
                    id: 2,
                    course: { id: 2, name: "Turma B", professor_id: 2 },
                    date: "2023-10-02",
                    start_time: "10:00:00",
                    end_time: "12:00:00",
                    status: "closed",
                    checklist: false,
                    has_open_plan: false,
                    reopen_attendance_request: [],
                    delete_planning_request: [],
                },
                {
                    id: 3,
                    course: { id: 3, name: "Turma C", professor_id: 3 },
                    date: "2023-10-03",
                    start_time: "14:00:00",
                    end_time: "16:00:00",
                    status: "open",
                    checklist: true,
                    has_open_plan: true,
                    reopen_attendance_request: [],
                    delete_planning_request: [],
                },
            ];
            setOriginalAttendanceSessions(initialData); // Armazena os dados originais
            setAttendanceSessions(initialData); // Define os dados iniciais
        };

        if (originalAttendanceSessions.length === 0) {
            fetchInitialData(); // Certifique-se de que os dados só sejam carregados uma vez
        }
    }, [originalAttendanceSessions]);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [courses, setCourses] = useState([
        { id: 1, name: "Turma A" },
        { id: 2, name: "Turma B" },
        { id: 3, name: "Turma C" },
    ]); // Turmas fictícias
    const [filterCourse, setFilterCourse] = useState('');
    const [filteredSessions, setFilteredSessions] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedSession, setSelectedSession] = useState(null);
    const [showPdfModal, setShowPdfModal] = useState(false);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [sortColumn, setSortColumn] = useState('id');
    const [sortOrder, setSortOrder] = useState('asc');
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
    });
    const [showLessonPlanModal, setShowLessonPlanModal] = useState(false);
    const [selectedLessonPlanContent, setSelectedLessonPlanContent] = useState('');
    const [selectedLessonInfo, setSelectedLessonInfo] = useState(null);
    const [isPaginationVisible, setIsPaginationVisible] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [showDeletePlanRequestModal, setShowDeletePlanRequestModal] = useState(false);
    const [requestComment, setRequestComment] = useState('');
    const [selectedSessionForRequest, setSelectedSessionForRequest] = useState(null);
    const [modalRoot, setModalRoot] = useState(null);
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');
    const [filterStartTime, setFilterStartTime] = useState('');
    const [filterEndTime, setFilterEndTime] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterTeacher, setFilterTeacher] = useState('');
    const [teachers, setTeachers] = useState([
        { id: 1, name: "Prof. João" },
        { id: 2, name: "Prof. Ana" },
        { id: 3, name: "Prof. Carlos" },
    ]); // Professores fictícios
    const [deletePlanContent, setDeletePlanContent] = useState('');
    const [activeTab, setActiveTab] = useState('request');
    const [dateError, setDateError] = useState('');
    const [timeError, setTimeError] = useState('');
    const [showPlanRequestHistoryModal, setShowPlanRequestHistoryModal] = useState(false);
    const [selectedPlanRequests, setSelectedPlanRequests] = useState([]);
    const [showReopenRequestHistoryModal, setShowReopenRequestHistoryModal] = useState(false);
    const [selectedReopenRequests, setSelectedReopenRequests] = useState([]);

    useEffect(() => {
        // Configurar o elemento root do modal após o componente montar
        const root = document.getElementById('modal-root') || document.createElement('div');
        if (!root.id) {
            root.id = 'modal-root';
            document.body.appendChild(root);
        }
        Modal.setAppElement('#modal-root');
        setModalRoot(root);

        return () => {
            // Cleanup ao desmontar
            if (root.id === 'modal-root' && !document.getElementById('modal-root')) {
                document.body.removeChild(root);
            }
        };
    }, []);

    useEffect(() => {
        const fetchTeachers = () => {
            // Dados fictícios de professores
            const fakeTeachers = [
                { id: 1, name: "Prof. João" },
                { id: 2, name: "Prof. Ana" },
                { id: 3, name: "Prof. Carlos" },
            ];
            setTeachers(fakeTeachers);
        };

        fetchTeachers();
    }, []);

    /**
     * Busca chamadas com filtros aplicados
     */
    const fetchAttendanceSessions = useCallback(() => {
        setError(null);
        try {
            setTimeout(() => {
                if (!filterCourse && !filterTeacher && !filterStatus && !filterStartDate && !filterEndDate && !filterStartTime && !filterEndTime) {
                    setAttendanceSessions(originalAttendanceSessions); // Restaura os dados originais
                } else {
                    const filteredSessions = originalAttendanceSessions.filter((session) => {
                        const matchesCourse = !filterCourse || session.course.id.toString() === filterCourse;
                        const matchesTeacher = !filterTeacher || teachers.some((teacher) => teacher.id.toString() === filterTeacher);
                        const matchesStatus = !filterStatus || session.status === filterStatus;
                        const matchesDate =
                            (!filterStartDate || new Date(session.date) >= new Date(filterStartDate)) &&
                            (!filterEndDate || new Date(session.date) <= new Date(filterEndDate));

                        const matchesTime = (() => {
                            if (!filterStartTime && !filterEndTime) return true;
                            const sessionStart = session.start_time.split(':').map(Number);
                            const sessionEnd = session.end_time.split(':').map(Number);
                            const filterStart = filterStartTime ? filterStartTime.split(':').map(Number) : null;
                            const filterEnd = filterEndTime ? filterEndTime.split(':').map(Number) : null;

                            const sessionStartMinutes = sessionStart[0] * 60 + sessionStart[1];
                            const sessionEndMinutes = sessionEnd[0] * 60 + sessionEnd[1];
                            const filterStartMinutes = filterStart ? filterStart[0] * 60 + filterStart[1] : null;
                            const filterEndMinutes = filterEnd ? filterEnd[0] * 60 + filterEnd[1] : null;

                            return (!filterStart || sessionStartMinutes >= filterStartMinutes) &&
                                (!filterEnd || sessionEndMinutes <= filterEndMinutes);
                        })();

                        return matchesCourse && matchesTeacher && matchesStatus && matchesDate && matchesTime;
                    });

                    setAttendanceSessions(filteredSessions);
                }

                setPagination((prev) => ({
                    ...prev,
                    totalItems: attendanceSessions.length,
                    totalPages: Math.ceil(attendanceSessions.length / pagination.itemsPerPage),
                }));
                setIsLoading(false);
            }, 500);
        } catch (error) {
            console.error("Erro ao buscar sessões de chamadas:", error);
            setError("Erro ao carregar os registros de chamadas.");
            setIsLoading(false);
        }
    }, [
        filterCourse,
        filterTeacher,
        filterStartDate,
        filterEndDate,
        filterStartTime,
        filterEndTime,
        filterStatus,
        pagination.itemsPerPage,
        originalAttendanceSessions,
        teachers,
    ]);

    const handleFilterChange = (event) => {
        setFilterCourse(event.target.value);
        setPagination(prev => ({ ...prev, currentPage: 1 })); // Resetar para a primeira página
    };

    const handleStatusFilterChange = (event) => {
        setFilterStatus(event.target.value);
        setPagination(prev => ({ ...prev, currentPage: 1 })); // Resetar para a primeira página
    };

    const handleTeacherFilterChange = (event) => {
        setFilterTeacher(event.target.value);
        setPagination(prev => ({ ...prev, currentPage: 1 })); // Resetar para a primeira página
    };

    useEffect(() => {
        const applyFilter = () => {
            let sessions = originalAttendanceSessions;

            // Filtro por turma
            if (filterCourse) {
                sessions = sessions.filter(session => session.course.name === filterCourse);
            }

            // Filtro por status
            if (filterStatus !== 'all') {
                sessions = sessions.filter(session => session.status === filterStatus);
            }

            // Filtro por professor
            if (filterTeacher) {
                sessions = sessions.filter(session =>
                    session.course.professor_id.toString() === filterTeacher
                );
            }

            setFilteredSessions(sessions);
            setPagination(prev => ({
                ...prev,
                totalItems: sessions.length,
                totalPages: Math.ceil(sessions.length / pagination.itemsPerPage),
            }));
        };

        applyFilter();
    }, [filterCourse, filterStatus, filterTeacher, originalAttendanceSessions, pagination.itemsPerPage]);

    const paginatedSessions = useMemo(() => {
        const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
        const endIndex = startIndex + pagination.itemsPerPage;
        return filteredSessions.slice(startIndex, endIndex);
    }, [filteredSessions, pagination.currentPage, pagination.itemsPerPage]);

    // Atualizar os dados ao alterar qualquer filtro
    useEffect(() => {
        fetchAttendanceSessions();
    }, [filterCourse, filterTeacher, filterStartDate, filterEndDate, filterStartTime, filterEndTime, filterStatus]);

    useEffect(() => {
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    }, [filterCourse, filterTeacher, filterStartDate, filterEndDate,
        filterStartTime, filterEndTime, filterStatus]);

    useEffect(() => {
        const fetchCourses = () => {
            // Dados fictícios de turmas
            const fakeCourses = [
                { id: 1, name: "Turma A" },
                { id: 2, name: "Turma B" },
                { id: 3, name: "Turma C" },
            ];
            setCourses(fakeCourses);
        };

        fetchCourses();
    }, []);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleOpenModal = (session) => {
        setSelectedSession({
            id: session.id,
            date: session.date, // Inclui a data da sessão
            course: session.course, // Inclui os dados do curso
        });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedSession(null);
        if (isMobile) {
            setIsPaginationVisible(true);
        }
    };

    const handleGenerateReport = async (session) => {
        setIsLoading(true);
        setError(null);

        try {
            // Dados fictícios do relatório
            const reportData = {
                course_name: session.course.name,
                date: session.date,
                attendances: [
                    { student_first_name: "João", student_last_name: "Silva", status: "P", comments: "" },
                    { student_first_name: "Ana", student_last_name: "Santos", status: "F", comments: "Faltou" },
                    { student_first_name: "Pedro", student_last_name: "Oliveira", status: "PA", comments: "Atrasado" },
                ],
            };

            const doc = new jsPDF({ format: 'a4' });

            // Use as cores do :root
            const rootStyles = getComputedStyle(document.documentElement);
            const primaryColor = rootStyles.getPropertyValue('--primary-color').trim() || "#000000";
            const textColor = rootStyles.getPropertyValue('--text-color').trim() || "#000000";

            const addHeader = (pageNumber) => {
                doc.setFillColor(primaryColor);
                doc.rect(0, 0, doc.internal.pageSize.width, 15, 'F');
                doc.setTextColor('#FFFFFF');
                doc.setFontSize(8);
                const formattedDate = formatDateToBR(reportData.date);
                doc.text(`Turma: ${reportData.course_name} | Data: ${formattedDate} | Página ${pageNumber}`, 5, 10);
            };

            const sortedAttendances = reportData.attendances.sort((a, b) => {
                const fullNameA = `${a.student_first_name} ${a.student_last_name}`.toLowerCase();
                const fullNameB = `${b.student_first_name} ${b.student_last_name}`.toLowerCase();
                return fullNameA.localeCompare(fullNameB, 'pt-BR');
            });

            const tableData = sortedAttendances.map(attendance => [
                `${attendance.student_first_name} ${attendance.student_last_name}`,
                attendance.status === 'P' ? 'P' :
                    attendance.status === 'F' ? 'F' :
                        attendance.status === 'FJ' ? 'FJ' :
                            attendance.status === 'PA' ? 'PA' : '-',
                attendance.comments || ''
            ]);

            doc.autoTable({
                startY: 20,
                head: [['Nome do Aluno', 'St', 'Observações']],
                body: tableData,
                theme: 'grid',
                styles: {
                    font: 'helvetica',
                    fontSize: 8,
                    cellPadding: {
                        top: 1,
                        right: 2,
                        bottom: 1,
                        left: 2
                    },
                    lineColor: primaryColor,
                    lineWidth: 0.1,
                },
                headStyles: {
                    fillColor: primaryColor,
                    textColor: '#FFFFFF',
                    fontSize: 8,
                    fontStyle: 'bold',
                    halign: 'center',
                    valign: 'middle',
                    lineWidth: 0.2,
                },
                columnStyles: {
                    0: { cellWidth: 60 },
                    1: { cellWidth: 10, halign: 'center' },
                    2: { cellWidth: 'auto' },
                },
                margin: { top: 20 },
                didDrawPage: function (data) {
                    addHeader(doc.internal.getNumberOfPages());
                },
                foot: [[
                    { content: 'Legenda: P = Presente | F = Falta | FJ = Falta Justificada | PA = Presente com Atraso', colSpan: 3, styles: { fontSize: 6, textColor: textColor, halign: 'left' } }
                ]],
            });

            const pdfBytes = doc.output('arraybuffer');
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setPdfUrl(url);
            setShowPdfModal(true);
        } catch (error) {
            console.error("Error generating or displaying PDF:", error);
            alert("Ocorreu um erro tentando gerar o relatório. Por favor, tente novamente mais tarde.");
        } finally {
            setIsLoading(false);
        }
    };



    const handleDeletePlanRequest = async (sessionId, comment) => {
        alert("Este é apenas um template. Não é possível solicitar exclusão do planejamento.");
        return; // Impede a execução do restante do código
        // ...existing code...
    };

    const handleDeletePlan = async (sessionId) => {
        setError("Este é apenas um template. Não é possível excluir o planejamento.");
        return; // Impede a execução do restante do código
        // ...existing code...
    };

    const processLessonPlanContent = (content) => {
        try {
            const parsedContent = JSON.parse(content);
            let htmlContent = '';

            parsedContent.blocks.forEach(block => {
                switch (block.type) {
                    case 'header':
                        htmlContent += `<h${block.data.level}>${block.data.text}</h${block.data.level}>`;
                        break;
                    case 'list':
                        if (block.data.style === 'unordered') {
                            htmlContent += '<ul class="unordered-list">';
                            block.data.items.forEach(item => {
                                htmlContent += `<li>${item.content}</li>`;
                            });
                            htmlContent += '</ul>';
                        } else if (block.data.style === 'ordered') {
                            htmlContent += '<ol class="ordered-list">';
                            block.data.items.forEach(item => {
                                htmlContent += `<li>${item.content}</li>`;
                            });
                            htmlContent += '</ol>';
                        } else if (block.data.style === 'checklist') {
                            htmlContent += '<ul class="checklist">';
                            block.data.items.forEach(item => {
                                htmlContent += `
                                    <li>
                                        <input type="checkbox" ${item.checked ? 'checked' : ''} disabled>
                                        <span>${item.content}</li>`;
                            });
                            htmlContent += '</ul>';
                        }
                        break;
                    default:
                        if (block.data && block.data.text) {
                            htmlContent += `<p>${block.data.text}</p>`;
                        }
                }
            });

            return htmlContent;
        } catch (error) {
            console.error('Erro ao processar conteúdo do plano de aula:', error);
            return '<p>Erro ao carregar o conteúdo do plano de aula</p>';
        }
    };

    const handleOpenLessonPlanModal = async (sessionId, courseName, date) => {
        try {
            // Dados fictícios do planejamento de aula
            const lessonPlanContent = {
                blocks: [
                    { type: "header", data: { level: 1, text: "Planejamento de Aula" } },
                    { type: "list", data: { style: "unordered", items: [{ content: "Introdução" }, { content: "Atividade prática" }] } },
                ],
            };

            setSelectedLessonInfo({
                courseName: courseName,
                date: formatDateToBR(date)
            });

            const formattedContent = processLessonPlanContent(JSON.stringify(lessonPlanContent));
            setSelectedLessonPlanContent(formattedContent);
            setShowLessonPlanModal(true);
        } catch (error) {
            console.error('Erro ao abrir o planejamento de aula:', error);
            alert('Erro ao carregar o planejamento de aula');
        }
    };

    const handleCloseLessonPlanModal = () => {
        setShowLessonPlanModal(false);
        setSelectedLessonPlanContent('');
    };

    const handlePrintLessonPlan = () => {
        // Criar um iframe invisível
        const printFrame = document.createElement('iframe');
        printFrame.style.position = 'fixed';
        printFrame.style.right = '0';
        printFrame.style.bottom = '0';
        printFrame.style.width = '0';
        printFrame.style.height = '0';
        printFrame.style.border = '0';

        document.body.appendChild(printFrame);

        const printContent = `
            <html>
                <head>
                    <title>Planejamento de Aula</title>
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            padding: 20px; 
                        }
                        .header { margin-bottom: 20px; }
                        .lesson-info { 
                            background-color: #f5f5f5;
                            padding: 10px;
                            border-radius: 5px;
                            margin-bottom: 20px;
                        }
                        .content { margin-top: 20px; }
                        ul { list-style-type: disc; padding-left: 20px; }
                        ol { list-style-type: decimal; padding-left: 20px; }
                        li { margin: 5px 0; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Planejamento de Aula</h1>
                    </div>
                    <div class="lesson-info">
                        <p><strong>Turma:</strong> ${selectedLessonInfo?.courseName || 'N/A'}</p>
                        <p><strong>Data da Aula:</strong> ${selectedLessonInfo?.date || 'N/A'}</p>
                    </div>
                    <div class="content">
                        ${selectedLessonPlanContent}
                    </div>
                </body>
            </html>
        `;

        // Escrever o conteúdo no iframe
        printFrame.contentWindow.document.open();
        printFrame.contentWindow.document.write(printContent);
        printFrame.contentWindow.document.close();

        // Esperar o carregamento do conteúdo
        printFrame.onload = () => {
            try {
                printFrame.contentWindow.print();
            } catch (error) {
                console.error('Erro ao imprimir:', error);
            } finally {
                // Remover o iframe após um curto delay
                setTimeout(() => {
                    document.body.removeChild(printFrame);
                }, 100);
            }
        };
    };

    const handleShowDeletePlanModal = async (session) => {
        // Se não for admin e tiver solicitações, mostrar histórico
        if (Cookies.get('userType') !== 'admin' && session.delete_planning_request?.length > 0) {
            setSelectedPlanRequests(session.delete_planning_request);
            setSelectedSessionForRequest(session);
            setShowPlanRequestHistoryModal(true);
            return;
        }

        // Comportamento original para admin ou sem solicitações
        setSelectedSessionForRequest(session);
        setShowDeletePlanRequestModal(true);

        // Substituir a chamada ao API pelo conteúdo fictício
        const lessonPlanContent = {
            blocks: [
                { type: "header", data: { level: 1, text: "Planejamento de Aula" } },
                { type: "list", data: { style: "unordered", items: [{ content: "Introdução" }, { content: "Atividade prática" }] } },
            ],
        };

        const formattedContent = processLessonPlanContent(JSON.stringify(lessonPlanContent));
        setDeletePlanContent(formattedContent);
    };

    const getActionItems = (itemId, item) => {
        const actions = [];
        const isMobileView = window.innerWidth <= 768;
        const userType = Cookies.get('userType');

        if (item.status !== "closed") { // Verifica se o status não é "Closed"
            if (isMobileView) {
                actions.push({
                    label: 'Fazer Chamada',
                    action: () => handleOpenModal(item)
                });
            } else {
                actions.push({
                    label: 'Fazer Chamada',
                    action: () => handleOpenModal(item)
                });
            }
        }

        actions.push({
            label: 'Gerar Relatório',
            action: () => handleGenerateReport(item)
        });

        if (item.status === "closed") {
            actions.unshift({
                label: "Solicitar Reabertura",
                action: () => {
                    if (item.reopen_attendance_request?.length > 0) {
                        setSelectedReopenRequests(item.reopen_attendance_request);
                        setSelectedSessionForRequest(item);
                        setShowReopenRequestHistoryModal(true);
                    } else {
                        setSelectedSessionForRequest(item);
                        setShowRequestModal(true);
                    }
                }
            });
        }

        if (item.has_open_plan) {
            actions.push({
                label: 'Planejamento de Aula',
                action: () => handleOpenLessonPlanModal(itemId, item.course.name, item.date)
            });

            if (userType === 'admin') {
                actions.push({
                    label: 'Excluir Planejamento',
                    action: () => handleDeletePlan(itemId)
                });
            } else {
                actions.push({
                    label: 'Solicitar Exclusão do Planejamento',
                    action: () => handleShowDeletePlanModal(item)
                });
            }
        }

        return actions;
    };

    const columns = [
        { key: 'id', label: 'ID', type: 'number', sortable: true },
        { key: 'course', label: 'Turma', type: 'string', render: (course) => course ? course.name : 'N/A', sortable: false },
        {
            key: 'date',
            label: 'Data',
            type: 'time',
            render: (date) => formatDateToBR(date),
            sortable: true
        },
        {
            key: 'start_time',
            label: 'Hora do Início',
            type: 'time',
            render: (start_time) => {
                if (!start_time) return "N/A";
                const [hours, minutes, seconds] = start_time.split(':');
                const now = new Date();
                const date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, seconds);
                return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            },
            sortable: true
        },
        {
            key: 'end_time',
            label: 'Hora do Término',
            type: 'time',
            render: (end_time) => {
                if (!end_time) return "N/A";
                const [hours, minutes, seconds] = end_time.split(':');
                const now = new Date();
                const date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, seconds);
                return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            },
            sortable: true
        },
        {
            key: 'has_open_plan',
            label: 'Planejamento de Aula',
            render: (has_open_plan) => has_open_plan ? 'Sim' : 'Não',
            sortable: false
        },
        {
            key: "checklist",
            label: "Aberto",
            render: (value) => (
                <input
                    type="checkbox"
                    checked={!!value}
                    readOnly
                    disabled
                />
            )
        },
    ];

    const handleSort = (column) => {
        const columnDefinition = columns.find(c => c.key === column);
        if (columnDefinition && columnDefinition.sortable) {
            if (sortColumn === column) {
                if (sortOrder === 'asc') {
                    setSortOrder('desc');
                } else if (sortOrder === 'desc') {
                    setSortColumn(null);
                    setSortOrder('asc');
                } else {
                    setSortOrder('asc');
                }
            } else {
                setSortColumn(column);
                setSortOrder('asc');
            }
            setPagination({ ...pagination, currentPage: 1 });
        }
    };

    const totalPages = Math.ceil(pagination.totalItems / pagination.itemsPerPage);

    const handlePageChange = (page) => {
        setPagination({ ...pagination, currentPage: page });
    };

    const handleItemsPerPageChange = (event) => {
        setPagination({ ...pagination, itemsPerPage: Number(event.target.value), currentPage: 1 });
    };

    const handleRefresh = useCallback(() => {
        setIsLoading(true); // Ativa o estado de carregamento
        setTimeout(() => {
            setIsLoading(false); // Desativa o estado de carregamento após o tempo
        }, 1000); // Tempo simbólico de 1 segundo
    }, []);

    const handleModalStateChange = (isOpen) => {
        if (isMobile) {
            setIsPaginationVisible(!isOpen);
        }
    };


    const validateDateRange = (start, end) => {
        if (!start || !end) return true;
        const [startYear, startMonth, startDay] = start.split('-');
        const [endYear, endMonth, endDay] = end.split('-');
        const startDate = new Date(startYear, startMonth - 1, startDay);
        const endDate = new Date(endYear, endMonth - 1, endDay);
        return startDate <= endDate;
    };



    const handleDateChange = (date, isStartDate) => {
        if (isStartDate) {
            if (filterEndDate && !validateDateRange(date, filterEndDate)) {
                setDateError('A data inicial não pode ser maior que a data final');
                return;
            }
            setFilterStartDate(date);
        } else {
            if (filterStartDate && !validateDateRange(filterStartDate, date)) {
                setDateError('A data final não pode ser menor que a data inicial');
                return;
            }
            setFilterEndDate(date);
        }
        setDateError('');
    };

    // Validação customizada para garantir que apenas horários válidos sejam digitados
    const handleTimeChange = (time, isStartTime) => {
        const newValue = time.replace(/[^\d]/g, '');
        let formattedValue = '';

        // Sistema de validação progressiva dos horários
        if (newValue.length > 0) {
            // Primeiro dígito: 0-2 apenas (primeiras 24h do dia)
            const firstDigit = newValue[0];
            if (!'012'.includes(firstDigit)) return;
            formattedValue = firstDigit;

            if (newValue.length > 1) {
                // Segundo dígito: 0-9 ou 0-3 se primeira hora for 2
                const secondDigit = newValue[1];
                if (firstDigit === '2' && Number(secondDigit) > 3) return;
                formattedValue += secondDigit;

                if (newValue.length > 2) {
                    // Terceiro dígito: 0-5 apenas (minutos válidos)
                    const thirdDigit = newValue[2];
                    if (Number(thirdDigit) > 5) return;
                    formattedValue = `${formattedValue}:${thirdDigit}`;

                    if (newValue.length > 3) {
                        // Quarto dígito: 0-9 (qualquer minuto)
                        formattedValue += newValue[3];
                    }
                }
            }
        }

        // Atualiza estado e valida intervalo quando horário estiver completo
        if (isStartTime) {
            setFilterStartTime(formattedValue);
        } else {
            setFilterEndTime(formattedValue);

            if (formattedValue.replace(/\D/g, '').length === 4 && filterStartTime) {
                const [startHour, startMinute] = filterStartTime.split(':').map(Number);
                const [endHour, endMinute] = formattedValue.split(':').map(Number);

                const startMinutes = startHour * 60 + startMinute;
                const endMinutes = endHour * 60 + endMinute;

                if (endMinutes < startMinutes) {
                    setTimeError('O horário final não pode ser menor que o horário inicial');
                } else {
                    setTimeError('');
                }
            }
        }
    };

    const closePdfModal = () => {
        setPdfUrl(null);
        setShowPdfModal(false);
    };

    return (
        <div className="list-containet-tab">
            <h2>Lista de Chamadas</h2>

            <div className="filters-container">
                <div className="filter-group">
                    <fieldset>
                        <legend>Turma:</legend>
                        <select
                            id="filter-course"
                            value={filterCourse}
                            onChange={handleFilterChange}
                        >
                            <option value="">Todas as turmas</option>
                            {courses.map(course => (
                                <option key={course.id} value={course.name}>
                                    {course.name}
                                </option>
                            ))}
                        </select>
                    </fieldset>
                </div>
                <div className="filter-group" >
                    <fieldset>
                        <legend>Período:</legend>
                        <div className="date-range">
                            <CustomDatePicker
                                selected={filterStartDate}
                                onChange={(date) => handleDateChange(date, true)}
                                placeholder="Inicial"
                                className="date-picker-compact"
                            />
                            <span className="date-separator">até</span>
                            <CustomDatePicker
                                selected={filterEndDate}
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
                            <legend>Horário:</legend>
                    <div className="time-filters">
                            <input
                                type="time"
                                value={filterStartTime}
                                onChange={(e) => handleTimeChange(e.target.value, true)}
                                placeholder="Hora Inicial"
                            />
                            <input
                                type="time"
                                value={filterEndTime}
                                onChange={(e) => handleTimeChange(e.target.value, false)}
                                placeholder="Hora Final"
                            />
                        </div>
                    </fieldset>
                </div>
                <div className="filter-group">
                    <fieldset>
                        <legend>Status:</legend>
                        <select
                            id="filter-status"
                            value={filterStatus}
                            onChange={handleStatusFilterChange}
                        >
                            <option value="all">Ambos</option>
                            <option value="open">Aberto</option>
                            <option value="closed">Fechado</option>
                        </select>
                    </fieldset>
                </div>
                <div className="filter-group">
                    <fieldset>
                        <legend>Professor:</legend>
                        <select
                            id="filter-teacher"
                            value={filterTeacher}
                            onChange={handleTeacherFilterChange}
                        >
                            <option value="">Todos os professores</option>
                            {teachers.map(teacher => (
                                <option key={teacher.id} value={teacher.id}>
                                    {teacher.name}
                                </option>
                            ))}
                        </select>
                    </fieldset>
                </div>
                <button
                    className="refresh-button"
                    onClick={handleRefresh}
                    disabled={isLoading}
                >
                    {isLoading ? <LoadingSpinner size="20px" /> : <><FaSync /> Atualizar</>}
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <Table
                data={paginatedSessions}
                columns={columns}
                itemsPerPage={pagination.itemsPerPage}
                isSortable={true}
                loading={isLoading}
                getActionItems={(itemId, item) => getActionItems(itemId, item)}
                handleSort={handleSort}
                sortColumn={sortColumn}
                sortOrder={sortOrder}
            />

            <div className="pagination">
                <button onClick={() => handlePageChange(1)} disabled={pagination.currentPage === 1}>{"<<"}</button>
                <button onClick={() => handlePageChange(pagination.currentPage - 1)} disabled={pagination.currentPage === 1}>{"<"}</button>
                <span>Página {pagination.currentPage} de {pagination.totalPages}</span>
                <button onClick={() => handlePageChange(pagination.currentPage + 1)} disabled={pagination.currentPage === pagination.totalPages}>{">"}</button>
                <button onClick={() => handlePageChange(pagination.totalPages)} disabled={pagination.currentPage === pagination.totalPages}>{">>"}</button>
            </div>

            <div className="items-per-page-selector">
                <label htmlFor="itemsPerPage">Itens por página: </label>
                <select
                    id="itemsPerPage"
                    value={pagination.itemsPerPage}
                    onChange={handleItemsPerPageChange}
                >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                </select>
            </div>

            {showModal && selectedSession && (
                <EditAttendanceModal
                    session={selectedSession}
                    onClose={handleCloseModal}
                    onSave={(updatedData) => {
                        setAttendanceSessions(
                            attendanceSessions.map((s) =>
                                s.id === selectedSession.id ? { ...s, ...updatedData } : s
                            )
                        );
                        handleCloseModal();
                        handleRefresh();
                    }}
                    appElement={modalRoot}
                />
            )}
            {showPdfModal && pdfUrl && (
                <Modal
                    isOpen={showPdfModal}
                    onRequestClose={closePdfModal}
                    contentLabel="Relatório de Chamada"
                    className="pdf-modal"
                    overlayClassName="modal-overlay"
                    parentSelector={() => modalRoot || document.body}
                    ariaHideApp={false}
                    style={{
                        content: {
                            width: '80%',
                            height: '90%',
                            margin: 'auto',
                            padding: '20px',
                            position: 'relative',
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                            overflow: 'hidden'
                        },
                        overlay: {
                            backgroundColor: 'rgba(0, 0, 0, 0.6)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }
                    }}
                >
                    <iframe
                        src={pdfUrl}
                        title="Relatório de Chamada"
                        style={{
                            width: '100%',
                            height: '100%',
                            border: 'none'
                        }}
                    />
                </Modal>
            )}
            {showLessonPlanModal && (
                <Modal
                    isOpen={showLessonPlanModal}
                    onRequestClose={handleCloseLessonPlanModal}
                    contentLabel="Planejamento de Aula"
                    className="lesson-plan-modal"
                    overlayClassName="lesson-plan-modal-overlay"
                    parentSelector={() => modalRoot || document.body}
                    ariaHideApp={false}
                >
                    <h2>Planejamento de Aula</h2>
                    <div className="lesson-info">
                        <p><strong>Turma:</strong> {selectedLessonInfo?.courseName || 'N/A'}</p>
                        <p><strong>Data da Aula:</strong> {selectedLessonInfo?.date || 'N/A'}</p>
                    </div>
                    <div dangerouslySetInnerHTML={{ __html: selectedLessonPlanContent }} />
                    <button onClick={handlePrintLessonPlan} className="print-button">Imprimir</button>
                </Modal>
            )}
            {showRequestModal && (
                <Modal
                    isOpen={showRequestModal}
                    onRequestClose={() => {
                        setShowRequestModal(false);
                        setRequestComment('');
                        setSelectedSessionForRequest(null);
                    }}
                    contentLabel="Solicitar Reabertura de Chamada"
                    className="request-modal"
                    overlayClassName="request-modal-overlay"
                    parentSelector={() => modalRoot || document.body}
                    ariaHideApp={false}
                >
                    <h2>Solicitar Reabertura de Chamada</h2>
                    <div className="session-info">
                        <p><strong>Turma:</strong> {selectedSessionForRequest?.course?.name || 'N/A'}</p>
                        <p><strong>Data:</strong> {formatDateToBR(selectedSessionForRequest?.date)}</p>
                        {selectedSessionForRequest?.start_time && (
                            <p><strong>Horário:</strong> {selectedSessionForRequest.start_time} - {selectedSessionForRequest.end_time}</p>
                        )}
                    </div>
                    <textarea
                        value={requestComment}
                        onChange={(e) => setRequestComment(e.target.value)}
                        placeholder="Comentário (opcional)"
                    />
                    {!selectedSessionForRequest?.reopen_attendance_request?.some(request => request.status === 'pending') && (
                        <div className="modal-buttons">
                            <button onClick={() => setShowRequestModal(false)}>Cancelar</button>
                        </div>
                    )}
                </Modal>
            )}

            {showDeletePlanRequestModal && (
                <Modal
                    isOpen={showDeletePlanRequestModal}
                    onRequestClose={() => {
                        setShowDeletePlanRequestModal(false);
                        setRequestComment('');
                        setSelectedSessionForRequest(null);
                        setDeletePlanContent('');
                        setActiveTab('request');
                    }}
                    contentLabel="Solicitar Exclusão do Planejamento"
                    className="request-modal delete-plan-modal"
                    overlayClassName="request-modal-overlay"
                    parentSelector={() => modalRoot || document.body}
                    ariaHideApp={false}
                >
                    <h2>Solicitar Exclusão do Planejamento</h2>
                    <div className="session-info">
                        <p><strong>Turma:</strong> {selectedSessionForRequest?.course?.name || 'N/A'}</p>
                        <p><strong>Data:</strong> {formatDateToBR(selectedSessionForRequest?.date)}</p>
                        {selectedSessionForRequest?.start_time && (
                            <p><strong>Horário:</strong> {selectedSessionForRequest.start_time} - {selectedSessionForRequest.end_time}</p>
                        )}
                    </div>

                    <div className="tabs">
                        <button
                            className={`tab-button ${activeTab === 'request' ? 'active' : ''}`}
                            onClick={() => setActiveTab('request')}
                        >
                            Solicitação
                        </button>
                        <button
                            className={`tab-button ${activeTab === 'preview' ? 'active' : ''}`}
                            onClick={() => setActiveTab('preview')}
                        >
                            Visualizar Planejamento
                        </button>
                    </div>

                    {activeTab === 'request' ? (
                        <div className="tab-content">
                            <textarea
                                value={requestComment}
                                onChange={(e) => setRequestComment(e.target.value)}
                                placeholder="Comentário (opcional)"
                            />
                            <div className="modal-buttons">
                                <button onClick={() => handleDeletePlanRequest(selectedSessionForRequest.id, requestComment)}>
                                    Enviar Solicitação
                                </button>
                                <button onClick={() => setShowDeletePlanRequestModal(false)}>Cancelar</button>
                            </div>
                        </div>
                    ) : (
                        <div className="tab-content preview-content">
                            <div dangerouslySetInnerHTML={{ __html: deletePlanContent }} />
                        </div>
                    )}
                </Modal>
            )}

            {showPlanRequestHistoryModal && (
                <Modal
                    isOpen={showPlanRequestHistoryModal}
                    onRequestClose={() => setShowPlanRequestHistoryModal(false)}
                    contentLabel="Histórico de Solicitações"
                    className="request-modal"
                    overlayClassName="request-modal-overlay"
                    parentSelector={() => modalRoot || document.body}
                    ariaHideApp={false}
                >
                    <h2>Histórico de Solicitações de Exclusão</h2>
                    <div className="session-info">
                        <p><strong>Turma:</strong> {selectedSessionForRequest?.course?.name || 'N/A'}</p>
                        <p><strong>Data:</strong> {formatDateToBR(selectedSessionForRequest?.date)}</p>
                    </div>

                    <div className="requests-history">
                        {selectedPlanRequests.map((request, index) => (
                            <div key={index} className="request-item">
                                <p><strong>Status:</strong> {
                                    request.status === 'pending' ? 'Pendente' :
                                        request.status === 'approved' ? 'Aprovado' :
                                            request.status === 'rejected' ? 'Rejeitado' : 'Desconhecido'
                                }</p>
                                <p><strong>Data da Solicitação:</strong> {new Date(request.created_at).toLocaleString('pt-BR')}</p>
                                {request.updated_at !== request.created_at && (
                                    <p><strong>{request.status === 'rejected' ? 'Data da rejeição' : 'Data da resposta'}:</strong> {new Date(request.updated_at).toLocaleString('pt-BR')}</p>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Só mostra seção de nova solicitação se não houver solicitações pendentes */}
                    {selectedPlanRequests.some(request => request.status === 'rejected') &&
                        !selectedPlanRequests.some(request => request.status === 'pending') && (
                            <div className="new-request-section">
                                <h3>Fazer Nova Solicitação</h3>
                                <textarea
                                    value={requestComment}
                                    onChange={(e) => setRequestComment(e.target.value)}
                                    placeholder="Comentário para nova solicitação"
                                />
                                <div className="modal-buttons">
                                    <button onClick={() => {
                                        handleDeletePlanRequest(selectedSessionForRequest.id, requestComment);
                                        setShowPlanRequestHistoryModal(false);
                                    }}>
                                        Enviar Nova Solicitação
                                    </button>
                                </div>
                            </div>
                        )}
                </Modal>
            )}

            {showReopenRequestHistoryModal && (
                <Modal
                    isOpen={showReopenRequestHistoryModal}
                    onRequestClose={() => setShowReopenRequestHistoryModal(false)}
                    contentLabel="Histórico de Solicitações de Reabertura"
                    className="request-modal"
                    overlayClassName="request-modal-overlay"
                    parentSelector={() => modalRoot || document.body}
                    ariaHideApp={false}
                >
                    <h2>Histórico de Solicitações de Reabertura</h2>
                    <div className="session-info">
                        <p><strong>Turma:</strong> {selectedSessionForRequest?.course?.name || 'N/A'}</p>
                        <p><strong>Data:</strong> {formatDateToBR(selectedSessionForRequest?.date)}</p>
                        {selectedSessionForRequest?.start_time && (
                            <p><strong>Horário:</strong> {selectedSessionForRequest.start_time} - {selectedSessionForRequest.end_time}</p>
                        )}
                    </div>

                    <div className="requests-history">
                        {selectedReopenRequests.map((request, index) => (
                            <div key={index} className="request-item">
                                <p><strong>Status:</strong> {
                                    request.status === 'pending' ? 'Pendente' :
                                        request.status === 'approved' ? 'Aprovado' :
                                            request.status === 'rejected' ? 'Rejeitado' : 'Desconhecido'
                                }</p>
                                <p><strong>Data da Solicitação:</strong> {new Date(request.created_at).toLocaleString('pt-BR')}</p>
                                {request.updated_at !== request.created_at && (
                                    <p><strong>{request.status === 'rejected' ? 'Data da rejeição' : 'Data da resposta'}:</strong> {new Date(request.updated_at).toLocaleString('pt-BR')}</p>
                                )}
                                {request.comment && (
                                    <p><strong>Comentário:</strong> {request.comment}</p>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Só mostra seção de nova solicitação se não houver solicitações pendentes */}
                    {selectedReopenRequests.some(request => request.status === 'rejected') &&
                        !selectedReopenRequests.some(request => request.status === 'pending') && (
                            <div className="new-request-section">
                                <h3>Fazer Nova Solicitação</h3>
                                <textarea
                                    value={requestComment}
                                    onChange={(e) => setRequestComment(e.target.value)}
                                    placeholder="Comentário para nova solicitação"
                                />
                                <div className="modal-buttons">
                                </div>
                            </div>
                        )}
                </Modal>
            )}
        </div>
    );
}

export default AttendanceRecords;