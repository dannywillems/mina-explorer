import type { ReactNode } from 'react';

export function Footer(): ReactNode {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark text-light py-4 mt-auto">
      <div className="container">
        <div className="row">
          <div className="col-md-4 mb-3 mb-md-0">
            <h5 className="mb-3 text-white">Mina Explorer</h5>
            <p className="text-light opacity-75 small mb-2">
              Open-source blockchain explorer for the Mina Protocol network.
            </p>
            <p className="text-light opacity-75 small mb-0">
              Built by{' '}
              <a
                href="https://o1labs.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white"
              >
                o1Labs
              </a>
            </p>
          </div>
          <div className="col-md-4 mb-3 mb-md-0">
            <h6 className="text-light opacity-75 mb-3">Resources</h6>
            <ul className="list-unstyled small">
              <li className="mb-2">
                <a
                  href="https://minaprotocol.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-light opacity-75 text-decoration-none link-hover"
                >
                  Mina Protocol
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="https://docs.minaprotocol.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-light opacity-75 text-decoration-none link-hover"
                >
                  Documentation
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="https://github.com/MinaProtocol/mina"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-light opacity-75 text-decoration-none link-hover"
                >
                  Mina GitHub
                </a>
              </li>
            </ul>
          </div>
          <div className="col-md-4">
            <h6 className="text-light opacity-75 mb-3">Connect</h6>
            <ul className="list-unstyled small">
              <li className="mb-2">
                <a
                  href="https://github.com/dannywillems/mina-explorer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-light opacity-75 text-decoration-none link-hover"
                >
                  Explorer GitHub
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="https://discord.gg/minaprotocol"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-light opacity-75 text-decoration-none link-hover"
                >
                  Discord
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="https://twitter.com/MinaProtocol"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-light opacity-75 text-decoration-none link-hover"
                >
                  Twitter
                </a>
              </li>
            </ul>
          </div>
        </div>
        <hr className="my-3 border-secondary" />
        <div className="row">
          <div className="col-12 text-center">
            <p className="text-light opacity-50 small mb-0">
              &copy; {currentYear} Mina Explorer. Open source under MIT License.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
