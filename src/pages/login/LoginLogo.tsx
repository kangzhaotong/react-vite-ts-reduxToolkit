export default function Logo() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <img
        style={{ width: 48 }}
        // src={`${import.meta.env.BASE_URL}logo64.png`}
      />
      <h1 className="logo_text">React Tamplate</h1>
    </div>
  );
}
