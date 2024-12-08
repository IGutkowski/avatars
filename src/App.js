import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [users, setUsers] = useState([]);
  const [avatars, setAvatars] = useState({}); // Obiekt przechowujący avatary użytkowników
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedUser, setSelectedUser] = useState("");
  const [message, setMessage] = useState("");
  const [authToken, setAuthToken] = useState(""); // State to hold the token

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/users");
      const data = await response.json();

      // Filter out users with null or empty userName
      const validUsers = data.filter((user) => user.userName);
      setUsers(validUsers);

      // Pobierz avatary użytkowników
      validUsers.forEach((user) => fetchAvatar(user.userName));
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchAvatar = async (username) => {
    try {
      const response = await fetch(
          `http://localhost:8080/api/users/profile-picture/${username}`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch avatar for ${username}`);
      }
      const data = await response.json();

      // Dodaj avatar użytkownika do stanu
      setAvatars((prevAvatars) => ({
        ...prevAvatars,
        [username]: `data:${data.contentType};base64,${data.imageData}`,
      }));
    } catch (error) {
      console.error("Error fetching avatar:", error);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setMessage("");
  };

  const handleUserChange = (e) => {
    setSelectedUser(e.target.value);
    setMessage("");
  };

  const handleTokenChange = (e) => {
    setAuthToken(e.target.value); // Update token dynamically
  };

  const handleAvatarUpload = async () => {
    console.log("Starting upload for user:", selectedUser);

    if (!selectedUser || !selectedFile || !authToken) {
      alert("Please fill all fields (user, image, token).");
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      const response = await fetch("http://localhost:8080/api/profile/avatar", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server Error:", errorText);
        alert(`Upload failed: ${errorText}`);
        return;
      }

      const message = await response.text();
      console.log("Upload success:", message);
      alert("Avatar uploaded successfully!");
      fetchUsers(); // Refresh users
    } catch (error) {
      console.error("Network Error:", error);
      alert("Network error occurred. Check the console for details.");
    }
  };




  return (
      <div className="App">
        <header className="App-header">
          <h1>User Management</h1>
          <div>
            <h2>Authorization Token</h2>
            <input
                type="text"
                placeholder="Paste your token here"
                value={authToken}
                onChange={handleTokenChange}
                style={{ width: "300px", padding: "10px", marginBottom: "20px" }}
            />
          </div>
          <div>
            <h2>User List</h2>
            {users.length === 0 ? (
                <p>No valid users available.</p>
            ) : (
                <ul>
                  {users.map((user) => (
                      <li key={user.id} style={{ marginBottom: "20px" }}>
                        <strong>{user.userName}</strong>
                        <br />
                        {avatars[user.userName] ? (
                            <img
                                src={avatars[user.userName]}
                                alt={`${user.userName}'s avatar`}
                                style={{ width: "100px", height: "100px", borderRadius: "50%" }}
                            />
                        ) : (
                            <p>(No Avatar)</p>
                        )}
                      </li>
                  ))}
                </ul>
            )}
          </div>
          <div>
            <h2>Upload Avatar</h2>
            <select onChange={handleUserChange} value={selectedUser}>
              <option value="">Select User</option>
              {users.map((user) => (
                  <option key={user.id} value={user.userName}>
                    {user.userName}
                  </option>
              ))}
            </select>
            <input
                type="file"
                onChange={handleFileChange}
                accept="image/jpeg, image/png"
            />
            <button onClick={handleAvatarUpload}>Upload Avatar</button>
            {message && <p>{message}</p>}
          </div>
        </header>
      </div>
  );
}

export default App;
