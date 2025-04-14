"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import Navigation from '@/components/layout/navigation';
import HomeHero from '@/components/sections/homepage/home-hero';
import { 
    NavigationMenu, 
    NavigationMenuItem, 
    NavigationMenuContent, 
    NavigationMenuList, 
    NavigationMenuTrigger,
    NavigationMenuLink
} from '@workspace/ui/components/navigation-menu';
import { Button } from '@workspace/ui/components/button';
import { ChevronRight, GraduationCap, Users, Lightbulb, BookOpen, Globe } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// Define dictionary type
interface DictionaryType {
    navigation?: {
        about?: string;
        what_we_do?: string;
        programs?: string;
        community_hub?: string;
    };
    about?: {
        who_we_are?: string;
        our_story?: string;
        [key: string]: string | undefined;
    };
    what_we_do?: {
        food_systems?: string;
        climate_change_adaptation?: string;
        [key: string]: string | undefined;
    };
    home?: {
        hero?: {
            title?: string;
            subtitle?: string;
            title_after?: {
                line1?: string;
                line2?: string;
                line3?: string;
                line4?: string;
            };
        };
    };
    cta?: {
        sign_in?: string;
        discover_more?: string;
    };
}

interface HeaderProps {
    locale: string;
    dict: DictionaryType;
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-green-50 hover:text-green-900"
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-gray-500">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

export default function Header({ locale, dict }: HeaderProps) {
    const pathname = usePathname();
    const isHomePage = pathname === `/${locale}` || pathname === '/';

    return (
        <>
            {isHomePage ? (
                <HomeHero
                    locale={locale}
                    dict={dict}
                    backgroundImage="/images/hero-test.jpg"
                />
            ) : (
                <Navigation
                    locale={locale}
                    dict={dict}
                    isHomePage={false}
                >
                    <NavigationMenu>
                        <NavigationMenuList>
                            {/* Programs Menu */}
                            <NavigationMenuItem>
                                <NavigationMenuTrigger>Programs</NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <div className="grid w-[800px] grid-cols-[1fr_1.5fr] gap-6 p-6">
                                        <div className="flex flex-col gap-4">
                                            <div className="flex items-center gap-2">
                                                <GraduationCap className="h-6 w-6 text-primary-green" />
                                                <h3 className="text-lg font-semibold">Our Programs</h3>
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                Discover our transformative programs designed to empower the next generation of African leaders.
                                            </p>
                                            <Link 
                                                href="/programs"
                                                className="inline-flex items-center text-primary-green hover:text-green-700 text-sm font-medium"
                                            >
                                                View All Programs <ChevronRight className="h-4 w-4 ml-1" />
                                            </Link>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <Link 
                                                href="/programs/fellowship/how-to-apply" 
                                                className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-[#045F3C] to-[#034028] p-6 hover:shadow-lg transition-all duration-300"
                                            >
                                                <div className="relative z-10">
                                                    <GraduationCap className="h-8 w-8 text-[#FDB022] mb-3" />
                                                    <h4 className="text-lg font-semibold text-white mb-2">Fellowship Program</h4>
                                                    <p className="text-sm text-white/80 mb-4">Join our flagship fellowship program for emerging leaders.</p>
                                                    <span className="inline-flex items-center text-[#FDB022] text-sm font-medium">
                                                        Apply Now <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                                    </span>
                                                </div>
                                                <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-10" />
                                            </Link>
                                            <div className="space-y-4">
                                                <Link 
                                                    href="/programs/mentorship"
                                                    className="block p-4 rounded-lg hover:bg-green-50 transition-colors"
                                                >
                                                    <h4 className="text-base font-medium text-gray-900 mb-1">Mentorship Program</h4>
                                                    <p className="text-sm text-gray-500">Connect with experienced industry leaders.</p>
                                                </Link>
                                                <Link 
                                                    href="/programs/innovation-hub"
                                                    className="block p-4 rounded-lg hover:bg-green-50 transition-colors"
                                                >
                                                    <h4 className="text-base font-medium text-gray-900 mb-1">Innovation Hub</h4>
                                                    <p className="text-sm text-gray-500">Collaborate on groundbreaking projects.</p>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </NavigationMenuContent>
                            </NavigationMenuItem>

                            {/* About Menu */}
                            <NavigationMenuItem>
                                <NavigationMenuTrigger>About</NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <ul className="grid gap-3 p-6 w-[600px] grid-cols-2">
                                        <li className="col-span-2">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Globe className="h-5 w-5 text-primary-green" />
                                                <h3 className="text-lg font-semibold">About GanzAfrica</h3>
                                            </div>
                                            <p className="text-sm text-gray-500 mb-4">
                                                Learn about our mission to transform Africa through sustainable development and innovation.
                                            </p>
                                        </li>
                                        <ListItem
                                            href="/about/who-we-are"
                                            title="Who We Are"
                                        >
                                            Our vision, mission, and the team behind GanzAfrica.
                                        </ListItem>
                                        <ListItem
                                            href="/about/our-impact"
                                            title="Our Impact"
                                        >
                                            See how we're making a difference across Africa.
                                        </ListItem>
                                    </ul>
                                </NavigationMenuContent>
                            </NavigationMenuItem>

                            {/* Resources Menu */}
                            <NavigationMenuItem>
                                <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <ul className="grid w-[600px] gap-3 p-6 grid-cols-2">
                                        <ListItem
                                            href="/resources/knowledge-hub"
                                            title="Knowledge Hub"
                                        >
                                            Access our library of research and publications.
                                        </ListItem>
                                        <ListItem
                                            href="/resources/events"
                                            title="Events & Webinars"
                                        >
                                            Join our upcoming events and watch past recordings.
                                        </ListItem>
                                        <ListItem
                                            href="/resources/blog"
                                            title="Blog"
                                        >
                                            Read the latest insights and stories from our community.
                                        </ListItem>
                                        <ListItem
                                            href="/resources/faq"
                                            title="FAQ"
                                        >
                                            Find answers to commonly asked questions.
                                        </ListItem>
                                    </ul>
                                </NavigationMenuContent>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>

                    <div className="flex items-center gap-4">
                        <Link href="/community">
                            <Button variant="outline" className="text-primary-green border-primary-green hover:bg-green-50">
                                Join Community
                            </Button>
                        </Link>
                        <Link href="/login">
                            <Button className="bg-primary-green hover:bg-green-700">
                                Sign In
                            </Button>
                        </Link>
                    </div>
                </Navigation>
            )}
        </>
    );
}