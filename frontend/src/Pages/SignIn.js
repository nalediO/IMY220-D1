
import React from 'react';
import {Link} from 'react-router-dom';
import SignInForm from '../components/SignInForm';
import Footer from '../components/footer';
import BackButton from '../components/BackButton';
import '../css/SignIn.css';

const SingIn = () => {
    return(
        <main className="signin-main">
            
           <header className="signin-header">
              <BackButton /> 
                <nav>
                  <Link to="/signin" className="nav-link">
                    Sign Up
                  </Link>
                  <Link to="/login" className="nav-link">
                    Log In
                  </Link>
                </nav>
            </header>
            <section className="signin-section">
                <h1 className="signin-title">Sign Up</h1>
                    <SignInForm />
            </section>
            <div>
                <Footer />
            </div>
        </main>
    );
};
export default SingIn;