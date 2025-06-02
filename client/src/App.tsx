import { Routes, Route, Link } from "react-router-dom";

// Pages
import { Home } from "./pages/index";
import { Campaign } from "./pages/campaign";

// Optional: Global layout styling
const App = () => {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <header className="bg-white shadow-md p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-purple-600">🕷️ HeadlessSpider.io</h1>
        <nav className="space-x-4">
          <Link to="/" className="text-sm hover:underline">
            Home
          </Link>
          <Link to="/campaign" className="text-sm hover:underline">
            Campaign
          </Link>
        </nav>
      </header>

      <main className="p-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/campaign" element={<Campaign />} />
        </Routes>
      </main>

      <footer className="text-center text-xs text-gray-500 mt-8 pb-4">
        © {new Date().getFullYear()} HeadlessSpider.io. All rights reserved.
      </footer>
    </div>
  );
};

export default App;
