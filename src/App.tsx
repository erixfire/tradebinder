import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@store/authStore';
import Layout from '@components/layout/Layout';
import Home from '@pages/Home';
import Login from '@pages/Login';
import Register from '@pages/Register';
import Dashboard from '@pages/Dashboard';
import Cards from '@pages/Cards';
import CardDetail from '@pages/CardDetail';
import Inventory from '@pages/Inventory';
import Orders from '@pages/Orders';
import OrderDetail from '@pages/OrderDetail';
import Wishlist from '@pages/Wishlist';
import Profile from '@pages/Profile';
import POS from '@pages/POS';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
        
        {/* Protected Routes */}
        <Route path="dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="cards" element={<Cards />} />
        <Route path="cards/:id" element={<CardDetail />} />
        <Route path="inventory" element={isAuthenticated ? <Inventory /> : <Navigate to="/login" />} />
        <Route path="orders" element={isAuthenticated ? <Orders /> : <Navigate to="/login" />} />
        <Route path="orders/:id" element={isAuthenticated ? <OrderDetail /> : <Navigate to="/login" />} />
        <Route path="wishlist" element={isAuthenticated ? <Wishlist /> : <Navigate to="/login" />} />
        <Route path="profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
        <Route path="pos" element={isAuthenticated ? <POS /> : <Navigate to="/login" />} />
      </Route>
    </Routes>
  );
}

export default App;
