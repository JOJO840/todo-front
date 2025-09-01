import React, { useEffect, useState } from "react";
import { userService } from "../services/userService";
import "./Dashboard.css";

export default function User() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await userService.getAll();
        setUsers(data || []);
      } catch (e) {
        alert("Failed to load users");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="dashboard-content">
      <h2>Users</h2>
      {loading && <div>Loading...</div>}
      <ul>
        {users.map((u) => (
          <li key={u.id}>{u.username} ({u.role})</li>
        ))}
      </ul>
    </div>
  );
}
