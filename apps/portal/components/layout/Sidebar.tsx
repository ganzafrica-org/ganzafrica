"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { Users } from "lucide-react";
import {
  LayoutGrid,
  FolderGit2,
  Briefcase,
  Users2,
  FileText,
  MessageSquareQuote,
  HelpCircle,
  Tag,
  Shield,
  ChevronDown,
  ChevronRight,
  UserPlus,
  MessageSquare,
  Mail,
  ChevronUp,
  CheckSquare,
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { isAdminOrManager } from "@/lib/auth-utils";

interface SidebarProps {
  isCollapsed: boolean;
}

const Sidebar = ({ isCollapsed }: SidebarProps) => {
  const pathname = usePathname();
  const { user } = useAuth();
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [usersOpen, setUsersOpen] = useState(false);
  const [teamsOpen, setTeamsOpen] = useState(false);
  const [opportunitiesOpen, setOpportunitiesOpen] = useState(false);
  const [newsOpen, setNewsOpen] = useState(false);
  const [helpFAQsOpen, setHelpFAQsOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showTopArrow, setShowTopArrow] = useState(false);
  const [showBottomArrow, setShowBottomArrow] = useState(false);

  // Check if user is admin or manager
  const userIsAdminOrManager = isAdminOrManager(user);

  // Get Task Management URL from environment variable
  const taskManagementUrl =
    process.env.NEXT_PUBLIC_TASK_URL || "http://localhost:3003";

  const toggleOpportunities = () => {
    if (!isCollapsed) {
      setOpportunitiesOpen(!opportunitiesOpen);
    }
  };

  const toggleTeams = () => {
    if (!isCollapsed) {
      setTeamsOpen(!teamsOpen);
    }
  };

  const toggleNews = () => {
    if (!isCollapsed) {
      setNewsOpen(!newsOpen);
    }
  };

  const toggleHelpFAQs = () => {
    if (!isCollapsed) {
      setHelpFAQsOpen(!helpFAQsOpen);
    }
  };

  useEffect(() => {
    // Auto-open dropdowns based on active route
    if (
      pathname === "/projects" ||
      pathname.startsWith("/projects/") ||
      pathname === "/categories" ||
      pathname.startsWith("/categories/")
    ) {
      setProjectsOpen(true);
    }
    if (
      pathname === "/users" ||
      pathname.startsWith("/users/") ||
      pathname === "/roles" ||
      pathname.startsWith("/roles/")
    ) {
      setUsersOpen(true);
    }
    if (pathname === "/news" || pathname.startsWith("/news/")) {
      setNewsOpen(true);
    }
    if (
      pathname === "/faqs" ||
      pathname.startsWith("/faqs/") ||
      pathname === "/contact" ||
      pathname.startsWith("/contact/") ||
      pathname === "/subscribers" ||
      pathname.startsWith("/subscribers/")
    ) {
      setHelpFAQsOpen(true);
    }
  }, [pathname]);

  // Check if we need to show arrows
  const checkArrows = () => {
    const el = scrollRef.current;
    if (!el) return;
    setShowTopArrow(el.scrollTop > 0);
    setShowBottomArrow(el.scrollTop + el.clientHeight < el.scrollHeight - 1);
  };

  useEffect(() => {
    checkArrows();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkArrows);
    window.addEventListener("resize", checkArrows);
    return () => {
      el.removeEventListener("scroll", checkArrows);
      window.removeEventListener("resize", checkArrows);
    };
  }, []);

  const scrollBy = (amount: number) => {
    scrollRef.current?.scrollBy({ top: amount, behavior: "smooth" });
  };

  return (
    <div
      className={`fixed left-0 top-0 h-full bg-[#045F3C] text-white/90 transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Logo Section */}
        <div className="h-16 flex-shrink-0 flex items-center px-6 border-b border-white/10">
          <div className="flex items-center">
            {!isCollapsed ? (
              <Image
                src={
                  process.env.NODE_ENV === "production"
                    ? "/portal/images/logoLight.png"
                    : "/images/logoLight.png"
                }
                alt="GanzAfrica"
                width={130}
                height={35}
                className="object-contain"
                priority
              />
            ) : (
              <Image
                src={
                  process.env.NODE_ENV === "production"
                    ? "/portal/images/logoLight.png"
                    : "/images/logoLight.png"
                }
                alt="GanzAfrica"
                width={32}
                height={32}
                className="object-contain"
                priority
              />
            )}
          </div>
        </div>

        {/* Menu Sections */}
        <div className="flex-1 min-h-0 relative">
          {/* Scroll Arrows */}
          {showTopArrow && (
            <button
              className="absolute left-1/2 -translate-x-1/2 top-2 z-20 bg-[#045F3C]/90 backdrop-blur-sm rounded-full shadow-lg p-1.5 hover:bg-[#045F3C] transition-all duration-200"
              onClick={() => scrollBy(-80)}
              aria-label="Scroll up"
            >
              <ChevronUp className="w-4 h-4 text-white" />
            </button>
          )}

          {showBottomArrow && (
            <button
              className="absolute left-1/2 -translate-x-1/2 bottom-2 z-20 bg-[#045F3C]/90 backdrop-blur-sm rounded-full shadow-lg p-1.5 hover:bg-[#045F3C] transition-all duration-200"
              onClick={() => scrollBy(80)}
              aria-label="Scroll down"
            >
              <ChevronDown className="w-4 h-4 text-white" />
            </button>
          )}

          {/* Menu Content */}
          <div
            ref={scrollRef}
            className="absolute inset-0 overflow-y-auto overflow-x-hidden no-scrollbar"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <div className="px-4 py-6">
              {/* Main Menu */}
              <div>
                {!isCollapsed && (
                  <h2 className="px-4 mb-3 text-sm font-medium text-white/60 uppercase tracking-wider">
                    Main Menu
                  </h2>
                )}
                <nav className="space-y-1">
                  <Link
                    href="/dashboard"
                    className={`flex items-center ${isCollapsed ? "justify-center px-3" : "px-4"} py-2.5 rounded-lg transition-colors ${
                      pathname === "/dashboard"
                        ? "bg-white/10 text-white"
                        : "text-white/80 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <LayoutGrid className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && (
                      <span className="ml-3 font-medium">Dashboard</span>
                    )}
                  </Link>

                  {/* Projects Dropdown */}
                  <div>
                    <div
                      className={`flex items-center justify-between cursor-pointer ${isCollapsed ? "justify-center px-3" : "px-4"} py-2.5 rounded-lg transition-colors ${
                        pathname === "/projects" ||
                        pathname.startsWith("/projects/") ||
                        pathname === "/categories" ||
                        pathname.startsWith("/categories/")
                          ? "bg-white/10 text-white"
                          : "text-white/80 hover:bg-white/5 hover:text-white"
                      }`}
                      onClick={() =>
                        !isCollapsed && setProjectsOpen(!projectsOpen)
                      }
                    >
                      <div className="flex items-center">
                        <FolderGit2 className="w-5 h-5 flex-shrink-0" />
                        {!isCollapsed && (
                          <span className="ml-3 font-medium">Projects</span>
                        )}
                      </div>
                      {!isCollapsed &&
                        (projectsOpen ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        ))}
                    </div>

                    {/* Projects dropdown items */}
                    {!isCollapsed && projectsOpen && (
                      <>
                        <Link
                          href="/projects"
                          className={`flex items-center pl-10 pr-4 py-2 rounded-lg transition-colors ${
                            pathname === "/projects"
                              ? "bg-white/10 text-white"
                              : "text-white/80 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          <FolderGit2 className="w-4 h-4 flex-shrink-0" />
                          <span className="ml-3 font-medium text-sm">
                            Manage Projects
                          </span>
                        </Link>
                        <Link
                          href="/categories"
                          className={`flex items-center pl-10 pr-4 py-2 rounded-lg transition-colors ${
                            pathname === "/categories" ||
                            pathname.startsWith("/categories/")
                              ? "bg-white/10 text-white"
                              : "text-white/80 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          <Tag className="w-4 h-4 flex-shrink-0" />
                          <span className="ml-3 font-medium text-sm">
                            Project Categories
                          </span>
                        </Link>
                      </>
                    )}
                  </div>

                  <div className="relative">
                    <button
                      onClick={toggleOpportunities}
                      className={`flex items-center w-full ${isCollapsed ? "justify-center px-3" : "justify-between px-4"} py-2.5 rounded-lg transition-colors ${
                        pathname === "/opportunities" ||
                        pathname === "/applications" ||
                        pathname.startsWith("/opportunities/") ||
                        pathname.startsWith("/applications/")
                          ? "bg-white/10 text-white"
                          : "text-white/80 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center">
                        <Briefcase className="w-5 h-5 flex-shrink-0" />
                        {!isCollapsed && (
                          <span className="ml-3 font-medium">
                            Opportunities
                          </span>
                        )}
                      </div>
                      {!isCollapsed &&
                        (opportunitiesOpen ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        ))}
                    </button>

                    {/* Dropdown menu */}
                    {!isCollapsed && opportunitiesOpen && (
                      <div className="pl-11 mt-1 space-y-1">
                        <Link
                          href="/opportunities"
                          className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                            pathname === "/opportunities"
                              ? "bg-white/10 text-white"
                              : "text-white/80 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          <span className="font-medium">Opportunities</span>
                        </Link>
                        <Link
                          href="/applications"
                          className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                            pathname === "/applications" ||
                            pathname.startsWith("/applications/")
                              ? "bg-white/10 text-white"
                              : "text-white/80 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          <span className="font-medium">
                            General Applications
                          </span>
                        </Link>
                      </div>
                    )}

                    {/* Compact menu for collapsed sidebar */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 z-10 w-48 mt-1 bg-[#045F3C] rounded-lg shadow-lg transform -translate-x-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-150">
                        <Link
                          href="/opportunities"
                          className="block px-4 py-2 text-white/80 hover:bg-white/5 hover:text-white rounded-t-lg"
                        >
                          All Opportunities
                        </Link>
                        <Link
                          href="/applications"
                          className="block px-4 py-2 text-white/80 hover:bg-white/5 hover:text-white rounded-b-lg"
                        >
                          Applications
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Users Dropdown */}
                  <div>
                    <div
                      className={`flex items-center justify-between cursor-pointer ${isCollapsed ? "justify-center px-3" : "px-4"} py-2.5 rounded-lg transition-colors ${
                        pathname === "/users" ||
                        pathname.startsWith("/users/") ||
                        pathname === "/roles" ||
                        pathname.startsWith("/roles/")
                          ? "bg-white/10 text-white"
                          : "text-white/80 hover:bg-white/5 hover:text-white"
                      }`}
                      onClick={() => !isCollapsed && setUsersOpen(!usersOpen)}
                    >
                      <div className="flex items-center">
                        <Users2 className="w-5 h-5 flex-shrink-0" />
                        {!isCollapsed && (
                          <span className="ml-3 font-medium">Users</span>
                        )}
                      </div>
                      {!isCollapsed &&
                        (usersOpen ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        ))}
                    </div>

                    {/* Users dropdown items */}
                    {!isCollapsed && usersOpen && (
                      <>
                        <Link
                          href="/users"
                          className={`flex items-center pl-10 pr-4 py-2 rounded-lg transition-colors ${
                            pathname === "/users"
                              ? "bg-white/10 text-white"
                              : "text-white/80 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          <Users2 className="w-4 h-4 flex-shrink-0" />
                          <span className="ml-3 font-medium text-sm">
                            Manage Users
                          </span>
                        </Link>
                        <Link
                          href="/roles"
                          className={`flex items-center pl-10 pr-4 py-2 rounded-lg transition-colors ${
                            pathname === "/roles" ||
                            pathname.startsWith("/roles/")
                              ? "bg-white/10 text-white"
                              : "text-white/80 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          <Shield className="w-4 h-4 flex-shrink-0" />
                          <span className="ml-3 font-medium text-sm">
                            Roles
                          </span>
                        </Link>
                      </>
                    )}
                  </div>

                  {/* Teams with dropdown */}
                  <div className="relative">
                    <button
                      onClick={toggleTeams}
                      className={`flex items-center w-full ${isCollapsed ? "justify-center px-3" : "justify-between px-4"} py-2.5 rounded-lg transition-colors ${
                        pathname === "/teams" || pathname.startsWith("/teams/")
                          ? "bg-white/10 text-white"
                          : "text-white/80 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center">
                        <UserPlus className="w-5 h-5 flex-shrink-0" />
                        {!isCollapsed && (
                          <span className="ml-3 font-medium">Teams</span>
                        )}
                      </div>
                      {!isCollapsed &&
                        (teamsOpen ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        ))}
                    </button>

                    {/* Teams dropdown menu */}
                    {!isCollapsed && teamsOpen && (
                      <div className="pl-11 mt-1 space-y-1">
                        <Link
                          href="/teams"
                          className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                            pathname === "/teams/manage"
                              ? "bg-white/10 text-white"
                              : "text-white/80 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          <span className="font-medium">Manage Teams</span>
                        </Link>
                        <Link
                          href="/teams/team-types"
                          className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                            pathname === "/teams/types/add"
                              ? "bg-white/10 text-white"
                              : "text-white/80 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          <span className="font-medium">Add Team Type</span>
                        </Link>
                      </div>
                    )}

                    {/* Compact menu for collapsed sidebar */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 z-10 w-48 mt-1 bg-[#045F3C] rounded-lg shadow-lg transform -translate-x-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-150">
                        <Link
                          href="/teams"
                          className="block px-4 py-2 text-white/80 hover:bg-white/5 hover:text-white rounded-t-lg"
                        >
                          Manage Teams
                        </Link>
                        <Link
                          href="/teams/add-tea"
                          className="block px-4 py-2 text-white/80 hover:bg-white/5 hover:text-white rounded-b-lg"
                        >
                          Manage Team Type
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* News & Tags Dropdown - FIXED */}
                  <div>
                    <div
                      className={`flex items-center justify-between cursor-pointer ${isCollapsed ? "justify-center px-3" : "px-4"} py-2.5 rounded-lg transition-colors text-white/80 hover:bg-white/5 hover:text-white`}
                      onClick={toggleNews}
                    >
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 flex-shrink-0" />
                        {!isCollapsed && (
                          <span className="ml-3 font-medium">News</span>
                        )}
                      </div>
                      {!isCollapsed &&
                        (newsOpen ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        ))}
                    </div>
                    {!isCollapsed && newsOpen && (
                      <>
                        <Link
                          href="/news"
                          className={`flex items-center pl-10 pr-4 py-2 rounded-lg transition-colors ${
                            pathname === "/news"
                              ? "bg-white/10 text-white"
                              : "text-white/80 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          <FileText className="w-4 h-4 flex-shrink-0" />
                          <span className="ml-3 font-medium text-sm">
                            All News
                          </span>
                        </Link>
                        <Link
                          href="/news/tags"
                          className={`flex items-center pl-10 pr-4 py-2 rounded-lg transition-colors ${
                            pathname === "/news/tags" ||
                            pathname.startsWith("/news/tags")
                              ? "bg-white/10 text-white"
                              : "text-white/80 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          <Tag className="w-4 h-4 flex-shrink-0" />
                          <span className="ml-3 font-medium text-sm">Tags</span>
                        </Link>
                      </>
                    )}
                  </div>
                  <Link
                    href="/partners"
                    className={`flex items-center ${isCollapsed ? "justify-center px-3" : "px-4"} py-2.5 rounded-lg transition-colors ${
                      pathname === "/partners" ||
                      pathname.startsWith("/partners/")
                        ? "bg-white/10 text-white"
                        : "text-white/80 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Users className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && (
                      <span className="ml-3 font-medium">Partners</span>
                    )}
                  </Link>

                  <Link
                    href="/testimonials"
                    className={`flex items-center ${isCollapsed ? "justify-center px-3" : "px-4"} py-2.5 rounded-lg transition-colors ${
                      pathname === "/testimonials" ||
                      pathname.startsWith("/testimonials/")
                        ? "bg-white/10 text-white"
                        : "text-white/80 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <MessageSquareQuote className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && (
                      <span className="ml-3 font-medium">Testimonials</span>
                    )}
                  </Link>

                  {/* Help & FAQs Dropdown */}
                  <div className="relative">
                    <button
                      onClick={toggleHelpFAQs}
                      className={`flex items-center w-full ${isCollapsed ? "justify-center px-3" : "justify-between px-4"} py-2.5 rounded-lg transition-colors ${
                        pathname === "/faqs" ||
                        pathname.startsWith("/faqs/") ||
                        pathname === "/contact" ||
                        pathname.startsWith("/contact/") ||
                        pathname === "/subscribers" ||
                        pathname.startsWith("/subscribers/")
                          ? "bg-white/10 text-white"
                          : "text-white/80 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center">
                        <HelpCircle className="w-5 h-5 flex-shrink-0" />
                        {!isCollapsed && (
                          <span className="ml-3 font-medium">Help & FAQs</span>
                        )}
                      </div>
                      {!isCollapsed &&
                        (helpFAQsOpen ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        ))}
                    </button>

                    {/* Help & FAQs dropdown menu */}
                    {!isCollapsed && helpFAQsOpen && (
                      <div className="pl-11 mt-1 space-y-1">
                        <Link
                          href="/faqs"
                          className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                            pathname === "/faqs" ||
                            pathname.startsWith("/faqs/")
                              ? "bg-white/10 text-white"
                              : "text-white/80 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          <HelpCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="font-medium">FAQs</span>
                        </Link>
                        <Link
                          href="/contact"
                          className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                            pathname === "/contact" ||
                            pathname.startsWith("/contact/")
                              ? "bg-white/10 text-white"
                              : "text-white/80 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          <MessageSquare className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="font-medium">Contact Us</span>
                        </Link>
                        <Link
                          href="/subscribers"
                          className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                            pathname === "/subscribers" ||
                            pathname.startsWith("/subscribers/")
                              ? "bg-white/10 text-white"
                              : "text-white/80 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="font-medium">Subscribers</span>
                        </Link>
                      </div>
                    )}

                    {/* Compact menu for collapsed sidebar */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 z-10 w-48 mt-1 bg-[#045F3C] rounded-lg shadow-lg transform -translate-x-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-150">
                        <Link
                          href="/faqs"
                          className="block px-4 py-2 text-white/80 hover:bg-white/5 hover:text-white rounded-t-lg"
                        >
                          FAQs
                        </Link>
                        <Link
                          href="/contact"
                          className="block px-4 py-2 text-white/80 hover:bg-white/5 hover:text-white"
                        >
                          Contact Us
                        </Link>
                        <Link
                          href="/subscribers"
                          className="block px-4 py-2 text-white/80 hover:bg-white/5 hover:text-white rounded-b-lg"
                        >
                          Subscribers
                        </Link>
                      </div>
                    )}
                  </div>
                </nav>
              </div>
            </div>
          </div>
        </div>

        {/* Task Management Link - Only for Admin and Manager */}
        {userIsAdminOrManager && (
          <div className="flex-shrink-0 p-4 border-t border-white/10">
            <a
              href={`${taskManagementUrl}/my-tasks`}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center ${isCollapsed ? "justify-center px-3" : "px-4"} py-2.5 text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-colors`}
            >
              <CheckSquare className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="ml-3 font-medium">Task Management</span>
              )}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
