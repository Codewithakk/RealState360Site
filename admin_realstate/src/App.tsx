import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Houses from './pages/Houses';
import Submissions from './pages/Submissions';
import Register from './pages/Register';
import WebSettings from './pages/Websetting';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('admin_token');
  return token ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="houses" element={<Houses />} />
          <Route path="submissions" element={<Submissions />} />
          <Route path="websetting" element={<WebSettings />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;