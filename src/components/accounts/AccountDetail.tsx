import { useState, type ReactNode } from 'react';
import { HashLink, Amount, LoadingSpinner } from '@/components/common';
import type { Account } from '@/types';

interface AccountDetailProps {
  account: Account | null;
  loading: boolean;
  error: string | null;
}

export function AccountDetail({
  account,
  loading,
  error,
}: AccountDetailProps): ReactNode {
  const [showJson, setShowJson] = useState(false);

  if (loading) {
    return <LoadingSpinner text="Loading account..." />;
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  if (!account) {
    return (
      <div className="alert alert-warning" role="alert">
        Account not found.
      </div>
    );
  }

  const isZkApp = account.zkappState && account.zkappState.length > 0;

  return (
    <div>
      <div className="card mb-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            Account
            {isZkApp && <span className="ms-2 badge bg-info">zkApp</span>}
          </h5>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setShowJson(!showJson)}
          >
            {showJson ? 'Hide JSON' : 'View JSON'}
          </button>
        </div>
        <div className="card-body">
          {showJson ? (
            <pre
              className="bg-dark text-light p-3 rounded"
              style={{
                maxHeight: '600px',
                overflow: 'auto',
                fontSize: '0.8rem',
              }}
            >
              {JSON.stringify(account, null, 2)}
            </pre>
          ) : (
            <>
              <div className="row mb-4">
                <div className="col-12">
                  <table className="table table-borderless table-sm">
                    <tbody>
                      <tr>
                        <th className="text-muted" style={{ width: '20%' }}>
                          Public Key
                        </th>
                        <td>
                          <span
                            className="font-monospace text-break"
                            style={{ fontSize: '0.85rem' }}
                          >
                            {account.publicKey}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <th className="text-muted">Balance</th>
                        <td>
                          <Amount value={account.balance.total} />
                        </td>
                      </tr>
                      {account.balance.liquid && (
                        <tr>
                          <th className="text-muted">Liquid Balance</th>
                          <td>
                            <Amount value={account.balance.liquid} />
                          </td>
                        </tr>
                      )}
                      {account.balance.locked && (
                        <tr>
                          <th className="text-muted">Locked Balance</th>
                          <td>
                            <Amount value={account.balance.locked} />
                          </td>
                        </tr>
                      )}
                      <tr>
                        <th className="text-muted">Nonce</th>
                        <td>{account.nonce}</td>
                      </tr>
                      {account.delegate && (
                        <tr>
                          <th className="text-muted">Delegate</th>
                          <td>
                            <HashLink hash={account.delegate} type="account" />
                          </td>
                        </tr>
                      )}
                      {account.tokenSymbol && (
                        <tr>
                          <th className="text-muted">Token Symbol</th>
                          <td>{account.tokenSymbol}</td>
                        </tr>
                      )}
                      {account.zkappUri && (
                        <tr>
                          <th className="text-muted">zkApp URI</th>
                          <td>
                            <a
                              href={account.zkappUri}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {account.zkappUri}
                            </a>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {isZkApp && account.zkappState && (
                <div className="mb-4">
                  <h6>zkApp State</h6>
                  <div className="table-responsive">
                    <table className="table table-sm table-bordered">
                      <thead>
                        <tr>
                          <th style={{ width: '80px' }}>Index</th>
                          <th>Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {account.zkappState.map((state, index) => (
                          <tr key={index}>
                            <td>{index}</td>
                            <td>
                              <span
                                className="font-monospace text-break"
                                style={{ fontSize: '0.8rem' }}
                              >
                                {state || '0'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {account.permissions && (
                <div className="mb-4">
                  <h6>Permissions</h6>
                  <div className="row">
                    {Object.entries(account.permissions).map(([key, value]) => (
                      <div key={key} className="col-md-4 col-sm-6 mb-2">
                        <small className="text-muted">{key}:</small>{' '}
                        <span className="badge bg-secondary">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {account.timing && (
                <div className="mb-4">
                  <h6>Vesting Schedule</h6>
                  <table className="table table-sm table-borderless">
                    <tbody>
                      <tr>
                        <th className="text-muted" style={{ width: '30%' }}>
                          Initial Minimum Balance
                        </th>
                        <td>
                          <Amount
                            value={account.timing.initialMinimumBalance}
                          />
                        </td>
                      </tr>
                      <tr>
                        <th className="text-muted">Cliff Time</th>
                        <td>{account.timing.cliffTime}</td>
                      </tr>
                      <tr>
                        <th className="text-muted">Cliff Amount</th>
                        <td>
                          <Amount value={account.timing.cliffAmount} />
                        </td>
                      </tr>
                      <tr>
                        <th className="text-muted">Vesting Period</th>
                        <td>{account.timing.vestingPeriod}</td>
                      </tr>
                      <tr>
                        <th className="text-muted">Vesting Increment</th>
                        <td>
                          <Amount value={account.timing.vestingIncrement} />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
