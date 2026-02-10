'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@ui/accordion';
import { Button } from '@ui/button';
import { Card } from '@ui/card';
import { Badge } from '@ui/badge';
import {
    Shield,
    Globe,
    Mail,
    FileText,
    Download,
    ArrowUp,
    Lock,
    Users,
    Clock,
    AlertCircle,
    CheckCircle2,
} from 'lucide-react';
import Image from "next/image";
import { default as HeaderBelt } from "@/components/layout/headerBelt";
import {TranslatableText} from "@/components/translate";

const sections = [
    { id: 'introduction', label: 'Introduction', icon: FileText },
    { id: 'controllers', label: 'Joint Data Controllers', icon: Users },
    { id: 'data-collection', label: 'Data Collection', icon: Shield },
    { id: 'using-data', label: 'Using Your Data', icon: Globe },
    { id: 'justification', label: 'Legal Justification', icon: Lock },
    { id: 'retention', label: 'Data Retention', icon: Clock },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'disclosures', label: 'Data Disclosures', icon: AlertCircle },
    { id: 'transfers', label: 'Cross-Border Transfers', icon: Globe },
    { id: 'rights', label: 'Your Rights', icon: CheckCircle2 },
    { id: 'updates', label: 'Policy Updates', icon: FileText },
    { id: 'other-sites', label: 'Other Websites', icon: Globe },
    // { id: '/contact-us', label: 'Contact Us', icon: Mail },
];

export default function PrivacyPolicy() {
    const [showTOC, setShowTOC] = useState(true);
    const [activeSection, setActiveSection] = useState('introduction');
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-background via-secondary/30 to-background">
            {/* Hero Section */}
            <section className="relative w-full h-[400px] sm:h-[500px] overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/images/SHIR5142-Enhanced-NR.jpg"
                        alt="Agricultural fields"
                        fill
                        className="object-cover"
                        priority
                    />
                </div>

                {/* Dark overlay */}
                <div className="absolute inset-0 bg-black opacity-70 z-0"></div>

                {/* Content */}
                <div className="relative container mx-auto px-4 h-full flex flex-col justify-center items-center text-center z-20">
                    <h2 className="text-primary-orange text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-wider mt-6 mb-6">
                        <TranslatableText>
                            PRIVACY POLICY
                        </TranslatableText>
                    </h2>
                    <h1 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold mb-2 leading-tight">
        <span className=" font-normal ">
            <TranslatableText>
               Your privacy is important to us at GanzAfrica. Learn how we protect your data.
            </TranslatableText>
        </span>
                    </h1>
                </div>


            </section>

            <HeaderBelt />


            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
                {/* Hero Section */}
                <div className="mb-12 flex justify-end animate-in fade-in duration-500">
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Last updated: February 9, 2026</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sticky Table of Contents - Desktop Only */}
                        <aside className="hidden lg:block lg:col-span-1">
                            <div className="sticky top-24 rounded-xl border border-border/40 bg-white p-6 shadow-sm">
                                <h3 className="text-sm font-bold text-[#00A15D] mb-6 uppercase tracking-wider">
                                    TABLE OF CONTENTS
                                </h3>
                                <nav className="flex flex-col gap-1">
                                    {sections.map((section) => (
                                        <a
                                            key={section.id}
                                            href={`#${section.id}`}
                                            onClick={() => setActiveSection(section.id)}
                                            className={`flex items-center gap-3 text-sm px-4 py-2.5 rounded-lg transition-all duration-200 ${
                                                activeSection === section.id
                                                    ? 'bg-[#00A15D]/10 text-[#00A15D] font-semibold shadow-sm'
                                                    : 'text-muted-foreground hover:text-[#00A15D] hover:bg-secondary/40'
                                            }`}
                                        >
                                            <section.icon className={`h-4 w-4 ${activeSection === section.id ? 'text-[#00A15D]' : 'text-muted-foreground/70'}`} />
                                            <span>{section.label}</span>
                                        </a>
                                    ))}
                                </nav>
                            </div>
                        </aside>

                    {/* Main Content */}
                    <main className="lg:col-span-3 space-y-8">
                        {/* Introduction */}
                        <section id="introduction" className="space-y-4 animate-in fade-in">
                            <div className="border-l-4 border-primary pl-6 py-2">
                                <p className="text-base text-foreground leading-relaxed">
                                    Your privacy is important to GanzAfrica. We are committed to
                                    safeguarding the privacy of our website visitors; this
                                    privacy statement sets out how we will treat your personal
                                    information.
                                </p>
                            </div>
                        </section>

                        {/* Joint Data Controllers - Prominent Banner */}
                        <section id="controllers" className="space-y-4">
                            <Card className="border-2 border-accent/30 bg-accent/5 p-6 shadow-md">
                                <div className="flex gap-4">
                                    <AlertCircle className="h-6 w-6 text-[#00A15D] flex-shrink-0 mt-1" />
                                    <div className="space-y-4">
                                        <h2 className="text-xl font-bold text-[#FDB022]">
                                            Joint Data Controllers
                                        </h2>
                                        <div className="space-y-3 text-foreground">
                                            <div>
                                                <h3 className="font-semibold text-[#00A15D] mb-2">
                                                    Statement of joint operation
                                                </h3>
                                                <p className="text-sm leading-relaxed">
                                                    This website is jointly operated by GanzAfrica
                                                    Foundation (Rwanda) and GanzAfrica CIO (UK).
                                                </p>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-[#00A15D] mb-2">
                                                    Controller identification
                                                </h3>
                                                <p className="text-sm leading-relaxed">
                                                    For the purposes of applicable data protection laws
                                                    (including UK GDPR), GanzAfrica Foundation and
                                                    GanzAfrica CIO are joint data controllers in relation
                                                    to personal data collected through this website.
                                                </p>
                                            </div>
                                        </div>

                                        {/* Contact Details Card */}
                                        <Card className="bg-white/50 p-4 space-y-3 mt-4">
                                            <div>
                                                <h4 className="text-sm font-semibold text-[#00A15D] mb-2">
                                                    Contact Information
                                                </h4>
                                                <div className="space-y-2 text-sm text-foreground">
                                                    <p className="flex items-center gap-2">
                                                        <Mail className="h-4 w-4 text-primary" />
                                                        <span>
                              <strong>Email:</strong> info@ganzafrica.org
                              (shared inbox)
                            </span>
                                                    </p>
                                                    <p className="text-sm">
                                                        <strong>GanzAfrica Foundation:</strong> Kigali, Rwanda
                                                    </p>
                                                    <p className="text-sm">
                                                        <strong>GanzAfrica CIO:</strong> 196 Grove Park,
                                                        Cheshire WA16 8QE, UK
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="pt-2 border-t border-border">
                                                <h4 className="text-sm font-semibold text-[#00A15D] mb-2">
                                                    Registration Numbers
                                                </h4>
                                                <div className="space-y-1 text-sm text-foreground">
                                                    <p>
                                                        <strong>GanzAfrica Foundation:</strong>{' '}
                                                        64/RGB/FDN/LP/07/2024
                                                    </p>
                                                    <p>
                                                        <strong>GanzAfrica CIO:</strong> 1210487
                                                    </p>
                                                </div>
                                            </div>
                                        </Card>
                                    </div>
                                </div>
                            </Card>
                        </section>

                        {/* Main Content Sections - Accordions */}
                        <Accordion type="single" collapsible defaultValue="data-collection">
                            {/* Personal Data Collection */}
                            <AccordionItem value="data-collection" id="data-collection">
                                <AccordionTrigger className="text-lg font-semibold text-[#FDB022] hover:text-[#FDB022]/90">
                                    <div className="flex items-center gap-3">
                                        <Shield className="h-5 w-5 text-[#00A15D]" />
                                        <span>Personal Data Collection</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="space-y-4 pt-4 text-foreground">
                                    <p className="text-sm leading-relaxed text-[#00A15D] font-medium">
                                        We collect personal data in the following circumstances:
                                    </p>
                                    <ul className="space-y-2 ml-6">
                                        <li className="text-sm flex gap-2">
                                            <span className="text-[#00A15D]">•</span>
                                            <span>Enquiries submitted through our contact form</span>
                                        </li>
                                        <li className="text-sm flex gap-2">
                                            <span className="text-[#00A15D]">•</span>
                                            <span>Fellowship applications</span>
                                        </li>
                                        <li className="text-sm flex gap-2">
                                            <span className="text-[#00A15D]">•</span>
                                            <span>Employment applications</span>
                                        </li>
                                        <li className="text-sm flex gap-2">
                                            <span className="text-[#00A15D]">•</span>
                                            <span>Newsletter signups</span>
                                        </li>
                                        <li className="text-sm flex gap-2">
                                            <span className="text-[#00A15D]">•</span>
                                            <span>Device and IP data via GoDaddy</span>
                                        </li>
                                        <li className="text-sm flex gap-2">
                                            <span className="text-[#00A15D]">•</span>
                                            <span>Other voluntary submissions</span>
                                        </li>
                                    </ul>
                                    <div className="bg-primary/5 border border-primary/20 rounded p-3 mt-4">
                                        <p className="text-sm text-foreground">
                                            <strong>No Cookies:</strong> We do not use cookies or
                                            tracking technologies. Your data is only collected when
                                            you voluntarily provide it.
                                        </p>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            {/* Using Personal Data */}
                            <AccordionItem value="using-data" id="using-data">
                                <AccordionTrigger className="text-lg font-semibold text-[#FDB022] hover:text-[#FDB022]/90">
                                    <div className="flex items-center gap-3">
                                        <Globe className="h-5 w-5 text-[#00A15D]" />
                                        <span>Using Your Personal Data</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="space-y-4 pt-4 text-foreground">
                                    <p className="text-sm leading-relaxed text-[#00A15D] font-medium">
                                        We process your data for the following purposes based on
                                        your user journey:
                                    </p>
                                    <div className="space-y-3">
                                        <div className="bg-secondary/50 p-3 rounded">
                                            <h4 className="text-sm font-semibold text-[#00A15D] mb-2">
                                                Newsletter Subscribers
                                            </h4>
                                            <p className="text-sm">
                                                Send you updates and information about our work
                                            </p>
                                        </div>
                                        <div className="bg-secondary/50 p-3 rounded">
                                            <h4 className="text-sm font-semibold text-[#00A15D] mb-2">
                                                Fellowship Applicants
                                            </h4>
                                            <p className="text-sm">
                                                Evaluate applications and communicate decisions
                                            </p>
                                        </div>
                                        <div className="bg-secondary/50 p-3 rounded">
                                            <h4 className="text-sm font-semibold text-[#00A15D] mb-2">
                                                Job Applicants
                                            </h4>
                                            <p className="text-sm">
                                                Review applications and conduct recruitment processes
                                            </p>
                                        </div>
                                        <div className="bg-secondary/50 p-3 rounded">
                                            <h4 className="text-sm font-semibold text-[#00A15D] mb-2">
                                                General Enquiries
                                            </h4>
                                            <p className="text-sm">
                                                Respond to your questions and provide support
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-accent/10 border border-accent/30 rounded p-3 mt-4">
                                        <p className="text-sm text-foreground italic">
                                            <strong>Important:</strong> Our responsibility ends when
                                            you leave our site via a link. Third-party websites have
                                            their own privacy policies.
                                        </p>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            {/* Legal Justification */}
                            <AccordionItem value="justification" id="justification">
                                <AccordionTrigger className="text-lg font-semibold text-[#FDB022] hover:text-[#FDB022]/90">
                                    <div className="flex items-center gap-3">
                                        <Lock className="h-5 w-5 text-[#00A15D]" />
                                        <span>Legal Justification</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="space-y-4 pt-4 text-foreground">
                                    <p className="text-sm leading-relaxed text-[#00A15D] font-medium">
                                        We process your personal data under UK GDPR Article 6 for
                                        the following lawful reasons:
                                    </p>
                                    <ul className="space-y-2 ml-6">
                                        <li className="text-sm flex gap-2">
                                            <span className="text-[#00A15D]">•</span>
                                            <span>
                                                <strong>Legitimate Interests:</strong> Processing
                                                necessary to provide services and respond to enquiries
                                            </span>
                                        </li>
                                        <li className="text-sm flex gap-2">
                                            <span className="text-[#00A15D]">•</span>
                                            <span>
                                                <strong>Public Task:</strong> Fulfilling our charitable
                                                objectives in the public interest
                                            </span>
                                        </li>
                                        <li className="text-sm flex gap-2">
                                            <span className="text-[#00A15D]">•</span>
                                            <span>
                                                <strong>Consent:</strong> Where you have explicitly
                                                agreed, such as newsletter signup
                                            </span>
                                        </li>
                                        <li className="text-sm flex gap-2">
                                            <span className="text-[#00A15D]">•</span>
                                            <span>
                                                <strong>Legal Obligations:</strong> Compliance with
                                                applicable laws and regulations
                                            </span>
                                        </li>
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>

                            {/* Data Retention */}
                            <AccordionItem value="retention" id="retention">
                                <AccordionTrigger className="text-lg font-semibold text-[#FDB022] hover:text-[#FDB022]/90">
                                    <div className="flex items-center gap-3">
                                        <Clock className="h-5 w-5 text-[#00A15D]" />
                                        <span>Data Retention Period</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="space-y-4 pt-4 text-foreground">
                                    <p className="text-sm leading-relaxed text-[#00A15D] font-medium">
                                        We retain your personal data for the following periods:
                                    </p>
                                    <div className="space-y-2">
                                        <div className="bg-secondary/50 p-3 rounded">
                                            <p className="text-sm font-semibold text-[#00A15D]">
                                                Fellowship Applications
                                            </p>
                                            <p className="text-sm">
                                                Archived for program assessment (6-12 months)
                                            </p>
                                        </div>
                                        <div className="bg-secondary/50 p-3 rounded">
                                            <p className="text-sm font-semibold text-[#00A15D]">
                                                Employment Applications
                                            </p>
                                            <p className="text-sm">Retained for 6 months</p>
                                        </div>
                                        <div className="bg-secondary/50 p-3 rounded">
                                            <p className="text-sm font-semibold text-[#00A15D]">
                                                Newsletter Subscribers
                                            </p>
                                            <p className="text-sm">
                                                Until unsubscribe or opt-out request
                                            </p>
                                        </div>
                                        <div className="bg-secondary/50 p-3 rounded">
                                            <p className="text-sm font-semibold text-[#00A15D]">General Enquiries</p>
                                            <p className="text-sm">Until query resolved</p>
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            {/* Security */}
                            <AccordionItem value="security" id="security">
                                <AccordionTrigger className="text-lg font-semibold text-[#FDB022] hover:text-[#FDB022]/90">
                                    <div className="flex items-center gap-3">
                                        <Lock className="h-5 w-5 text-[#00A15D]" />
                                        <span>Personal Data Security</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="space-y-4 pt-4 text-foreground">
                                    <p className="text-sm leading-relaxed text-[#00A15D] font-medium">
                                        We implement appropriate security measures to protect your
                                        data:
                                    </p>
                                    <ul className="space-y-2 ml-6">
                                        <li className="text-sm flex gap-2">
                                            <span className="text-primary">•</span>
                                            <span>
                        Secure storage via Google Workspace and Office 365
                      </span>
                                        </li>
                                        <li className="text-sm flex gap-2">
                                            <span className="text-primary">•</span>
                                            <span>Encrypted backups and data redundancy</span>
                                        </li>
                                        <li className="text-sm flex gap-2">
                                            <span className="text-primary">•</span>
                                            <span>GoDaddy hosting with SSL/TLS encryption</span>
                                        </li>
                                        <li className="text-sm flex gap-2">
                                            <span className="text-primary">•</span>
                                            <span>
                        Access controls limiting data to authorized personnel
                      </span>
                                        </li>
                                        <li className="text-sm flex gap-2">
                                            <span className="text-primary">•</span>
                                            <span>
                        Regular security assessments and compliance monitoring
                      </span>
                                        </li>
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>

                            {/* Disclosures */}
                            <AccordionItem value="disclosures" id="disclosures">
                                <AccordionTrigger className="text-lg font-semibold text-[#FDB022] hover:text-[#FDB022]/90">
                                    <div className="flex items-center gap-3">
                                        <Users className="h-5 w-5 text-[#00A15D]" />
                                        <span>Data Disclosures</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="space-y-4 pt-4 text-foreground">
                                    <p className="text-sm leading-relaxed text-[#00A15D] font-medium">
                                        We may share your data with the following parties:
                                    </p>
                                    <ul className="space-y-2 ml-6">
                                        <li className="text-sm flex gap-2">
                                            <span className="text-primary">•</span>
                                            <span>Employees and trustees with legitimate need</span>
                                        </li>
                                        <li className="text-sm flex gap-2">
                                            <span className="text-primary">•</span>
                                            <span>Third-party service providers (hosting, email)</span>
                                        </li>
                                        <li className="text-sm flex gap-2">
                                            <span className="text-primary">•</span>
                                            <span>
                        Legal authorities when required by law or court order
                      </span>
                                        </li>
                                    </ul>
                                    <div className="bg-primary/5 border border-primary/20 rounded p-3 mt-4">
                                        <p className="text-sm text-foreground">
                                            All third parties are contractually obligated to protect
                                            your data with equivalent security standards.
                                        </p>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            {/* Cross-Border Transfers */}
                            <AccordionItem value="transfers" id="transfers">
                                <AccordionTrigger className="text-lg font-semibold text-[#FDB022] hover:text-[#FDB022]/90">
                                    <div className="flex items-center gap-3">
                                        <Globe className="h-5 w-5 text-[#00A15D]" />
                                        <span>Cross-Border Data Transfers</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="space-y-4 pt-4 text-foreground">
                                    <p className="text-sm leading-relaxed text-[#00A15D] font-medium">
                                        Your data may be stored and processed across multiple
                                        countries where GanzAfrica operates and where our service
                                        providers are located:
                                    </p>
                                    <ul className="space-y-2 ml-6">
                                        <li className="text-sm flex gap-2">
                                            <span className="text-primary">•</span>
                                            <span>Rwanda and United Kingdom (primary operations)</span>
                                        </li>
                                        <li className="text-sm flex gap-2">
                                            <span className="text-primary">•</span>
                                            <span>
                        Cloud service providers in US and European data centers
                      </span>
                                        </li>
                                        <li className="text-sm flex gap-2">
                                            <span className="text-primary">•</span>
                                            <span>Global internet infrastructure</span>
                                        </li>
                                    </ul>
                                    <div className="bg-primary/5 border border-primary/20 rounded p-3 mt-4">
                                        <p className="text-sm text-foreground">
                                            All transfers comply with applicable data protection laws
                                            and include appropriate safeguards.
                                        </p>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            {/* Your Rights */}
                            <AccordionItem value="rights" id="rights">
                                <AccordionTrigger className="text-lg font-semibold text-[#FDB022] hover:text-[#FDB022]/90">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-[#00A15D]" />
                                        <span>Your Privacy Rights</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="space-y-4 pt-4 text-foreground">
                                    <p className="text-sm leading-relaxed text-[#00A15D] font-medium">
                                        Under UK GDPR and applicable laws, you have the right to:
                                    </p>
                                    <ul className="space-y-2 ml-6">
                                        <li className="text-sm flex gap-2">
                                            <span className="text-primary">•</span>
                                            <span>
                        <strong>Access</strong> – Request a copy of your data
                      </span>
                                        </li>
                                        <li className="text-sm flex gap-2">
                                            <span className="text-primary">•</span>
                                            <span>
                        <strong>Erasure</strong> – Request deletion (right to be
                        forgotten)
                      </span>
                                        </li>
                                        <li className="text-sm flex gap-2">
                                            <span className="text-primary">•</span>
                                            <span>
                        <strong>Rectification</strong> – Correct inaccurate data
                      </span>
                                        </li>
                                        <li className="text-sm flex gap-2">
                                            <span className="text-primary">•</span>
                                            <span>
                        <strong>Restrict</strong> – Limit how we use your data
                      </span>
                                        </li>
                                        <li className="text-sm flex gap-2">
                                            <span className="text-primary">•</span>
                                            <span>
                        <strong>Portability</strong> – Receive your data in a
                        structured format
                      </span>
                                        </li>
                                        <li className="text-sm flex gap-2">
                                            <span className="text-primary">•</span>
                                            <span>
                        <strong>Object</strong> – Opt-out of processing
                      </span>
                                        </li>
                                    </ul>

                                    <div className="mt-6 space-y-3">
                                        <h4 className="font-semibold text-[#00A15D]">
                                            How to Exercise Your Rights
                                        </h4>
                                        <p className="text-sm">
                                            Email:{' '}
                                            <a
                                                href="mailto:info@ganzafrica.org"
                                                className="text-primary font-semibold hover:underline"
                                            >
                                                info@ganzafrica.org
                                            </a>
                                        </p>
                                        <p className="text-sm">
                                            Mail: GanzAfrica CIO, 196 Grove Park, Cheshire WA16 8QE,
                                            UK
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Processing may take up to 30 days. Requests are generally
                                            free, though complex requests may incur reasonable fees.
                                        </p>
                                    </div>

                                    <Button className="mt-4 w-full bg-primary hover:bg-primary/90 text-white gap-2">
                                        <Mail className="h-4 w-4" />
                                        <a href="mailto:info@ganzafrica.org">
                                            Exercise Your Rights
                                        </a>
                                    </Button>

                                    <div className="bg-accent/10 border border-accent/30 rounded p-3">
                                        <p className="text-sm text-foreground">
                                            <strong>Still not satisfied?</strong> You have the right
                                            to lodge a complaint with the UK Information Commissioner's
                                            Office (ICO).
                                        </p>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            {/* Policy Updates */}
                            <AccordionItem value="updates" id="updates">
                                <AccordionTrigger className="text-lg font-semibold text-[#FDB022] hover:text-[#FDB022]/90">
                                    <div className="flex items-center gap-3">
                                        <FileText className="h-5 w-5 text-[#00A15D]" />
                                        <span>Privacy Statement Updates</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="space-y-4 pt-4 text-foreground">
                                    <p className="text-sm leading-relaxed text-[#00A15D] font-medium">
                                        We may update this privacy policy periodically to reflect
                                        changes in our practices, technology, or legal requirements.
                                    </p>
                                    <div className="bg-secondary/50 p-3 rounded space-y-2">
                                        <p className="text-sm font-semibold">Notifications</p>
                                        <p className="text-sm">
                                            Material changes will be announced via:
                                        </p>
                                        <ul className="text-sm space-y-1 ml-6">
                                            <li>• Email to newsletter subscribers</li>
                                            <li>• Prominent notice on our website</li>
                                            <li>• Direct communication for significant changes</li>
                                        </ul>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Your continued use of our website after updates constitutes
                                        acceptance of the new terms.
                                    </p>
                                </AccordionContent>
                            </AccordionItem>

                            {/* Other Websites */}
                            <AccordionItem value="other-sites" id="other-sites">
                                <AccordionTrigger className="text-lg font-semibold text-[#FDB022] hover:text-[#FDB022]/90">
                                    <div className="flex items-center gap-3">
                                        <Globe className="h-5 w-5 text-[#00A15D]" />
                                        <span>Links to Other Websites</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="space-y-4 pt-4 text-foreground">
                                    <p className="text-sm leading-relaxed text-[#00A15D] font-medium">
                                        Our website contains links to external websites. Please note:
                                    </p>
                                    <ul className="space-y-2 ml-6">
                                        <li className="text-sm flex gap-2">
                                            <span className="text-primary">•</span>
                                            <span>
                        We are not responsible for third-party privacy practices
                      </span>
                                        </li>
                                        <li className="text-sm flex gap-2">
                                            <span className="text-primary">•</span>
                                            <span>
                        Third-party sites have their own privacy policies
                      </span>
                                        </li>
                                        <li className="text-sm flex gap-2">
                                            <span className="text-primary">•</span>
                                            <span>
                        We recommend reviewing their policies before sharing data
                      </span>
                                        </li>
                                    </ul>
                                    <div className="bg-primary/5 border border-primary/20 rounded p-3 mt-4">
                                        <p className="text-sm text-foreground">
                                            <strong>Disclaimer:</strong> Our responsibility ends when
                                            you follow a link away from GanzAfrica.
                                        </p>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>

                        {/* FAQ Section */}
                        <section className="mt-12 space-y-4">
                            <h2 className="text-2xl font-bold text-[#FDB022]">
                                Frequently Asked Questions
                            </h2>
                            <Accordion type="single" collapsible>
                                <AccordionItem value="faq-1">
                                    <AccordionTrigger className="text-base font-semibold text-[#00A15D] hover:text-[#00A15D]/90">
                                        Do you use cookies or tracking?
                                    </AccordionTrigger>
                                    <AccordionContent className="text-sm text-foreground">
                                        No. We are a cookie-free zone. We do not use cookies, pixels,
                                        analytics trackers, or any technology to track your behavior.
                                        Your privacy is respected by default.
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="faq-2">
                                    <AccordionTrigger className="text-base font-semibold text-[#00A15D] hover:text-[#00A15D]/90">
                                        How do I request my data?
                                    </AccordionTrigger>
                                    <AccordionContent className="text-sm text-foreground">
                                        Email info@ganzafrica.org with a "Data Subject Access
                                        Request" (DSAR). Include your name and email address. We'll
                                        respond within 30 days with your data in a structured format.
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="faq-3">
                                    <AccordionTrigger className="text-base font-semibold text-[#00A15D] hover:text-[#00A15D]/90">
                                        How long do you keep my data?
                                    </AccordionTrigger>
                                    <AccordionContent className="text-sm text-foreground">
                                        Retention varies: fellowship applications (6-12 months),
                                        employment (6 months), newsletter subscribers (until
                                        unsubscribe), general enquiries (until resolved). We delete
                                        data after retention periods unless legally required to keep
                                        it.
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="faq-4">
                                    <AccordionTrigger className="text-base font-semibold text-[#00A15D] hover:text-[#00A15D]/90">
                                        Can I opt out or delete my data?
                                    </AccordionTrigger>
                                    <AccordionContent className="text-sm text-foreground">
                                        Yes. You can request deletion (erasure) or restrict how we use
                                        your data at any time. Email info@ganzafrica.org with your
                                        request. Opt-out links are included in all newsletters.
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="faq-5">
                                    <AccordionTrigger className="text-base font-semibold text-[#00A15D] hover:text-[#00A15D]/90">
                                        Where is my data stored?
                                    </AccordionTrigger>
                                    <AccordionContent className="text-sm text-foreground">
                                        Data is securely stored via Google Workspace, Microsoft 365,
                                        and GoDaddy hosting. These providers maintain data centers in
                                        multiple locations (US and EU). All transfers comply with UK
                                        GDPR.
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </section>
                    </main>
                </div>
            </div>

            {/* Back to Top Button */}
            {scrollY > 300 && (
                <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="fixed bottom-8 right-8 p-3 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-all"
                    aria-label="Back to top"
                >
                    <ArrowUp className="h-5 w-5" />
                </button>
            )}
        </div>
    );
}
