import { useState, FormEvent } from 'react';
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
    <div className="import-page">
      <header className="page-header">
        <h1>📥 Import Inventory</h1>
        <a href="/inventory" className="btn-secondary">← Back to Inventory</a>
      </header>

      <main className="import-content">
        <div className="import-card">
          <h2>ManaBox CSV Import</h2>
          <p className="import-description">
            Upload a CSV file exported from ManaBox to bulk import your MTG card inventory.
          </p>

          <div className="format-info">
            <h3>Expected CSV Format:</h3>
            <p>Your CSV should include these columns from ManaBox:</p>
            <ul>
              <li><strong>Name</strong> - Card name (required)</li>
              <li><strong>Set code</strong> - Set abbreviation (required)</li>
              <li><strong>Scryfall ID</strong> - Unique card identifier (required)</li>
              <li><strong>Quantity</strong> - Number of cards (required)</li>
              <li><strong>Condition</strong> - Card condition (required)</li>
              <li><strong>Foil</strong> - "foil" or "normal"</li>
              <li><strong>Language</strong> - Language code (e.g., "en")</li>
              <li><strong>Purchase price</strong> - Cost per card</li>
              <li><strong>Set name</strong>, <strong>Collector number</strong>, <strong>Rarity</strong> - Additional info</li>
            </ul>
            <p className="note">
              <strong>Note:</strong> Cards will be priced at 1.5x the purchase price by default. 
              You can adjust prices later in the inventory page.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="import-form">
            <div className="file-input-container">
              <label htmlFor="csv-file" className="file-label">
                {file ? `📄 ${file.name}` : '📁 Choose CSV File'}
              </label>
              <input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="file-input"
              />
            </div>

            <button
              type="submit"
              disabled={!file || loading}
              className="btn-primary"
            >
              {loading ? '⏳ Importing...' : '🚀 Import CSV'}
            </button>
          </form>

          {error && (
            <div className="alert alert-error">
              <strong>❌ Error:</strong> {error}
            </div>
          )}

          {result && (
            <div className="import-results">
              <h3>✅ Import Complete</h3>
              <div className="results-grid">
                <div className="result-stat">
                  <span className="stat-label">Total Rows:</span>
                  <span className="stat-value">{result.total}</span>
                </div>
                <div className="result-stat success">
                  <span className="stat-label">Inserted:</span>
                  <span className="stat-value">{result.inserted}</span>
                </div>
                <div className="result-stat info">
                  <span className="stat-label">Updated:</span>
                  <span className="stat-value">{result.updated}</span>
                </div>
                <div className="result-stat warning">
                  <span className="stat-label">Skipped:</span>
                  <span className="stat-value">{result.skipped}</span>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div className="errors-section">
                  <h4>⚠️ Errors ({result.errors.length}):</h4>
                  <ul className="error-list">
                    {result.errors.slice(0, 20).map((err, idx) => (
                      <li key={idx}>
                        <strong>Row {err.row}:</strong> {err.message}
                      </li>
                    ))}
                  </ul>
                  {result.errors.length > 20 && (
                    <p className="more-errors">
                      ...and {result.errors.length - 20} more errors
                    </p>
                  )}
                </div>
              )}

              <div className="result-actions">
                <a href="/inventory" className="btn-primary">View Inventory</a>
                <button 
                  onClick={() => { setResult(null); setFile(null); }}
                  className="btn-secondary"
                >
                  Import Another File
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
