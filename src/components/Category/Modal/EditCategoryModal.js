/**
 * Componente EditCategoryModal
 * Modal para edição de categorias/oficinas existentes
 */

import React, { useState, useEffect } from 'react';
import './EditCategoryModal.css'; 

function EditCategoryModal({ category, onClose, onSave }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  /**
   * Carrega dados da categoria ao abrir modal
   */
  useEffect(() => {
    if (category) {
      setName(category.name);
      setDescription(category.description || '');
    }
  }, [category]);

  /**
   * Salva alterações da categoria
   */
  const handleSave = async () => {
      setError("Este template é apenas para demonstração das funcionalidades. Não é possível editar oficina.");
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-body">
          <h2>Editar Oficina</h2>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">
          {error && <div className="error-message">{error}</div>}
          <div className="form-group">
            <label htmlFor="category-name">Nome:</label>
            <input
              type="text"
              id="category-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="category-description">Descrição:</label>
            <textarea
              id="category-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="modal-save-button" onClick={handleSave}>Salvar</button>
          <button className="modal-cancel-button" onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

export default EditCategoryModal;