import React, { useState, useEffect } from "react";

const AddManager = () => {
  const [managers, setManagers] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/users");
        const data = await response.json();
        setManagers(data);
      } catch (error) {
        console.error("Error fetching managers:", error);
      }
    };

    fetchManagers();
  }, []);

  const handleAddManager = async (managerId) => {
    try {
      await fetch(`/api/users/${managerId}/assign-role`, {
        method: "POST",
        body: JSON.stringify({ role: "manager" }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      alert("Manager added successfully");
      window.location.reload();
    } catch (error) {
      console.error("Failed to add manager:", error);
    }
  };

  return (
    <div className="add-manager">
      <h3>Add Manager:</h3>
      <input
        type="text"
        placeholder="Search by name or ID"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="manager-list">
        {managers
          .filter(manager => manager.name.toLowerCase().includes(search.toLowerCase()))
          .map(manager => (
            <div key={manager.id} className="manager-item">
              {manager.name}
              <button onClick={() => handleAddManager(manager.id)}>+</button>
            </div>
          ))}
      </div>
    </div>
  );
};

export default AddManager;
