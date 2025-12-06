import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Books from "./pages/Books";
import Members from "./pages/Members";
import Borrow from "./pages/Borrow";
import Register from "./pages/register";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/books" element={<Books />} />
          <Route path="/members" element={<Members />} />
          <Route path="/borrow" element={<Borrow />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
