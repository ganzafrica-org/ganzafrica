'use client';

import React, { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, Leaf, Send, CheckCircle2, Building2, AlertCircle } from "lucide-react";
import { safeAccess } from "@/lib/utils/safeAccess";
import { motion, AnimatePresence } from "framer-motion";
import apiClient from "@/lib/api-client";
import { trackFormSubmission, trackVideoEvent } from "@/components/analytics/google-analytics";
import { TranslatableText } from "@/components/translate/TranslatableText";

const ContactUsContent: React.FC = () => {
    const [formState, setFormState] = useState({
        name: "",
        email: "",
        phone: "",
        message: "",
        location: "rwanda",
    });

    const [isPointerActive, setIsPointerActive] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formSuccess, setFormSuccess] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [newsletterEmail, setNewsletterEmail] = useState("");
    const [newsletterSuccess, setNewsletterSuccess] = useState(false);
    const [newsletterError, setNewsletterError] = useState<string | null>(null);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormState((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setFormError(null);

        try {
            // Send to the API endpoint
            const response = await apiClient.post('/contacts', formState, { timeout: 10000 });

            // Show success message and reset form
            setFormSuccess(true);

            // Track successful form submission
            trackFormSubmission('contact_form', true);

            setFormState({
                name: "",
                email: "",
                phone: "",
                message: "",
                location: "rwanda",
            });

            // Reset success message after 5 seconds
            setTimeout(() => {
                setFormSuccess(false);
            }, 5000);

        } catch (error: any) {
            console.error("Error submitting contact form:", error);

            // Track failed form submission
            trackFormSubmission('contact_form', false);


            // Set appropriate error message
            if (error.response && error.response.data && error.response.data.message) {
                setFormError(error.response.data.message);
            } else {
                setFormError("An error occurred while submitting the form. Please try again later.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleNewsletterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newsletterEmail) return;

        setNewsletterError(null);

        try {
            const response = await apiClient.post('/newsletter/subscribe', {
                email: newsletterEmail
            });

            // Show success message and reset form
            setNewsletterSuccess(true);

            // Track successful newsletter subscription
            trackFormSubmission('newsletter_subscribe_contact', true);

            setNewsletterEmail("");

            // Reset success message after 5 seconds
            setTimeout(() => {
                setNewsletterSuccess(false);
            }, 5000);
        } catch (error: any) {
            console.error("Error subscribing to newsletter:", error);

            // Track failed newsletter subscription
            trackFormSubmission('newsletter_subscribe_contact', false);

            // Set appropriate error message
            if (error.response && error.response.data && error.response.data.message) {
                setNewsletterError(error.response.data.message);
            } else {
                setNewsletterError("Failed to subscribe. Please try again later.");
            }
        }
    };

    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemFadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Hero Section with Background Image */}
            <motion.section
                className="relative h-[400px] md:h-[500px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
            >
                <div className="absolute inset-0">
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                        onPlay={() => trackVideoEvent('play', 'Contact Page Hero Video')}
                        onPause={() => trackVideoEvent('pause', 'Contact Page Hero Video')}
                        onEnded={() => trackVideoEvent('complete', 'Contact Page Hero Video')}
                    >
                        <source src="/videos/hero-video.mp4" type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-black/60" />
                </div>
                <div className="relative z-10 h-full flex items-center justify-center">
                    <div className="container mx-auto px-4 text-center">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-3xl md:text-5xl font-bold text-white mb-4"
                        >
                            <TranslatableText>Get In</TranslatableText>{" "}
                            <span className="text-[#FDB022]">
                              <TranslatableText>Touch</TranslatableText>
                            </span>{" "}
                            <TranslatableText>With Our Team</TranslatableText>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="text-white/90 text-base md:text-lg max-w-2xl mx-auto mb-6"
                        >
                            <TranslatableText>
                                Have questions or want to learn more about our programs? We're here to help.
                            </TranslatableText>
                        </motion.p>
                    </div>
                </div>
            </motion.section>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
                <motion.div
                    className="bg-white rounded-md shadow-xl p-8 md:p-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Contact Form */}
                        <motion.div
                            className="space-y-8 flex flex-col justify-center items-start"
                            variants={fadeInUp}
                            initial="hidden"
                            animate="visible"
                        >
                            <motion.h2
                                className="text-2xl font-bold text-[#005c3d] "
                                variants={itemFadeIn}
                            >
                                <TranslatableText>Send Us A Message</TranslatableText>
                            </motion.h2>

                            {/* Success Message */}
                            {formSuccess && (
                                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start">
                                    <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                                    <div>
                                        <p className="font-medium">

                                            <TranslatableText>Message sent successfully!</TranslatableText>
                                            <TranslatableText>Thank you for contacting us. We'll get back to you as soon as possible.</TranslatableText>
                                        </p>
                                        <p className="text-sm">
                                            <TranslatableText>Thank you for contacting us. We'll get back to you as soon as possible.</TranslatableText>
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Error Message */}
                            {formError && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
                                    <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5" />
                                    <div>
                                        <p className="font-medium">
                                            Submission failed
                                            <TranslatableText>An error occurred while submitting the form. Please try again later.</TranslatableText>
                                        </p>
                                        <p className="text-sm">
                                            <TranslatableText>
                                                {formError}
                                            </TranslatableText>
                                        </p>
                                    </div>
                                </div>
                            )}

                            <motion.form
                                onSubmit={handleSubmit}
                                className="space-y-8 w-full"
                                variants={staggerContainer}
                                initial="hidden"
                                animate="visible"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <TranslatableText>Name</TranslatableText> *
                                        </label>
                                        <Input
                                            type="text"
                                            name="name"
                                            value={formState.name}
                                            onChange={handleChange}
                                            placeholder="Enter your name"
                                            className="w-full bg-white border-2 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#005c3d] focus:border-[#005c3d]"
                                            required
                                            disabled={submitting}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <TranslatableText>Email</TranslatableText> *
                                        </label>
                                        <Input
                                            type="email"
                                            name="email"
                                            value={formState.email}
                                            onChange={handleChange}
                                            placeholder="Enter your email"
                                            className="w-full bg-white border-2 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#005c3d] focus:border-[#005c3d]"
                                            required
                                            disabled={submitting}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        <TranslatableText>Phone</TranslatableText>
                                    </label>
                                    <Input
                                        type="tel"
                                        name="phone"
                                        value={formState.phone}
                                        onChange={handleChange}
                                        placeholder="Enter your phone number"
                                        className="w-full bg-white border-2 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#005c3d] focus:border-[#005c3d]"
                                        disabled={submitting}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        <TranslatableText>Message</TranslatableText> *
                                    </label>
                                    <Textarea
                                        name="message"
                                        value={formState.message}
                                        onChange={handleChange}
                                        placeholder="How can we help you?"
                                        className="w-full h-40 bg-white border-2 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#005c3d] focus:border-[#005c3d]"
                                        required
                                        disabled={submitting}
                                    />
                                </div>
                                {/* Hidden input for location value */}
                                <input
                                    type="hidden"
                                    name="location"
                                    value={formState.location}
                                />
                                <Button
                                    type="submit"
                                    className="w-full bg-[#005c3d] hover:bg-[#009758] text-white px-8 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <TranslatableText>Sending...</TranslatableText>
                                        </>
                                    ) : (
                                        <>

                                            <TranslatableText>Send Message</TranslatableText>
                                        </>
                                    )}
                                </Button>
                            </motion.form>
                        </motion.div>

                        {/* Contact Information */}
                        <motion.div
                            className="space-y-8"
                            variants={fadeInUp}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: 0.3 }}
                        >
                            <motion.div
                                className="bg-[#FFFDEB] rounded-lg p-8"
                                variants={itemFadeIn}
                            >
                                <h3 className="text-xl font-bold text-[#005c3d] mb-4">
                                    <TranslatableText>Stay Updated</TranslatableText>
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    <TranslatableText>Subscribe to our newsletter to receive updates about our programs, events, and opportunities.</TranslatableText>
                                </p>

                                {/* Newsletter Success Message */}
                                {newsletterSuccess && (
                                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start mb-4">
                                        <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                                        <div>
                                            <p className="font-medium">
                                                <TranslatableText>Subscribed successfully!</TranslatableText>
                                            </p>
                                            <p className="text-sm">
                                                <TranslatableText>Thank you for subscribing to our newsletter.</TranslatableText>
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Newsletter Error Message */}
                                {newsletterError && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start mb-4">
                                        <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5" />
                                        <div>
                                            <p className="font-medium">
                                                <TranslatableText>Subscription failed</TranslatableText>
                                            </p>
                                            <p className="text-sm">
                                                <TranslatableText>{newsletterError}</TranslatableText>
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <form onSubmit={handleNewsletterSubmit} className="space-y-4">
                                    <Input
                                        type="email"
                                        placeholder="Enter your email"
                                        value={newsletterEmail}
                                        onChange={(e) => setNewsletterEmail(e.target.value)}
                                        className="w-full bg-white border-2 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#005c3d] focus:border-[#005c3d]"
                                        required
                                    />
                                    <Button
                                        type="submit"
                                        className="w-full bg-[#FDB022] hover:bg-[#E69B1E] text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
                                    >
                                        <TranslatableText>Subscribe</TranslatableText>
                                    </Button>
                                </form>
                            </motion.div>

                            {/* Rwanda Office Information */}
                            <motion.div
                                className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden"
                                variants={itemFadeIn}
                            >
                                {/* Header */}
                                <div className="bg-[#005c3d] px-6 py-4">
                                    <div className="flex items-center gap-2 text-white">
                                        <Building2 className="h-5 w-5" />
                                        <span className="text-sm font-medium">
                                            <TranslatableText>Rwanda Office</TranslatableText>
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    <div className="space-y-4">
                                        <div className="bg-[#005c3d]/5 rounded-md p-4">
                                            <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-4 ">
                                                <div className="flex items-center space-x-3 border-0 md:border-r md:border-gray-200 pr-4">
                                                    <div className="flex-shrink-0 bg-[#005c3d]/10 p-2 rounded-full">
                                                        <Phone className="h-5 w-5 text-[#005c3d]" />
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-600">
                                                            <TranslatableText>(250) 799 390 199</TranslatableText>
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            <TranslatableText>Mon-Fri, 8:00 AM - 5:00 PM</TranslatableText>
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="bg-red-500 flex items-center space-x-3 pl-0 md:pl-4">
                                                    <div className="flex-shrink-0 bg-[#005c3d]/10 p-2 rounded-full">
                                                        <Mail className="h-5 w-5 text-[#005c3d]" />
                                                    </div>

                                                    <div className="min-w-0 flex-1 break-words">
                                                        <p className="text-gray-600 break-words">
                                                            <TranslatableText>info@ganzafrica.org"</TranslatableText>
                                                        </p>
                                                        <p className="text-xs text-gray-500 break-words">
                                                            <TranslatableText>Response within 24 hours</TranslatableText>
                                                        </p>
                                                    </div>
                                                </div>

                                            </div>
                                        </div>

                                        <div className="bg-[#005c3d]/5 rounded-md p-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="flex-shrink-0 bg-[#005c3d]/10 p-2 rounded-full">
                                                    <MapPin className="h-5 w-5 text-[#005c3d]" />
                                                </div>
                                                <div>
                                                    <p className="text-gray-600">
                                                        <TranslatableText>27 House, KG 594 St</TranslatableText>
                                                    </p>
                                                    <p className="text-gray-600">
                                                        <TranslatableText>Kigali, Rwanda</TranslatableText>
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        <TranslatableText>East Africa Regional Hub</TranslatableText>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Map Section */}
                <motion.div
                    className="mt-8 mb-16"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    <motion.div
                        className="h-[400px] w-full rounded-md overflow-hidden border-2 border-gray-200 relative shadow-lg"
                        whileHover={{ scale: 1.01 }}
                        transition={{ duration: 0.3 }}
                    >
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3987.5391413519837!2d30.086420174725987!3d-1.9367383980456767!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x7bf79ceaa49e0e1%3A0xdf3900088362ba30!2sGanzAfrica!5e0!3m2!1sen!2sus!4v1745400915436!5m2!1sen!2sus"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="GanzAfrica Rwanda Location"
                        ></iframe>
                        <div className="absolute inset-0 pointer-events-none">
                            <div
                                className="absolute top-[38%] left-[52%] w-16 h-16 -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
                                onMouseEnter={() => setIsPointerActive(true)}
                                onMouseLeave={() => setIsPointerActive(false)}
                                onFocus={() => setIsPointerActive(true)}
                                onBlur={() => setIsPointerActive(false)}
                                tabIndex={0}
                                aria-label="Rwanda Office location"
                            />

                            <AnimatePresence>
                                {isPointerActive && (
                                    <motion.div
                                        key="pointer-card"
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute top-[28%] left-[51%] -translate-x-1/2 -translate-y-full pointer-events-none"
                                    >
                                        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-4 border-2 border-[#005c3d] w-48 text-center">
                                            <div className="flex flex-col items-center space-y-2">
                                                <div className="flex-shrink-0 bg-white p-2">
                                                    <img
                                                        src="/images/logo.png"
                                                        alt="GanzAfrica Logo"
                                                        className="h-12 w-auto object-contain"
                                                    />
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-sm font-medium text-[#005c3d]">Rwanda Office</p>
                                                </div>
                                            </div>
                                        </div>
                                        {/* <div className="w-4 h-4 bg-[#005c3d] rotate-45 mx-auto -mt-2 border-2 border-white"></div> */}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}

export default ContactUsContent;