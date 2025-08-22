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
          <Link to="/" className="h4  text-primary text-decoration-none">
            ResumeAnalyzer
          </Link>
          <div className="d-flex gap-3">
            <Link
              to="/"
              className={`btn ${isActive('/') ? ' text-primary' : 'fw-light text-dark'} btn-link`}
            >
              Home
            </Link>
            <Link
              to="/job"
              className={`btn ${isActive('/job') ? ' text-primary' : 'fw-light text-dark'} btn-link`}
            >
              Job
            </Link>
            <Link
              to="/about"
              className={`btn ${isActive('/about') ? ' text-primary' : 'fw-light text-dark'} btn-link`}
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
