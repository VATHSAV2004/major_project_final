import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import "./index.css";

const Header = () => {
  const [isToggleOpen, setIsToggleOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));
  const [userRole, setUserRole] = useState(localStorage.getItem("role") || null);
  const navigate = useNavigate();

  // ✅ Ensure component updates when localStorage changes
  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem("token"));
    setUserRole(localStorage.getItem("role"));
  }, [localStorage.getItem("token")]); // React re-renders when token changes

  const handleToggleOpen = () => {
    setIsToggleOpen(!isToggleOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    
    // ✅ Update state immediately
    setIsAuthenticated(false);
    setUserRole(null);

    navigate("/login");
  };

  const handleDashboardClick = (e) => {
    if (!isAuthenticated) {
      e.preventDefault(); // Prevent navigation
      navigate("/login");
    }
  };

  // ✅ Determine dashboard route dynamically
  const dashboardRoute =
    userRole === "admin" ? "/admin-dashboard" :
    userRole === "manager" ? "/manager-dashboard" :
    userRole === "volunteer" ? "/volunteer-dashboard" :
    "/user-dashboard";

  return (
    <header className="header-container">
      <div className="nav_logo">
        <button style={{
    background: 'none',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
    padding: '4px',
    marginRight: '8px'
  }} onClick={() => navigate(-1)}>🔙</button>
      
        <Link to="/" className="nav-logo-link">
        <img src="/logoheader.png" alt="EveOsmania Logo" style={{ height: '100px' }} />
        </Link>
        <button style={{
    background: 'none',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
    padding: '4px',
    marginRight: '8px'
  }} onClick={() => navigate(1)}>🔜</button>
      </div>

      <ul className={`nav-menu ${isToggleOpen ? "open" : ""}`}>
        <li>
          <Link to="/" className="nav-menu-list">Home</Link>
        </li>
        
        {/* ✅ Always present, dynamically links to the correct dashboard */}
        <li>
  <Link
    to={isAuthenticated ? dashboardRoute : "/login"}
    className={`nav-menu-list ${window.location.pathname === dashboardRoute ? "active-dashboard-link" : ""}`}
    onClick={handleDashboardClick}
  >
     Dashboard
  </Link>
</li>


        <li>
          <Link to="/about" className="nav-menu-list">About</Link>
        </li>
        <li><Link to="/verify" className="nav-menu-list">Verify</Link></li>

        {/* ✅ Instant Login/Logout Toggle */}
        {!isAuthenticated ? (
          <li>
            <Link to="/login" className="nav-menu-list login-button">Login</Link>
          </li>
        ) : (
          <li>
            <button className="nav-menu-list logout-button" onClick={handleLogout}>Logout</button>
          </li>
        )}
      </ul>

      <FaBars className="menuToggleBtn" onClick={handleToggleOpen} />
    </header>
  );
};

export default Header;
