import React, { useState, useEffect } from 'react';
import './EditUserModal.css';

function EditUserModal({ user, onClose, onSave }) {
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        type: user?.type || '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            alert(`Usuário ${formData.name} atualizado com sucesso!`);
            onSave({ ...user, ...formData });
            onClose();
            setIsLoading(false);
        }, 1000);
    };

    if (!user) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Editar Usuário</h2>
                    <button onClick={onClose} className="close-button">&times;</button>
                </div>
                <div className="modal-body">
                    {error && <div className="error-message">{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="name">Nome:</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">E-mail:</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="type">Tipo:</label>
                            <input
                                type="text"
                                id="type"
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                required
                                disabled
                            />
                        </div>
                        <div className="modal-buttons">
                            <button type="submit" disabled={isLoading}>
                                {isLoading ? 'Salvando...' : 'Salvar'}
                            </button>
                            <button type="button" onClick={onClose} disabled={isLoading}>
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default EditUserModal;