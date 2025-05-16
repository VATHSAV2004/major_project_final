import React from 'react';
import './index.css';

const About = () => {
  return (
    <div className="about-container">
      <h1>About EveOsmania</h1>
      <p>
        <strong>EveOsmania</strong> is a centralized event management platform designed to streamline and enhance the event experience within Osmania University. 
        Our mission is to provide an intuitive and efficient way for students, faculty, and clubs to organize, register, and manage events seamlessly.
      </p>

      <h2>Key Features</h2>
      <ul>
        <li>Browse and discover events organized by different clubs and departments.</li>
        <li>User registration with real-time status tracking (pending, approved).</li>
        <li>Role-based dashboards for users, volunteers, managers, and administrators.</li>
        <li>Event recommendations based on user interests.</li>
        <li>Secure payment and screenshot verification for event registrations.</li>
      </ul>

      <h2>Who Can Use It?</h2>
      <p>
        EveOsmania is built for everyone in the Osmania University community:
      </p>
      <ul>
        <li><strong>Students:</strong> Discover, register, and participate in events.</li>
        <li><strong>Volunteers:</strong> Assist in organizing and managing events.</li>
        <li><strong>Managers:</strong> Oversee event logistics and registrations.</li>
        <li><strong>Admins:</strong> Manage users, events, and overall platform integrity.</li>
      </ul>

      <p className="thank-you">Thank you for being a part of our event-driven community!</p>
    </div>
  );
};

export default About;
