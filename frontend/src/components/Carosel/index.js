import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import EventCard from "../Card3";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "./index.css";

const ArrowButton = ({ className, style, onClick, direction }) => (
  <button
    className={`${className} slick-arrow`}
    onClick={onClick}
    style={{
      ...style,
      display: "block",
      background: "rgba(0, 0, 0, 0.5)",
      borderRadius: "50%",
      width: "40px",
      height: "40px",
      position: "absolute",
      top: "50%",
      transform: "translateY(-50%)",
      zIndex: 10,
      color: "white",
      fontSize: "20px",
      border: "none",
      cursor: "pointer",
    }}
  >
    {direction === "prev" ? <FaChevronLeft /> : <FaChevronRight />}
  </button>
);

export default function SliderComponent({ events = [] }) {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    prevArrow: <ArrowButton direction="prev" />,
    nextArrow: <ArrowButton direction="next" />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          arrows: true,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          centerMode: false,
          arrows: true,
        },
      },
    ],
  };

  return (
    <div className="slider-container">
      <Slider {...settings}>
        {events.map((event) => (
          <div key={event._id}>
            <EventCard
              eventId={event._id}
              image={
                event.poster && event.posterContentType
                  ? `data:${event.posterContentType};base64,${event.poster}`
                  : "https://via.placeholder.com/300x200?text=No+Image" // fallback if no poster
              }
              name={event.name}
              description={event.description}
            />
          </div>
        ))}
      </Slider>
    </div>
  );
}
