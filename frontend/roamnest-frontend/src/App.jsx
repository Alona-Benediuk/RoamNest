import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/layout/Layout';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register'; // <-- Додано
import PropertyDetails from './pages/PropertyDetails';
import Profile from './pages/Profile';
import MyBookings from './pages/MyBookings';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import OwnerBookings from './pages/owner/OwnerBookings'; // <-- Додано
import AdminUsers from './pages/admin/AdminUsers';
import AdminProperties from './pages/admin/AdminProperties';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route element={<Layout />}>
                        <Route path="/" element={<Home />} />
                        <Route path="/properties/:id" element={<PropertyDetails />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} /> {/* <-- Додано */}
                    </Route>

                    <Route element={<ProtectedRoute allowedRoles={['USER', 'OWNER', 'ADMIN']} />}>
                        <Route element={<Layout />}>
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/my-bookings" element={<MyBookings />} />
                        </Route>
                    </Route>

                    <Route element={<ProtectedRoute allowedRoles={['OWNER']} />}>
                        <Route element={<Layout />}>
                            <Route path="/owner/dashboard" element={<OwnerDashboard />} />
                            <Route path="/owner/bookings" element={<OwnerBookings />} /> {/* <-- Додано */}
                        </Route>
                    </Route>

                    <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                        <Route element={<Layout />}>
                            <Route path="/admin/users" element={<AdminUsers />} />
                            <Route path="/admin/properties" element={<AdminProperties />} />
                        </Route>
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;