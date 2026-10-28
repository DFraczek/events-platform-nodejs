import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { apiUrl } from "../../api";
import Navbar from "../Navbar";
import styles from "./EditEventForm.module.css";

const EditEventForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    eventName: "",
    description: "",
    category: "",
    location: "",
    maxMembers: "",
    startDate: "",
    endDate: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const url = apiUrl(`/api/events/${id}`);
        const { data } = await axios.get(url);
        setFormData(data);
      } catch (error) {
        setError("Nie udało się pobrać danych wydarzenia.");
      }
    };

    fetchEventData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { startDate, endDate, maxMembers } = formData;
      const currentDate = new Date();
      if (
        new Date(startDate) <= currentDate ||
        new Date(endDate) <= currentDate
      ) {
        setError("Daty muszą być z przyszłości.");
        return;
      }

      if (new Date(startDate) >= new Date(endDate)) {
        setError("Data zakończenia musi być późniejsza niż data rozpoczęcia.");
        return;
      }

      if (parseInt(maxMembers) < 1) {
        setError("Maksymalna liczba uczestników musi być większa lub równa 1.");
        return;
      }

      const url = apiUrl(`/api/events/${id}`);
      await axios.put(url, formData);
      window.location.reload();
    } catch (error) {
      setError("Błąd podczas edycji wydarzenia.");
    }
  };

  return (
    <div>
      <Navbar />
      <div className={styles.container}>
        <h2>Edytuj wydarzenie</h2>
        <form onSubmit={handleSubmit}>
          <label>Nazwa wydarzenia:</label>
          <input
            type="text"
            name="eventName"
            value={formData.eventName}
            onChange={handleChange}
            required
            className={styles.inputText}
          />
          <label>Opis:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            className={styles.textarea}
          />

          <label>Kategoria:</label>
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

          <label>Lokalizacja:</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            className={styles.inputText}
          />

          <label>Maksymalna liczba uczestników:</label>
          <input
            type="number"
            name="maxMembers"
            value={formData.maxMembers}
            onChange={handleChange}
            required
            className={styles.inputNumber}
          />

          <label>Data rozpoczęcia:</label>
          <input
            type="datetime-local"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            required
            className={styles.inputDatetime}
          />

          <label>Data zakończenia:</label>
          <input
            type="datetime-local"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            required
            className={styles.inputDatetime}
          />
          {error && <div className={styles.error}>{error}</div>}
          <button type="submit">Zapisz zmiany</button>
        </form>
      </div>
    </div>
  );
};

export default EditEventForm;
