import { Route, Routes, Navigate } from "react-router-dom";
import Main from "./components/Main";
import Signup from "./components/Signup";
import Login from "./components/Login";
import CreateEventForm from "./components/CreateEventForm";
import EventDetails from "./components/EventDetails";
import EditEventForm from "./components/EditEventForm";
import EventDiscussion from "./components/EventDiscussion";
import ProtectedRoute from "./components/ProtectedRoute";
import MyEvents from "./components/MyEvents";
import "@fortawesome/fontawesome-free/css/all.min.css";

function App() {
  const user = localStorage.getItem("token");

  return (
    <Routes>
      {user && <Route path="/" element={<Main />} />}
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/create-event"
        element={user ? <CreateEventForm /> : <Navigate replace to="/login" />}
      />
      <Route
        path="/my-events"
        element={user ? <MyEvents /> : <Navigate replace to="/login" />}
      />
      <Route
        path="/event/:id"
        element={user ? <EventDetails /> : <Navigate replace to="/login" />}
      />
      <Route
        path="/edit-event/:id"
        element={user ? <EditEventForm /> : <Navigate replace to="/login" />}
      />
      <Route
        path="/event/:id/discussion"
        element={
          <ProtectedRoute>
            <EventDiscussion />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate replace to="/login" />} />
    </Routes>
  );
}

export default App;
