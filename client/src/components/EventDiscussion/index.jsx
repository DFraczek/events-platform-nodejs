import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { apiUrl } from "../../api";
import Navbar from "../Navbar";
import styles from "./EventDiscussion.module.css";

const EventDiscussion = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [posts, setPosts] = useState([]);
  const [newPostMessage, setNewPostMessage] = useState("");
  const [newCommentMessage, setNewCommentMessage] = useState({});
  const [editingComment, setEditingComment] = useState({});
  const [editingPost, setEditingPost] = useState(null);
  const [error, setError] = useState("");
  const email = localStorage.getItem("email");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const eventUrl = apiUrl(`/api/events/${id}`);
        const eventResponse = await axios.get(eventUrl, {
          headers: {
            "x-auth-token": token,
          },
        });
        setEvent(eventResponse.data);

        const postsUrl = apiUrl(`/api/events/discussion/${id}`);
        const postsResponse = await axios.get(postsUrl, {
          headers: {
            "x-auth-token": token,
          },
        });
        setPosts(postsResponse.data);
      } catch (error) {
        if (error.response && error.response.status === 403) {
          navigate("/");
        } else {
          setError("Failed to fetch discussion posts.");
        }
      }
    };

    fetchEventDetails();
  }, [id, token, navigate]);

  const handlePostMessage = async () => {
    try {
      const url = apiUrl(`/api/events/discussion/${id}`);
      const { data } = await axios.post(
        url,
        { email, message: newPostMessage },
        {
          headers: {
            "x-auth-token": token,
          },
        },
      );
      setPosts(data);
      setNewPostMessage("");
    } catch (error) {
      setError("Failed to post message.");
    }
  };

  const handlePostComment = async (postId) => {
    try {
      const url = apiUrl(`/api/events/discussion/${id}/comments/${postId}`);
      const { data } = await axios.post(
        url,
        { email, message: newCommentMessage[postId] },
        {
          headers: {
            "x-auth-token": token,
          },
        },
      );
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId ? { ...post, comments: data } : post,
        ),
      );
      setNewCommentMessage((prevComments) => ({
        ...prevComments,
        [postId]: "",
      }));
    } catch (error) {
      setError("Failed to post comment.");
    }
  };

  const handleEditComment = (postId, commentId) => {
    setEditingComment({ postId, commentId });
    setNewCommentMessage((prevComments) => ({
      ...prevComments,
      [commentId]: posts
        .find((post) => post._id === postId)
        .comments.find((comment) => comment._id === commentId).message,
    }));
  };

  const handleUpdateComment = async (postId, commentId) => {
    try {
      const url = apiUrl(
        `/api/events/discussion/${id}/comments/${postId}/${commentId}`,
      );
      const { data } = await axios.put(
        url,
        { email, message: newCommentMessage[commentId] },
        {
          headers: {
            "x-auth-token": token,
          },
        },
      );
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId ? { ...post, comments: data } : post,
        ),
      );
      setEditingComment({});
      setNewCommentMessage((prevComments) => ({
        ...prevComments,
        [commentId]: "",
      }));
    } catch (error) {
      setError("Failed to update comment.");
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      const url = apiUrl(`/api/events/discussion/${id}/posts/${postId}`);
      const { data } = await axios.delete(url, {
        data: { email },
        headers: {
          "x-auth-token": token,
        },
      });
      setPosts(data);
    } catch (error) {
      setError("Failed to delete post.");
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    try {
      const url = apiUrl(
        `/api/events/discussion/${id}/comments/${postId}/${commentId}`,
      );
      const { data } = await axios.delete(url, {
        data: { email },
        headers: {
          "x-auth-token": token,
        },
      });
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId ? { ...post, comments: data } : post,
        ),
      );
    } catch (error) {
      setError("Failed to delete comment.");
    }
  };

  const handleEditPost = (postId) => {
    setEditingPost(postId);
    setNewPostMessage(posts.find((post) => post._id === postId).message);
  };

  const handleUpdatePost = async (postId) => {
    try {
      const url = apiUrl(`/api/events/discussion/${id}/posts/${postId}`);
      const { data } = await axios.put(
        url,
        { email, message: newPostMessage },
        {
          headers: {
            "x-auth-token": token,
          },
        },
      );
      setPosts(data);
      setEditingPost(null);
      setNewPostMessage("");
    } catch (error) {
      setError("Failed to update post.");
    }
  };

  return (
    <div>
      <Navbar />
      <div className={styles.mainContainer}>
        {event && (
          <h2>
            Dyskusja na temat:{" "}
            <span className={styles.eventName}>{event.eventName}</span>
          </h2>
        )}

        {error && <div className={styles.error}>{error}</div>}
        <ul className={styles.postsList}>
          {posts.map((post) => (
            <li key={post._id} className={styles.postItem}>
              <p>
                <strong>{post.email}</strong>: {post.message}
              </p>
              <p>
                <small>{new Date(post.timestamp).toLocaleString()}</small>
              </p>
              {post.email === email && (
                <div className={styles.actionButtons}>
                  <button
                    onClick={() => handleEditPost(post._id)}
                    className={styles.editButton}
                  >
                    <i className="fa-solid fa-pen"></i>
                  </button>
                  <button
                    onClick={() => handleDeletePost(post._id)}
                    className={styles.deleteButton}
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>
              )}
              {editingPost === post._id && (
                <div className={styles.editForm}>
                  <textarea
                    value={newPostMessage}
                    onChange={(e) => setNewPostMessage(e.target.value)}
                    placeholder="Edytuj post..."
                  />
                  <button
                    onClick={() => handleUpdatePost(post._id)}
                    className={styles.saveButton}
                  >
                    Zapisz
                  </button>
                </div>
              )}
              <ul className={styles.commentsList}>
                {post.comments.map((comment) => (
                  <li key={comment._id} className={styles.commentItem}>
                    <p>
                      <strong>{comment.email}</strong>: {comment.message}
                    </p>
                    <p>
                      <small>
                        {new Date(comment.timestamp).toLocaleString()}
                      </small>
                    </p>
                    {comment.email === email && (
                      <div className={styles.commentButtons}>
                        <button
                          onClick={() =>
                            handleEditComment(post._id, comment._id)
                          }
                          className={styles.editButton}
                        >
                          <i className="fa-solid fa-pen"></i>
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteComment(post._id, comment._id)
                          }
                          className={styles.deleteButton}
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    )}
                    {editingComment.commentId === comment._id && (
                      <div className={styles.editForm}>
                        <textarea
                          value={newCommentMessage[comment._id] || ""}
                          onChange={(e) =>
                            setNewCommentMessage({
                              ...newCommentMessage,
                              [comment._id]: e.target.value,
                            })
                          }
                          placeholder="Edytuj komentarz..."
                        />
                        <button
                          onClick={() =>
                            handleUpdateComment(post._id, comment._id)
                          }
                          className={styles.saveButton}
                        >
                          Zapisz
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
              <div className={styles.newCommentForm}>
                <textarea
                  value={newCommentMessage[post._id] || ""}
                  onChange={(e) =>
                    setNewCommentMessage({
                      ...newCommentMessage,
                      [post._id]: e.target.value,
                    })
                  }
                  placeholder="Napisz komentarz..."
                />
                <button
                  onClick={() => handlePostComment(post._id)}
                  className={styles.commentButton}
                >
                  Wyślij komentarz
                </button>
              </div>
            </li>
          ))}
        </ul>
        <div className={styles.newPostForm}>
          <textarea
            value={editingPost === null ? newPostMessage : ""}
            onChange={(e) => setNewPostMessage(e.target.value)}
            placeholder="Napisz post"
          />
          <button onClick={handlePostMessage} className={styles.postButton}>
            Wyślij
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventDiscussion;
