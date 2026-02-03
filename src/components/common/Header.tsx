import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { SearchBar } from './SearchBar';
import { NetworkSelector } from './NetworkSelector';

export function Header(): ReactNode {
  return (
    <header className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link to="/" className="navbar-brand d-flex align-items-center">
          <i className="bi bi-box me-2"></i>
          Mina Explorer
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link to="/blocks" className="nav-link">
                <i className="bi bi-boxes me-1"></i>
                Blocks
              </Link>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-3">
            <SearchBar className="d-none d-lg-block" />
            <NetworkSelector />
          </div>
        </div>
      </div>
    </header>
  );
}
