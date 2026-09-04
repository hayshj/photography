import { lazy, Suspense } from 'react';
import Home from './pages/Home';
import { Routes, Route } from 'react-router-dom';
import Footer from './components/Footer';
import { PageLoadingState } from './components/LoadingStates';
import './App.css';

const Contact = lazy(() => import('./pages/Contact'));
const Galleries = lazy(() => import('./pages/Galleries'));
const GalleryPage = lazy(() => import('./pages/GalleryPage'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const CreateGallery = lazy(() => import('./pages/CreateGallery'));
const EditGallery = lazy(() => import('./pages/EditGallery'));
const NotFound = lazy(() => import('./pages/NotFound'));
const RequireAdmin = lazy(() => import('./components/RequireAdmin'));


function App() {
  return (
    <>
      <Suspense fallback={<PageLoadingState />}>
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
      </Suspense>
      <Footer />
    </>
  );
}

export default App;
