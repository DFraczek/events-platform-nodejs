import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { apiUrl } from "../../api";
import Navbar from "../Navbar";
import styles from "./EventDetails.module.css";

const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const url = apiUrl(`/api/events/${id}`);
        const { data } = await axios.get(url);
        setEvent(data);
      } catch (error) {
        setError("Nie udało się pobrać szczegółów wydarzenia.");
      }
    };

    fetchEvent();
  }, [id]);

  if (error) {
    return <div>{error}</div>;
  }

  if (!event) {
    return <div>Ładowanie...</div>;
  }

  return (
    <div>
      <Navbar />
      <div className={styles.eventDetailsContainer}>
        <h2 className={styles.eventName}>{event.eventName}</h2>
        <p className={styles.eventDetail}>
          <span className={styles.label}>Data rozpoczęcia:</span>{" "}
          {new Date(event.startDate).toLocaleString([], {
            year: "numeric",
            month: "numeric",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
          })}
        </p>
        <p className={styles.eventDetail}>
          <span className={styles.label}>Data zakończenia:</span>{" "}
          {new Date(event.endDate).toLocaleString([], {
            year: "numeric",
            month: "numeric",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
          })}
        </p>
        <p className={styles.eventDetail}>
          <span className={styles.label}>Kategoria:</span> {event.category}
        </p>
        <p className={styles.eventDetail}>
          <span className={styles.label}>Opis:</span> {event.description}
        </p>
        <p className={styles.eventDetail}>
          <span className={styles.label}>Lokalizacja:</span> {event.location}
        </p>
        <p className={styles.eventDetail}>
          <span className={styles.label}>Ilość zapisanych osób:</span>{" "}
          {event.participants.length}/{event.maxMembers}
        </p>
        <ul className={styles.participantsList}>
          {event.participants.map((participant, index) => (
            <li key={index} className={styles.participantItem}>
              {participant}
            </li>
          ))}
        </ul>
        <p className={styles.eventDetail}>
          <span className={styles.label}>Email organizatora:</span>{" "}
          {event.organizer}
        </p>
      </div>
    </div>
  );
};

export default EventDetails;
