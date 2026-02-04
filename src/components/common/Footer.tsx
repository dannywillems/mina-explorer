import type { ReactNode } from 'react';

export function Footer(): ReactNode {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card py-8">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h5 className="mb-3 font-semibold">Mina Explorer</h5>
            <p className="mb-2 text-sm text-muted-foreground">
              Open-source blockchain explorer for the Mina Protocol network.
            </p>
            <p className="text-sm text-muted-foreground">
              Built by{' '}
              <a
                href="https://o1labs.org"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground hover:underline"
              >
                o1Labs
              </a>
            </p>
          </div>

          <div>
            <h6 className="mb-3 text-sm font-medium text-muted-foreground">
              Resources
            </h6>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://minaprotocol.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Mina Protocol
                </a>
              </li>
              <li>
                <a
                  href="https://docs.minaprotocol.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/MinaProtocol/mina"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Mina GitHub
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h6 className="mb-3 text-sm font-medium text-muted-foreground">
              Connect
            </h6>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://github.com/dannywillems/mina-explorer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Explorer GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://discord.gg/minaprotocol"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Discord
                </a>
              </li>
              <li>
                <a
                  href="https://twitter.com/MinaProtocol"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Twitter
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} Mina Explorer. Open source under MIT License.
          </p>
        </div>
      </div>
    </footer>
  );
}
