/**
 * Componente ListCourses
 * Gerencia listagem, filtragem e ações em turmas
 */

import React, { useState, useEffect, useCallback } from 'react';
import LoadingSpinner from '../../LoadingSpinner/LoadingSpinner';
import { FaSync } from 'react-icons/fa';
import EditCourseModal from '../Modal/EditCourseModal';
import Table from '../../Shared/Table.js';
import Modal from 'react-modal';
import CreateCallModal from '../Modal/CreateCallModal/CreateCallModal';
import AddStudentsIntoCourseModal from '../Modal/AddStudentsIntoCourseModal/AddStudentsIntoCourseModal';
import RemoveStudentsFromCourseModal from '../Modal/RemoveStudentsFromCourseModal/RemoveStudentsFromCourseModal';
import './ListCourses.css';

function ListCourses() {
    const [courses, setCourses] = useState([
        {
            id: 1,
            name: "Turma A",
            category: { id: 1, name: "Matemática" },
            professors: [{ id: 1, name: "Prof. João" }],
            students: [
                { id: 1, first_name: "João", last_name: "Silva" },
                { id: 2, first_name: "Ana", last_name: "Santos" }
            ],
        },
        {
            id: 2,
            name: "Turma B",
            category: { id: 2, name: "Português" },
            professors: [{ id: 2, name: "Prof. Ana" }],
            students: [
                { id: 2, first_name: "Ana", last_name: "Santos" },
                { id: 3, first_name: "Pedro", last_name: "Oliveira" }
            ],
        },
        {
            id: 3,
            name: "Turma C",
            category: { id: 3, name: "História" },
            professors: [{ id: 3, name: "Prof. Carlos" }],
            students: [
                { id: 1, first_name: "João", last_name: "Silva" },
                { id: 3, first_name: "Pedro", last_name: "Oliveira" }
            ],
        },
    ]); // Dados fictícios
    const [isLoading, setIsLoading] = useState(false);
    const [isEditCourseModalOpen, setIsEditCourseModalOpen] = useState(false);
    const [error, setError] = useState(null);
    const [isModalError, setIsModalError] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [isCreateCallModalOpen, setIsCreateCallModalOpen] = useState(false);
    const [selectedCourseForCall, setSelectedCourseForCall] = useState(null);
    const [sortColumn, setSortColumn] = useState('id');
    const [hasDisplayedError, setHasDisplayedError] = useState(false);
    const [sortOrder, setSortOrder] = useState('asc');
    const [itemsPerPage, setItemsPerPage] = useState(10); //eslint-disable-line
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
    });

    // modal to delete course
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [adminEmain, setAdminEmain] = useState('');
    const [adminPassword, setAdminPassword] = useState('');
    const [courseToDelete, setCourseToDelete] = useState(null);

    // modal to restore course
    const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
    const [courseToRestore, setCourseToRestore] = useState(null);

    const [filterCourseName, setFilterCourseName] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterProfessor, setFilterProfessor] = useState('');
    const [filterStudent, setFilterStudent] = useState("");
    const storedUserType = localStorage.getItem('userType');
    const storedUserName = localStorage.getItem('userName');

    //modal details
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedCourseDetails, setSelectedCourseDetails] = useState(null);

    const [professors, setProfessors] = useState([
        { id: 1, name: "Prof. João" },
        { id: 2, name: "Prof. Ana" },
        { id: 3, name: "Prof. Carlos" },
    ]); // Professores fictícios

    const [categories, setCategories] = useState([
        { id: 1, name: "Matemática" },
        { id: 2, name: "Português" },
        { id: 3, name: "História" },
    ]); // Categorias fictícias

    const [isAddStudentsIntoCourseModalOpen, setIsAddStudentsIntoCourseModalOpen] = useState(false);
    const [selectedCourseForStudents, setSelectedCourseForStudents] = useState(null);
    const [isRemoveStudentsFromCourseModalOpen, setIsRemoveStudentsFromCourseModalOpen] = useState(false);
    const [selectedCourseForRemoveStudents, setSelectedCourseForRemoveStudents] = useState(null);

    /**
     * Busca turmas com filtros aplicados
     */
    const fetchCourses = useCallback(() => {
        setIsLoading(true);
        setError(null);
        try {
            // Simula um atraso para carregar os dados fictícios
            setTimeout(() => {
                setPagination(prev => ({
                    ...prev,
                    totalItems: courses.length,
                    totalPages: Math.ceil(courses.length / prev.itemsPerPage),
                }));
                setIsLoading(false);
            }, 500);
        } catch (error) {
            setError('Erro ao carregar as turmas.');
            setIsLoading(false);
        }
    }, [courses]);




    useEffect(() => {
        if (error) {
            setHasDisplayedError(true);
        }
    }, [error]);

    const handleShowDetails = (courseId) => {
        const courseDetails = courses.find(course => course.id === courseId);
        setSelectedCourseDetails(courseDetails);
        setIsDetailsModalOpen(true);
    };

    const handleSort = (column) => {
        if (sortColumn === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortOrder('asc');
        }
        setPagination({ ...pagination, currentPage: 1 });
    };

    const handlePageChange = (page) => {
        setPagination({ ...pagination, currentPage: page });
    };

    const handleItemsPerPageChange = (event) => {
        const newItemsPerPage = Number(event.target.value);
        setItemsPerPage(newItemsPerPage);

        setPagination({
            ...pagination,
            itemsPerPage: newItemsPerPage,
            currentPage: 1,
        });
    };


    const handleFilterChange = (setter) => (event) => {
        setter(event.target.value);
        setPagination({ ...pagination, currentPage: 1 });
    };

    const handleEditCourse = (courseId) => {
        const courseToEdit = courses.find(course => course.id === courseId)
        setEditingCourse(courseToEdit);
        setIsEditCourseModalOpen(true);
    };

    const handleCloseEditCourseModal = () => {
        setIsEditCourseModalOpen(false);
        setEditingCourse(null);
    };

    const handleCreateCall = (courseId) => {
        const course = courses.find(course => course.id === courseId);
        setSelectedCourseForCall(course);
        setIsCreateCallModalOpen(true);
    };

    const handleCloseCreateCallModal = () => {
        setIsCreateCallModalOpen(false);
        setSelectedCourseForCall(null);
    };

    const handleAddStudents = (courseId) => {
        const course = courses.find(course => course.id === courseId);
        setSelectedCourseForStudents(course);
        setIsAddStudentsIntoCourseModalOpen(true);
    };

    const handleCloseAddStudentsIntoCourseModal = () => {
        setIsAddStudentsIntoCourseModalOpen(false);
        setSelectedCourseForStudents(null);
    };

    const handleRemoveStudents = (courseId) => {
        const course = courses.find(course => course.id === courseId);
        setSelectedCourseForRemoveStudents(course);
        setIsRemoveStudentsFromCourseModalOpen(true);
    };

    const handleCloseRemoveStudentsFromCourseModal = () => {
        setIsRemoveStudentsFromCourseModalOpen(false);
        setSelectedCourseForRemoveStudents(null);
    };

    const handleSaveStudents = (updatedStudents) => {
        setCourses(prevCourses =>
            prevCourses.map(course =>
                course.id === selectedCourseForStudents.id ? { ...course, students: updatedStudents } : course
            )
        );
    };

    const handleSaveRemoveStudents = (removedStudents) => {
        setCourses(prevCourses =>
            prevCourses.map(course =>
                course.id === selectedCourseForRemoveStudents.id ? { ...course, students: course.students.filter(student => !removedStudents.some(rs => rs.id === student.id)) } : course
            )
        );
    };

    const handleSaveCourseEdit = (updatedCourse) => {
        setCourses(prevCourses =>
            prevCourses.map(course =>
                course.id === updatedCourse.id ? updatedCourse : course
            )
        );
    };

    const handleRestore = (courseId) => {
        setCourseToRestore(courseId);
        setIsRestoreModalOpen(true);
        setIsModalError(true);

    };


    const handleDeleteCourse = (courseId) => {
        setCourseToDelete(courseId);
        setIsDeleteModalOpen(true);
        setIsModalError(true);
    };

   

    const handleRefresh = () => {
        fetchCourses();
    };

    const getActionItems = (courseId, course) => {
        const actions = [
            { label: 'Detalhar', action: () => handleShowDetails(courseId) },
            { label: 'Adicionar Alunos', action: () => handleAddStudents(courseId) },
            { label: 'Remover Alunos', action: () => handleRemoveStudents(courseId) },
        ];
        actions.push(
            { label: 'Criar Chamada', action: () => handleCreateCall(courseId) }
        );
        if (course.deleted_at === null) {
            if (storedUserType === 'admin') {
                actions.push({
                    label: "Editar turma", action: () => handleEditCourse(courseId)
                },
                    { label: 'Excluir', action: () => handleDeleteCourse(courseId) }
                );
            }
        } 

        return actions;
    };

    const columns = [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Nome' },
        { key: 'category', label: 'Oficina', render: (category) => category ? category.name : 'N/A', sortable: false },
        {
            key: 'professors',
            label: 'Professores',
            render: (professors) => Array.isArray(professors) && professors.length > 0
                ? professors.map((professor, index) => (
                    <span key={professor.id} className="professor-name">
                        {professor.name}{index < professors.length - 1 ? ' - ' : ''}
                    </span>
                ))
                : 'N/A'
        },
    ];

    const filteredCourses = courses.filter(course => {
        const matchesCourseName = course.name.toLowerCase().includes(filterCourseName.toLowerCase());
        const matchesCategory = filterCategory === '' || (course.category && course.category.id.toString() === filterCategory);
        const matchesProfessor = filterProfessor === '' || course.professors.some(p => p.id.toString() === filterProfessor);
        const matchesStudent = filterStudent === '' || course.students.some(s => 
            `${s.first_name} ${s.last_name}`.toLowerCase().includes(filterStudent.toLowerCase())
        );

        return matchesCourseName && matchesCategory && matchesProfessor && matchesStudent;
    });

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    return (
        <div className="list-containet-tab">
            <h2>Lista de turmas</h2>

            {/* Filtros */}
            <div className="filters-container">
                <div className="filter-group">
                    <fieldset>
                        <legend>Nome da turma:</legend>
                        <input
                            type="text"
                            placeholder="Filtrar por nome da turma"
                            value={filterCourseName}
                            onChange={handleFilterChange(setFilterCourseName)}
                        />
                    </fieldset>
                </div>
                <div className="filter-group">
                    <fieldset>
                        <legend>Oficina:</legend>
                        <select 
                            value={filterCategory}
                            onChange={handleFilterChange(setFilterCategory)}
                        >
                            <option value="">Todas as oficinas</option>
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>{category.name}</option>
                            ))}
                        </select>
                    </fieldset>
                </div>
                <div className="filter-group">
                    <fieldset>
                        <legend>Professor:</legend>
                        <select
                            value={filterProfessor}
                            onChange={handleFilterChange(setFilterProfessor)}
                            disabled={storedUserType === "professor"}
                        >
                            {storedUserType !== "professor" ? (
                                <>
                                    <option value="">Todos os professores</option>
                                    {professors.map((professor) => (
                                        <option key={professor.id} value={professor.id}>
                                            {professor.name}
                                        </option>
                                    ))}
                                </>
                            ) : (
                                <option>
                                    {storedUserName}
                                </option>
                            )}
                        </select>
                    </fieldset>
                </div>
                <div className="filter-group">
                    <fieldset>
                        <legend>Aluno:</legend>
                        <input
                            type="text"
                            placeholder="Filtrar por aluno"
                            value={filterStudent}
                            onChange={handleFilterChange(setFilterStudent)}
                        />
                    </fieldset>
                </div>
                <button className="refresh-button" onClick={handleRefresh} disabled={isLoading}>
                    {isLoading ? <LoadingSpinner size="20px" /> : <><FaSync /> Atualizar Tabela</>}
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <Table
                data={filteredCourses}
                columns={columns}
                itemsPerPage={pagination.itemsPerPage}
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                isSortable={true}
                loading={isLoading}
                isModalError={isModalError}
                getActionItems={getActionItems}
                handleSort={handleSort}
                sortColumn={sortColumn}
                sortOrder={sortOrder}
                onPageChange={handlePageChange}
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

            {/* modal to delete */}
            <Modal
                isOpen={isDeleteModalOpen}
                onRequestClose={() => setIsDeleteModalOpen(false)}
                contentLabel="Confirmar Exclusão"
                className="delete-modals"
                overlayClassName="details-modal-overlay"
            >

                <div className="course-details">
                    <div className='modal'>

                        <h2>Confirme a exclusão</h2>
                        {error && isModalError && (<div className="error-message">{error}</div>)}
                        <p>Digite suas credenciais de administrador para excluir a turma.</p>

                        <div className="form-group-inline">
                            <fieldset>
                                <legend >email:</legend>
                                <input
                                    type="email"
                                    placeholder="E-mail"
                                    value={adminEmain}
                                    onChange={(e) => setAdminEmain(e.target.value)}
                                />
                            </fieldset>
                            <fieldset>
                                <legend>Password:</legend>
                                <input
                                    type="password"
                                    placeholder="Senha"
                                    value={adminPassword}
                                    onChange={(e) => setAdminPassword(e.target.value)}
                                />
                            </fieldset>
                        </div>
                        <div className='modal-buttons'>
                            <button onClick={() => setIsDeleteModalOpen(false)}>Cancelar</button>
                        </div>
                    </div>

                </div>
            </Modal>

            {/* modal to restaure */}

            <Modal
                isOpen={isRestoreModalOpen}
                onRequestClose={() => setIsRestoreModalOpen(false)}
                contentLabel="Confirmar Restauração"
                className="delete-modals"
                overlayClassName="details-modal-overlay"
            >
                <div className="course-details">
                    <div className='modal'>
                        <h2>Confirme a restauração</h2>
                        {error && isModalError && (<div className="error-message">{error}</div>)}
                        <p>Digite suas credenciais de administrador para restaurar a turma.</p>

                        <div className="form-group-inline">
                            <fieldset>
                                <legend >email:</legend>
                                <input
                                    type="email"
                                    placeholder="E-mail"
                                    value={adminEmain}
                                    onChange={(e) => setAdminEmain(e.target.value)}
                                />
                            </fieldset>
                            <fieldset>
                                <legend>Password:</legend>
                                <input
                                    type="password"
                                    placeholder="Senha"
                                    value={adminPassword}
                                    onChange={(e) => setAdminPassword(e.target.value)}
                                />
                            </fieldset>
                        </div>
                        <div className='modal-buttons'>
                            <button onClick={() => setIsRestoreModalOpen(false)}>Cancelar</button>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Modal para editar uma turma */}
            {isEditCourseModalOpen && (
                <EditCourseModal
                    course={editingCourse}
                    onClose={handleCloseEditCourseModal}
                    onSave={handleSaveCourseEdit}
                    fetchCourses={fetchCourses}
                />
            )}

            {/*Modal para criar a chamada*/}
            {isCreateCallModalOpen && selectedCourseForCall && (
                <CreateCallModal
                    course={selectedCourseForCall}
                    onClose={handleCloseCreateCallModal}
                    onSuccess={() => {
                        handleCloseCreateCallModal();
                        handleRefresh();
                    }}
                />
            )}

            {isAddStudentsIntoCourseModalOpen && (
                <AddStudentsIntoCourseModal
                    course={selectedCourseForStudents}
                    onClose={handleCloseAddStudentsIntoCourseModal}
                    onSave={handleSaveStudents}

                />
            )}

            {isRemoveStudentsFromCourseModalOpen && (
                <RemoveStudentsFromCourseModal
                    course={selectedCourseForRemoveStudents}
                    onClose={handleCloseRemoveStudentsFromCourseModal}
                    onSave={handleSaveRemoveStudents}
                />
            )}

            <Modal
                isOpen={isDetailsModalOpen}
                onRequestClose={() => setIsDetailsModalOpen(false)}
                className="details-modal"
                overlayClassName="details-modal-overlay"
            >
                {selectedCourseDetails && (
                    <div className="course-details">
                        <h2>Detalhes da Turma</h2>
                        <div className="details-content">
                            <p><strong>ID:</strong> {selectedCourseDetails.id}</p>
                            <p><strong>Nome:</strong> {selectedCourseDetails.name}</p>
                            <p><strong>Oficina:</strong> {selectedCourseDetails.category?.name}</p>
                            <p><strong>Status:</strong> {selectedCourseDetails.deleted_at ? 'Inativo' : 'Ativo'}</p>

                            <div className="professors-section">
                                <h3>Professores:</h3>
                                <ul>
                                    {selectedCourseDetails.professors?.map(professor => (
                                        <li key={professor.id}>{professor.name}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className="students-section">
                                <h3>Alunos:</h3>
                                <ul>
                                    {selectedCourseDetails.students?.map(student => (
                                        <li key={student.id}>{student.first_name} {student.last_name}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}

export default ListCourses;

Modal.setAppElement('#root');
