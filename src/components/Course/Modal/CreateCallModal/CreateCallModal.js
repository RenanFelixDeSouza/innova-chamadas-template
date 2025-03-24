/**
 * Componente CreateCallModal
 * Modal para criar nova chamada para uma turma
 */

import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';

function CreateCallModal({ course, onClose, onSuccess }) {
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [startTime, setStartTime] = useState('00:00');
    const [endTime, setEndTime] = useState('00:00');
    const [selectedDay, setSelectedDay] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const daysOfWeekMapping = {
        1: "Segunda-feira",
        2: "Terça-feira",
        3: "Quarta-feira",
        4: "Quinta-feira",
        5: "Sexta-feira",
        6: "Sábado",
        7: "Domingo",
    };

    const getDayOfWeek = (date) => {
        const day = new Date(date).getUTCDay();
        return day === 0 ? 7 : day; 
    };

    /**
     * Salva nova chamada
     */
    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');


        // Simula o comportamento de salvar chamada
        setTimeout(() => {
            setError('Este template é apenas para demonstração. Não é possível criar chamadas.');
        }, 500);
    };

    // Adicionar dias fictícios ao curso
    const mockWeeks = [
        { id: 1, name: "Segunda-feira" },
        { id: 2, name: "Terça-feira" },
        { id: 3, name: "Quarta-feira" },
        { id: 4, name: "Quinta-feira" },
        { id: 5, name: "Sexta-feira" },
    ];

    course.weeks = mockWeeks;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal create-call-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Criar Chamada para turma ID: {course.id}</h2>
                    <button onClick={onClose} className="close-button">
                        <FaTimes />
                    </button>
                </div>
                <div className="modal-body">
                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="attendance-date">Data:</label>
                            <input
                                type="date"
                                id="attendance-date"
                                value={attendanceDate}
                                onChange={(e) => setAttendanceDate(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="start-time">Hora de Início:</label>
                            <input
                                type="time"
                                id="start-time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="end-time">Hora de Término:</label>
                            <input
                                type="time"
                                id="end-time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="available-days">Dias Disponíveis:</label>
                            <select
                                id="available-days"
                                value={selectedDay}
                                onChange={(e) => setSelectedDay(e.target.value)}
                                required
                            >
                                <option value="">Selecione um dia</option>
                                {course.weeks && course.weeks.map(week => (
                                    <option key={week.id} value={week.id}>
                                        {daysOfWeekMapping[week.id]}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="modal-buttons">
                            <button type="button" onClick={onClose}>
                                Cancelar
                            </button>
                            <button type="submit">
                                Salvar Chamada
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default CreateCallModal;