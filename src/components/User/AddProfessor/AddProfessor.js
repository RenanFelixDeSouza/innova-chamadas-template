/**
 * Componente AddProfessor
 * Gerencia o cadastro de novos professores
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './AddProfessor.css';

function AddProfessor() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [polos, setPolos] = useState([
    { id: 1, name: "Polo A" },
    { id: 2, name: "Polo B" },
    { id: 3, name: "Polo C" },
    { id: 4, name: "Polo D" }
  ]);
  const [selectedPolos, setSelectedPolos] = useState([]);
  const [currentPoloPage, setCurrentPoloPage] = useState(1);
  const polosPerPage = 4;

  const handlePoloChange = (poloId) => {
    setSelectedPolos((prevSelected) =>
      prevSelected.includes(poloId)
        ? prevSelected.filter((id) => id !== poloId)
        : [...prevSelected, poloId]
    );
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !email || !password || !passwordConfirmation) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    if (password.length < 3) {
      setError('A senha deve ter pelo menos 3 caracteres.');
      return;
    }

    if (password !== passwordConfirmation) {
      setError('As senhas não coincidem.');
      return;
    }

    if (selectedPolos.length === 0) {
      setError('Nenhum Polo selecionado.');
      return;
    }

    setSuccess('Professor cadastrado com sucesso!');
    setName('');
    setEmail('');
    setPassword('');
    setPasswordConfirmation('');
    setSelectedPolos([]);
  };

  const currentPolos = useMemo(() => {
    const start = (currentPoloPage - 1) * polosPerPage;
    return polos.slice(start, start + polosPerPage);
  }, [polos, currentPoloPage, polosPerPage]);

  return (
    <div className="create-teacher-container">
      <h2>Cadastrar Novo Professor</h2>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group-inline">
          <div className="form-group">
            <label htmlFor="name">Nome:</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">E-mail:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
        </div>

        <div className="form-group-inline">
          <div className="form-group">
            <label htmlFor="password">Senha:</label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                className="toggle-password"
                style={{ backgroundColor: "transparent" }}

                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="password-confirmation">Confirmação de Senha:</label>
            <div className="password-input-container">
              <input
                type={showPasswordConfirmation ? "text" : "password"}
                id="password-confirmation"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                className="toggle-password"
                style={{ backgroundColor: "transparent" }}
                onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
              >
                {showPasswordConfirmation ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>Polos:</label>
          <div className="category-checkbox-group">
            {currentPolos.map((polo) => (
              <div key={polo.id} className="category-checkbox-item">
                <input
                  type="checkbox"
                  id={`polo-${polo.id}`}
                  value={polo.id}
                  checked={selectedPolos.includes(polo.id)}
                  onChange={() => handlePoloChange(polo.id)}
                />
                <label htmlFor={`polo-${polo.id}`}>{polo.name}</label>
              </div>
            ))}
          </div>

          {/* Controles de Paginação dos Polos */}
          <div className="pagination">
            <button
              type="button"
              onClick={() => setCurrentPoloPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPoloPage === 1}
            >
              Anterior
            </button>

            <span>
              Página {currentPoloPage} de {Math.ceil(polos.length / polosPerPage)}
            </span>

            <button
              type="button"
              onClick={() =>
                setCurrentPoloPage((prev) =>
                  prev < Math.ceil(polos.length / polosPerPage) ? prev + 1 : prev
                )
              }
              disabled={currentPoloPage === Math.ceil(polos.length / polosPerPage)}
            >
              Próximo
            </button>
          </div>
        </div>

        <div className="form-group" style={{ marginTop: '1rem' }}>
          <button type="submit">Cadastrar Professor</button>
        </div>
      </form>
    </div>
  );
}

export default AddProfessor;
