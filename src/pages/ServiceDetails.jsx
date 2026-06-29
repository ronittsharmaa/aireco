// src/pages/ServiceDetails.jsx

import { useParams, Navigate } from "react-router-dom";
import { services } from "../data/services";

function ServiceDetails({ title }) {
  const { slug } = useParams();

  const service = services.find((item) => item.slug === slug);

  if (!service) {
    return <Navigate to="/404" replace />;
  }

  return (
    <div>
      <h1>{title}</h1>
      <h1>{service.title}</h1>
      <p>{service.description || "Coming soon..."}</p>
      <img
        src={service.image}
        alt={service.title}
        height="100"
        width="100"
      />{" "}
    </div>
  );
}

export default ServiceDetails;
