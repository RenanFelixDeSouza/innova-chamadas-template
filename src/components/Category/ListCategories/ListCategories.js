import React, { useState, useEffect, useCallback } from "react";
import "./ListCategories.css";
import EditCategoryModal from "../Modal/EditCategoryModal";
import LoadingSpinner from "../../LoadingSpinner/LoadingSpinner";
import Table from "../../Shared/Table.js";
import { FaSync } from 'react-icons/fa';

function ListCategories() {
    const [categories, setCategories] = useState([
        { id: 1, name: "Matemática", description: "Oficina de Matemática" },
        { id: 2, name: "Português", description: "Oficina de Português" },
        { id: 3, name: "História", description: "Oficina de História" },
        { id: 4, name: "Geografia", description: "Oficina de Geografia" },
        { id: 5, name: "Ciências", description: "Oficina de Ciências" },
    ]); // Dados fictícios
    const [filterName, setFilterName] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortColumn, setSortColumn] = useState("id");
    const [sortOrder, setSortOrder] = useState("asc");

    const fetchCategories = useCallback(() => {
        setError(null);
        try {
            // Simula carregamento de dados fictícios
            setTimeout(() => {
                const filteredCategories = categories.filter(category =>
                    category.name.toLowerCase().includes(filterName.toLowerCase())
                );

                const paginatedCategories = filteredCategories.slice(
                    (currentPage - 1) * itemsPerPage,
                    currentPage * itemsPerPage
                );

                setPagination({
                    currentPage,
                    totalPages: Math.ceil(filteredCategories.length / itemsPerPage),
                    totalItems: filteredCategories.length,
                    itemsPerPage,
                });

                setCategories(paginatedCategories); 
            }, 500);
        } catch (error) {
            console.error("Erro ao buscar oficinas:", error);
            setError("Erro ao carregar as oficinas.");
            setIsLoading(false);
        }
    }, [categories, filterName, currentPage, itemsPerPage]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleEdit = (categoryId) => {
        const categoryToEdit = categories.find((category) => category.id === categoryId);
        setEditingCategory(categoryToEdit);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
    };

    const handleSaveModal = (updatedCategory) => {
        setCategories((prevCategories) =>
            prevCategories.map((category) =>
                category.id === updatedCategory.id ? updatedCategory : category
            )
        );
        handleRefresh();
    };

    const handleRefresh = useCallback(() => {
        setIsLoading(true);
        setTimeout(() => {
            fetchCategories();
            setCurrentPage(1);
            setIsLoading(false);
        }, 500);
    }, [fetchCategories]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (event) => {
        setItemsPerPage(Number(event.target.value));
        setCurrentPage(1);
    };

    const handleSort = (column) => {
        const columnDefinition = columns.find(c => c.key === column);
        if (columnDefinition && columnDefinition.sortable) {
            if (sortColumn === column) {
                if (sortOrder === 'asc') {
                    setSortOrder('desc');
                } else if (sortOrder === 'desc') {
                    setSortColumn(null);
                    setSortOrder('asc');
                } else {
                    setSortOrder('asc');
                }
            } else {
                setSortColumn(column);
                setSortOrder('asc');
            }
            setCurrentPage(1);
        }
    };

    const columns = [
        { key: "name", label: "Nome", sortable: true },
        {
            key: "description", 
            label: "Descrição", 
            sortable: false,
            render: (descriptions) => descriptions ?? "Sem Descrição"
        },
    ];

    const getActionItems = (categoryId) => [
        { label: "Editar", action: () => handleEdit(categoryId) },
    ];

    const handleFilterChange = (e) => {
        setFilterName(e.target.value);
        setCurrentPage(1); 
    };

    return (
        <div className="categories-list-container">
            <h2>Listar Oficinas</h2>
            <div className="header-container">
                <div className="filters-container">
                    <div className="filter-group">
                        <fieldset>
                            <legend>Nome da oficina:</legend>
                            <input
                                type="text"
                                placeholder="Filtrar por Nome"
                                value={filterName}
                                onChange={handleFilterChange}
                            />
                        </fieldset>
                    </div>
                    <button
                        className="refresh-button"
                        onClick={handleRefresh}
                        disabled={isLoading}
                    >
                        {isLoading ? <LoadingSpinner size="20px" /> : <><FaSync /> Atualizar</> }
                    </button>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <Table
                data={categories}
                columns={columns}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                isSortable={true}
                sortColumn={sortColumn}
                sortOrder={sortOrder}
                handleSort={handleSort}
                onPageChange={handlePageChange}
                loading={isLoading}
                error={error}
                getActionItems={getActionItems}
            />

            <div className="pagination">
                <button onClick={() => handlePageChange(1)} disabled={currentPage === 1}>{"<<"}</button>
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>{"<"}</button>
                <span>Página {currentPage} de {pagination.totalPages}</span>
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === pagination.totalPages}>{">"}</button>
                <button onClick={() => handlePageChange(pagination.totalPages)} disabled={currentPage === pagination.totalPages}>{">>"}</button>
            </div>

            <div className="items-per-page-selector">
                <label htmlFor="itemsPerPage">Itens por página: </label>
                <select
                    id="itemsPerPage"
                    value={itemsPerPage}
                    onChange={handleItemsPerPageChange}
                >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                </select>
            </div>

            {isModalOpen && (
                <EditCategoryModal
                    category={editingCategory}
                    onClose={handleCloseModal}
                    onSave={handleSaveModal}
                />
            )}
        </div>
    );
}

export default ListCategories;
