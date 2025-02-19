import { useEffect, useState } from 'react';
import './App.css';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';

function App() {
  const [pingResponse, setPingResponse] = useState<string>('');

  useEffect(() => {
    const fetchPing = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/users/ping');
        const data = await response.text();
        setPingResponse(data);
      } catch (error) {
        console.error('Error fetching ping:', error);
        setPingResponse('Error connecting to server');
      }
    };

    fetchPing();
  }, []);

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Ping</h1>
      <div className="card">
        <div className="ping-response">
          <h2>Server Response:</h2>
          <h3>{pingResponse || 'Loading...'}</h3>
        </div>
      </div>
    </>
  );
}

export default App;
