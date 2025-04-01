import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { TrashBinProvider } from './contexts/TrashBinContext';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import TrashBinDetail from './components/TrashBinDetail';
import TrashBinForm from './components/TrashBinForm';
import ProtectedRoute from './components/ProtectedRoute';
import TrashStatus from './components/TrashStatus';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <TrashBinProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/trash-bins/:id" element={<TrashBinDetail />} />
              <Route path="/trash-bins/new" element={<TrashBinForm />} />
              <Route path="/trash-bins/edit/:id" element={<TrashBinForm />} />
              <Route path='/trash-status' element={<TrashStatus />} />
            </Route>
            
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </TrashBinProvider>
    </AuthProvider>
  );
};

export default App;

// import React, { useEffect, useState } from "react";

// const App: React.FC = () => {
//     const [status, setStatus] = useState("Normal");

//     useEffect(() => {
//         const ws = new WebSocket("ws://localhost:5000");

//         ws.onmessage = (event) => {
//             const message = event.data;
//             if (message === "full") {
//                 setStatus("Trash Bin is Full!");
//             }
//         };

//         return () => ws.close();
//     }, []);

//     return (
//         <div>
//             <h1>Smart Trash Bin</h1>
//             <p>Status: {status}</p>
//         </div>
//     );
// };

// export default App;
