import { useEffect, useState } from "react";

export default function Members() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/members.json") 
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load members.json");
        return res.json();
      })
      .then((data) => {
        setMembers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading members...</p>;
  if (error) return <p>Error: {error}</p>;
  if (members.length === 0) return <p>No members found.</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>👥 Members List</h2>
      <ul style={styles.list}>
        {members.map((member) => (
          <li key={member.id} style={styles.item}>
            <strong>{member.name}</strong> — {member.email}
          </li>
        ))}
      </ul>
    </div>
  );
}

const styles = {
  list: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  item: {
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "6px",
  },
};
