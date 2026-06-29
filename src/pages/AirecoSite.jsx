import { useState, useEffect, useRef } from "react";
import "../AirecoSite.css";
import { services } from "../data/services";
import { Link } from "react-router-dom";

const styles = `
.bra-scene {
  position: absolute;
  left: 8%;
  top: 0;
  bottom: 0;
  width: 120px;
  overflow: visible;
  pointer-events: none;
  z-index: 1000;
}
.bra-battery {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: none;
  top: -80px;
}
.bra-battery.phase-falling {
  transition: top 1.1s cubic-bezier(0.55, 0.05, 0.95, 0.45),
              transform 1.1s linear;
  top: calc(100% - 180px);
  transform: translateX(-50%) rotate(-25deg);
}
.bra-battery.phase-impact {
  top: calc(100% - 200px);
  transform: translateX(-50%) rotate(-25deg) scaleY(0.75) scaleX(1.2);
  transition: transform 0.08s ease-out, top 0.08s ease-out;
}
.bra-battery.phase-vanish {
  opacity: 0;
  transform: translateX(-50%) rotate(-25deg) scale(0.5);
  transition: opacity 0.12s ease-out, transform 0.12s ease-out;
}
.bra-dust-area {
  position: absolute;
  bottom: 200px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
}
.bra-dust-particle {
  position: absolute;
  border-radius: 50%;
  opacity: 0;
  left: 0;
  top: 0;
}
.bra-dust-particle.burst {
  animation: bra-dustburst 0.6s cubic-bezier(0.2, 0.8, 0.3, 1) forwards;
}
@keyframes bra-dustburst {
  0%   { transform: translate(0, 0); opacity: 0.9; }
  100% { transform: translate(var(--dx), var(--dy)); opacity: 0; }
}
.bra-pile {
  position: absolute;
  bottom: 200px;
  left: 50%;
  transform: translateX(-50%);
  width: 70px;
  height: 0;
  border-radius: 50% 50% 6px 6px / 40% 40% 8px 8px;
  background: #1a1a18;
  opacity: 0;
  transition: height 0.5s cubic-bezier(0.3, 1.5, 0.5, 1),
              opacity 0.3s ease-out,
              box-shadow 0.5s ease-out;
  box-shadow: none;
}
.bra-pile.show {
  height: 28px;
  opacity: 1;
  box-shadow: 0 0 18px 4px rgba(80, 80, 60, 0.35),
              0 0 6px 2px rgba(120, 120, 80, 0.2);
}
.bra-pile.glow {
  box-shadow: 0 0 32px 10px rgba(100, 100, 60, 0.55),
              0 0 12px 4px rgba(160, 150, 80, 0.35);
  transition: box-shadow 0.4s ease-in-out;
}
.bra-pile.fade-out {
  opacity: 0;
  height: 0;
  box-shadow: none;
  transition: opacity 0.6s ease-out, height 0.6s ease-out, box-shadow 0.4s ease-out;
}
.bra-glow-ring {
  position: absolute;
  bottom: 200px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 10px;
  border-radius: 50%;
  background: radial-gradient(ellipse, rgba(100, 100, 70, 0.22) 0%, transparent 80%);
  opacity: 0;
  transition: opacity 0.6s ease-out 0.3s;
  pointer-events: none;
}
.bra-glow-ring.show { opacity: 1; }
.bra-glow-ring.glow {
  background: radial-gradient(ellipse, rgba(140, 130, 60, 0.45) 0%, transparent 80%);
  width: 110px;
  transition: opacity 0.4s ease-in-out, width 0.4s ease-in-out, background 0.4s ease-in-out;
}
.bra-glow-ring.fade-out {
  opacity: 0;
  transition: opacity 0.6s ease-out;
}
`;

function BatteryRecycleAnimation() {
  const [phase, setPhase] = useState("idle");
  const [dustParticles, setDustParticles] = useState([]);
  const [pileClass, setPileClass] = useState("");
  const [glowClass, setGlowClass] = useState("");
  const [done, setDone] = useState(false);
  const timersRef = useRef([]);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const makeDust = () => {
    const particles = Array.from({ length: 18 }, () => {
      const angle = Math.random() * Math.PI * 1.4 - Math.PI * 0.7;
      const dist = 22 + Math.random() * 52;
      const dx = Math.cos(angle) * dist * (Math.random() > 0.5 ? 1 : -1);
      const dy = -(
        Math.abs(Math.sin(angle)) * dist * 0.5 +
        8 +
        Math.random() * 10
      );
      const size = 2.5 + Math.random() * 4;
      return {
        id: Math.random(),
        size,
        dx,
        dy,
        color: Math.random() > 0.4 ? "#888780" : "#2C2C2A",
      };
    });
    setDustParticles(particles);
  };

  const runAnimation = () => {
    clearTimers();
    setPhase("idle");
    setDustParticles([]);
    setPileClass("");
    setGlowClass("");
    setDone(false);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setPhase("falling");
      });
    });

    // Impact squash
    const t1 = setTimeout(() => setPhase("impact"), 1050);

    // Battery vanishes, dust bursts
    const t2 = setTimeout(() => {
      setPhase("vanish");
      makeDust();
    }, 1180);

    // Pile rises + soft glow
    const t3 = setTimeout(() => {
      setPileClass("show");
      setGlowClass("show");
    }, 1350);

    // Intensify glow after pile settles
    const t4 = setTimeout(() => {
      setPileClass("show glow");
      setGlowClass("show glow");
    }, 1900);

    // Fade everything out after 2s of glow
    const t5 = setTimeout(() => {
      setPileClass("show glow fade-out");
      setGlowClass("show glow fade-out");
    }, 3900);

    // Mark done so the wrapper unmounts / hides
    const t6 = setTimeout(() => {
      setDone(true);
    }, 4600);

    timersRef.current.push(t1, t2, t3, t4, t5, t6);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    runAnimation();
    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [burstKey, setBurstKey] = useState(0);
  useEffect(() => {
    if (dustParticles.length > 0) {
      requestAnimationFrame(() => setBurstKey((k) => k + 1));
    }
  }, [dustParticles]);

  if (done) return null;

  return (
    <>
      <style>{styles}</style>
      <div className="bra-scene">
        <div
          className={`bra-battery${phase !== "idle" ? ` phase-${phase}` : ""}`}
        >
          <svg viewBox="0 0 40 72" width="40" height="72">
            <rect x="14" y="0" width="12" height="8" rx="3" fill="#5F5E5A" />
            <rect x="2" y="8" width="36" height="62" rx="6" fill="#1D9E75" />
            <rect
              x="7"
              y="17"
              width="26"
              height="11"
              rx="2"
              fill="#9FE1CB"
              opacity="0.7"
            />
            <rect
              x="10"
              y="36"
              width="20"
              height="4"
              rx="1.5"
              fill="#085041"
              opacity="0.9"
            />
            <rect
              x="10"
              y="44"
              width="20"
              height="4"
              rx="1.5"
              fill="#085041"
              opacity="0.9"
            />
            <rect
              x="10"
              y="52"
              width="20"
              height="4"
              rx="1.5"
              fill="#085041"
              opacity="0.9"
            />
            <text
              x="20"
              y="31"
              textAnchor="middle"
              fontSize="8"
              fill="#04342C"
              fontFamily="sans-serif"
              fontWeight="600"
            >
              +
            </text>
          </svg>
        </div>

        <div className="bra-dust-area">
          {dustParticles.map((p) => (
            <div
              key={p.id}
              className={`bra-dust-particle${burstKey > 0 ? " burst" : ""}`}
              style={{
                width: p.size,
                height: p.size,
                background: p.color,
                "--dx": `${p.dx}px`,
                "--dy": `${p.dy}px`,
              }}
            />
          ))}
        </div>

        <div className={`bra-pile${pileClass ? ` ${pileClass}` : ""}`} />
        <div className={`bra-glow-ring${glowClass ? ` ${glowClass}` : ""}`} />
      </div>
    </>
  );
}

function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    number: "",
    message: "",
  });

  const [status, setStatus] = useState("idle"); // idle | sending | success | error

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_key: "b5f87e8c-0c4c-4e5f-8a2a-27c028d095e4", // paste your real Web3Forms key here
          subject: "New enquiry from Aireco website",
          from_name: "Aireco Website",
          name: form.name,
          email: form.email,
          number: form.number,
          message: form.message,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setStatus("success");
        setForm({ name: "", email: "", number: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-field">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Your name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="number">Phone Number</label>
          <input
            id="number"
            name="number"
            type="tel"
            placeholder="+91 00000 00000"
            value={form.number}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-field">
        <label htmlFor="message">Message</label>
        <textarea
          id="message"
          name="message"
          placeholder="Tell us what you need recycled..."
          rows={4}
          value={form.message}
          onChange={handleChange}
          required
        />
      </div>

      <button
        type="submit"
        className="btn btn-primary btn-large form-submit"
        disabled={status === "sending"}
      >
        {status === "sending" ? "Sending..." : "Submit"}
      </button>

      {status === "success" && (
        <p className="form-status form-status-success">
          Thanks! Your message has been sent — we'll get back to you soon.
        </p>
      )}

      {status === "error" && (
        <p className="form-status form-status-error">
          Something went wrong sending your message. Please try again or email
          us directly.
        </p>
      )}
    </form>
  );
}

export default function AirecoSite() {
  const fadeRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
        }
      });
    });

    fadeRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const addFadeRef = (el) => {
    if (el && !fadeRefs.current.includes(el)) {
      fadeRefs.current.push(el);
    }
  };

  return (
    <>
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="navbar-inner">
          <div className="brand">
            <img
              className="logo-img"
              href="./AirecoSite"
              src="logo.png"
              alt="Aireco logo"
            />
            <h1 className="logo">AIRECO</h1>
          </div>

          <div className="nav-links">
            <a href="#about">About</a>
            <a href="#services">What We Do</a>
            <a href="#projects">Services</a>
            <a href="#contact">Contact</a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <BatteryRecycleAnimation />

        <div className="blur-circle green-light"></div>
        <div className="blur-circle green-dark"></div>

        <div className="max-w">
          <p className="hero-eyebrow">Sustainable Recycling Solutions</p>

          <h1 className="section-title hero-title">
            Environmentally Responsible Recycling Solutions
          </h1>

          <p className="hero-sub">
            Turning today’s e-waste into tomorrow’s resources.
          </p>

          <div className="hero-actions">
            <a href="#contact" className="btn btn-secondary">
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="section">
        <div className="max-w fade-up" ref={addFadeRef}>
          <p className="eyebrow">About Us</p>

          <h2 className="section-title mb-10">Recycling With Purpose</h2>

          <div className="about-grid">
            <p>
              Aireco Recyclers Private Limited provides secure, compliant, and
              sustainable e-waste recycling for organizations and businesses,
              ensuring ethical disposal, maximum material recovery, and the
              return of valuable resources to the supply chain instead of
              landfills.With a process-driven approach and modern recycling
              infrastructure, Aireco ensures secure e-waste segregation,
              dismantling, processing, reverse logistics, documentation, and
              responsible recycling while promoting transparency, safety,
              sustainability, and a circular economy.{" "}
            </p>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="section section-alt">
        <div className="max-w fade-up" ref={addFadeRef}>
          <h2 className="section-title mb-20">What We Do</h2>

          <div className="services-grid">
            <div className="service-card">
              <h3>Collection</h3>
              <p>We handle secure e-waste pickup from your location.</p>
            </div>

            <div className="service-card">
              <h3>Recycling</h3>
              <p>Specialized dismantling of hazardous electronic parts.</p>
            </div>

            <div className="service-card">
              <h3>Compliance</h3>
              <p>Sorting and segregation for efficient recycling.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PROJECTS */}
      <section id="projects" className="section">
        <div className="max-w fade-up" ref={addFadeRef}>
          <h2 className="section-title mb-20">Services</h2>

          <div className="projects-grid">
            {services.map((service) => (
              <Link
                key={service.id}
                to={`/services/${service.slug}`}
                className="project-box"
              >
                <div key={services.id} className="project-box">
                  {services.title}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="stats">
        <div className="max-w">
          <div className="stats-grid">
            <div>
              <h3 className="stat-number">500+</h3>
              <p className="stat-label">Clients</p>
            </div>

            <div>
              <h3 className="stat-number">25K</h3>
              <p className="stat-label">Tons Recycled</p>
            </div>

            <div>
              <h3 className="stat-number">15+</h3>
              <p className="stat-label">Years</p>
            </div>

            <div>
              <h3 className="stat-number">100%</h3>
              <p className="stat-label">Compliance</p>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="section">
        <div className="max-w fade-up" ref={addFadeRef}>
          <h2 className="section-title mb-10">Let's Work Together</h2>

          <p className="contact-text">Phone : +91-9650521774</p>

          <p className="contact-text">E-mail : info@airecorecycler.com</p>

          <ContactForm />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="max-w footer-inner">
          <p>© {new Date().getFullYear()} Aireco Recyclers</p>
          <p>Sustainable • Responsible • Circular</p>
        </div>
      </footer>
    </>
  );
}
