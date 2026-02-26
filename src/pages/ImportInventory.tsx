import { useState, FormEvent } from 'react';
import Navigation from '../components/Navigation';
import './ImportInventory.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

interface ImportResult {
  total: number;
  inserted: number;
  updated: number;
  skipped: number;
  errors: { row: number; message: string }[];
}

export default function ImportInventory() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a CSV file');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Not authenticated. Please login.');
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_URL}/api/inventory/import`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Import failed');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to import CSV');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navigation />
      <div className="import-page">
        <header className="page-header">
          <h1>📥 Import Inventory</h1>
          <p className="page-subtitle">Bulk import your MTG collection from ManaBox CSV</p>
        </header>

        <main className="import-content">
          <div className="import-card">
            <div className="card-header">
              <h2>📊 ManaBox CSV Import</h2>
              <p>Upload your collection data and let us handle the rest</p>
            </div>

            <div className="format-info">
              <h3>📋 Required CSV Columns</h3>
              <div className="column-grid">
                <div className="column-item required">
                  <span className="column-icon">✅</span>
                  <strong>Name</strong> - Card name
                </div>
                <div className="column-item required">
                  <span className="column-icon">✅</span>
                  <strong>Set code</strong> - Set abbreviation
                </div>
                <div className="column-item required">
                  <span className="column-icon">✅</span>
                  <strong>Scryfall ID</strong> - Unique identifier
                </div>
                <div className="column-item required">
                  <span className="column-icon">✅</span>
                  <strong>Quantity</strong> - Number of cards
                </div>
                <div className="column-item required">
                  <span className="column-icon">✅</span>
                  <strong>Condition</strong> - Card condition
                </div>
                <div className="column-item optional">
                  <span className="column-icon">⭐</span>
                  <strong>Foil</strong> - foil/normal
                </div>
                <div className="column-item optional">
                  <span className="column-icon">⭐</span>
                  <strong>Purchase price</strong> - Cost per card
                </div>
                <div className="column-item optional">
                  <span className="column-icon">⭐</span>
                  <strong>Language</strong> - Language code
                </div>
              </div>
              <div className="pricing-note">
                💰 <strong>Auto-pricing:</strong> Cards are priced at 1.5x purchase price by default
              </div>
            </div>

            <form onSubmit={handleSubmit} className="import-form">
              <div className="file-input-container">
                <input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="file-input"
                />
                <label htmlFor="csv-file" className="file-label">
                  {file ? (
                    <>
                      <span className="file-icon">📄</span>
                      <span className="file-name">{file.name}</span>
                    </>
                  ) : (
                    <>
                      <span className="upload-icon">📁</span>
                      <span>Click to choose CSV file or drag & drop</span>
                    </>
                  )}
                </label>
              </div>

              <button
                type="submit"
                disabled={!file || loading}
                className="btn-import"
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Importing...
                  </>
                ) : (
                  <>
                    <span>🚀</span>
                    Import CSV
                  </>
                )}
              </button>
            </form>

            {error && (
              <div className="alert alert-error">
                <span className="alert-icon">❌</span>
                <div>
                  <strong>Import Failed</strong>
                  <p>{error}</p>
                </div>
              </div>
            )}

            {result && (
              <div className="import-results">
                <div className="results-header">
                  <span className="success-icon">✅</span>
                  <h3>Import Complete!</h3>
                </div>
                
                <div className="results-grid">
                  <div className="result-stat total">
                    <span className="stat-icon">📊</span>
                    <div>
                      <span className="stat-label">Total Rows</span>
                      <span className="stat-value">{result.total}</span>
                    </div>
                  </div>
                  <div className="result-stat success">
                    <span className="stat-icon">➕</span>
                    <div>
                      <span className="stat-label">Inserted</span>
                      <span className="stat-value">{result.inserted}</span>
                    </div>
                  </div>
                  <div className="result-stat info">
                    <span className="stat-icon">🔄</span>
                    <div>
                      <span className="stat-label">Updated</span>
                      <span className="stat-value">{result.updated}</span>
                    </div>
                  </div>
                  <div className="result-stat warning">
                    <span className="stat-icon">⚠️</span>
                    <div>
                      <span className="stat-label">Skipped</span>
                      <span className="stat-value">{result.skipped}</span>
                    </div>
                  </div>
                </div>

                {result.errors.length > 0 && (
                  <div className="errors-section">
                    <h4>⚠️ Errors ({result.errors.length})</h4>
                    <div className="error-list">
                      {result.errors.slice(0, 10).map((err, idx) => (
                        <div key={idx} className="error-item">
                          <span className="error-row">Row {err.row}</span>
                          <span className="error-message">{err.message}</span>
                        </div>
                      ))}
                    </div>
                    {result.errors.length > 10 && (
                      <p className="more-errors">
                        + {result.errors.length - 10} more errors
                      </p>
                    )}
                  </div>
                )}

                <div className="result-actions">
                  <button 
                    onClick={() => { setResult(null); setFile(null); }}
                    className="btn-secondary"
                  >
                    🔄 Import Another
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
