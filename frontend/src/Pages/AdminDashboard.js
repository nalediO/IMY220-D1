import React, { useEffect, useState } from "react";
import { adminService } from "../services/api";
import Nav from "../components/Nav";
import Footer from "../components/footer";

const AdminDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    const allProjects = await adminService.getProjects();
    const allUsers = await adminService.getUsers();
    setProjects(allProjects);
    setUsers(allUsers);
  };

  const handleDeleteProject = async (id) => {
    if (window.confirm("Delete this project?")) {
      await adminService.deleteProject(id);
      fetchAll();
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm("Delete this user?")) {
      await adminService.deleteUser(id);
      fetchAll();
    }
  };

  return (
    <main className="admin-dashboard">
      <Nav />
      <section>
        <h2>All Projects</h2>
        <ul>
          {projects.map((p) => (
            <li key={p._id}>
              {p.name}
              <button onClick={() => handleDeleteProject(p._id)}>Delete</button>
            </li>
          ))}
        </ul>

        <h2>All Users</h2>
        <ul>
          {users.map((u) => (
            <li key={u._id}>
              {u.username} ({u.role})
              <button onClick={() => handleDeleteUser(u._id)}>Delete</button>
            </li>
          ))}
        </ul>
      </section>
      <Footer />
    </main>
  );
};

export default AdminDashboard;
