import { useState } from 'react';
import './App.css';

function App() {
  const [count, setCount] = useState(0);

  const handleLog = () => {
    console.log('Button clicked!', { count, timestamp: new Date() });
  };

  const handleWarn = () => {
    console.warn('Warning message from React!', { level: 'warning' });
  };

  const handleError = () => {
    console.error('Error message from React!', { error: true });
  };

  return (
    <div className="app">
      <div className="container">
        <h1>⚛️ Vite + React Example</h1>
        <p>Testing hot-reload and console capture</p>
        
        <div className="card">
          <h2>Counter: {count}</h2>
          <button onClick={() => setCount(count + 1)}>
            Increment
          </button>
        </div>

        <div className="buttons">
          <button className="btn-log" onClick={handleLog}>
            Console Log
          </button>
          <button className="btn-warn" onClick={handleWarn}>
            Console Warn
          </button>
          <button className="btn-error" onClick={handleError}>
            Console Error
          </button>
        </div>

        <div className="info">
          <p>💡 <strong>Hot Reload Test:</strong></p>
          <p>Edit this file and save to see HMR in action!</p>
          <p>Changes will appear instantly without full reload.</p>
        </div>
      </div>
    </div>
  );
}

export default App;
