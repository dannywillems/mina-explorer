import type { ReactNode } from 'react';

export function Footer(): ReactNode {
  return (
    <footer className="bg-dark text-light py-4 mt-auto">
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <h5>Mina Explorer</h5>
            <p className="text-muted mb-0">
              A blockchain explorer for the Mina Protocol network.
            </p>
            <p className="text-muted mb-0 mt-2">
              Built by{' '}
              <a
                href="https://o1labs.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-light"
              >
                o1Labs
              </a>
            </p>
          </div>
          <div className="col-md-6 text-md-end">
            <p className="text-muted mb-2">
              <a
                href="https://minaprotocol.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted"
              >
                Mina Protocol
              </a>
            </p>
            <p className="text-muted mb-0">
              <a
                href="https://github.com/o1-labs"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted me-3"
              >
                <i className="bi bi-github"></i> GitHub
              </a>
              <a
                href="https://twitter.com/oaborisov"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted"
              >
                <i className="bi bi-twitter-x"></i> Twitter
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
