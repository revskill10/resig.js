import { useSignal, useComputed } from '../hooks';
import { signal } from '../signal';
import { useSyncExternalStore, useRef } from 'react';

// Excel-like grid with automatic formula calculation
function ExcelGridDemo() {
  // Grid dimensions
  const ROWS = 20;
  const COLS = 10;

  // Create a 2D grid of signals using refs to avoid hook violations
  const gridRef = useRef<ReturnType<typeof signal>[][]>();
  if (!gridRef.current) {
    gridRef.current = [];
    for (let row = 0; row < ROWS; row++) {
      gridRef.current[row] = [];
      for (let col = 0; col < COLS; col++) {
        gridRef.current[row][col] = signal<unknown>('');
      }
    }
  }

  const [selectedCell, setSelectedCell] = useSignal<{row: number, col: number} | null>(null);
  const [formulaBar, setFormulaBar] = useSignal('');
  
  // Convert column index to Excel-style letter (A, B, C, etc.)
  const getColumnLetter = (col: number): string => {
    return String.fromCharCode(65 + col);
  };
  
  // Parse cell reference like "A1" to {row: 0, col: 0}
  const parseCellRef = (ref: string): {row: number, col: number} | null => {
    const match = ref.match(/^([A-Z])(\d+)$/);
    if (!match) return null;
    const col = match[1].charCodeAt(0) - 65;
    const row = parseInt(match[2]) - 1;
    if (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
      return {row, col};
    }
    return null;
  };
  
  // Evaluate formula - supports SUM, AVERAGE, and cell references
  const evaluateFormula = (formula: string): string => {
    if (!formula.startsWith('=')) return formula;
    
    const expr = formula.slice(1); // Remove '='
    
    try {
      // Handle SUM function: =SUM(A1:A5)
      if (expr.startsWith('SUM(') && expr.endsWith(')')) {
        const range = expr.slice(4, -1);
        const [start, end] = range.split(':');
        const startCell = parseCellRef(start);
        const endCell = parseCellRef(end);
        
        if (startCell && endCell) {
          let sum = 0;
          for (let row = startCell.row; row <= endCell.row; row++) {
            for (let col = startCell.col; col <= endCell.col; col++) {
              const value = parseFloat(String(gridRef.current![row][col].value())) || 0;
              sum += value;
            }
          }
          return sum.toString();
        }
      }
      
      // Handle AVERAGE function: =AVERAGE(A1:A5)
      if (expr.startsWith('AVERAGE(') && expr.endsWith(')')) {
        const range = expr.slice(8, -1);
        const [start, end] = range.split(':');
        const startCell = parseCellRef(start);
        const endCell = parseCellRef(end);
        
        if (startCell && endCell) {
          let sum = 0;
          let count = 0;
          for (let row = startCell.row; row <= endCell.row; row++) {
            for (let col = startCell.col; col <= endCell.col; col++) {
              const value = parseFloat(String(gridRef.current![row][col].value())) || 0;
              sum += value;
              count++;
            }
          }
          return count > 0 ? (sum / count).toFixed(2) : '0';
        }
      }
      
      // Handle simple cell references and arithmetic: =A1+B1, =A1*2, etc.
      let processedExpr = expr;
      
      // Replace cell references with their values
      const cellRefRegex = /[A-Z]\d+/g;
      processedExpr = processedExpr.replace(cellRefRegex, (match) => {
        const cellRef = parseCellRef(match);
        if (cellRef) {
          const cellValue = gridRef.current![cellRef.row][cellRef.col].value();
          const numValue = parseFloat(String(cellValue)) || 0;
          return numValue.toString();
        }
        return '0';
      });
      
      // Evaluate the mathematical expression
      // Note: In production, use a proper expression parser for security
      const result = Function(`"use strict"; return (${processedExpr})`)();
      return isNaN(result) ? '#ERROR' : result.toString();
      
    } catch (error) {
      return '#ERROR';
    }
  };
  
  // Create computed values for display - we'll compute them on demand
  const getComputedValue = (row: number, col: number): string => {
    const value = gridRef.current![row][col].value();
    if (typeof value === 'string' && value.startsWith('=')) {
      return evaluateFormula(value);
    }
    return String(value);
  };

  // Statistics computed automatically from all cells
  const stats = useComputed(() => {
    let sum = 0;
    let count = 0;
    let min = Infinity;
    let max = -Infinity;

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const computedValue = getComputedValue(row, col);
        const value = parseFloat(computedValue) || 0;
        if (value !== 0) {
          sum += value;
          count++;
          min = Math.min(min, value);
          max = Math.max(max, value);
        }
      }
    }

    return {
      sum: sum.toFixed(2),
      count,
      average: count > 0 ? (sum / count).toFixed(2) : '0',
      min: min === Infinity ? '0' : min.toFixed(2),
      max: max === -Infinity ? '0' : max.toFixed(2)
    };
  });
  
  const handleCellClick = (row: number, col: number) => {
    setSelectedCell({row, col});
    setFormulaBar(String(gridRef.current![row][col].value()));
  };

  const handleCellChange = (row: number, col: number, value: string) => {
    gridRef.current![row][col]._set(value);
    if (selectedCell?.row === row && selectedCell?.col === col) {
      setFormulaBar(value);
    }
  };

  const handleFormulaBarChange = (value: string) => {
    setFormulaBar(value);
    if (selectedCell) {
      gridRef.current![selectedCell.row][selectedCell.col]._set(value);
    }
  };
  
  // Subscribe to grid changes for React updates
  const gridValues = gridRef.current.map(row =>
    row.map(cell => useSyncExternalStore(cell.subscribe, cell.value))
  );

  const fillSampleData = () => {
    // Fill column A with numbers 1-10
    for (let i = 0; i < 10; i++) {
      gridRef.current![i][0]._set((i + 1).toString());
    }

    // Fill column B with numbers 10-19
    for (let i = 0; i < 10; i++) {
      gridRef.current![i][1]._set((i + 10).toString());
    }

    // Add some formulas
    gridRef.current![10][0]._set('=SUM(A1:A10)'); // Sum of column A
    gridRef.current![10][1]._set('=SUM(B1:B10)'); // Sum of column B
    gridRef.current![10][2]._set('=A11+B11');     // Sum of the sums
    gridRef.current![11][0]._set('=AVERAGE(A1:A10)'); // Average of column A
    gridRef.current![11][1]._set('=AVERAGE(B1:B10)'); // Average of column B
    gridRef.current![12][0]._set('=A1*2');        // Simple formula
    gridRef.current![12][1]._set('=B1*B1');       // Square
  };
  
  return (
    <div className="demo-section">
      <h2>📊 Excel Grid (Automatic Formula Calculation)</h2>
      
      <div style={{ 
        background: '#e8f5e8', 
        padding: '15px', 
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #4caf50'
      }}>
        <h3>🚀 Performance Showcase</h3>
        <p>
          This Excel grid demonstrates Signal-Σ's strength: <strong>automatic dependency tracking</strong> 
          without manual optimization. Each cell is an independent signal, formulas automatically 
          recalculate when dependencies change, and the entire grid stays in sync effortlessly.
        </p>
        <p><strong>NO useEffect, NO dependency arrays, NO manual memoization!</strong></p>
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <button onClick={fillSampleData} style={{ 
          padding: '10px 20px', 
          background: '#4caf50', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px',
          cursor: 'pointer'
        }}>
          Fill Sample Data & Formulas
        </button>
      </div>
      
      {/* Formula Bar */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ fontWeight: 'bold', marginRight: '10px' }}>
          {selectedCell ? `${getColumnLetter(selectedCell.col)}${selectedCell.row + 1}:` : 'Formula Bar:'}
        </label>
        <input
          value={formulaBar}
          onChange={(e) => handleFormulaBarChange(e.target.value)}
          placeholder="Enter value or formula (e.g., =SUM(A1:A5))"
          style={{ 
            width: '400px', 
            padding: '8px', 
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}
        />
      </div>
      
      {/* Grid */}
      <div style={{ 
        border: '1px solid #ddd', 
        borderRadius: '4px',
        overflow: 'auto',
        maxHeight: '400px',
        marginBottom: '20px'
      }}>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th style={{ 
                background: '#f5f5f5', 
                border: '1px solid #ddd', 
                padding: '8px',
                minWidth: '40px'
              }}></th>
              {Array.from({length: COLS}, (_, col) => (
                <th key={col} style={{ 
                  background: '#f5f5f5', 
                  border: '1px solid #ddd', 
                  padding: '8px',
                  minWidth: '80px'
                }}>
                  {getColumnLetter(col)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({length: ROWS}, (_, row) => (
              <tr key={row}>
                <td style={{ 
                  background: '#f5f5f5', 
                  border: '1px solid #ddd', 
                  padding: '8px',
                  textAlign: 'center',
                  fontWeight: 'bold'
                }}>
                  {row + 1}
                </td>
                {Array.from({length: COLS}, (_, col) => (
                  <td key={col} style={{
                    border: '1px solid #ddd',
                    padding: '0',
                    background: selectedCell?.row === row && selectedCell?.col === col ? '#e3f2fd' : 'white',
                    position: 'relative',
                    minWidth: '100px',
                    height: '32px'
                  }}>
                    {selectedCell?.row === row && selectedCell?.col === col ? (
                      // Edit mode - show formula/raw value
                      <input
                        value={String(gridValues[row][col])}
                        onChange={(e) => handleCellChange(row, col, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            setSelectedCell(null);
                            // Move to next row
                            if (row < ROWS - 1) {
                              setSelectedCell({row: row + 1, col});
                              setFormulaBar(String(gridRef.current![row + 1][col].value()));
                            }
                          } else if (e.key === 'Tab') {
                            e.preventDefault();
                            setSelectedCell(null);
                            // Move to next column
                            if (col < COLS - 1) {
                              setSelectedCell({row, col: col + 1});
                              setFormulaBar(String(gridRef.current![row][col + 1].value()));
                            } else if (row < ROWS - 1) {
                              setSelectedCell({row: row + 1, col: 0});
                              setFormulaBar(String(gridRef.current![row + 1][0].value()));
                            }
                          } else if (e.key === 'Escape') {
                            setSelectedCell(null);
                          }
                        }}
                        onBlur={() => {
                          // Small delay to allow other click events to process first
                          setTimeout(() => setSelectedCell(null), 100);
                        }}
                        autoFocus
                        style={{
                          width: 'calc(100% - 4px)',
                          height: 'calc(100% - 4px)',
                          border: '2px solid #2196f3',
                          padding: '2px 6px',
                          margin: '2px',
                          background: 'white',
                          fontSize: '14px',
                          outline: 'none',
                          textAlign: typeof gridValues[row][col] === 'string' && gridValues[row][col].startsWith('=') ? 'left' : 'right',
                          boxSizing: 'border-box',
                          borderRadius: '2px'
                        }}
                      />
                    ) : (
                      // Display mode - show computed value
                      <div
                        onClick={() => handleCellClick(row, col)}
                        style={{
                          width: 'calc(100% - 4px)',
                          height: 'calc(100% - 4px)',
                          border: typeof gridValues[row][col] === 'string' && gridValues[row][col].startsWith('=')
                            ? '2px solid #4caf50'
                            : '2px solid transparent',
                          padding: '2px 6px',
                          margin: '2px',
                          background: typeof gridValues[row][col] === 'string' && gridValues[row][col].startsWith('=')
                            ? 'rgba(76, 175, 80, 0.05)'
                            : 'transparent',
                          fontSize: '14px',
                          cursor: 'pointer',
                          textAlign: 'right',
                          boxSizing: 'border-box',
                          borderRadius: '2px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          color: typeof gridValues[row][col] === 'string' && gridValues[row][col].startsWith('=')
                            ? '#2e7d32'
                            : '#000'
                        }}
                        title={`${getColumnLetter(col)}${row + 1}: ${typeof gridValues[row][col] === 'string' && gridValues[row][col].startsWith('=') ? gridValues[row][col] : 'Value'}`}
                      >
                        {getComputedValue(row, col)}
                      </div>
                    )}

                    {/* Formula indicator */}
                    {typeof gridValues[row][col] === 'string' && gridValues[row][col].startsWith('=') && selectedCell?.row !== row && selectedCell?.col !== col && (
                      <div style={{
                        position: 'absolute',
                        top: '2px',
                        left: '2px',
                        background: '#4caf50',
                        color: 'white',
                        fontSize: '8px',
                        padding: '1px 3px',
                        borderRadius: '2px',
                        fontWeight: 'bold',
                        pointerEvents: 'none',
                        lineHeight: '1'
                      }}>
                        fx
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Statistics - automatically computed from all cells */}
      <div style={{ 
        background: '#f8f9fa', 
        padding: '15px', 
        borderRadius: '8px',
        border: '1px solid #dee2e6'
      }}>
        <h3>📈 Live Statistics (Auto-computed)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '15px' }}>
          <div>
            <strong>Sum:</strong> {stats.sum}
          </div>
          <div>
            <strong>Count:</strong> {stats.count}
          </div>
          <div>
            <strong>Average:</strong> {stats.average}
          </div>
          <div>
            <strong>Min:</strong> {stats.min}
          </div>
          <div>
            <strong>Max:</strong> {stats.max}
          </div>
        </div>
      </div>
      
      <div>
        <h3>Supported Formulas</h3>
        <ul>
          <li><code>=SUM(A1:A10)</code> - Sum a range of cells</li>
          <li><code>=AVERAGE(A1:A10)</code> - Average a range of cells</li>
          <li><code>=A1+B1</code> - Add two cells</li>
          <li><code>=A1*2</code> - Multiply cell by number</li>
          <li><code>=A1*B1</code> - Multiply two cells</li>
        </ul>
      </div>
      
      <div>
        <h4>✅ Demonstrates:</h4>
        <ul>
          <li>✨ <strong>200 independent signals</strong> (20×10 grid) working in harmony</li>
          <li>🔄 <strong>Automatic formula recalculation</strong> when dependencies change</li>
          <li>📊 <strong>Real-time statistics</strong> computed from all cells</li>
          <li>⚡ <strong>Zero manual optimization</strong> - Signal-Σ handles everything</li>
          <li>🧮 <strong>Complex dependency graphs</strong> resolved automatically</li>
          <li>🎯 <strong>Excel-like functionality</strong> with minimal code</li>
        </ul>
      </div>
    </div>
  );
}

export default ExcelGridDemo;
