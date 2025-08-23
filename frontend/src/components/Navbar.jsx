import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname === path) return true;
    return false;
  };

  return (
    <header className="bg-light border-bottom">
      <div className="container py-3">
        <div className="d-flex justify-content-between align-items-center">
          <Link to="/" className="h4 text-primary text-decoration-none">
            ResumeAnalyzer
          </Link>
          <div className="d-flex">
            <Link
              to="/"
              className={`btn ${isActive('/') ? ' text-primary fw-bold' : 'fw-light text-dark'} btn-link text-decoration-none`}
            >
              Home
            </Link>
            <Link
              to="/job"
              className={`btn ${isActive('/job') ? ' text-primary fw-bold' : 'fw-light text-dark'} btn-link text-decoration-none`}
            >
              Job
            </Link>
            <Link
              to="/about"
              className={`btn ${isActive('/about') ? ' text-primary fw-bold' : 'fw-light text-dark'} btn-link text-decoration-none`}
            >
              About
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
