/**
 * Componente LessonPlan
 * Gerencia o planejamento de aulas, permitindo criar e vincular planejamentos a chamadas.
 * Inclui editor de texto rico, controle de caracteres e listagem de chamadas disponíveis.
 */

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import { FaSync } from 'react-icons/fa';
import LoadingSpinner from '../../LoadingSpinner/LoadingSpinner';
import "./LessonPlan.css";


const LessonPlan = () => {
    const editorInstance = useRef(null);
    const [isEditorReady, setIsEditorReady] = useState(false);
    const [courses, setCourses] = useState([
        { id: 1, name: "Turma A" },
        { id: 2, name: "Turma B" },
        { id: 3, name: "Turma C" },
    ]); // Turmas fictícias
    const isMounted = useRef(false);
    const [saveMessage, setSaveMessage] = useState(null);
    const [charCount, setCharCount] = useState(0);
    const MAX_CHARS = 8000;
    const [availableCalls, setAvailableCalls] = useState([
        {
            id: 1,
            name: "Turma A",
            date: "2023-10-01",
            courseName: "Turma A",
            status: "open",
            startTime: "08:00",
            endTime: "10:00",
            checklist: true,
            has_open_plan: false,
        },
        {
            id: 2,
            name: "Turma B",
            date: "2023-10-02",
            courseName: "Turma B",
            status: "open",
            startTime: "10:00",
            endTime: "12:00",
            checklist: true,
            has_open_plan: true,
        },
        {
            id: 3,
            name: "Turma C",
            date: "2023-10-03",
            courseName: "Turma C",
            status: "open",
            startTime: "14:00",
            endTime: "16:00",
            checklist: true,
            has_open_plan: false,
        },
    ]); // Chamadas fictícias
    const [loading, setLoading] = useState(false);
    const [selectedCalls, setSelectedCalls] = useState([]);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 4
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const [filterCourse, setFilterCourse] = useState('');
    const [filteredCalls, setFilteredCalls] = useState([]);
    const [filterLessonPlan, setFilterLessonPlan] = useState('all'); // Filtro para planejamento de aula

    /**
     * Formata a data do formato ISO para DD/MM/YYYY
     */
    const formatDate = (dateString) => {
        try {
            const [date,] = dateString.split('T');
            const [year, month, day] = date.split('-');
            return `${day}/${month}/${year} `;
        } catch (error) {
            console.error('Erro ao formatar data:', error);
            return dateString;
        }
    };

    const handleCallSelection = (callId) => {
        if (selectedCalls.includes(callId)) {
            setSelectedCalls(selectedCalls.filter(id => id !== callId));
        } else {
            setSelectedCalls([...selectedCalls, callId]);
        }
    };

    const handleNextPage = () => {
        if (currentPage < pagination.totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleFirstPage = () => {
        setCurrentPage(1);
    };

    const handleLastPage = () => {
        setCurrentPage(pagination.totalPages);
    };

    const handleRefresh = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
        }, 3000); // Simula carregamento por 3 segundos
    };

    const handleFilterChange = (event) => {
        setFilterCourse(event.target.value);
        setPagination(prev => ({ ...prev, currentPage: 1 })); // Resetar para a primeira página
    };

    const handleLessonPlanFilterChange = (event) => {
        setFilterLessonPlan(event.target.value);
        setPagination(prev => ({ ...prev, currentPage: 1 })); // Resetar para a primeira página
    };

    useEffect(() => {
        const applyFilter = () => {
            let calls = availableCalls;

            // Filtro por turma
            if (filterCourse) {
                calls = calls.filter(call => call.courseName === filterCourse);
            }

            // Filtro por planejamento de aula
            if (filterLessonPlan === 'withPlan') {
                calls = calls.filter(call => call.has_open_plan);
            } else if (filterLessonPlan === 'withoutPlan') {
                calls = calls.filter(call => !call.has_open_plan);
            }

            setFilteredCalls(calls);
            setPagination(prev => ({
                ...prev,
                totalItems: calls.length,
                totalPages: Math.ceil(calls.length / pagination.itemsPerPage),
            }));
        };

        applyFilter();
    }, [filterCourse, filterLessonPlan, availableCalls, pagination.itemsPerPage]);

    const paginatedCalls = useMemo(() => {
        const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
        const endIndex = startIndex + pagination.itemsPerPage;
        return filteredCalls.slice(startIndex, endIndex);
    }, [filteredCalls, pagination.currentPage, pagination.itemsPerPage]);

    useEffect(() => {
        let editor;

        const initializeEditor = () => {
            editor = new EditorJS({
                holder: 'editorjs',
                tools: {
                    header: {
                        class: Header,
                        inlineToolbar: true,
                        config: {
                            placeholder: 'Cabeçalho',
                            levels: [2, 3, 4],
                            defaultLevel: 2
                        }
                    },
                    list: {
                        class: List,
                        inlineToolbar: true,
                        config: {
                            placeholder: 'Lista'
                        }
                    }
                },
                data: {
                    blocks: [
                        {
                            type: "paragraph",
                            data: {
                            }
                        }
                    ]
                },
                onReady: () => {
                    // Remover qualquer formatação HTML residual
                    const editorElement = document.getElementById('editorjs');
                    if (editorElement) {
                        const paragraphs = editorElement.getElementsByTagName('p');
                        Array.from(paragraphs).forEach(p => {
                            p.innerHTML = p.textContent;
                        });
                    }
                },
                onChange: async () => {
                    try {
                        const savedData = await editor.save();
                        const text = savedData.blocks.reduce((acc, block) => {
                            return acc + (block.data.text || '') + ' ';
                        }, '');

                        // Se exceder o limite máximo
                        if (text.length > MAX_CHARS) {
                            // Encontra o último bloco que contém texto
                            const lastBlockWithText = [...savedData.blocks].reverse()
                                .find(block => block.data.text && block.data.text.length > 0);

                            if (lastBlockWithText) {
                                // Mantém o texto no limite exato de MAX_CHARS caracteres
                                const excessChars = text.length - MAX_CHARS;
                                const updatedBlocks = savedData.blocks.map(block => {
                                    if (block === lastBlockWithText) {
                                        return {
                                            ...block,
                                            data: {
                                                ...block.data,
                                                text: lastBlockWithText.data.text.slice(0, -(excessChars))
                                            }
                                        };
                                    }
                                    return block;
                                });

                                // Renderiza o conteúdo atualizado
                                editor.render({ blocks: updatedBlocks });
                                setCharCount(MAX_CHARS);
                            }
                        } else {
                            setCharCount(text.length);
                        }
                    } catch (error) {
                        console.error('Erro ao contar caracteres:', error);
                    }
                },
                placeholder: 'Comece a escrever seu planejamento...',
                i18n: {
                    messages: {
                        ui: {
                            blockTunes: {
                                toggler: {
                                    "Click to tune": "Clique para ajustar",
                                    "or drag to move": "ou arraste para mover"
                                },
                            },
                            inlineToolbar: {
                                converter: {
                                    "Convert to": "Converter para"
                                }
                            },
                            toolbar: {
                                toolbox: {
                                    Add: "Adicionar"
                                }
                            }
                        },
                        toolNames: {
                            Text: "Texto",
                            Heading: "Cabeçalho",
                            List: "Lista",
                            Warning: "Aviso",
                            Checklist: "Lista de Verificação",
                            Quote: "Citação",
                            Code: "Código",
                            Delimiter: "Delimitador",
                            Raw: "HTML Bruto",
                            Table: "Tabela",
                            Link: "Link",
                            Marker: "Marcador",
                            Bold: "Negrito",
                            Italic: "Itálico",
                            InlineCode: "Código Inline",
                            UnorderedList: "Lista não ordenada",
                            OrderedList: "Lista ordenada"
                        },
                        tools: {
                            warning: {
                                Title: "Título",
                                Message: "Mensagem"
                            },
                            link: {
                                "Add a link": "Adicionar um link"
                            },
                            stub: {
                                'The block can not be displayed correctly.': 'O bloco não pode ser exibido corretamente.'
                            }
                        },
                        blockTunes: {
                            delete: {
                                "Delete": "Excluir"
                            },
                            moveUp: {
                                "Move up": "Mover para cima"
                            },
                            moveDown: {
                                "Move down": "Mover para baixo"
                            }
                        }
                    }
                }
            });
            editorInstance.current = editor;
            setIsEditorReady(true);
        };

        const destroyEditor = () => {
            if (editorInstance.current && typeof editorInstance.current.destroy === 'function') {
                editorInstance.current.destroy();
                editorInstance.current = null;
                setIsEditorReady(false);
            }
        };

        const editorElement = document.getElementById('editorjs');

        if (editorElement) {
            if (!isEditorReady) {
                initializeEditor();
            }
        } else {
            const observer = new MutationObserver(() => {
                const editorElement = document.getElementById('editorjs');
                if (editorElement && !isEditorReady) {
                    initializeEditor();
                    observer.disconnect();
                }
            });

            observer.observe(document.body, { childList: true, subtree: true });

            return () => observer.disconnect();
        }

        return destroyEditor;
    }, [isEditorReady]);

    /**
     * Salva o planejamento e vincula às chamadas selecionadas
     */
    const handleSavePlan = async () => {
        setError("Este é apenas um template. Não é possível vincular o planejamento.");
    };

    return (
        <div className="lesson-plan-container">
            <div className="lesson-plan-content">
                <div className="plan-area">
                    <div className="plan-header">
                        <div className="plan-header-left">
                            <h2>Planejamento de Aula</h2>
                            <div className="char-counter">
                                <span className={charCount > MAX_CHARS * 0.9 ? "char-warning" : ""}>
                                    {charCount}/{MAX_CHARS} caracteres
                                </span>
                            </div>
                        </div>
                        <div className="plan-actions">
                            <button
                                className="save-plan-button"
                                onClick={handleSavePlan}
                                disabled={isSaving || selectedCalls.length === 0 || charCount === 0}
                            >
                                {isSaving ? 'Salvando...' : 'Vincular Planejamento'}
                            </button>
                        </div>
                    </div>
                    {error && <div className="error-message">{error}</div>}
                    <div id="editorjs" className="editor-container" placeholder="Comece a escrever seu planejamento..."></div>
                </div>

                <div className="sidebar-area">
                    <div className="filters-refresh-container">
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
                            <div className="filter-group">
                                <fieldset>
                                    <legend>Planejamento:</legend>
                                    <select
                                        id="filter-lesson-plan"
                                        value={filterLessonPlan}
                                        onChange={handleLessonPlanFilterChange}
                                    >
                                        <option value="all">Ambos</option>
                                        <option value="withPlan">Com planejamento</option>
                                        <option value="withoutPlan">Sem planejamento</option>
                                    </select>
                                </fieldset>
                            </div>
                            <button
                                className="refresh-button"
                                onClick={handleRefresh}
                                disabled={loading}
                            >
                                {loading ? 'Carregando...' : <><FaSync /> Atualizar</>}
                            </button>
                        </div>
                    </div>

                    <div className="calls-area">
                        <h2>Vincular Chamadas</h2>
                        {loading ? (
                            <LoadingSpinner />
                        ) : (
                            <>
                                {paginatedCalls.length > 0 ? (
                                    <div className="calls-list">
                                        {paginatedCalls.map(call => (
                                            <div key={call.id} className={`call-item ${call.has_open_plan ? 'call-item-disabled' : ''}`}>
                                                <label>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedCalls.includes(call.id)}
                                                        onChange={() => handleCallSelection(call.id)}
                                                        disabled={call.has_open_plan}
                                                    />
                                                    <div className="call-info">
                                                        <div className="call-header">
                                                            <span className={`course-name ${call.has_open_plan ? 'strikethrough' : ''}`}>
                                                                {call.name}
                                                            </span>
                                                        </div>
                                                        <div className="call-details">
                                                            <span className={`call-date ${call.has_open_plan ? 'strikethrough' : ''}`}>
                                                                {formatDate(call.date)}
                                                            </span>
                                                            <span className={`call-time ${call.has_open_plan ? 'strikethrough' : ''}`}>
                                                                {call.startTime} - {call.endTime}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="no-calls">Nenhuma chamada aberta disponível</div>
                                )}

                                {pagination.totalPages > 1 && (
                                    <div className="pagination">
                                        <button
                                            className="pagination-button"
                                            onClick={handleFirstPage}
                                            disabled={currentPage === 1}
                                        >
                                            {"<<"}
                                        </button>
                                        <button
                                            className="pagination-button"
                                            onClick={handlePreviousPage}
                                            disabled={currentPage === 1}
                                        >
                                            {"<"}
                                        </button>
                                        <span className="page-info">
                                            Página {currentPage} de {pagination.totalPages}
                                        </span>
                                        <button
                                            className="pagination-button"
                                            onClick={handleNextPage}
                                            disabled={currentPage === pagination.totalPages}
                                        >
                                            {">"}
                                        </button>
                                        <button
                                            className="pagination-button"
                                            onClick={handleLastPage}
                                            disabled={currentPage === pagination.totalPages}
                                        >
                                            {">>"}
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LessonPlan;