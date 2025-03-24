/**
 * Componente AddCategory
 * Gerencia a criação de novas categorias/oficinas
 */

import React, { useState } from 'react';
import './AddCategory.css';

function AddCategory() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
        setMessage('Não é possivel criar nova Oficina no template do sistema.');
  };

  return (
    <div className="create-category-container">
      <h2>Criar Nova Oficina</h2>
      {message && <div className="message">{message}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Nome da Oficina:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Descrição:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <button type="submit">Criar Oficina</button>
      </form>
    </div>
  );
}

export default AddCategory;