import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./styles.module.css";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    window.location.reload();
  };

  const handleCreateEvent = () => {
    navigate("/create-event");
  };

  const handleMyEvents = () => {
    navigate("/my-events");
  };

  const handleHomeClick = () => {
    navigate("/");
  };

  return (
    <div className={styles.main_container}>
      <nav className={styles.navbar}>
        <h1 onClick={handleHomeClick} style={{ cursor: "pointer" }}>
          Wydarzenia
        </h1>
        <div className={styles.button_group}>
          <button className={styles.white_btn} onClick={handleCreateEvent}>
            Utwórz wydarzenie
          </button>
          <button className={styles.white_btn} onClick={handleMyEvents}>
            Moje wydarzenia
          </button>
          <button className={styles.white_btn} onClick={handleLogout}>
            Wyloguj
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
