/**
 * Componente ListStudent
 * Exibe lista de alunos com filtros, paginação e ações
 */

import React, { useState, useEffect, useRef } from "react";
import Modal from 'react-modal';
import "./ListStudents.css";
import EditStudentModal from "../Modal/EditStudent/EditStudentModal";
import Table from "../../Shared/Table";
import { FaSync } from "react-icons/fa";
import ContractView from "../Modal/ContractView/ContractView";
import ContactModal from "../Modal/ContactModal/ContactModal";
import { useSearchParams } from 'react-router-dom';

function ListStudents() {
  const [searchParams] = useSearchParams();
  const [students, setStudents] = useState([
    {
      id: 1,
      first_name: "João",
      last_name: "Silva",
      email: "joao.silva@example.com",
      phone_number: "11987654321",
      gender: "male",
      birthdate: "2005-05-15",
      categories: [{ id: 1, name: "Matemática" }, { id: 2, name: "Português" }],
      deleted_at: null,
      father_name: "Carlos Silva",
      mother_name: "Maria Silva",
      can_go_home: true,
      street: "Rua das Flores",
      number: "123",
      complement: "Apto 45",
      neighborhood: "Centro",
      city: "São Paulo",
      state: "SP",
      zip_code: "01000-000",
      responsibles: [
        {
          id: 1,
          first_name: "Carlos",
          last_name: "Silva",
          relation: "Pai",
          email: "carlos.silva@example.com",
          phone_number: "11987654321",
        },
        {
          id: 2,
          first_name: "Maria",
          last_name: "Silva",
          relation: "Mãe",
          email: "maria.silva@example.com",
          phone_number: "11987654322",
        },
      ],
    },
    {
      id: 2,
      first_name: "Ana",
      last_name: "Santos",
      email: "ana.santos@example.com",
      phone_number: "21987654321",
      gender: "female",
      birthdate: "2006-08-20",
      categories: [{ id: 3, name: "História" }],
      deleted_at: null,
      father_name: "José Santos",
      mother_name: "Clara Santos",
      can_go_home: false,
      street: "Avenida Brasil",
      number: "456",
      complement: "",
      neighborhood: "Jardim América",
      city: "Rio de Janeiro",
      state: "RJ",
      zip_code: "20000-000",
      responsibles: [
        {
          id: 3,
          first_name: "José",
          last_name: "Santos",
          relation: "Pai",
          email: "jose.santos@example.com",
          phone_number: "21987654321",
        },
      ],
    },
    {
      id: 3,
      first_name: "Pedro",
      last_name: "Oliveira",
      email: "pedro.oliveira@example.com",
      phone_number: "31987654321",
      gender: "male",
      birthdate: "2007-03-10",
      categories: [{ id: 4, name: "Geografia" }, { id: 5, name: "Ciências" }],
      deleted_at: "2023-01-01",
      father_name: "Fernando Oliveira",
      mother_name: "Fernanda Oliveira",
      can_go_home: true,
      street: "Rua das Palmeiras",
      number: "789",
      complement: "Casa",
      neighborhood: "Bela Vista",
      city: "Belo Horizonte",
      state: "MG",
      zip_code: "30000-000",
      responsibles: [
        {
          id: 4,
          first_name: "Fernando",
          last_name: "Oliveira",
          relation: "Pai",
          email: "fernando.oliveira@example.com",
          phone_number: "31987654321",
        },
      ],
    },
  ]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [sortColumn, setSortColumn] = useState("id");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showActions, setShowActions] = useState(null); // eslint-disable-line
  const [filterFullName, setFilterFullName] = useState("");
  const [filterEmail, setFilterEmail] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [categories, setCategories] = useState([
    { id: 1, name: "Matemática" },
    { id: 2, name: "Português" },
    { id: 3, name: "História" },
    { id: 4, name: "Geografia" },
    { id: 5, name: "Ciências" },
  ]);
  const actionsMenuRef = useRef(null);

  const [editingStudent, setEditingStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDeleted, setShowDeleted] = useState(false);

  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfAttachmentUrl, setPdfAttachmentUrl] = useState(null);
  //modal detail
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [selectedContactStudent, setSelectedContactStudent] = useState(null);

  /**
   * Carrega lista de alunos com filtros aplicados
   */
  useEffect(() => {
    const nameFromUrl = searchParams.get('name');
    if (nameFromUrl) {
      setFilterFullName(nameFromUrl);
      setPagination(prev => ({ ...prev, currentPage: 1 }));
    }
  }, [searchParams]);

  useEffect(() => {
    const applyFilters = () => {
      let filtered = [...students];

      if (filterFullName) {
        filtered = filtered.filter(student =>
          `${student.first_name} ${student.last_name}`.toLowerCase().includes(filterFullName.toLowerCase())
        );
      }

      if (filterEmail) {
        filtered = filtered.filter(student =>
          student.email.toLowerCase().includes(filterEmail.toLowerCase())
        );
      }

      if (filterGender) {
        filtered = filtered.filter(student => student.gender === filterGender);
      }

      if (filterCategory) {
        filtered = filtered.filter(student =>
          student.categories.some(category => category.id === parseInt(filterCategory))
        );
      }

      if (!showDeleted) {
        filtered = filtered.filter(student => !student.deleted_at);
      }

      setFilteredStudents(filtered);

      setPagination(prev => ({
        ...prev,
        totalItems: filtered.length,
        totalPages: Math.ceil(filtered.length / prev.itemsPerPage),
      }));
    };

    applyFilters();
  }, [students, filterFullName, filterEmail, filterGender, filterCategory, showDeleted, pagination.itemsPerPage]);

  const handleItemsPerPageChange = (event) => {
    setPagination({ ...pagination, itemsPerPage: Number(event.target.value), currentPage: 1 });
  };

  const handleEdit = async (studentId) => {
    try {
      // Substitui a chamada à API por dados fictícios
      const student = students.find((s) => s.id === studentId);
      if (!student) {
        throw new Error("Aluno não encontrado.");
      }
      setEditingStudent(student);
      setIsModalOpen(true);
      setShowActions(null);
    } catch (error) {
      console.error("Erro ao carregar dados do aluno:", error);
      alert("Erro ao carregar dados do aluno. Por favor, tente novamente.");
    }
  };

  const handlePrintContract = (studentId) => {
    try {
      const student = students.find((s) => s.id === studentId);
      if (!student) {
        throw new Error("Aluno não encontrado.");
      }
  
      const contractData = {
        student,
        polo: {
          name: "Polo Fictício",
          address: "Rua Fictícia, 123, Centro, São Paulo, SP",
          phone: "11999999999",
        },
        allCategory: student.categories.map((category) => category.name), // Corrige a exibição do campo name
      };
  
      // Corrige a exibição das oficinas cadastradas
      contractData.officesDescription = contractData.allCategory.length > 0
        ? contractData.allCategory.join(", ")
        : "Nenhuma oficina cadastrada";

  console.log(contractData);
  
      setPdfUrl(contractData);
    } catch (error) {
      console.error("Erro ao gerar contrato:", error);
      alert("Erro ao gerar o contrato. Por favor, tente novamente.");
    }
  };
  

  const handlePrint = () => {
    const modalContent = document.querySelector('.student-details').innerHTML;

    const printStyles = `
      <style>
        .details-content { margin: 15px 0; }
        h2, h3 { margin: 15px 0; color: #333; }
        p { margin: 8px 0; }
        @media print {
          body { font-family: Arial, sans-serif; }
          .modal-buttons { display: none; }
        }
      </style>
    `;

    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write('<html><head><title>Imprimir Detalhes do Aluno</title>');
    printWindow.document.write(printStyles);
    printWindow.document.write('</head><body>');
    printWindow.document.write(modalContent);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
    printWindow.onafterprint = () => {
      printWindow.close();
    };
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
  };

  const handleSaveModal = (updatedStudent) => {
    setStudents((prevStudents) =>
      prevStudents.map((student) =>
        student.id === updatedStudent.id ? updatedStudent : student
      )
    );
  };

  const handleRefresh = () => {
    setError(null);
    setIsLoading(true);

    // Simula um atraso para carregar os dados fictícios
    setTimeout(() => {
      setIsLoading(false);
      console.log("Tabela atualizada com dados fictícios.");
    }, 500);
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleSort = (column) => {
    const newSortOrder = sortColumn === column && sortOrder === "asc" ? "desc" : "asc";
    setSortColumn(column);
    setSortOrder(newSortOrder);

    const sorted = [...filteredStudents].sort((a, b) => {
      const aValue = column === "full_name" ? `${a.first_name} ${a.last_name}` : a[column];
      const bValue = column === "full_name" ? `${b.first_name} ${b.last_name}` : b[column];

      if (aValue < bValue) return newSortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return newSortOrder === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredStudents(sorted);
  };



  const handleDelete = async (studentId) => {
    setError("Este template é apenas para demonstração das funcionalidades. Não é possível excluir alunos.");
  };

  const handleRestore = async (studentId) => {
        setError("Este template é apenas para demonstração das funcionalidades. Não é possível restaurar alunos.");
  };

  const handleOpenPdfAttachment = (pdfUrl) => {

    if (pdfUrl) {
      const formattedUrl = `http://innova.test${pdfUrl}`;
      console.log("Formatted URL:", formattedUrl);
      setPdfAttachmentUrl(formattedUrl);
    } else {
      alert("Nenhum PDF de anexo disponível.");
    }
  };

  const handleDetailStudent = async (studentId) => {
    try {
      // Substitui a chamada à API por dados fictícios
      const student = students.find((s) => s.id === studentId);
      if (!student) {
        throw new Error("Aluno não encontrado.");
      }
      setSelectedStudent(student);
      setIsDetailsModalOpen(true);
    } catch (error) {
      console.error("Erro ao carregar detalhes do aluno:", error);
      alert("Erro ao carregar detalhes do aluno. Por favor, tente novamente.");
    }
  };

  const handleContact = (studentId) => {
    try {
      const student = students.find((s) => s.id === studentId);
      if (!student) {
        throw new Error("Aluno não encontrado.");
      }
  
      const studentContact = {
        name: `${student.first_name} ${student.last_name}`,
        phone_number: student.phone_number,
      };
  
      const responsiblesContacts = student.responsibles.map((responsible) => ({
        name: `${responsible.first_name} ${responsible.last_name}`,
        relation: responsible.relation,
        phone_number: responsible.phone_number,
      }));
  
      setSelectedContactStudent({ studentContact, responsiblesContacts });
      setIsContactModalOpen(true);
    } catch (error) {
      console.error("Erro ao carregar contatos:", error);
      alert("Erro ao carregar informações de contato. Por favor, tente novamente.");
    }
  };
  

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        actionsMenuRef.current &&
        !actionsMenuRef.current.contains(event.target)
      ) {
        setShowActions(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const columns = [
    {
      key: "full_name",
      sortable: true,
      label: "Nome Completo",
      render: (value, item) => `${item.first_name} ${item.last_name}`
    },
    { key: "email", sortable: true, label: "Email" },
    {
      key: "phone_number",
      label: "Telefone",
      sortable: true,
      render: (phone) => {
        if (!phone) return "Não informado";
        phone = phone.replace(/\D/g, "");
        if (phone.length === 11) {
          return `(${phone.slice(0, 2)}) ${phone.slice(2, 7)}-${phone.slice(7)}`;
        } else if (phone.length === 10) {
          return `(${phone.slice(0, 2)}) ${phone.slice(2, 6)}-${phone.slice(6)}`;
        }
        return phone;
      }
    },
    {
      key: "gender",
      sortable: true,
      label: "Gênero",
      render: (value) => value === 'male' ? 'Masculino' : 'Feminino'
    },
    {
      key: 'birthdate',
      label: 'Data de Nascimento',
      sortable: true,
      render: (date) => new Date(date).toLocaleDateString('pt-BR')
    },
    {
      key: "categories",
      label: "Oficinas",
      sortable: false,
      render: (categories) => {
        if (!categories || categories.length === 0) return "Nenhuma";
        return categories.map((category) => category.name).join(", ");
      },
    },
    {
      key: "deleted_at",
      label: "Ativo",
      sortable: true,
      render: (value) => (
        <input
          type="checkbox"
          checked={!value}
          readOnly
          disabled
          title={value ? "Inativo" : "Ativo"}
        />
      )
    }
  ];

  const getActionItems = (itemId, item) => {
    const actions = [
      {
        label: "Detalhar",
        action: () => handleDetailStudent(itemId)
      },
      {
        label: "Contatar",
        action: () => handleContact(itemId)
      }
    ];

    if (item.pdf_attachment) {
      actions.push({
        label: "Abrir Laudo PCD",
        action: () => handleOpenPdfAttachment(`/storage/${item.pdf_attachment}`),
      });
    }

    if (item.deleted_at === null) {
      actions.push(
        {
          label: "Imprimir Contrato",
          action: () => handlePrintContract(itemId),
        },
        {
          label: "Editar",
          action: () => handleEdit(itemId),
        },
        {
          label: "Excluir",
          action: () => handleDelete(itemId),
        });
    } else {
      actions.push(
        {
          label: "Restaurar",
          action: () => handleRestore(itemId),
        });
    }

    return actions;
  };

  const paginatedStudents = filteredStudents.slice(
    (pagination.currentPage - 1) * pagination.itemsPerPage,
    pagination.currentPage * pagination.itemsPerPage
  );

  return (
    <div className="students-list-container">
      <h2>Lista de Alunos</h2>

      <div className="header-container">
        <div className="filters-container">
          <div className="filter-group">
            <fieldset>
              <legend>Nome Completo:</legend>
              <input
                type="text"
                placeholder="Filtrar por Nome Completo"
                value={filterFullName}
                onChange={(e) => setFilterFullName(e.target.value)}
              />
            </fieldset>
          </div>
          <div className="filter-group">
            <fieldset>
              <legend>Email:</legend>
              <input
                type="text"
                placeholder="Filtrar por Email"
                value={filterEmail}
                onChange={(e) => setFilterEmail(e.target.value)}
              />
            </fieldset>
          </div>
          <div className="filter-group">
            <fieldset>
              <legend>Gênero:</legend>
              <select
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value)}
              >
                <option value="">Todos os Gêneros</option>
                <option value="male">Masculino</option>
                <option value="female">Feminino</option>
              </select>
            </fieldset>
          </div>
          <div className="filter-group">
            <fieldset>
              <legend>Oficina:</legend>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="">Todas as Oficinas</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </fieldset>
          </div>
          <div className="switch-container">
            <label className="switch">
              <input
                type="checkbox"
                id="showDeleted"
                checked={showDeleted}
                onChange={(e) => setShowDeleted(e.target.checked)}
              />
              <span className="slider round"></span>
            </label>
            <label htmlFor="showDeleted">Exibir Excluídos</label>
          </div>
          <button
            className="refresh-button"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <FaSync />
            {isLoading ? "" : " Atualizar Tabela"}
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <Table
        data={paginatedStudents}
        columns={columns}
        itemsPerPage={pagination.itemsPerPage}
        loading={isLoading}
        isSortable={true}
        getActionItems={getActionItems}
        handleSort={handleSort}
        sortColumn={sortColumn}
        sortOrder={sortOrder}
        menuHeight={200}
      />

      {pdfAttachmentUrl && (
        <div className="iframe-modal-overlay" onClick={() => setPdfAttachmentUrl(null)}>
          <div className="iframe-modal-content" onClick={(e) => e.stopPropagation()}>
            <iframe
              src={pdfAttachmentUrl}
              width="100%"
              height="500px"
              title="PDF de Anexo"
            />
            <button onClick={() => setPdfAttachmentUrl(null)} className="iframe-close-button">
              x
            </button>
          </div>
        </div>
      )}

      {pdfUrl && (
        <div className="iframe-modal-overlay" onClick={() => setPdfUrl(null)}>
          <div className="iframe-modal-content" onClick={(e) => e.stopPropagation()}>
            <ContractView
              student={pdfUrl.student}
              polo={pdfUrl.polo}
              allCategory={pdfUrl.allCategory}
              officesDescription={pdfUrl.officesDescription}
            />
            <button onClick={() => setPdfUrl(null)} className="iframe-close-button">x</button>
          </div>
        </div>
      )}

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

      {isModalOpen && (
        <EditStudentModal
          student={editingStudent}
          onClose={handleCloseModal}
          onSave={handleSaveModal}
        />
      )}

      <Modal
        isOpen={isDetailsModalOpen}
        onRequestClose={() => setIsDetailsModalOpen(false)}
        contentLabel="Detalhes do Aluno"
        className="modal-student-details"
        overlayClassName="modal-overlay-student-details"
      >
        <div className="student-details">
          <h2>Detalhes do Aluno</h2>
          <div className="modal-header">
            <div className="modal-buttons">
              <button onClick={handlePrint} className="button">
                Imprimir
              </button>
            </div>
          </div>

          {selectedStudent && (
            <div className="details-content">
              <fieldset>
                <legend>Informações Pessoais</legend>
                <div className="details-row">
                  <ul>
                    <li><strong>ID:</strong> {selectedStudent.id}</li>
                    <li><strong>Nome Completo:</strong> {selectedStudent.first_name} {selectedStudent.last_name}</li>
                    <li><strong>Data de Nascimento:</strong> {new Date(selectedStudent.birthdate).toLocaleDateString('pt-BR')}</li>
                    <li><strong>Gênero:</strong> {selectedStudent.gender === 'male' ? 'Masculino' : 'Feminino'}</li>
                  </ul>
                  <ul>
                    <li><strong>Email:</strong> {selectedStudent.email}</li>
                    <li><strong>Telefone:</strong> {selectedStudent.phone_number}</li>
                    <li>
                      <strong>Status:</strong> {selectedStudent.deleted_at ? (
                        <>
                          Inativo (Excluído em: {new Date(selectedStudent.deleted_at).toLocaleString('pt-BR')})
                        </>
                      ) : 'Ativo'}
                    </li>
                    <li><strong>Oficinas:</strong> {selectedStudent.categories && selectedStudent.categories.length > 0 ? selectedStudent.categories.map(category => category.name).join(", ") : "Nenhuma"}</li>
                  </ul>
                </div>
              </fieldset>
              <fieldset>
                <legend>Filiação</legend>
                <div className="details-row">
                  <ul>
                    <li><strong>Nome do Pai:</strong> {selectedStudent.father_name}</li>
                    <li><strong>Nome da Mãe:</strong> {selectedStudent.mother_name}</li>
                    <li><strong>Pode ir embora sozinho:</strong> {selectedStudent.can_go_home ? 'Sim' : 'Não'}</li>
                  </ul>
                </div>
              </fieldset>
              <fieldset>
                <legend>Endereço</legend>
                <div className="details-row">
                  <ul>
                    <li><strong>Rua:</strong> {selectedStudent.street}</li>
                    <li><strong>Número:</strong> {selectedStudent.number}</li>
                    <li><strong>Complemento:</strong> {selectedStudent.complement}</li>
                  </ul>
                  <ul>
                    <li><strong>Bairro:</strong> {selectedStudent.neighborhood}</li>
                    <li><strong>Cidade:</strong> {selectedStudent.city}</li>
                    <li><strong>Estado:</strong> {selectedStudent.state}</li>
                    <li><strong>CEP:</strong> {selectedStudent.zip_code}</li>
                  </ul>
                </div>
              </fieldset>
              <fieldset>
                <legend>Responsáveis</legend>
                {selectedStudent.responsibles && selectedStudent.responsibles.length > 0 ? (
                  <table className="responsibles-table">
                    <thead>
                      <tr>
                        <th>Nome</th>
                        <th>Parentesco</th>
                        <th>Email</th>
                        <th>Telefone</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedStudent.responsibles.map((responsible) => (
                        <tr key={responsible.id}>
                          <td>{responsible.first_name} {responsible.last_name}</td>
                          <td>{responsible.relation}</td>
                          <td>{responsible.email}</td>
                          <td>{responsible.phone_number || 'Não informado'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>Nenhum responsável cadastrado.</p>
                )}
              </fieldset>
            </div>
          )}
        </div>
      </Modal>

      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        student={selectedContactStudent}
      />
    </div>
  );

}

export default ListStudents;