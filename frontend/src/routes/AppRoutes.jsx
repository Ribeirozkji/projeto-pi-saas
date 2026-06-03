import { Navigate, Route, Routes } from 'react-router-dom';

import MainLayout from '../components/MainLayout.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import Products from '../pages/Products.jsx';
import ProductForm from '../pages/ProductForm.jsx';
import Categories from '../pages/Categories.jsx';
import Suppliers from '../pages/Suppliers.jsx';
import StockMovements from '../pages/StockMovements.jsx';
import Sales from '../pages/Sales.jsx';
import SaleReceipt from '../pages/SaleReceipt.jsx';
import Reports from '../pages/Reports.jsx';
import Users from '../pages/Users.jsx';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/dashboard" replace />} />

      <Route element={<MainLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/new" element={<ProductForm />} />
        <Route path="/products/:id/edit" element={<ProductForm />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/stock" element={<StockMovements />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/sales/:id/receipt" element={<SaleReceipt />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/users" element={<Users />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default AppRoutes;
