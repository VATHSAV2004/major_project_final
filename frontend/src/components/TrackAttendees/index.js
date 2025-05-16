import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from "recharts";
import "./index.css";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const TrackAttendees = () => {
  const { eventId } = useParams();
  const [attendees, setAttendees] = useState([]);
  const [eventName, setEventName] = useState("");
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    const fetchAttendees = async () => {
      try {
        const res = await axios.get(`http://localhost:3001/api/events/${eventId}/attendees`);
        setAttendees(res.data.attendees || []);
        setEventName(res.data.eventName || "Untitled Event");
      } catch (error) {
        console.error("Error fetching attendees:", error);
      }
    };

    const fetchAnalytics = async () => {
      try {
        const res = await axios.get(`http://localhost:3001/events/${eventId}/analytics`);
        setAnalytics(res.data);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      }
    };

    fetchAttendees();
    fetchAnalytics();
  }, [eventId]);

  const formatData = (dataObj) =>
    Object.entries(dataObj).map(([key, value]) => ({ name: key, value }));

  return (
    <div className="track-attendees-wrapper">
      <h2>Attendees for: <span className="highlight">{eventName}</span></h2>
      {attendees.length > 0 ? (
        <ul className="attendee-list">
          {attendees.map((attendee, index) => (
            <li key={index} className="attendee-item">
              <strong>{attendee.name}</strong> ({attendee.email})
            </li>
          ))}
        </ul>
      ) : (
        <p>No attendees found.</p>
      )}

      {analytics && (
        <div className="analytics-section">
          <h3>Analytics</h3>
          <p><strong>Total Attendees:</strong> {analytics.totalAttendees}</p>

          <div className="chart-row">
            <div className="chart-box">
              <h4>Occupation</h4>
              <PieChart width={300} height={250}>
                <Pie data={formatData(analytics.occupationCounts)} dataKey="value" nameKey="name" outerRadius={80} label>
                  {formatData(analytics.occupationCounts).map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </div>

            <div className="chart-box">
              <h4>Year-wise (Students)</h4>
              <BarChart width={400} height={250} data={formatData(analytics.yearCounts)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </div>

            <div className="chart-box">
              <h4>Department</h4>
              <BarChart width={400} height={250} data={formatData(analytics.departmentCounts)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#82ca9d" />
              </BarChart>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackAttendees;
