import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { apiUrl } from "../../api";
import styles from "./CreateEventForm.module.css";
import Navbar from "../Navbar";

const CreateEventForm = () => {
  const navigate = useNavigate();
  const organizerEmail = localStorage.getItem("email");

  const [formData, setFormData] = useState({
    eventName: "",
    description: "",
    category: "",
    location: "",
    maxMembers: 0,
    startDate: "",
    endDate: "",
    organizer: organizerEmail,
    participants: [],
  });

  const [error, setError] = useState("");

  const handleChange = ({ currentTarget: input }) => {
    setFormData({
      ...formData,
      [input.name]: input.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = apiUrl("/api/events");
      const { data: res } = await axios.post(url, formData);
      console.log("Utworzono nowe wydarzenie:", res.data);
      navigate("/");
    } catch (error) {
      if (
        error.response &&
        error.response.status >= 400 &&
        error.response.status <= 500
      ) {
        setError(error.response.data.message);
      }
    }
  };

  return (
    <div>
      <Navbar />
      <div className={styles.container}>
        <h2 className={styles.title}>Utwórz nowe wydarzenie</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>Nazwa wydarzenia:</label>
          <input
            type="text"
            name="eventName"
            value={formData.eventName}
            onChange={handleChange}
            required
            className={styles.input}
          />

          <label className={styles.label}>Opis:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            className={styles.textarea}
          />

          <label className={styles.label}>Kategoria:</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className={styles.select}
          >
            <option value="">Wybierz kategorię</option>
            <option value="Sportowe">Sportowe</option>
            <option value="Kulturalne">Kulturalne</option>
            <option value="Edukacyjne">Edukacyjne</option>
            <option value="Rozrywkowe">Rozrywkowe</option>
            <option value="Charytatywne">Charytatywne</option>
            <option value="Biznesowe">Biznesowe</option>
            <option value="Inne">Inne</option>
          </select>

          <label className={styles.label}>Lokalizacja:</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            className={styles.input}
          />

          <label className={styles.label}>Maksymalna liczba uczestników:</label>
          <input
            type="number"
            name="maxMembers"
            value={formData.maxMembers}
            onChange={handleChange}
            required
            className={styles.input}
          />

          <label className={styles.label}>Data rozpoczęcia:</label>
          <input
            type="datetime-local"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            required
            className={styles.input}
          />

          <label className={styles.label}>Data zakończenia:</label>
          <input
            type="datetime-local"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            required
            className={styles.input}
          />
          {error && <div className={styles.error}>{error}</div>}

          <button type="submit" className={styles.button}>
            Utwórz wydarzenie
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateEventForm;
