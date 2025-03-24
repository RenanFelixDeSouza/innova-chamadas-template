/**
 * Componente AddCategoryModal
 * Modal para vincular oficinas a um professor
 */

import React, { useState, useEffect } from 'react';
import './AddCategoryModal.css';

function AddCategoryModal({ user, onClose, onSave }) {
    const [availableCategories, setAvailableCategories] = useState([
        { id: 1, name: "Matemática" },
        { id: 2, name: "Português" },
        { id: 3, name: "História" },
        { id: 4, name: "Geografia" },
        { id: 5, name: "Ciências" }
    ]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [existingCategories, setExistingCategories] = useState(user?.categories?.map(cat => cat.id) || []);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 3,
    });

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setPagination(prev => ({
            ...prev,
            currentPage: 1 // Reset para página 1 ao pesquisar
        }));
    };

    const handleCategorySelection = (categoryId) => {
        if (existingCategories.includes(categoryId)) return;
        setSelectedCategories(prev => prev.includes(categoryId) ? prev.filter(id => id !== categoryId) : [...prev, categoryId]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        alert(`Oficinas vinculadas com sucesso: ${selectedCategories.join(", ")}`);
        onSave();
        onClose();
    };

    const handlePageChange = (page) => setPagination(prev => ({ ...prev, currentPage: page }));

    const filteredCategories = availableCategories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredCategories.length / pagination.itemsPerPage);
    const paginatedCategories = filteredCategories.slice(
        (pagination.currentPage - 1) * pagination.itemsPerPage,
        pagination.currentPage * pagination.itemsPerPage
    );

    useEffect(() => {
        setPagination(prev => ({
            ...prev,
            totalPages: totalPages,
            totalItems: filteredCategories.length
        }));
    }, [filteredCategories, totalPages]);

    return (
        <div className="modal-overlay">
            <div className="modal-contentl" onClick={(e) => e.stopPropagation()}>
                <div className="modal-content">
                    <h2>Adicionar Oficinas para {user.name}</h2>
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Pesquisar oficinas..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="search-input"
                        />
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="categories-grid">
                            {paginatedCategories.map(category => (
                                <div key={category.id} className="category-grid-item">
                                    <label className={existingCategories.includes(category.id) ? 'disabled' : ''}>
                                        <input
                                            type="checkbox"
                                            checked={selectedCategories.includes(category.id) || existingCategories.includes(category.id)}
                                            onChange={() => handleCategorySelection(category.id)}
                                            disabled={existingCategories.includes(category.id)}
                                        />
                                        <span className="category-name">
                                            {category.name}
                                            {existingCategories.includes(category.id) && ' (Já vinculada)'}
                                        </span>
                                    </label>
                                </div>
                            ))}
                        </div>

                        <div className="pagination">
                            <button  type='button' onClick={() => handlePageChange(1)} disabled={pagination.currentPage === 1}>{"<<"}</button>
                            <button type='button' onClick={() => handlePageChange(pagination.currentPage - 1)} disabled={pagination.currentPage === 1}>{"<"}</button>
                            <span>Página {pagination.currentPage} de {pagination.totalPages}</span>
                            <button type='button' onClick={() => handlePageChange(pagination.currentPage + 1)} disabled={pagination.currentPage === totalPages}>{">"}</button>
                            <button type='button' onClick={() => handlePageChange(totalPages)} disabled={pagination.currentPage === totalPages}>{">>"}</button>
                        </div>

                        <div className="modal-buttons">
                            <button type="submit" disabled={selectedCategories.length === 0}>
                                Salvar
                            </button>
                            <button type="button" onClick={onClose}>Cancelar</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AddCategoryModal;
