import React from "react";
import AdminLogInForm from "../components/AdminLogInForm";
import Footer from "../components/footer";
import BackButton from "../components/BackButton";
import "../css/LogIn.css";

const AdminLogin = () => {
  return (
    <main className="login-page">
      <header className="login-header">
        <BackButton />
        <h1 className="login-title">Admin Login</h1>
      </header>

      <section className="login-content">
        <AdminLogInForm />
      </section>

      <Footer />
    </main>
  );
};

export default AdminLogin;
