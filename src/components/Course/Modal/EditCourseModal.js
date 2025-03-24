/**
 * Componente EditCourseModal
 * Modal para edição de dados de uma turma
 */

import React, { useState, useEffect } from 'react';
import { FaChalkboardTeacher } from 'react-icons/fa';
import './EditCourseModal.css';

function EditCourseModal({ course, onClose }) {
    const [name, setName] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [selectedProfessors, setSelectedProfessors] = useState([]);
    const [categories, setCategories] = useState([]);
    const [professors, setProfessors] = useState([]);
    const [error, setError] = useState('');
    const [professorCategories, setProfessorCategories] = useState({}); // eslint-disable-line

    /**
     * Carrega dados iniciais para edição
     */
    useEffect(() => {
        const loadData = () => {
            try {
                const mockCategories = [
                    { id: 1, name: "Categoria 1" },
                    { id: 2, name: "Categoria 2" },
                    { id: 3, name: "Categoria 3" },
                ];

                const mockProfessors = [
                    { professor: { id: 1 }, user_name: "Professor 1" },
                    { professor: { id: 2 }, user_name: "Professor 2" },
                    { professor: { id: 3 }, user_name: "Professor 3" },
                ];

                setCategories(mockCategories);
                setProfessors(mockProfessors);
                setError("");
            } catch (error) {
                setError("Erro ao carregar dados do formulário.");
            }
        };

        loadData();
    }, [categoryId]);

    useEffect(() => {
        if (course && course.id) {
            setName(course.name);
            setCategoryId(course.category ? course.category.id : '');
            setSelectedProfessors(Array.isArray(course.professors) ? course.professors.map(p => p.id) : []);

            const loadProfessorCategories = () => {
                const categories = {};

                for (const professor of course.professors) {
                    if (professor.categories && professor.categories.length > 0) {
                        categories[professor.id] = professor.categories.map(cat => cat.id);
                    } else {
                        categories[professor.id] = [];
                    }
                }

                setProfessorCategories(categories);
            };

            loadProfessorCategories();
        }
    }, [course]);

    const handleProfessorChange = professorId => {
        setSelectedProfessors(prevSelected => {
            if (prevSelected.includes(professorId)) {
                return prevSelected.filter(id => id !== professorId);
            } else {
                return [...prevSelected, professorId];
            }
        });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <button className="close-button" onClick={onClose}>
                        &times;
                    </button>
                    <h2 style={{ textAlign: "center" }}>Editar oficina</h2>
                </div>

                <div className="modal-body">
                    {error && <div className="error-message">{error}</div>}
                    <form>
                        <div className="form-group-inline">
                            <div className="form-group">
                                <label htmlFor="course-name">Nome da oficina:</label>
                                <input
                                    type="text"
                                    id="course-name"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="category">Oficina:</label>
                                <select
                                    id="category"
                                    value={categoryId}
                                    disabled
                                    required
                                >
                                    <option value="">Selecione uma Oficina</option>
                                    {categories.map(category => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="form-group">
                            <fieldset>
                                <legend>
                                    <FaChalkboardTeacher /> Professores:
                                </legend>
                                <div className="category-checkbox-group">
                                    {professors.map(professor => (
                                        <label
                                        className='category-checkbox-item'
                                        key={professor.professor.id} style={{ alignItems: 'center' }}>
                                            <input
                                                type="checkbox"
                                                disabled
                                                checked={selectedProfessors.includes(professor.professor.id)}
                                                onChange={() => handleProfessorChange(professor.professor.id)}
                                            />
                                            {professor.user_name}
                                        </label>
                                    ))}
                                </div>
                            </fieldset>
                        </div>

                        <div className="modal-buttons">
                            <button type="button" onClick={onClose}>
                                Fechar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default EditCourseModal;