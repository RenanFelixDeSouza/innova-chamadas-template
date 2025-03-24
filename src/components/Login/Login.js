/**
 * Componente Login
 * Gerencia autenticação e seleção de polo do usuário
 */

import React, { useEffect, useState } from "react";
import Modal from 'react-modal';
import "./Login.css";
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";

Modal.setAppElement('#root');

function Login({ setIsLoggedIn }) {
  const [username, setUsername] = useState("renanfdev");
  const [password, setPassword] = useState("renanfdev");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPoloModal, setShowPoloModal] = useState(false);
  const [polos, setPolos] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const polosPerPage = 4;
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add('login-page');

    return () => {
      document.body.classList.remove('login-page');
    };
  }, []);

  /**
   * Realiza autenticação do usuário
   */
  const handleLogin = (event) => {
    event.preventDefault();
    setError("");

    if (username === "renanfdev" && password === "renanfdev") {
      setIsLoggedIn();
    } else {
      setError("Usuário ou senha inválidos");
    }
  };

  const handleExit = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('studentsData');
    setShowPoloModal(false);
  };

  const indexOfLastPolo = currentPage * polosPerPage;
  const indexOfFirstPolo = indexOfLastPolo - polosPerPage;
  const currentPolos = polos.slice(indexOfFirstPolo, indexOfLastPolo);
  const totalPages = Math.ceil(polos.length / polosPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <div className="login-container">
        <form className="login-form" onSubmit={handleLogin}>
          <h2>Login</h2>
          <div className="info-message">Login: renanfdev | Senha: renanfdev</div>
          {error && <div className="error-message">{error}</div>}
          <input
            type="text"
            placeholder="Usuário"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={isLoading}
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? <LoadingSpinner /> : "Entrar"}
          </button>
        </form>
      </div>

      {showPoloModal && (
        <Modal
          isOpen={true}
          onRequestClose={() => { }} 
          className="polo-modal"
          overlayClassName="polo-modal-overlay"
          shouldCloseOnOverlayClick={false}
          ariaHideApp={false}
        >
          <div className="polo-selector-container">
            <h2>Selecione um Polo</h2>
            <div className="polo-list">
              {currentPolos.map(polo => (
                <button
                  key={polo.id}
                  className="polo-button"
                  onClick={() => console.log(`Polo selecionado: ${polo.name}`)}
                >
                  {polo.name}
                </button>
              ))}
            </div>
            {polos.length > polosPerPage && (
              <div className="pagination">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  &lt;
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => paginate(i + 1)}
                    className={currentPage === i + 1 ? 'active' : ''}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  &gt;
                </button>
              </div>
            )}
            <button className="polo-exit-button" onClick={handleExit}>
              Sair
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}

export default Login;