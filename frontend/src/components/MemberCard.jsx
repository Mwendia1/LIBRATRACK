export default function MemberCard({ member }) {
  return (
    <div style={{ border: "1px solid #ddd", padding: 12, marginTop: 8, background: "#f3eeeeff" }}>
      <h4 style={{ margin: 0 }}>{member.name}</h4>
      {member.email ? <p style={{ margin: 0 }}>{member.email}</p> : null}
    </div>
  );
}
