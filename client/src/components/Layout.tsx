import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

// The dashboard (My Listings) page owns its own full-height layout, with the
// sidebar stretching down beside its content and its own Footer instance, so
// the sidebar can reach all the way to the footer's bottom edge.
const ROUTES_WITH_OWN_FOOTER = ['/my-listings'];

export default function Layout() {
  const location = useLocation();
  const ownsFooter = ROUTES_WITH_OWN_FOOTER.includes(location.pathname);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />
      <div className="flex flex-1 flex-col">
        <Outlet />
      </div>
      {!ownsFooter && <Footer />}
    </div>
  );
}