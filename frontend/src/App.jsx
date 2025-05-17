import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Contact from './pages/Contact';
import Galleries from './pages/Galleries';
import GalleryPage from './pages/GalleryPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import CreateGallery from './pages/CreateGallery';
import EditGallery from './pages/EditGallery';
import RequireAdmin from './components/RequireAdmin';
import Footer from './components/Footer';
import './App.css';

function App() {
  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/gallery" element={<Galleries />} />
        <Route path="/gallery/:id" element={<GalleryPage />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected Admin Routes */}
        <Route path="/admin" element={<RequireAdmin />}>
          <Route index element={<AdminDashboard />} />
          <Route path="create" element={<CreateGallery />} />
          <Route path="edit/:id" element={<EditGallery />} />
        </Route>
        
        {/* Catch-all route for 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
