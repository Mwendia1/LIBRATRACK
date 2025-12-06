import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <>
      <style>
        {`
          nav {
            background: #ffffff;
            border-bottom: 2px solid #e5e5e5;
            padding: 14px 20px;
            display: flex;
            gap: 18px;
            align-items: center;
            font-family: Arial, sans-serif;
          }

          nav:hover {
            background: #f8f9ff;
            transition: background 0.3s ease;
          }

          nav a {
            text-decoration: none;
            font-weight: 600;
            color: #333;
            padding: 8px 14px;
            border-radius: 6px;
            letter-spacing: 0.3px;
            transition: 0.3s ease;
          }

          nav a:hover {
            background: #4f46e5;
            color: white;
          }

          nav a:active {
            transform: scale(0.96);
          }
        `}
      </style>

      <nav style={{ display: "flex", gap: 12, padding: 12, background: "#fff" }}>
        <Link to="/">Home</Link>
        <Link to="/books">Books</Link>
        <Link to="/members">Members</Link>
        <Link to="/borrow">Borrow</Link>
        <Link to="/register">Register</Link>
      </nav>
    </>
  );
}
