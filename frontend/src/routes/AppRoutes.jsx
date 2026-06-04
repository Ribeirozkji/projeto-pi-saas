import { Navigate, Route, Routes } from 'react-router-dom';

import MainLayout from '../components/MainLayout.jsx';
import Categories from '../pages/Categories.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import Login from '../pages/Login.jsx';
import ProductForm from '../pages/ProductForm.jsx';
import Products from '../pages/Products.jsx';
import Reports from '../pages/Reports.jsx';
import SaleReceipt from '../pages/SaleReceipt.jsx';
import Sales from '../pages/Sales.jsx';
import StockMovements from '../pages/StockMovements.jsx';
import Suppliers from '../pages/Suppliers.jsx';
import Users from '../pages/Users.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />

          <Route element={<ProtectedRoute allowedRoles={['admin', 'gerente']} />}>
            <Route path="/products/new" element={<ProductForm />} />
            <Route path="/products/:id/edit" element={<ProductForm />} />
          </Route>

          <Route path="/categories" element={<Categories />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/stock" element={<StockMovements />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/sales/:id/receipt" element={<SaleReceipt />} />

          <Route element={<ProtectedRoute allowedRoles={['admin', 'gerente']} />}>
            <Route path="/reports" element={<Reports />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/users" element={<Users />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default AppRoutes;
