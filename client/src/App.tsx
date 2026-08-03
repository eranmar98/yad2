import Navbar from './components/Navbar';
import Hero from './components/Hero';
import StatsBar from './components/StatsBar';

function App() {
  return (
    <div className="min-h-screen bg-white">
      <StatsBar />
      <Navbar />
      <Hero />
    </div>
  );
}

export default App;