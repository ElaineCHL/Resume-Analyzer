const Footer = () => {
  return (
    <footer className="bg-light text-center text-muted py-3 mt-5 border-top">
      <div className="container">
        <small>
          &copy; {new Date().getFullYear()} DCS Assignment &middot; Developed by Group 4
        </small>
      </div>
    </footer>
  );
};

export default Footer;
