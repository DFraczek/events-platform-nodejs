import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../../api";
import Navbar from "../Navbar";
import styles from "./Main.module.css";

const Main = () => {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const [signupMessages, setSignupMessages] = useState({});
  const [editEventData, setEditEventData] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateFilter, setDateFilter] = useState({ start: "", end: "" });
  const [statusFilter, setStatusFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navigate = useNavigate();
  const loggedInUserEmail = localStorage.getItem("email");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const url = apiUrl("/api/events");
        const { data } = await axios.get(url);
        setEvents(data);
      } catch (error) {
        setError("Nie udało się pobrać wydarzeń.");
      }
    };

    fetchEvents();
  }, []);

  const handleDetailsClick = (id) => {
    navigate(`/event/${id}`);
  };

  const handleSignup = async (eventId) => {
    try {
      const url = apiUrl(`/api/events/signup/${eventId}`);
      const email = localStorage.getItem("email");

      const event = events.find((event) => event._id === eventId);

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
    const eventToEdit = events.find((event) => event._id === eventId);
    setEditEventData(eventToEdit);
    navigate(`/edit-event/${eventId}`);
  };

  const handleDiscussionClick = (id) => {
    navigate(`/event/${id}/discussion`);
  };

  const handleSearchChange = (e) => {
    setSearchKeyword(e.target.value);
  };

  const handleCategoryFilterChange = (e) => {
    setCategoryFilter(e.target.value);
  };

  const handleDateFilterChange = (e) => {
    setDateFilter({
      ...dateFilter,
      [e.target.name]: e.target.value,
    });
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleAvailabilityFilterChange = (e) => {
    setAvailabilityFilter(e.target.value);
  };

  const filterEvents = () => {
    return events.filter((event) => {
      const matchesKeyword = event.eventName
        .toLowerCase()
        .includes(searchKeyword.toLowerCase());
      const matchesCategory =
        !categoryFilter || event.category === categoryFilter;
      const matchesDate =
        (!dateFilter.start ||
          new Date(event.startDate) >= new Date(dateFilter.start)) &&
        (!dateFilter.end ||
          new Date(event.endDate) <= new Date(dateFilter.end));
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "ongoing" && new Date(event.endDate) > new Date()) ||
        (statusFilter === "finished" && new Date(event.endDate) <= new Date());
      const matchesAvailability =
        availabilityFilter === "all" ||
        (availabilityFilter === "available" &&
          event.participants.length < event.maxMembers);

      return (
        matchesKeyword &&
        matchesCategory &&
        matchesDate &&
        matchesStatus &&
        matchesAvailability
      );
    });
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <div>
      <Navbar />
      <div className={styles.mainContainer}>
        <h2>Lista wydarzeń</h2>
        <div className={styles.searchContainer}>
          <div className={styles.dropdown}>
            <button onClick={toggleDropdown} className={styles.dropdownButton}>
              Filtry
            </button>
            {dropdownOpen && (
              <div className={styles.dropdownMenu}>
                <select
                  value={categoryFilter}
                  onChange={handleCategoryFilterChange}
                >
                  <option value="">Wszystkie kategorie</option>
                  <option value="Sportowe">Sportowe</option>
                  <option value="Kulturalne">Kulturalne</option>
                  <option value="Edukacyjne">Edukacyjne</option>
                  <option value="Rozrywkowe">Rozrywkowe</option>
                  <option value="Charytatywne">Charytatywne</option>
                  <option value="Biznesowe">Biznesowe</option>
                  <option value="Inne">Inne</option>
                </select>
                <input
                  type="date"
                  name="start"
                  placeholder="Data rozpoczęcia"
                  value={dateFilter.start}
                  onChange={handleDateFilterChange}
                />
                <input
                  type="date"
                  name="end"
                  placeholder="Data zakończenia"
                  value={dateFilter.end}
                  onChange={handleDateFilterChange}
                />
                <select
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                >
                  <option value="all">Wszystkie</option>
                  <option value="ongoing">Trwające</option>
                  <option value="finished">Zakończone</option>
                </select>
                <select
                  value={availabilityFilter}
                  onChange={handleAvailabilityFilterChange}
                >
                  <option value="all">Wszystkie</option>
                  <option value="available">Z dostępnymi miejscami</option>
                </select>
              </div>
            )}
          </div>
          <div className={styles.search}>
            <input
              type="text"
              placeholder="Szukaj"
              value={searchKeyword}
              onChange={handleSearchChange}
              className={styles.searchInput}
            />
            <i className="fa-solid fa-magnifying-glass"></i>
          </div>
        </div>
        {error && <div>{error}</div>}
        <div className={styles.eventsGrid}>
          {filterEvents().map((event) => (
            <div key={event._id} className={styles.eventCard}>
              <button
                onClick={() => handleDetailsClick(event._id)}
                className={styles.infoButton}
              >
                <i className="fa-solid fa-circle-info"></i>
              </button>
              <h3>
                {event.eventName}
                {loggedInUserEmail === event.organizer && (
                  <>
                    <button
                      onClick={() => handleEditEvent(event._id)}
                      className={styles.iconButton}
                    >
                      <i className="fa-solid fa-pen"></i>
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event._id)}
                      className={`${styles.iconButton} ${styles.deleteIcon}`}
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </>
                )}
                {new Date(event.endDate) < new Date() && (
                  <span className={styles.completedEvent}>[ZAKOŃCZONE]</span>
                )}
              </h3>
              <p>
                <i className="fa-solid fa-calendar-days"></i> Data rozpoczęcia:{" "}
                {new Date(event.startDate).toLocaleString([], {
                  year: "numeric",
                  month: "numeric",
                  day: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                })}
              </p>
              <p>
                <i className="fa-solid fa-calendar-days"></i> Data zakończenia:{" "}
                {new Date(event.endDate).toLocaleString([], {
                  year: "numeric",
                  month: "numeric",
                  day: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                })}
              </p>
              <p>
                <i className="fa-solid fa-icons"></i> Kategoria:{" "}
                {event.category}
              </p>
              <p>
                <i className="fa-solid fa-users"></i> Ilość zapisanych osób:{" "}
                {event.participants.length}/{event.maxMembers}
              </p>
              {new Date(event.endDate) > new Date() &&
                (event.participants.includes(loggedInUserEmail) ? (
                  <button
                    onClick={() => handleLeaveEvent(event._id)}
                    className={`${styles.leaveButton}`}
                  >
                    <i className="fa-solid fa-user-minus"></i> Opuść wydarzenie
                  </button>
                ) : (
                  loggedInUserEmail !== event.organizer && (
                    <button
                      onClick={() => handleSignup(event._id)}
                      className={`${styles.signupButton}`}
                    >
                      <i className="fa-solid fa-user-plus"></i> Zapisz na
                      wydarzenie
                    </button>
                  )
                ))}
              {(event.participants.includes(loggedInUserEmail) ||
                loggedInUserEmail === event.organizer) && (
                <button
                  onClick={() => handleDiscussionClick(event._id)}
                  className={`${styles.commentButton} ${styles.iconButton}`}
                >
                  <i className="fa-solid fa-comment-dots"></i>
                </button>
              )}
              {signupMessages[event._id] && (
                <p style={{ color: "red" }}>{signupMessages[event._id]}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Main;
