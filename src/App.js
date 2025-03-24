import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import Login from './components/Login/Login';
import Dashboard from './components/Dashboard/Dashboard';
import Sidebar from './components/SideBar/SideBar';
import Header from './components/Header/Header';

import ListCategories from './components/Category/ListCategories/ListCategories';
import AddCategory from './components/Category/AddCategory/AddCategory';

import AddCourse from './components/Course/AddCourse/AddCourse';
import ListCourses from './components/Course/ListCourses/ListCourses';

import ListStudent from './components/Student/ListStudent/ListStudent';
import AddStudent from './components/Student/AddStudent/AddStudent';

import UserManager from './components/User/UserManager/UserManager';
import ListUsers from './components/User/ListUser/ListUsers';

import Attendance from './components/Attendance/AttendanceList/AttendanceList';
import ListRequest from './components/Requests/ListRequest/ListRequest';
import ReportPage from './components/Reports/ReportPage';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userType, setUserType] = useState(null);
  const [userName, setUserName] = useState(null);
  const [poloName, setPoloName] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [hasRequests, setHasRequests] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setUserType("admin");
    setUserName("renanfdev");
    setPoloName("Polo Fictício");
  };

  const toggleSidebar = () => setIsSidebarOpen(prevState => !prevState);

  const handleMouseEnter = () => !isMobile && setIsSidebarOpen(true);
  const handleMouseLeave = () => !isMobile && setIsSidebarOpen(false);

  return (
    <Router>
      <div className={`app-container ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        {isLoggedIn && (
          <>
            <Sidebar
              isOpen={isSidebarOpen}
              toggleSidebar={toggleSidebar}
              setIsLoggedIn={setIsLoggedIn}
              userType={userType}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              hasRequests={hasRequests}
            />
            <Header userName={userName} userType={userType} poloName={poloName} />
          </>
        )}

        <div className="main-content">
          <Routes>
            <Route
              path="/"
              element={isLoggedIn ? <Navigate to={isMobile ? "/chamadas" : "/dashboard"} /> : <Login setIsLoggedIn={handleLoginSuccess} />}
            />
            <Route path="/chamadas" element={<Attendance />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/listar-oficinas" element={<ListCategories />} />
            <Route path="/criar-oficina" element={<AddCategory />} />
            <Route path="/criar-aula" element={<AddCourse />} />
            <Route path="/adicionar-turma" element={<AddCourse />} />
            <Route path="/listar-turmas" element={<ListCourses />} />
            <Route path="/adicionar-aluno" element={<AddStudent />} />
            <Route path="/alunos" element={<ListStudent />} />
            <Route path="/adicionar-usuario" element={<UserManager />} />
            <Route path="/listar-usuarios" element={<ListUsers />} />
            <Route path="/solicitacoes" element={<ListRequest />} />
            <Route path="/relatorios" element={<ReportPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;