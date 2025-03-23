import React, { useState, useEffect } from 'react';
import axios from 'axios';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

const API_URL = 'http://localhost:8080/api';

const App = () => {
  const [activeTab, setActiveTab] = useState('current');
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    flatpickr('#reservation-time-input', {
      enableTime: true,
      noCalendar: false,
      dateFormat: 'Y-m-d H:00',
      minTime: '08:00',
      maxTime: '22:00',
      time_24hr: true,
      minuteIncrement: 60,
    });

    flatpickr('#start-date', { dateFormat: 'Y-m-d' });
    flatpickr('#end-date', { dateFormat: 'Y-m-d' });

    fetchActiveReservations();
  }, []);

  const fetchActiveReservations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/reservations/active`);
      setReservations(response.data);
    } catch (err) {
      console.log('Full Axios Error:', err.response || err); // Agrega esto
      setError('Failed to load reservations. Please try again later.');
      console.error('Error fetching reservations:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPastReservations = async () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      setError('Please select both start and end dates');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
          `${API_URL}/reservations/past?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
      );
      setReservations(response.data);
    } catch (err) {
      setError('Failed to load past reservations. Please try again later.');
      console.error('Error fetching past reservations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReservationSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const reservationData = {
      email: formData.get('email'),
      name: formData.get('name'),
      studentId: formData.get('studentId'),
      laboratory: formData.get('laboratory'),
      reservationTime: new Date(formData.get('reservationTime')).toISOString().split('.')[0],
    };

    try {
      setLoading(true);
      setError(null);
      await axios.post(`${API_URL}/reservations`, reservationData);
      event.target.reset();
      fetchActiveReservations();
      alert('Reservation created successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create reservation. Please try again.');
      console.error('Error creating reservation:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'current') {
      fetchActiveReservations();
    } else if (tab === 'past') {
      fetchPastReservations();
    }
  };

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
      <div>
        <header className="header">
          <div className="container">
            <h1 className="text-center">Laboratory Access Request System</h1>
          </div>
        </header>

        <div className="container">
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button
                  className={`nav-link ${activeTab === 'current' ? 'active' : ''}`}
                  onClick={() => handleTabChange('current')}
              >
                Current Reservations
              </button>
            </li>
            <li className="nav-item">
              <button
                  className={`nav-link ${activeTab === 'past' ? 'active' : ''}`}
                  onClick={() => handleTabChange('past')}
              >
                Past Reservations
              </button>
            </li>
            <li className="nav-item">
              <button
                  className={`nav-link ${activeTab === 'new' ? 'active' : ''}`}
                  onClick={() => handleTabChange('new')}
              >
                New Reservation
              </button>
            </li>
          </ul>

          {activeTab === 'current' && (
              <div>
                <h2>Current Reservations</h2>
                {loading && (
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                )}
                {error && <div className="alert alert-danger">{error}</div>}
                {!loading && reservations.length === 0 && (
                    <div className="alert alert-info">No active reservations found.</div>
                )}
                <div className="row">
                  {reservations.map((reservation) => (
                      <div className="col-md-4" key={reservation.id}>
                        <div className="card reservation-card">
                          <div className="card-body">
                            <h5 className="card-title">{reservation.name}</h5>
                            <h6 className="card-subtitle mb-2 text-muted">ID: {reservation.studentId}</h6>
                            <p className="card-text">
                              <strong>Email:</strong> {reservation.email}
                              <br />
                              <strong>Laboratory:</strong> {reservation.laboratory}
                              <br />
                              <strong>Time:</strong> {formatDateTime(reservation.reservationTime)}
                            </p>
                          </div>
                        </div>
                      </div>
                  ))}
                </div>
              </div>
          )}

          {activeTab === 'past' && (
              <div>
                <h2>Past Reservations</h2>
                <div className="card mb-4">
                  <div className="card-body">
                    <div className="row g-3 align-items-center">
                      <div className="col-md-4">
                        <label htmlFor="start-date" className="form-label">
                          Start Date
                        </label>
                        <input
                            type="text"
                            id="start-date"
                            className="form-control"
                            value={dateRange.startDate}
                            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                        />
                      </div>
                      <div className="col-md-4">
                        <label htmlFor="end-date" className="form-label">
                          End Date
                        </label>
                        <input
                            type="text"
                            id="end-date"
                            className="form-control"
                            value={dateRange.endDate}
                            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                        />
                      </div>
                      <div className="col-md-4 d-flex align-items-end">
                        <button
                            className="btn btn-primary"
                            onClick={fetchPastReservations}
                            disabled={loading}
                        >
                          {loading ? (
                              <>
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...
                              </>
                          ) : (
                              'Search'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                {error && <div className="alert alert-danger">{error}</div>}
                {!loading && reservations.length === 0 && (
                    <div className="alert alert-info">No reservations found for the selected date range.</div>
                )}
                <div className="row">
                  {reservations.map((reservation) => (
                      <div className="col-md-4" key={reservation.id}>
                        <div className="card reservation-card">
                          <div className="card-body">
                            <h5 className="card-title">{reservation.name}</h5>
                            <h6 className="card-subtitle mb-2 text-muted">ID: {reservation.studentId}</h6>
                            <p className="card-text">
                              <strong>Email:</strong> {reservation.email}
                              <br />
                              <strong>Laboratory:</strong> {reservation.laboratory}
                              <br />
                              <strong>Time:</strong> {formatDateTime(reservation.reservationTime)}
                            </p>
                          </div>
                        </div>
                      </div>
                  ))}
                </div>
              </div>
          )}

          {activeTab === 'new' && (
              <div>
                <h2>New Reservation</h2>
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="card">
                  <div className="card-body">
                    <form onSubmit={handleReservationSubmit}>
                      <div className="mb-3">
                        <label htmlFor="email-input" className="form-label">
                          Email
                        </label>
                        <input type="email" className="form-control" id="email-input" name="email" required />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="name-input" className="form-label">
                          Full Name
                        </label>
                        <input type="text" className="form-control" id="name-input" name="name" required />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="student-id-input" className="form-label">
                          Student ID
                        </label>
                        <input type="text" className="form-control" id="student-id-input" name="studentId" required />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="laboratory-input" className="form-label">
                          Laboratory
                        </label>
                        <select className="form-select" id="laboratory-input" name="laboratory" required>
                          <option value="">Select Laboratory</option>
                          <option value="Lab 1">Lab 1</option>
                          <option value="Lab 2">Lab 2</option>
                          <option value="Lab 3">Lab 3</option>
                          <option value="Lab 4">Lab 4</option>
                        </select>
                      </div>
                      <div className="mb-3">
                        <label htmlFor="reservation-time-input" className="form-label">
                          Reservation Time
                        </label>
                        <input type="text" className="form-control" id="reservation-time-input" name="reservationTime" required />
                        <div className="form-text">Select a time between 8 AM and 10 PM. Reservations must be on the hour.</div>
                      </div>
                      <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Submitting...
                            </>
                        ) : (
                            'Submit Reservation'
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
          )}
        </div>
      </div>
  );
};

export default App;