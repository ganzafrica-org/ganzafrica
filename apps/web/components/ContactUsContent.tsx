'use client';

import React, { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, Leaf, Send, CheckCircle2, Building2, AlertCircle } from "lucide-react";
import { safeAccess } from "@/lib/utils/safeAccess";
import { motion } from "framer-motion";
import apiClient from "@/lib/api-client";

interface ContactUsContentProps {
    dict: any;
}

const ContactUsContent: React.FC<ContactUsContentProps> = ({ dict }) => {
    const [formState, setFormState] = useState({
        name: "",
        email: "",
        phone: "",
        message: "",
        location: "rwanda", 
    });

    const [activeTab, setActiveTab] = useState('rwanda');
    const [showPointer, setShowPointer] = useState(true);
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
            // Update location based on active tab
            const contactData = { name: formState.name, email: formState.email, phone: formState.phone, message: formState.message, location: activeTab };
            
            // Send to the API endpoint
            const response = await apiClient.post('/contacts', contactData, { timeout: 10000 });
            
            // Show success message and reset form
            setFormSuccess(true);
            setFormState({
                name: "",
                email: "",
                phone: "",
                message: "",
                location: activeTab,
            });
            
            // Reset success message after 5 seconds
            setTimeout(() => {
                setFormSuccess(false);
            }, 5000);
            
        } catch (error: any) {
            console.error("Error submitting contact form:", error);
            
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
            setNewsletterEmail("");
            
            // Reset success message after 5 seconds
            setTimeout(() => {
                setNewsletterSuccess(false);
            }, 5000);
        } catch (error: any) {
            console.error("Error subscribing to newsletter:", error);
            
            // Set appropriate error message
            if (error.response && error.response.data && error.response.data.message) {
                setNewsletterError(error.response.data.message);
            } else {
                setNewsletterError("Failed to subscribe. Please try again later.");
            }
        }
    };

    const handlePointerClick = () => {
        setShowPointer(false);
    };

    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId);
        // Update location in form state when tab changes
        setFormState(prev => ({
            ...prev,
            location: tabId
        }));
    };

    const tabs = [
        { id: 'rwanda', label: 'Rwanda Office', icon: Building2 },
        { id: 'burkina', label: 'Burkina Faso Office', icon: Building2 },
    ];

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
                            Get in <span className="text-[#FDB022]">Touch</span> With Our Team
                        </motion.h1>
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="text-white/90 text-base md:text-lg max-w-2xl mx-auto mb-6"
                        >
                            Have questions or want to learn more about our programs? We're here to help.
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="flex items-center justify-center gap-6 text-white/90"
                        >
                            <div className="flex items-center">
                                <CheckCircle2 className="w-5 h-5 mr-2 text-[#FDB022]" />
                                <span>24/7 Support</span>
                            </div>
                            <div className="w-1.5 h-1.5 rounded-full bg-[#FDB022]"></div>
                            <div className="flex items-center">
                                <CheckCircle2 className="w-5 h-5 mr-2 text-[#FDB022]" />
                                <span>Quick Response</span>
                            </div>
                            <div className="w-1.5 h-1.5 rounded-full bg-[#FDB022]"></div>
                            <div className="flex items-center">
                                <CheckCircle2 className="w-5 h-5 mr-2 text-[#FDB022]" />
                                <span>Expert Team</span>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.section>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
                <motion.div 
                    className="bg-white rounded-xl shadow-xl p-8 md:p-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Contact Form */}
                        <motion.div 
                            className="space-y-6"
                            variants={fadeInUp}
                            initial="hidden"
                            animate="visible"
                        >
                            <motion.h2 
                                className="text-2xl font-bold text-[#005c3d] mb-6"
                                variants={itemFadeIn}
                            >
                                Send Us a Message
                            </motion.h2>
                            
                            {/* Success Message */}
                            {formSuccess && (
                                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start">
                                    <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                                    <div>
                                        <p className="font-medium">Message sent successfully!</p>
                                        <p className="text-sm">Thank you for contacting us. We'll get back to you as soon as possible.</p>
                                    </div>
                                </div>
                            )}
                            
                            {/* Error Message */}
                            {formError && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
                                    <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5" />
                                    <div>
                                        <p className="font-medium">Submission failed</p>
                                        <p className="text-sm">{formError}</p>
                                    </div>
                                </div>
                            )}
                            
                            <motion.form 
                                onSubmit={handleSubmit} 
                                className="space-y-6"
                                variants={staggerContainer}
                                initial="hidden"
                                animate="visible"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Name *
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
                                            Email *
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
                                        Phone
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
                                        Message *
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
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            Send Message
                                            <Send className="h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                            </motion.form>
                        </motion.div>

                        {/* Contact Information with Tabs */}
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
                                    Stay Updated
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    Subscribe to our newsletter to receive updates about our programs, events, and opportunities.
                                </p>
                                
                                {/* Newsletter Success Message */}
                                {newsletterSuccess && (
                                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start mb-4">
                                        <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                                        <div>
                                            <p className="font-medium">Subscribed successfully!</p>
                                            <p className="text-sm">Thank you for subscribing to our newsletter.</p>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Newsletter Error Message */}
                                {newsletterError && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start mb-4">
                                        <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5" />
                                        <div>
                                            <p className="font-medium">Subscription failed</p>
                                            <p className="text-sm">{newsletterError}</p>
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
                                        Subscribe
                                    </Button>
                                </form>
                            </motion.div>

                            {/* Office Information Tabs */}
                            <motion.div 
                                className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden"
                                variants={itemFadeIn}
                            >
                                {/* Tab Navigation */}
                                <div className="flex border-b border-gray-200">
                                    {tabs.map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => handleTabChange(tab.id)}
                                            className={`flex-1 px-6 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-all duration-300 ${
                                                activeTab === tab.id
                                                    ? 'bg-[#005c3d] text-white'
                                                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                            }`}
                                        >
                                            <tab.icon className="h-5 w-5" />
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Tab Content */}
                                <div className="p-6">
                                    {activeTab === 'rwanda' && (
                                        <div className="space-y-4">
                                            <div className="bg-[#005c3d]/5 rounded-lg p-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="flex items-center space-x-3 border-r border-gray-200 pr-4">
                                                        <div className="flex-shrink-0 bg-[#005c3d]/10 p-2 rounded-full">
                                                            <Phone className="h-5 w-5 text-[#005c3d]" />
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-600">(250) 799 390 199</p>
                                                            <p className="text-xs text-gray-500">Mon-Fri, 8:00 AM - 5:00 PM</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-3 pl-4">
                                                        <div className="flex-shrink-0 bg-[#005c3d]/10 p-2 rounded-full">
                                                            <Mail className="h-5 w-5 text-[#005c3d]" />
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-600">info@ganzafrica.org</p>
                                                            <p className="text-xs text-gray-500">Response within 24 hours</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-[#005c3d]/5 rounded-lg p-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="flex-shrink-0 bg-[#005c3d]/10 p-2 rounded-full">
                                                        <MapPin className="h-5 w-5 text-[#005c3d]" />
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-600">27 House, KG 594 St</p>
                                                        <p className="text-gray-600">Kigali, Rwanda</p>
                                                        <p className="text-xs text-gray-500">East Africa Regional Hub</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'burkina' && (
                                        <div className="space-y-4">
                                            <div className="bg-[#005c3d]/5 rounded-lg p-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="flex items-center space-x-3 border-r border-gray-200 pr-4">
                                                        <div className="flex-shrink-0 bg-[#005c3d]/10 p-2 rounded-full">
                                                            <Phone className="h-5 w-5 text-[#005c3d]" />
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-600">Coming Soon</p>
                                                            <p className="text-xs text-gray-500">Mon-Fri, 8:00 AM - 5:00 PM</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-3 pl-4">
                                                        <div className="flex-shrink-0 bg-[#005c3d]/10 p-2 rounded-full">
                                                            <Mail className="h-5 w-5 text-[#005c3d]" />
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-600">info@ganzafrica.org</p>
                                                            <p className="text-xs text-gray-500">Response within 24 hours</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-[#005c3d]/5 rounded-lg p-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="flex-shrink-0 bg-[#005c3d]/10 p-2 rounded-full">
                                                        <MapPin className="h-5 w-5 text-[#005c3d]" />
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-600">Ouagadougou</p>
                                                        <p className="text-gray-600">Burkina Faso</p>
                                                        <p className="text-xs text-gray-500">West Africa Regional Hub</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
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
                        className="h-[400px] w-full rounded-lg overflow-hidden border-2 border-gray-200 relative shadow-lg"
                        whileHover={{ scale: 1.01 }}
                        transition={{ duration: 0.3 }}
                    >
                        <iframe
                            src={activeTab === 'rwanda' 
                                ? "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3987.5391413519837!2d30.086420174725987!3d-1.9367383980456767!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x7bf79ceaa49e0e1%3A0xdf3900088362ba30!2sGanzAfrica!5e0!3m2!1sen!2sus!4v1745400915436!5m2!1sen!2sus"
                                : "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d124958.73162347189!2d-1.786902!3d12.368446!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xe391a7ba14962e7%3A0xf4dacb6c506517ed!2sOuagadougou%2C%20Burkina%20Faso!5e0!3m2!1sen!2sus!4v1647881234567!5m2!1sen!2sus"
                            }
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title={activeTab === 'rwanda' ? "GanzAfrica Rwanda Location" : "GanzAfrica Burkina Faso Location"}
                        ></iframe>
                        {showPointer && (
                            <motion.div 
                                className="absolute top-[48%] left-[48%] transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-opacity duration-300"
                                onClick={handlePointerClick}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <motion.div 
                                    className="bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-4 border-2 border-[#005c3d] hover:scale-105 transition-transform duration-300"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <div className="flex flex-col items-center space-y-2">
                                        <div className="flex-shrink-0 bg-white p-2">
                                            <img 
                                                src="/images/logo.png" 
                                                alt="GanzAfrica Logo" 
                                                className="h-12 w-auto object-contain"
                                            />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-medium text-[#005c3d]">{activeTab === 'rwanda' ? 'Rwanda Office' : 'Burkina Faso Office'}</p>
                                        </div>
                                    </div>
                                </motion.div>
                                <div className="w-4 h-4 bg-[#005c3d] rotate-45 mx-auto -mt-2"></div>
                            </motion.div>
                        )}
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}

export default ContactUsContent;