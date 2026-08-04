import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import StatsBar from './StatsBar';

export default function Layout() {
  return (
    <div className="min-h-screen bg-white">
      <StatsBar />
      <Navbar />
      <Outlet />
    </div>
  );
}
