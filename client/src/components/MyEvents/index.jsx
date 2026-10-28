import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../../api";
import styles from "./MyEvents.module.css";
import Navbar from "../Navbar";

const MyEvents = () => {
  const [events, setEvents] = useState([]);
  const [view, setView] = useState("created");
  const [error, setError] = useState("");
  const [signupMessages, setSignupMessages] = useState({});
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const loggedInUserEmail = localStorage.getItem("email");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const url =
          view === "created"
            ? apiUrl("/api/user-events/created")
            : apiUrl("/api/user-events/signed-up");
        const { data } = await axios.get(url, {
          headers: {
            "x-auth-token": token,
          },
        });
        setEvents(data);
      } catch (error) {
        setError("Failed to fetch events.");
      }
    };

    fetchEvents();
  }, [view, token]);

  const handleViewChange = (newView) => {
    setView(newView);
  };

  const handleDetailsClick = (id) => {
    navigate(`/event/${id}`);
  };

  const handleSignup = async (eventId) => {
    try {
      const url = apiUrl(`/api/events/signup/${eventId}`);
      const email = localStorage.getItem("email");

      const event = events.find((event) => event._id === eventId);
      if (event.participants.includes(email)) {
        setSignupMessages({
          ...signupMessages,
          [eventId]: "Jesteś już zapisany na to wydarzenie.",
        });
        return;
      }

      if (event.participants.length >= event.maxMembers) {
        setSignupMessages({
          ...signupMessages,
          [eventId]: "Przekroczono limit uczestników na to wydarzenie.",
        });
        return;
      }

      const response = await axios.put(url, { email });
      const updatedEvents = events.map((event) =>
        event._id === eventId ? response.data : event,
      );
      setEvents(updatedEvents);
    } catch (error) {
      console.error("Błąd podczas zapisywania na wydarzenie:", error);
    }
  };

  const handleLeaveEvent = async (eventId) => {
    try {
      const url = apiUrl(`/api/events/leave/${eventId}`);
      const email = localStorage.getItem("email");

      const response = await axios.put(url, { email });
      const updatedEvents = events.map((event) =>
        event._id === eventId ? response.data : event,
      );
      setEvents(updatedEvents);
    } catch (error) {
      console.error("Błąd podczas opuszczania wydarzenia:", error);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      const url = apiUrl(`/api/events/${eventId}`);
      await axios.delete(url);
      const updatedEvents = events.filter((event) => event._id !== eventId);
      setEvents(updatedEvents);
    } catch (error) {
      console.error("Błąd podczas usuwania wydarzenia:", error);
    }
  };

  const handleEditEvent = (eventId) => {
    navigate(`/edit-event/${eventId}`);
  };

  const handleDiscussionClick = (id) => {
    navigate(`/event/${id}/discussion`);
  };

  return (
    <div>
      <Navbar />
      <div className={styles.container}>
        <h2 className={styles.title}>Moje wydarzenia</h2>
        <div className={styles.buttonGroup}>
          <button
            onClick={() => handleViewChange("created")}
            className={`${styles.button} ${
              view === "created" ? styles.activeButton : ""
            }`}
          >
            Wydarzenia utworzone przeze mnie
          </button>
          <button
            onClick={() => handleViewChange("signed-up")}
            className={`${styles.button} ${
              view === "signed-up" ? styles.activeButton : ""
            }`}
          >
            Wydarzenia, na które jestem zapisany
          </button>
        </div>
        {error && <div className={styles.error}>{error}</div>}
        <ul className={styles.eventList}>
          {events.map((event) => (
            <li key={event._id} className={styles.eventItem}>
              <div className={styles.eventHeader}>
                <h3 className={styles.eventTitle}>
                  {new Date(event.endDate) < new Date() && "[ZAKOŃCZONE] "}
                  {event.eventName}
                </h3>
                {loggedInUserEmail === event.organizer && (
                  <div className={styles.actionButtons}>
                    <button
                      onClick={() => handleEditEvent(event._id)}
                      className={styles.editButton}
                    >
                      <i className="fa-solid fa-pen"></i>
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event._id)}
                      className={styles.deleteButton}
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>
                )}
              </div>
              <p className={styles.eventDescription}>{event.description}</p>
              <p>
                <span className={styles.label}>Data rozpoczęcia:</span>{" "}
                {new Date(event.startDate).toLocaleString([], {
                  year: "numeric",
                  month: "numeric",
                  day: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                })}
              </p>
              <p>
                <span className={styles.label}>Data zakończenia:</span>{" "}
                {new Date(event.endDate).toLocaleString([], {
                  year: "numeric",
                  month: "numeric",
                  day: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                })}
              </p>
              <p>
                <span className={styles.label}>Kategoria:</span>{" "}
                {event.category}
              </p>
              <p>
                <span className={styles.label}>Ilość zapisanych osób:</span>{" "}
                {event.participants.length}/{event.maxMembers}
              </p>
              <button
                onClick={() => handleDetailsClick(event._id)}
                className={styles.infoButton}
              >
                <i className="fa-solid fa-circle-info"></i>
              </button>
              {new Date(event.endDate) > new Date() &&
                (event.participants.includes(loggedInUserEmail) ? (
                  <button
                    onClick={() => handleLeaveEvent(event._id)}
                    className={styles.leaveButton}
                  >
                    Opuść wydarzenie
                  </button>
                ) : (
                  loggedInUserEmail !== event.organizer && (
                    <button
                      onClick={() => handleSignup(event._id)}
                      className={styles.signupButton}
                    >
                      Zapisz na wydarzenie
                    </button>
                  )
                ))}
              {(event.participants.includes(loggedInUserEmail) ||
                loggedInUserEmail === event.organizer) && (
                <button
                  onClick={() => handleDiscussionClick(event._id)}
                  className={styles.discussionButton}
                >
                  <i className="fa-solid fa-comment-dots"></i>
                </button>
              )}
              {signupMessages[event._id] && (
                <p className={styles.signupMessage}>
                  {signupMessages[event._id]}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MyEvents;
