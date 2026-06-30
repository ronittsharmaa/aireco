import { useParams, Navigate, Link } from "react-router-dom";
import "./ServiceDetails.css";
import { services } from "../data/services";

export default function ServiceDetails() {
  const { slug } = useParams();
  const service = services.find((item) => item.slug === slug);

  if (!service) {
    return <Navigate to="/404" replace />;
  }

  return (
    <section className="service-details">
      <div className="service-card">
        <div className="service-image">
          <img src={service.image} alt={service.title} />
        </div>

        <div className="service-content">
          <p className="service-eyebrow">{service.eyebrow}</p>
          <h1 className="service-title">{service.title}</h1>
          <p className="service-description">{service.description}</p>

          <div className="service-info-grid">
            <div className="service-info-box">
              <h3>What we do</h3>
              <ul>
                {service.whatWeDo?.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </div>

            <div className="service-info-box">
              <h3>Ideal for</h3>
              <ul>
                {service.idealFor?.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="service-footer">
            {service.tags && (
              <span className="service-tags">{service.tags}</span>
            )}
            <Link to="/#contact" className="btn btn-secondary service-enquire">
              Enquire →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}