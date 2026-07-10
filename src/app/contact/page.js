"use client";

import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle, MessageCircle, Clock, ExternalLink } from "lucide-react";

import { getDBService } from "@/lib/firebase";

const STORES = [
  {
    name: "Candy World — Thalawathugoda",
    address: "124, Hokandara Road, Thalawathugoda, Sri Lanka",
    phone: "+94 77 123 4567",
    hours: "Mon–Sat: 9:00 AM – 8:00 PM\nSun: 10:00 AM – 6:00 PM",
    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3961.07782!2d79.9200!3d6.8500!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwNTEnMDAuMCJOIDc5wrA1NSczNi4wIkU!5e0!3m2!1sen!2slk!4v1680000000000!5m2!1sen!2slk",
    emoji: "🏪",
    color: "from-candy-pink/10 to-pink-50",
  },
  {
    name: "Candy World — Colombo 03",
    address: "34/2, Flower Road, Colombo 03, Sri Lanka",
    phone: "+94 77 987 6543",
    hours: "Mon–Sat: 10:00 AM – 9:00 PM\nSun: 11:00 AM – 7:00 PM",
    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.8!2d79.8500!3d6.9100!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwNTQnMzYuMCJOIDc5wrA1MScwMC4wIkU!5e0!3m2!1sen!2slk!4v1680000001000!5m2!1sen!2slk",
    emoji: "🏬",
    color: "from-candy-purple/10 to-purple-50",
  },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "General Enquiry",
    message: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dbService = getDBService();
      await dbService.saveMessage({
        ...formData,
      });
      setSubmitted(true);
      setFormData({ name: "", phone: "", email: "", subject: "General Enquiry", message: "" });
    } catch (err) {
      console.error("Failed to submit enquiry", err);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/40">
      {/* Page header */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
          <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-candy-purple bg-candy-purple/10 px-3 py-1 rounded-full mb-3">
            <MapPin className="h-3.5 w-3.5" />
            Find Us or Drop a Message
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-3">
            Contact Candy World 🍬
          </h1>
          <p className="text-sm text-gray-500 max-w-lg mx-auto leading-relaxed">
            We&apos;re here for all your enquiries — product questions, wholesale orders, delivery issues or just a sweet chat. Reach us through any channel below.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">

        {/* Quick Contact Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <a
            href="https://wa.me/94771234567"
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-1 hover:bg-emerald-50 hover:border-emerald-200 transition-all flex items-center gap-4"
          >
            <div className="p-3 bg-emerald-50 text-emerald-500 rounded-xl flex-shrink-0">
              <MessageCircle className="h-6 w-6" />
            </div>
            <div>
              <span className="font-extrabold text-gray-800 text-sm block">WhatsApp Chat</span>
              <span className="text-xs text-emerald-600 font-medium">Fastest response · Usually within minutes</span>
            </div>
            <ExternalLink className="ml-auto h-4 w-4 text-gray-300 group-hover:text-emerald-500 transition-colors" />
          </a>

          <a
            href="tel:+94771234567"
            className="group bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-1 hover:bg-candy-pink/5 hover:border-candy-pink/30 transition-all flex items-center gap-4"
          >
            <div className="p-3 bg-candy-pink/10 text-candy-pink rounded-xl flex-shrink-0">
              <Phone className="h-6 w-6" />
            </div>
            <div>
              <span className="font-extrabold text-gray-800 text-sm block">Call Us</span>
              <span className="text-xs text-gray-500">+94 77 123 4567 · Mon–Sat 9am–8pm</span>
            </div>
          </a>

          <a
            href="mailto:candyworld.lk23@gmail.com"
            className="group bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-1 hover:bg-candy-purple/5 hover:border-candy-purple/30 transition-all flex items-center gap-4"
          >
            <div className="p-3 bg-candy-purple/10 text-candy-purple rounded-xl flex-shrink-0">
              <Mail className="h-6 w-6" />
            </div>
            <div>
              <span className="font-extrabold text-gray-800 text-sm block">Email Us</span>
              <span className="text-xs text-gray-500 break-all">candyworld.lk23@gmail.com</span>
            </div>
          </a>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Contact Form */}
          <div className="lg:col-span-7 bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="inline-flex p-4 bg-emerald-50 text-emerald-500 rounded-full">
                  <CheckCircle className="h-12 w-12" />
                </div>
                <h3 className="font-extrabold text-gray-900 text-xl">Message Received! 🎉</h3>
                <p className="text-sm text-gray-500 max-w-xs mx-auto">
                  Thank you for reaching out. Our team will get back to you within 24 hours. For urgent queries, please use WhatsApp.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="bg-candy-purple text-white text-xs font-extrabold px-6 py-2.5 rounded-full hover:bg-candy-purple-dark transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-extrabold text-gray-900 mb-6 border-b border-gray-100 pb-4">
                  📩 Send Us a Message
                </h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label htmlFor="contact-name" className="text-xs font-bold text-gray-500 uppercase">
                        Full Name *
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        placeholder="E.g. Shanika Perera"
                        value={formData.name}
                        onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-candy-purple/40 focus:border-candy-purple transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="contact-phone" className="text-xs font-bold text-gray-500 uppercase">
                        Phone Number
                      </label>
                      <input
                        id="contact-phone"
                        type="tel"
                        placeholder="+94 77 xxx xxxx"
                        value={formData.phone}
                        onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-candy-purple/40 focus:border-candy-purple transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="contact-email" className="text-xs font-bold text-gray-500 uppercase">
                      Email Address *
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      placeholder="customer@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-candy-purple/40 focus:border-candy-purple transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="contact-subject" className="text-xs font-bold text-gray-500 uppercase">
                      Subject
                    </label>
                    <select
                      id="contact-subject"
                      value={formData.subject}
                      onChange={(e) => setFormData((p) => ({ ...p, subject: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-candy-purple/40 focus:border-candy-purple transition-all font-semibold text-gray-700"
                    >
                      <option>General Enquiry</option>
                      <option>Wholesale / Bulk Order</option>
                      <option>Product Availability</option>
                      <option>Delivery Support</option>
                      <option>Returns / Exchange</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="contact-message" className="text-xs font-bold text-gray-500 uppercase">
                      Your Message *
                    </label>
                    <textarea
                      id="contact-message"
                      required
                      rows={4}
                      placeholder="Tell us about your enquiry, what products you're looking for, or how we can help..."
                      value={formData.message}
                      onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-candy-purple/40 focus:border-candy-purple transition-all resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-candy-purple hover:bg-candy-purple-dark text-white font-extrabold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5"
                  >
                    <Send className="h-4.5 w-4.5" />
                    Submit Enquiry
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Store Locations */}
          <div className="lg:col-span-5 space-y-5">
            <h2 className="text-xl font-extrabold text-gray-900">🗺️ Our Physical Stores</h2>

            {STORES.map((store, i) => (
              <div key={i} className={`bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm`}>
                {/* Map Embed */}
                <div className="h-44 bg-gray-100 relative">
                  <iframe
                    src={store.mapUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full h-full"
                    title={store.name}
                  />
                </div>
                <div className={`p-5 bg-gradient-to-br ${store.color} space-y-3`}>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{store.emoji}</span>
                    <h3 className="font-extrabold text-gray-900 text-sm">{store.name}</h3>
                  </div>
                  <div className="space-y-2 text-xs text-gray-600">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-3.5 w-3.5 text-candy-pink flex-shrink-0 mt-0.5" />
                      <span>{store.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-candy-purple flex-shrink-0" />
                      <a href={`tel:${store.phone}`} className="hover:text-candy-purple font-semibold">{store.phone}</a>
                    </div>
                    <div className="flex items-start gap-2">
                      <Clock className="h-3.5 w-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span className="whitespace-pre-line">{store.hours}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
