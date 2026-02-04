import React, { useState } from "react";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const ContactUs = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("http://localhost:3002/api/contactUs", form); // Backend endpoint
      toast.success("Message sent successfully!");
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      console.error(err?.message);
      toast.error("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  const reviews = [
    { name: "Alice", text: "Amazing website! Super helpful." },
    { name: "Bob", text: "Great UX and clean design." },
    { name: "Charlie", text: "Highly recommend this site for anyone!" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 text-white p-6 md:p-12">
      <ToastContainer theme="colored" position="top-right" />
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-12">
        {/* Left: Owner info */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="flex-1 flex flex-col items-center lg:items-start gap-6"
        >
          <img
            src="src\assets\contactUs.jpeg"
            alt="Owner"
            className="w-48 h-48 rounded-full object-cover border-4 border-purple-400"
          />
          <h2 className="text-3xl font-bold">Hi, I'm Geet</h2>
          <p className="text-gray-300 text-center lg:text-left">
            Welcome to my website! I love building modern web apps and helping
            people create secure, responsive solutions.
          </p>
        </motion.div>

        {/* Right: Contact form */}
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="flex-1 bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-lg"
        >
          <h3 className="text-2xl font-semibold mb-6 text-center">Contact Me</h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {["name", "email", "message"].map((field) => (
              <div key={field} className="relative">
                <input
                  type={field === "email" ? "email" : "text"}
                  name={field}
                  value={form[field]}
                  onChange={handleChange}
                  required
                  className="w-full p-4 pt-6 rounded-lg bg-white/20 border border-gray-400 text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-purple-400"
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                />
                <label
                  className="absolute left-4 top-3 text-gray-300 text-sm transition-all duration-200 pointer-events-none"
                >
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
              </div>
            ))}
            <button
              type="submit"
              disabled={loading}
              className="bg-purple-500 hover:bg-purple-600 transition-colors py-3 rounded-lg font-semibold"
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </motion.div>
      </div>

      {/* Reviews section */}
      <motion.div
        className="mt-16"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <h3 className="text-2xl font-bold mb-6 text-center">What People Say</h3>
        <div className="flex overflow-x-auto gap-6 py-4 scrollbar-hide">
          {reviews.map((r, idx) => (
            <motion.div
              key={idx}
              className="min-w-[250px] bg-white/20 backdrop-blur-md p-6 rounded-xl shadow-lg"
              whileHover={{ scale: 1.05 }}
            >
              <p className="italic mb-3">"{r.text}"</p>
              <p className="font-bold">- {r.name}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default ContactUs;
