import { useState, useEffect, useRef } from "react";
import "../AirecoSite.css";
function BatteryRecycleAnimation() {
  const [phase, setPhase] = useState("idle"); // idle | falling | impact | powder
  const [dustParticles, setDustParticles] = useState([]);
  const timeoutsRef = useRef([]);

  const makeDust = () => {
    const particles = Array.from({ length: 14 }, () => {
      const angle = Math.random() * Math.PI - Math.PI;
      const dist = 20 + Math.random() * 45;
      return {
        id: Math.random(),
        size: 3 + Math.random() * 4,
        dx: Math.cos(angle) * dist,
        dy: -Math.abs(Math.sin(angle) * dist) * 0.6 - 10,
      };
    });
    setDustParticles(particles);
  };

  const clearPendingTimeouts = () => {
    timeoutsRef.current.forEach((id) => clearTimeout(id));
    timeoutsRef.current = [];
  };

  const runAnimation = () => {
    clearPendingTimeouts();
    setPhase("idle");
    setDustParticles([]);

    requestAnimationFrame(() => {
      setPhase("falling");
    });

    const t1 = setTimeout(() => {
      setPhase("impact");
    }, 900);

    const t2 = setTimeout(() => {
      makeDust();
      setPhase("powder");
    }, 1020);

    timeoutsRef.current.push(t1, t2);
  };

  useEffect(() => {
    runAnimation();
  }, []);

  return (
    <div className="battery-recycle-scene">
      <div className={`battery phase-${phase}`}>
        <svg viewBox="0 0 34 64" width="30" height="56">
          <rect x="12" y="0" width="10" height="6" rx="2" fill="#888780" />
          <rect x="2" y="6" width="30" height="56" rx="4" fill="#1D9E75" />
          <rect x="6" y="14" width="22" height="10" fill="#E1F5EE" />
          <text x="17" y="46" textAnchor="middle" fontSize="9" fill="#04342C" fontFamily="sans-serif">+/-</text>
        </svg>
      </div>

      <div className="dust-container" style={{zIndex: 999}}>

        {dustParticles.map((p) => (
          <div
            key={p.id}
            className="dust-particle"
            style={{
              width: p.size,
              height: p.size,
              "--dx": `${p.dx}px`,
              "--dy": `${p.dy}px`,
            }}
          />
        ))}
      </div>

      <div className={`powder-pile ${phase === "powder" ? "show" : ""}`}></div>
    </div>
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
          Something went wrong sending your message. Please try again or email us directly.
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
        <div className="max-w navbar-inner">
          <div className="brand">
            <img className="logo-img" href="./AirecoSite" src="logo.png" alt="Aireco logo" />
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
            <a href="#contact" className="btn btn-secondary">Learn More</a>
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
Aireco Recyclers Private Limited provides secure, compliant, and sustainable e-waste recycling for organizations and businesses, ensuring ethical disposal, maximum material recovery, and the return of valuable resources to the supply chain instead of landfills.With a process-driven approach and modern recycling infrastructure, Aireco ensures secure e-waste segregation, dismantling, processing, reverse logistics, documentation, and responsible recycling while promoting transparency, safety, sustainability, and a circular economy.            </p>
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
            <div className="project-box"></div>
            <div className="project-box"></div>
            <div className="project-box"></div>
            <div className="project-box"></div>
            <div className="project-box"></div>
            <div className="project-box"></div>
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

          <p className="contact-text">
            Phone : +91-9650521774
          </p>

          <p className="contact-text">E-mail : info@airecorecycler.com
          </p>

          <ContactForm />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="max-w footer-inner">
          <p>© 2026 Aireco Recyclers</p>
          <p>Sustainable • Responsible • Circular</p>
        </div>
      </footer>
    </>
  );
}