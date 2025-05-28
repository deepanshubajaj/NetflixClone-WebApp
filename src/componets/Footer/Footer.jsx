import React, { useState } from "react";
import styles from "./styles.module.scss";

function Footer2() {
  const [showPopup, setShowPopup] = useState(false);

  // Function to handle showing the popup
  const handlePopupOpen = () => {
    setShowPopup(true);
  };

  // Function to handle closing the popup
  const handlePopupClose = () => {
    setShowPopup(false);
  };

  return (
    <div className="bg-black p-2">
      <footer className={styles.footer}>
        <div className={styles.containerFooter}>
          <div className={styles.icons}></div>
          <ul className={styles.details}>
            <li>FAQ</li>
            <li>Investor Relations</li>
            <li>Privacy</li>
            <li>Speed Test</li>
            <li>Help Center</li>
            <li>Jobs</li>
            <li>Cookie Preference</li>
            <li>Legal Notices</li>
            <li>Account</li>
            <li>Ways to Watch</li>
            <li>Corporate Information</li>
            <li>iOS</li>
            <li>Android</li>
          </ul>
          <div className={styles.security}>
            <div>English</div>
            {/* Make the copyright text clickable to open the popup */}
            <span
              onClick={handlePopupOpen}
              style={{ cursor: 'pointer' }}
            >
              © 1997-2024 Netflix, Inc.
            </span>
            <span>
              © Designed & Developed By:{" "}
              <a
                href={import.meta.env.VITE_GITHUB_LINK}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "underline" }}
              >
                Deepanshu Bajaj
              </a>
            </span>
          </div>
        </div>
      </footer>

      {/* Popup Modal */}
      {showPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popup}>
            <button className={styles.closeBtn} onClick={handlePopupClose}>
              &times;
            </button>
            <h2>🎬 NetflixClone Project</h2>
            <p>
              This project is a NetflixClone Designed & Developed by: Deepanshu Bajaj, it is built using React. It is created solely for educational purposes and has no affiliation with the actual Netflix platform.
            </p>
            <div className={styles.credits}>
              <h4>Credits:</h4>
              <ul>
                <li>Netflix</li>
                <li>TMDB API</li>
                <li>YouTube</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Footer2;
