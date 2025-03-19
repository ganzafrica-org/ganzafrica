import Link from 'next/link';
import Image from 'next/image';
import { Home, Phone, Mail } from 'lucide-react'; // Keep Lucide icons as they are
import { LinkedInIcon, TwitterIcon } from '@/components/ui/icons'; // Import custom icons from icons.tsx

export default function Footer({ locale, dict }: { locale: string; dict: any }) {
    return (
        <footer className="bg-primary-green text-white py-2">
            <div className="container mx-auto px-4">
                {/* Top Section: Logo and Social Icons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-between mb-4">
                    <div className="flex justify-start">
                        <Link href={`/${locale}`} prefetch={true}>
                            <Image
                                src="/images/logo-2.png"
                                alt="GanzAfrica"
                                width={150}
                                height={50}
                                className="h-auto"
                            />
                        </Link>
                    </div>

                    <div className="flex justify-end items-center space-x-4">
                        <Link href="/" aria-label="Home" className="bg-white rounded-full p-2 hover:opacity-90 transition-opacity">
                            <Home className="h-5 w-5 text-primary-green" />
                        </Link>
                        <Link href="https://linkedin.com/company/ganzafrica" aria-label="LinkedIn" className="bg-white rounded-full p-2 hover:opacity-90 transition-opacity">
                            <LinkedInIcon />
                        </Link>
                        <Link href="https://twitter.com/ganzafrica" aria-label="Twitter" className="bg-white rounded-full p-2 hover:opacity-90 transition-opacity">
                            <TwitterIcon />
                        </Link>
                        <Link href="tel:+250799390199" aria-label="Phone" className="bg-white rounded-full p-2 hover:opacity-90 transition-opacity">
                            <Phone className="h-5 w-5 text-primary-green" />
                        </Link>
                        <Link href="mailto:info@ganzafrica.org" aria-label="Email" className="bg-white rounded-full p-2 hover:opacity-90 transition-opacity">
                            <Mail className="h-5 w-5 text-primary-green" />
                        </Link>
                    </div>
                </div>

                {/* Middle Section: About GanzAfrica, Programs, What We Do */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-4">
                    {/* About GanzAfrica */}
                    <div>
                        <h3 className="font-semibold text-secondary-yellow mb-4 text-lg">About GanzAfrica</h3>
                        <ul className="space-y-3">
                            <li><Link href={`/${locale}/about/policies`} className="hover:text-secondary-yellow transition-colors">{dict.footer.policies}</Link></li>
                            <li><Link href={`/${locale}/faqs`} className="hover:text-secondary-yellow transition-colors">{dict.footer.faqs}</Link></li>
                            <li><Link href={`/${locale}/contact`} className="hover:text-secondary-yellow transition-colors">{dict.footer.contact}</Link></li>
                        </ul>
                    </div>

                    {/* Programs */}
                    <div>
                        <h3 className="font-semibold text-secondary-yellow mb-4 text-lg">{dict.footer.programs}</h3>
                        <ul className="space-y-3">
                            <li><Link href={`/${locale}/programs/fellowship`} className="hover:text-secondary-yellow transition-colors">{dict.programs.fellowship.title}</Link></li>
                            <li><Link href={`/${locale}/programs/alumni`} className="hover:text-secondary-yellow transition-colors">{dict.programs.alumni.title}</Link></li>
                            <li><Link href={`/${locale}/programs/policy-support`} className="hover:text-secondary-yellow transition-colors">{dict.programs.policy_support.title}</Link></li>
                        </ul>
                    </div>

                    {/* What We Do */}
                    <div>
                        <h3 className="font-semibold text-secondary-yellow mb-4 text-lg">{dict.footer.what_we_do}</h3>
                        <ul className="space-y-3">
                            <li><Link href={`/${locale}/what-we-do/food-systems`} className="hover:text-secondary-yellow transition-colors">{dict.what_we_do.food_systems}</Link></li>
                            <li><Link href={`/${locale}/what-we-do/climate-change-adaptation`} className="hover:text-secondary-yellow transition-colors">{dict.what_we_do.climate_change_adaptation}</Link></li>
                        </ul>
                    </div>

                    {/* Explore */}
                    <div>
                        <h3 className="font-semibold text-secondary-yellow mb-4 text-lg">{dict.footer.explore}</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href={`/${locale}/explore/member-login`} className="hover:text-secondary-yellow transition-colors">
                                    {dict.footer.login}
                                </Link>
                            </li>
                            <li>
                                <Link href={`/${locale}/explore/opportunities`} className="hover:text-secondary-yellow transition-colors">
                                    {dict.footer.opportunities}
                                </Link>
                            </li>
                            <li>
                                <Link href={`/${locale}/explore/research`} className="hover:text-secondary-yellow transition-colors">
                                    {dict.footer.research}
                                </Link>
                            </li>
                        </ul>
                    </div>



                </div>
                {/* NGO Source Logo */}
                <div className="col-span-1 md:col-span-4 flex justify-start">
                    <Image
                        src="/images/ngosource.png"
                        alt="NGO Source"
                        width={120}
                        height={40}
                        className="h-auto"
                    />
                </div>

                {/* Divider */}
                <div className="h-px bg-white/30 my-6"></div>

                {/* Bottom Section */}
                <div className="flex flex-col md:flex-row justify-between items-center">
                    {/* Left: Copyright */}
                    <div className="flex items-center mb-4 md:mb-0">
                        <p className="text-sm">© 2025 All Rights Reserved GanzAfrica</p>
                    </div>

                    {/* Center: Email & Phone */}
                    <div className="flex items-center mb-4 md:mb-0 space-x-6">
                        <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-2" />
                            <a href="mailto:info@ganzafrica.org" className="hover:text-secondary-yellow transition-colors">
                                info@ganzafrica.org
                            </a>
                        </div>

                        <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2" />
                            <a href="tel:+250799390199" className="hover:text-secondary-yellow transition-colors">
                                (250) 799 390 199
                            </a>
                        </div>
                    </div>

                    {/* Right: Privacy Policy */}
                    <div>
                        <Link href={`/${locale}/privacy-policy`} className="hover:text-secondary-yellow transition-colors">
                            Privacy policy
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
