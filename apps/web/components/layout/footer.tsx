import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react"
import { Home, Phone, Mail } from "lucide-react";
import { LinkedInIcon, TwitterIcon } from "@/components/ui/icons";
import { Button } from "@workspace/ui/components/button";
import { TranslatableText } from '@/components/translate/TranslatableText';
import { trackOutboundLink } from "@/components/analytics/google-analytics";

export default function Footer({}: {
}) {

    const [year, setYear] = useState<number | null>(null)
    useEffect(()=>{
        setYear(new Date().getFullYear())
    },[])

    return (
        <footer className="bg-primary-green text-white py-1" id="footer-translate">
            <div className="pl-4 pr-3 sm:pl-6 sm:pr-4 md:pl-12 md:pr-8 lg:pl-16 lg:pr-10 xl:pl-[80px] xl:pr-[40px]" id="footer-translate-widget">
                {/* Top Section - Logo and Social Icons */}
                <div className="flex justify-between items-center mb-1 md:hidden">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link href={`/`} prefetch={true}>
                            <Image
                                src="/images/logo-2.png"
                                alt="GanzAfrica"
                                width={120}
                                height={40}
                                className="h-auto w-auto"
                            />
                        </Link>
                    </div>

                    {/* Social Icons */}
                    <div className="flex items-center justify-start space-x-1">
                        <Link href="/" aria-label="Home" className="bg-white rounded-full p-1 hover:opacity-90 transition-opacity">
                            <Home className="h-3.5 w-3.5 text-primary-green" />
                        </Link>
                        <Link
                            href="https://linkedin.com/company/ganzafrica"
                            aria-label="LinkedIn"
                            className="bg-white rounded-full p-1 hover:opacity-90 transition-opacity"
                            onClick={() => trackOutboundLink("https://linkedin.com/company/ganzafrica", "LinkedIn")}
                        >
                            <LinkedInIcon className="h-3.5 w-3.5" />
                        </Link>
                        <Link
                            href="https://twitter.com/ganzafrica"
                            aria-label="Twitter"
                            className="bg-white rounded-full p-1 hover:opacity-90 transition-opacity"
                            onClick={() => trackOutboundLink("https://twitter.com/ganzafrica", "Twitter")}
                        >
                            <TwitterIcon className="h-3.5 w-3.5" />
                        </Link>
                        <Link href="tel:+250799390199" aria-label="Phone" className="bg-white rounded-full p-1 hover:opacity-90 transition-opacity">
                            <Phone className="h-3.5 w-3.5 text-primary-green" />
                        </Link>
                        <Link href="mailto:info@ganzafrica.org" aria-label="Email" className="bg-white rounded-full p-1 hover:opacity-90 transition-opacity">
                            <Mail className="h-3.5 w-3.5 text-primary-green" />
                        </Link>
                    </div>
                </div>

                {/* Top Section for Desktop */}
                <div className="hidden md:grid grid-cols-4 gap-1 items-center mb-1">
                    {/* Logo - aligned with About GanzAfrica */}
                    <div className="flex-shrink-0">
                        <Link href={`/`} prefetch={true}>
                            <Image
                                src="/images/logo-2.png"
                                alt="GanzAfrica"
                                width={120}
                                height={40}
                                className="h-auto w-auto"
                            />
                        </Link>
                    </div>

                    {/* Empty space for Programs column */}
                    <div></div>

                    {/* Empty space for Our Approach column */}
                    <div></div>

                    {/* Social Icons - aligned with Explore */}
                    <div className="flex items-center justify-start space-x-1">
                        <Link href="/" aria-label="Home" className="bg-white rounded-full p-1 hover:opacity-90 transition-opacity">
                            <Home className="h-3.5 w-3.5 text-primary-green" />
                        </Link>
                        <Link
                            href="https://www.linkedin.com/in/ganzafrica-foundation-87b998274/"
                            aria-label="LinkedIn"
                            className="bg-white rounded-full p-1 hover:opacity-90 transition-opacity"
                            onClick={() => trackOutboundLink("https://www.linkedin.com/in/ganzafrica-foundation-87b998274/", "LinkedIn")}
                        >
                            <LinkedInIcon className="h-3.5 w-3.5" />
                        </Link>
                        <Link
                            href="https://twitter.com/ganzafrica"
                            aria-label="Twitter"
                            className="bg-white rounded-full p-1 hover:opacity-90 transition-opacity"
                            onClick={() => trackOutboundLink("https://twitter.com/ganzafrica", "Twitter")}
                        >
                            <TwitterIcon className="h-3.5 w-3.5" />
                        </Link>
                        <Link href="tel:+250799390199" aria-label="Phone" className="bg-white rounded-full p-1 hover:opacity-90 transition-opacity">
                            <Phone className="h-3.5 w-3.5 text-primary-green" />
                        </Link>
                        <Link href="mailto:info@ganzafrica.org" aria-label="Email" className="bg-white rounded-full p-1 hover:opacity-90 transition-opacity">
                            <Mail className="h-3.5 w-3.5 text-primary-green" />
                        </Link>
                    </div>
                </div>

                {/* Middle Section */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-0 mb-1 md:space-x-4">
                    {/* About GanzAfrica */}
                    <div>
                        <h3 className="font-semibold text-secondary-yellow mb-0.5 text-base"><TranslatableText>About GanzAfrica</TranslatableText></h3>
                        <ul className="space-y-0">
                            <li>
                                <Link href={`/faqs`} className="hover:text-secondary-yellow transition-colors text-sm">
                                    <TranslatableText>FAQs</TranslatableText>
                                </Link>
                            </li>
                            <li>
                                <Link href={`/contact`} className="hover:text-secondary-yellow transition-colors text-sm">
                                    <TranslatableText>Contact Us</TranslatableText>
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Programs */}
                    <div>
                        <h3 className="font-semibold text-secondary-yellow mb-0.5 text-base"><TranslatableText>Programs</TranslatableText></h3>
                        <ul className="space-y-0">
                            <li>
                                <Link href={`/programs/fellowship`} className="hover:text-secondary-yellow transition-colors text-sm">
                                    <TranslatableText>Fellowship</TranslatableText>
                                </Link>
                            </li>
                            <li>
                                <Link href={`/programs/alumni`} className="hover:text-secondary-yellow transition-colors text-sm">
                                    <TranslatableText>Alumni</TranslatableText>
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Our Approach */}
                    <div>
                        <h3 className="font-semibold text-secondary-yellow mb-0.5 text-base"><TranslatableText>Our Approach</TranslatableText></h3>
                        <ul className="space-y-0">
                            <li>
                                <Link href={`/our_approach/food_systems`} className="hover:text-secondary-yellow transition-colors text-sm">
                                    <TranslatableText>Food Systems</TranslatableText>
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Explore */}
                    <div>
                        <h3 className="font-semibold text-secondary-yellow mb-0.5 text-base"><TranslatableText>Explore</TranslatableText></h3>
                        <ul className="space-y-0">
                            <li>
                                <a
                                    href={`${process.env.LOGIN_URL}`}
                                    className="hover:text-secondary-yellow transition-colors text-sm"
                                >
                                    <TranslatableText>Member Login</TranslatableText>
                                </a>
                            </li>
                            <li>
                                <Link href={`/opportunities`} className="hover:text-secondary-yellow transition-colors text-sm">
                                    <TranslatableText>Opportunities</TranslatableText>
                                </Link>
                            </li>
                            <li>
                                <Link href={`/news`} className="hover:text-secondary-yellow transition-colors text-sm">
                                    <TranslatableText>News & Updates</TranslatableText>
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* NGO Source Logo */}
                <div className="flex justify-start mb-1">
                    <img src="/images/ngo-source.png" alt="NGO Source" width={60} height={25} className="h-auto w-40" />
                </div>

                {/* Divider */}
                <div className="h-px bg-white/30 my-0.5"></div>

                {/* Bottom Section */}
                <div className="flex flex-col md:flex-row justify-between items-center text-sm">
                    <div className="mb-0.5 md:mb-0">
                        <p><TranslatableText>© {year} All Rights Reserved GanzAfrica</TranslatableText></p>
                    </div>
                    <div className="flex flex-col md:flex-row items-center space-y-0 md:space-y-0 md:space-x-6 mb-0.5 md:mb-0">
                        <div className="flex items-center">
                            <Mail className="h-3 w-3 mr-2" />
                            <a href="mailto:info@ganzafrica.org" className="hover:text-secondary-yellow transition-colors">
                                info@ganzafrica.org
                            </a>
                        </div>
                        <div className="flex items-center">
                            <Phone className="h-3 w-3 mr-2" />
                            <a href="tel:+250799390199" className="hover:text-secondary-yellow transition-colors">
                                (250) 799 390 199
                            </a>
                        </div>
                    </div>
                    <div>
                        <Link href={`/privacy-policy`} className="hover:text-secondary-yellow transition-colors">
                            <TranslatableText>Privacy policy</TranslatableText>
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}