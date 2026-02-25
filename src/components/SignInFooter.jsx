import React from 'react';

const SignInFooter = () => {
  return (
    <>
      <style jsx global>{`
        .signin-footer {
          text-align: center;
          padding: 20px 0;
          margin-top: 40px;
          border-top: 1px solid #ddd;
          background: #f3f3f3;
          font-size: 12px;
          color: #555;
        }
        .signin-footer-links {
          margin-bottom: 10px;
        }
        .signin-footer-links a {
          color: #0066c0;
          text-decoration: none;
          margin: 0 10px;
        }
        .signin-footer-links a:hover {
          text-decoration: underline;
          color: #c45500;
        }
        .signin-footer-copyright {
          color: #555;
        }
      `}</style>

      <footer className="signin-footer">
        <div className="signin-footer-links">
          <a href="#">Conditions of Use</a>
          <a href="#">Privacy Notice</a>
          <a href="#">Help</a>
        </div>
        <div className="signin-footer-copyright">
          © 2025, Robert & Izak Computers or its affiliates
        </div>
      </footer>
    </>
  );
};

export default SignInFooter;