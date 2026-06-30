import { useState, useEffect, useRef } from "react";
import "../AirecoSite.css";
import "./ScrollBattery.css";
import "./RevealText.css";
import { services } from "../data/services";
import { Link } from "react-router-dom";
import ScrollBattery from "./ScrollBattery";
import RevealText from "./Revealtext";

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

/**
 * StaggerGroup
 * Wraps a set of children (cards, stat blocks, etc) and reveals each one
 * with a staggered delay as the group scrolls into view — used for the
 * service cards, project boxes, and stats grid so they cascade in rather
 * than appearing all at once.
 */
function StaggerGroup({ children, className = "", staggerMs = 90 }) {
  const groupRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = groupRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      setVisible(entry.isIntersecting);
    });
  },
  { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const items = Array.isArray(children) ? children : [children];

  return (
    <div ref={groupRef} className={className}>
      {items.map((child, i) => (
        <div
          key={i}
          className={`fade-up-item ${visible ? "show" : ""}`}
          style={{ transitionDelay: `${i * staggerMs}ms` }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

export default function AirecoSite() {
  const fadeRefs = useRef([]);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);



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
    <div className="blur-circle green-light"></div>
        <div className="blur-circle green-dark"></div>
      {/* Scroll-driven background battery: grows on scroll, bursts into dust once, then gone */}
      <ScrollBattery />

      {/* NAVBAR */}
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
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
        

        <div className="max-w">
          <RevealText as="p" className="hero-eyebrow" delay={0}>
            Sustainable Recycling Solutions
          </RevealText>

          <RevealText
            as="h1"
            className="section-title hero-title"
            split="lines"
            delay={110}
          >
            {"Environmentally Responsible\nRecycling Solutions"}
          </RevealText>

          <RevealText as="p" className="hero-sub" delay={0}>
            Turning today’s e-waste into tomorrow’s resources.
          </RevealText>

          <div className="hero-actions">
            <a href="#contact" className="btn btn-secondary">
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="section">
        <div className="max-w">
          <RevealText as="p" className="eyebrow" delay={0}>
            About Us
          </RevealText>

          <RevealText as="h2" className="section-title mb-10" delay={0}>
            Recycling With Purpose
          </RevealText>

          <div className="about-grid fade-up" ref={addFadeRef}>
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
        <div className="max-w">
          <RevealText as="h2" className="section-title mb-20" delay={0}>
            What We Do
          </RevealText>

          <StaggerGroup className="services-grid" staggerMs={100}>
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
          </StaggerGroup>
        </div>
      </section>

      {/* PROJECTS */}
      <section id="projects" className="section">
        <div className="max-w">
          <RevealText as="h2" className="section-title mb-20" delay={0}>
            Services
          </RevealText>

          <StaggerGroup className="projects-grid" staggerMs={90}>
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
          </StaggerGroup>
        </div>
      </section>

      {/* STATS */}
      <section className="stats">
        <div className="max-w">
          <StaggerGroup className="stats-grid" staggerMs={80}>
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
          </StaggerGroup>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="section">
        <div className="max-w">
          <RevealText as="h2" className="section-title mb-10" delay={0}>
            Let's Work Together
          </RevealText>

          <div className="fade-up" ref={addFadeRef}>
            <p className="contact-text">Phone : +91-9650521774</p>
            <p className="contact-text">E-mail : info@airecorecycler.com</p>
            <ContactForm />
          </div>
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