import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Browse from './pages/Browse';
import PublishItem from './pages/PublishItem';
import MyListings from './pages/MyListings';
import Inquiries from './pages/Inquiries';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="browse" element={<Browse />} />

          <Route element={<ProtectedRoute />}>
            <Route path="publish" element={<PublishItem />} />
            <Route path="my-listings" element={<MyListings />} />
            <Route path="inquiries" element={<Inquiries />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;