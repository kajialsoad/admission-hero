"use client";

import { useState } from "react";
import emailjs from "emailjs-com";

export default function DeleteAccountPage() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    reason: "",
  });
  const [status, setStatus] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Sending...");

    emailjs
      .send(
        "service_53qgtxa", // 🔹 EmailJS Service ID
        "template_o74al0d", // 🔹 EmailJS Template ID
        {
          name: form.name,
          phone: form.phone,
          reason: form.reason,
        },
        "U-KvWBWtHVMy5eSKe" // 🔹 EmailJS Public Key
      )
      .then(
        () => {
          setStatus("✅ Request sent successfully!");
          setForm({ name: "", phone: "", reason: "" });
        },
        () => {
          setStatus("❌ Failed to send request. Try again.");
        }
      );
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-6">
      <div className="w-full max-w-lg bg-white shadow-lg rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-center text-red-600 mb-4">
          Delete Account Request
        </h1>
        <p className="text-gray-600 text-center mb-6">
          Please fill out the form below to request deletion of your account.
          Your request will be processed within 7 business days.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:outline-none"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              name="phone"
              type="text"
              value={form.phone}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:outline-none"
              placeholder="Enter your phone number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason (optional)
            </label>
            <textarea
              name="reason"
              rows={4}
              value={form.reason}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:outline-none"
              placeholder="Why do you want to delete your account?"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            Submit Request
          </button>
        </form>

        {status && <p className="text-center mt-4 text-sm">{status}</p>}
      </div>
    </div>
  );
}
