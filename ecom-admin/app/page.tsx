'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/users')
      .then(response => response.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-10 font-sans">
      <main>
        <h1>Admin Panel</h1>
        <h2>Users</h2>
        <pre>{JSON.stringify(users, null, 2)}</pre>
      </main>
    </div>
  );
}
