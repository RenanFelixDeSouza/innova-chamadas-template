/**
 * Componente EditStudentModal
 * Modal para edição de dados do aluno
 */

import React, { useState, useEffect } from "react";
import "./EditStudentModal.css";

function EditStudentModal({ student, onClose }) {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    gender: "",
    birthdate: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    zip_code: "",
    father_name: "",
    mother_name: "",
    can_go_home_alone: false,
    responsibles: [{ first_name: "", last_name: "", email: "", phone_number: "", relation: "" }]
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories] = useState([
    { id: 1, name: "Matemática" },
    { id: 2, name: "Português" },
    { id: 3, name: "História" },
    { id: 4, name: "Geografia" },
    { id: 5, name: "Ciências" },
  ]); // Valores fictícios
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [successMessage, setSuccessMessage] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [categoriesPerPage] = useState(12);

  useEffect(() => {
    if (student) {
      setSelectedCategories(student.categories.map((category) => category.id));
      // Ensure responsibles is initialized properly
      const initialResponsibles = student.responsibles && student.responsibles.length > 0 
        ? student.responsibles.map(responsible => ({
            first_name: responsible.first_name || "",
            last_name: responsible.last_name || "",
            email: responsible.email || "",
            phone_number: responsible.phone_number || "",
            relation: responsible.relation || "",
          }))
        : [{ first_name: "", last_name: "", email: "", phone_number: "", relation: "" }];

      setFormData({
        first_name: student.first_name,
        last_name: student.last_name,
        email: student.email,
        phone_number: student.phone_number || "",
        gender: student.gender === 'female' ? 0 : 1,
        birthdate: student.birthdate,
        street: student.street || "",
        number: student.number || "",
        complement: student.complement || "",
        neighborhood: student.neighborhood || "",
        city: student.city || "",
        state: student.state || "",
        zip_code: student.zip_code || "",
        father_name: student.father_name || "",
        mother_name: student.mother_name || "",
        can_go_home_alone: student.can_go_home_alone || false,
        responsibles: initialResponsibles,
      });
    }
  }, [student]);

  const indexOfLastCategory = currentPage * categoriesPerPage;
  const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage;
  const currentCategories = categories
    .filter(category => selectedCategories.includes(category.id))
    .concat(categories.filter(category => !selectedCategories.includes(category.id)))
    .slice(indexOfFirstCategory, indexOfLastCategory);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= Math.ceil(categories.length / categoriesPerPage)) {
      setCurrentPage(pageNumber);
    }
  };

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(categories.length / categoriesPerPage); i++) {
    pageNumbers.push(i);
  }



  /**
   * Salva alterações do aluno
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Este template é apenas para demonstração das funcionalidades. Não é possível editar os dados.");
  };

  if (!student) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="edit-student-modal-edit" onClick={(e) => e.stopPropagation()}>
        <div className="edit-student-modal-content">

          <h2>Editar Aluno</h2>
          <div className="edit-student-info-message">
            Este template é apenas para demonstração das funcionalidades. Não é possível editar os dados.
          </div>
          <form onSubmit={handleSubmit}>
            {/* Campos do formulário */}
            <div className="edit-student-form-group-inline">
              <div className="edit-student-form-group">
                <label htmlFor="first_name">Nome:</label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={() => {}}
                  disabled
                />
              </div>
              <div className="edit-student-form-group">
                <label htmlFor="last_name">Sobrenome:</label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={() => {}}
                  disabled
                />
              </div>
            </div>
            <div className="edit-student-form-group-inline">
              <div className="edit-student-form-group">
                <label htmlFor="email">Email:</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={() => {}}
                  disabled
                />
              </div>
              <div className="edit-student-form-group">
                <label htmlFor="phone_number">Telefone:</label>
                <input
                  type="text"
                  id="phone_number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={() => {}}
                  disabled
                />
              </div>
            </div>

            <div className="edit-student-form-group">
              <label htmlFor="gender">Gênero:</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={() => {}}
                disabled
              >
                <option value="">Selecione</option>
                <option value="1">Masculino</option>
                <option value="0">Feminino</option>
              </select>
            </div>
            <div className="edit-student-form-group">
              <label htmlFor="birthdate">Data de Nascimento:</label>
              <input
                type="date"
                id="birthdate"
                name="birthdate"
                value={formData.birthdate}
                onChange={() => {}}
                disabled
              />
            </div>

            {/* Other form fields */}
            <div className="edit-student-form-group">
              <h3>Responsáveis</h3>
              <table className="responsible-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Sobrenome</th>
                    <th>Email</th>
                    <th>Telefone</th>
                    <th>Parentesco</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.responsibles.map((responsible, index) => (
                    <tr key={index}>
                      <td>
                        <input
                          type="text"
                          name="first_name"
                          value={responsible.first_name}
                          onChange={() => {}}
                          disabled
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          name="last_name"
                          value={responsible.last_name}
                          onChange={() => {}}
                          disabled
                        />
                      </td>
                      <td>
                        <input
                          type="email"
                          name="email"
                          value={responsible.email}
                          onChange={() => {}}
                          disabled
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          name="phone_number"
                          value={responsible.phone_number}
                          onChange={() => {}}
                          disabled
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          name="relation"
                          value={responsible.relation}
                          onChange={() => {}}
                          disabled
                        />
                      </td>
                      <td>
                        <button type="button" className="button-remove" onClick={() => {}} disabled>
                          Remover
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="responsible-buttons-container">
                <button type="button" className="button-responsible" onClick={() => {}} disabled>
                  Adicionar Responsável
                </button>
              </div>
            </div>
            <div className="edit-student-form-group">
              <label htmlFor="street">Rua:</label>
              <input
                type="text"
                id="street"
                name="street"
                value={formData.street}
                onChange={() => {}}
                disabled
              />
            </div>
            <div className="edit-student-form-group">
              <label htmlFor="number">Número:</label>
              <input
                type="text"
                id="number"
                name="number"
                value={formData.number}
                onChange={() => {}}
                disabled
              />
            </div>
            <div className="edit-student-form-group">
              <label htmlFor="complement">Complemento:</label>
              <input
                type="text"
                id="complement"
                name="complement"
                value={formData.complement}
                onChange={() => {}}
                disabled
              />
            </div>
            <div className="edit-student-form-group">
              <label htmlFor="neighborhood">Bairro:</label>
              <input
                type="text"
                id="neighborhood"
                name="neighborhood"
                value={formData.neighborhood}
                onChange={() => {}}
                disabled
              />
            </div>
            <div className="edit-student-form-group">
              <label htmlFor="city">Cidade:</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={() => {}}
                disabled
              />
            </div>
            <div className="edit-student-form-group">
              <label htmlFor="state">Estado:</label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={() => {}}
                disabled
              />
            </div>
            <div className="edit-student-form-group">
              <label htmlFor="zip_code">CEP:</label>
              <input
                type="text"
                id="zip_code"
                name="zip_code"
                value={formData.zip_code}
                onChange={() => {}}
                disabled
              />
            </div>
            <div className="edit-student-form-group">
              <label htmlFor="father_name">Nome do Pai:</label>
              <input
                type="text"
                id="father_name"
                name="father_name"
                value={formData.father_name}
                onChange={() => {}}
                disabled
              />
            </div>
            <div className="edit-student-form-group">
              <label htmlFor="mother_name">Nome da Mãe:</label>
              <input
                type="text"
                id="mother_name"
                name="mother_name"
                value={formData.mother_name}
                onChange={() => {}}
                disabled
              />
            </div>
            <div className="edit-student-form-group">
              <label htmlFor="can_go_home_alone">Pode ir para casa sozinho?</label>
              <select
                id="can_go_home_alone"
                name="can_go_home_alone"
                value={formData.can_go_home_alone}
                onChange={() => {}}
                disabled
              >
                <option value="true">Sim</option>
                <option value="false">Não</option>
              </select>
            </div>
            {/* Campo de seleção de oficinas */}
            <div className="student-form-group">
              <label>Oficinas:</label>
              <div className="category-checkbox-group">
                {currentCategories.map((category) => ( 
                  <div key={category.id} className="edit-student-category-checkbox-item">
                    <input
                      type="checkbox"
                      id={`category-${category.id}`}
                      name="category"
                      value={category.id}
                      checked={selectedCategories.includes(category.id)}
                      onChange={() => {}}
                      disabled
                    />
                    <label htmlFor={`category-${category.id}`}>{category.name}</label>
                  </div>
                ))}
              </div>

              {/* Pagination controls */}
              <div className="pagination">
                <button 
                  type="button" 
                  onClick={() => paginate(1)} 
                  disabled={currentPage === 1}
                >
                  {"<<"}
                </button>
                <button 
                  type="button" 
                  onClick={() => paginate(currentPage - 1)} 
                  disabled={currentPage === 1}
                >
                  {"<"}
                </button>
                <span>
                  Página {currentPage} de {Math.ceil(categories.length / categoriesPerPage)}
                </span>
                <button 
                  type="button" 
                  onClick={() => paginate(currentPage + 1)} 
                  disabled={currentPage === Math.ceil(categories.length / categoriesPerPage)}
                >
                  {">"}
                </button>
                <button 
                  type="button" 
                  onClick={() => paginate(Math.ceil(categories.length / categoriesPerPage))} 
                  disabled={currentPage === Math.ceil(categories.length / categoriesPerPage)}
                >
                  {">>"}
                </button>
              </div>

            </div>

            <div className="edit-student-modal-buttons">
              <button type="submit" disabled>
                Salvar
              </button>
              <button type="button" onClick={onClose}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditStudentModal;