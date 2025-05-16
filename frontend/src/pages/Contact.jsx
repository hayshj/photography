import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.message) {
      setStatus('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setStatus('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok) {
        setSent(true);
        setForm({ name: '', email: '', message: '' });
      } else {
        setStatus(data.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setStatus('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-black">
      <Navbar />
      <main className="flex-grow py-10 px-6 mt-[60px]">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-semibold mb-8 text-center">Contact Me</h2>

          {sent ? (
            <div className="text-center text-green-600 text-lg font-medium">
              Thank you! Your message has been sent.
              <br />
              <Link to="/" className="text-blue-500 hover:underline">
                Back to Home
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your Name"
                className="w-full p-3 border border-gray-300 rounded"
                disabled={loading}
              />

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Your Email"
                className="w-full p-3 border border-gray-300 rounded"
                disabled={loading}
              />

              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Your Message"
                rows="5"
                className="w-full p-3 border border-gray-300 rounded"
                disabled={loading}
              />

              <button
                type="submit"
                className={`w-full py-3 rounded text-white transition-colors ${
                  loading ? 'bg-gray-500 cursor-not-allowed' : 'bg-black hover:bg-gray-800'
                }`}
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>

              {status && (
                <p className="text-center text-sm text-red-500 mt-2">{status}</p>
              )}
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

export default Contact;
