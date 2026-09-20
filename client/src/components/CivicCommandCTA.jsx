import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import nightGhatsImg from "../assets/city_ghats_night_panorama.jpg";

export default function CivicCommandCTA() {
  const { user } = useAuth();

  return (
    <section style={{ padding: "0 1.5rem", maxWidth: "80rem", margin: "0 auto" }}>
      {/* Outer card */}
      <div
        style={{
          position: "relative",
          borderRadius: "1.5rem",
          overflow: "hidden",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
        }}
      >
        {/* Background image layer */}
        <img
          src={nightGhatsImg}
          alt="City skyline at night"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center 40%",
            display: "block",
          }}
        />

        {/* Dark gradient overlay — strong on left, fades right */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to right, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.75) 55%, rgba(0,0,0,0.45) 100%)",
          }}
        />

        {/* Content — sits on top */}
        <div
          className="cta-dark-section"
          style={{
            position: "relative",
            zIndex: 10,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "2rem",
            padding: "3.5rem 3rem",
          }}
        >
          {/* Left text block */}
          <div style={{ flex: "1 1 320px", maxWidth: "520px" }}>
            <span
              style={{
                display: "block",
                fontSize: "0.65rem",
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: "0.3em",
                color: "rgba(255,255,255,0.6)",
                textTransform: "uppercase",
                marginBottom: "0.75rem",
              }}
            >
              Be The Change
            </span>

            <h2
              style={{
                fontSize: "clamp(2rem, 4vw, 3.25rem)",
                fontWeight: 900,
                lineHeight: 1.1,
                color: "#ffffff",
                margin: "0 0 1rem 0",
                letterSpacing: "-0.02em",
              }}
            >
              Your City.
              <br />
              Your Voice.
            </h2>

            <p
              style={{
                fontSize: "0.95rem",
                color: "rgba(255,255,255,0.75)",
                lineHeight: 1.7,
                margin: 0,
                maxWidth: "380px",
              }}
            >
              Report civic issues, track progress, and make your city a better place.
            </p>
          </div>

          {/* Right CTA button */}
          <div style={{ flexShrink: 0 }}>
            <Link
              to={user ? "/report" : "/login"}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.6rem",
                backgroundColor: "#ffffff",
                color: "#000000",
                borderRadius: "9999px",
                padding: "1rem 2rem",
                fontSize: "0.9rem",
                fontWeight: 700,
                textDecoration: "none",
                whiteSpace: "nowrap",
                boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                transition: "background 0.2s, transform 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e5e5e5")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ffffff")}
            >
              Report an Issue
              <ArrowRight size={16} strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
