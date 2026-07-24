import Image from "next/image";
import { DecoratedHeading } from "@/components/layout/headertext";
import BuildingSolutionsSection from "@/components/sections/BuildingSolutionsSection";
import { default as HeaderBelt } from "@/components/layout/headerBelt";
import { Goal, Telescope, BarChart3, ShieldCheck, Leaf, LucideIcon } from "lucide-react";

import { FC } from "react";
import { TransformativePartner } from "@/components/TransformativePartner";
import { TranslatableText } from "@/components/translate";
import { Metadata } from "next";
import WhoWeArePageContent from "@/components/WhoWeArePageContent";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://web.ganzafrica.org";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "Who We Are | GanzAfrica - Empowering Africa's Food System Leaders",
  description:
    "Learn about GanzAfrica's mission to empower African youth through agriculture training, sustainable land management, and data literacy programs. Discover our vision, values, and transformative approach.",
  keywords: [
    "GanzAfrica who we are",
    "GanzAfrica mission",
    "GanzAfrica vision",
    "African agriculture training",
    "sustainable land management Africa",
    "youth empowerment Africa",
    "food systems transformation",
    "agriculture fellowship Africa",
  ],
  openGraph: {
    title: "Who We Are | GanzAfrica - Empowering Africa's Food System Leaders",
    description:
      "GanzAfrica empowers African youth through holistic training, mentorship, and work placements in agriculture, sustainable land management, and data-driven decision-making.",
    siteName: "GanzAfrica",
    type: "website",
    url: `${baseUrl}/about/who-we-are`,
    images: [
      {
        url: `${baseUrl}/images/SHIR5142-Enhanced-NR.jpg`,
        width: 1200,
        height: 630,
        alt: "GanzAfrica - Who We Are",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Who We Are | GanzAfrica",
    description:
      "Empowering African youth through agriculture training, sustainable land management, and data literacy programs.",
    creator: "@GanzAfrica",
    images: [`${baseUrl}/images/SHIR5142-Enhanced-NR.jpg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: `${baseUrl}/about/who-we-are`,
  },
};

// Types for props
interface MissionCardProps {
  bgColor: string;
  labelColor: string;
  iconColor: string;
  textColor?: string;
  label: string;
  content: string;
  hasCurvedCorner?: boolean;
  icon?: LucideIcon;
}

interface ValueCardProps {
  bgColor: string;
  iconBgColor: string;
  iconColor?: string;
  title: string;
  titleColor: string;
  textColor?: string;
  description: string;
  icon: LucideIcon;
}

interface FloatingTagProps {
  text: string;
  position: string;
  color: string;
  rotate?: string;
}

interface PromiseCardProps {
  type: "Partners" | "Fellows";
  items?: string[];
  content?: string | string[];
  hasCurvedCorner?: boolean;
  marginRight?: string;
}

interface PageProps {
  params: { locale: string };
}

const MissionCard: FC<MissionCardProps> = ({
  bgColor,
  labelColor,
  iconColor,
  textColor = "text-gray-900",
  label,
  content,
  hasCurvedCorner = false,
  icon,
}) => {
  const IconComponent = icon || (() => null);

  return (
    <div className="relative group">
      <div
        className={`${bgColor} rounded-3xl p-6 sm:p-8 overflow-hidden transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1`}
      >
        <div className="flex items-center mb-4 sm:mb-6">
          <div
            className={`${labelColor} text-white rounded-full px-3 py-1 sm:px-4 sm:py-2 flex items-center justify-center text-xs sm:text-sm font-medium`}
          >
            <span className="mr-2">●</span> {label}
          </div>
        </div>
        <p className={`text-base md:text-xl font-bold ${textColor}`}>{content}</p>
        {hasCurvedCorner && (
          <div
            className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 bg-white"
            style={{
              borderBottomLeftRadius: "100%",
            }}
          />
        )}
        <div
          className={`absolute -top-4 -right-4 ${iconColor} rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center shadow-lg`}
        >
          <IconComponent className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
        </div>
      </div>
    </div>
  );
};

// Reusable Value Card component
const ValueCard: FC<ValueCardProps> = ({
  bgColor,
  iconBgColor,
  iconColor = "white",
  title,
  titleColor,
  textColor = "text-gray-800",
  description,
  icon: IconComponent,
}) => (
  <div
    className={`w-full md:w-1/3 ${bgColor} rounded-3xl p-6 sm:p-8 relative transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer mb-6 md:mb-0`}
  >
    <div className="flex justify-center mb-4 sm:mb-6">
      <div
        className={`${iconBgColor} rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center shadow-md transition-transform duration-300 hover:scale-110`}
      >
        <IconComponent
          className="w-8 h-8 sm:w-10 sm:h-10 transition-transform duration-300 hover:scale-125"
          color={iconColor}
        />
      </div>
    </div>

    <h3
      className={`text-xl sm:text-2xl font-bold text-center ${titleColor} mb-3 sm:mb-4 transition-colors duration-300 hover:text-yellow-500`}
    >
      <TranslatableText>{title}</TranslatableText>
    </h3>

    <p
      className={`${textColor} text-center text-sm sm:text-base transition-all duration-300 hover:font-medium`}
    >
      <TranslatableText>{description}</TranslatableText>
    </p>
  </div>
);

// Promise Card component
const PromiseCard: FC<PromiseCardProps> = ({
  type,
  items,
  content,
  hasCurvedCorner = false,
  marginRight = "",
}) => {
  const bgColor = type === "Partners" ? "bg-[#073392]" : "bg-green-800";
  const labelColor = type === "Partners" ? "bg-primary-orange" : "bg-green-500";
  const textColor = type === "Partners" ? "text-white" : "text-white";
  const label = `Promise To ${type}`;
  const iconBg = type === "Partners" ? "bg-primary-orange" : "bg-green-600";

  return (
    <div
      className={`${bgColor} ${marginRight} rounded-md p-6 sm:p-8 relative transition-all duration-300 border-0 mb-5 hover:-translate-y-1`}
    >
      <div className="flex items-center mb-4">
        <div
          className={`${labelColor} text-white font-bold md:text-xl rounded-full px-3 py-1 sm:px-4 sm:py-2 flex items-center justify-center text-xs sm:text-sm`}
        >
          <span className="mr-2"></span>
          <TranslatableText>{label}</TranslatableText>
        </div>
      </div>

      {Array.isArray(content) ? (
        <ul className="space-y-3 sm:space-y-4">
          {content.map((item, index) => (
            <li key={index} className="flex items-start">
              <span className={`${textColor} mr-2 sm:mr-3 mt-1 `}>•</span>
              <span className={`${textColor} text-sm sm:text-base`}>
                <TranslatableText>{item}</TranslatableText>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="space-y-4 sm:space-y-6">
          {items?.map((item, index) => (
            <li key={index} className="flex items-start">
              <span className={`${textColor} mr-2 sm:mr-3 mt-1`}>•</span>
              <span className={`${textColor} text-sm sm:text-base`}>
                <TranslatableText>{item}</TranslatableText>
              </span>
            </li>
          ))}
        </ul>
      )}

      {hasCurvedCorner && (
        <div
          className="absolute -top-1 -right-1 w-16 h-16 sm:w-24 sm:h-24 bg-white"
          style={{ borderBottomLeftRadius: "100%" }}
        />
      )}

      {type === "Fellows" && (
        <div className="absolute -top-5 -right-5 bg-green-600 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center shadow-lg">
          <Telescope className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
        </div>
      )}
    </div>
  );
};

export default async function AboutPage({ params }: PageProps): Promise<JSX.Element> {
  // Tag data with translations
  const tags = [
    // Yellow
    {
      text: "Youth Empowerment",
      color: "bg-primary-orange",
      position: "left-56 bottom-10",
      rotate: "-5deg",
    },
    {
      text: "Land Management",
      color: "bg-primary-orange",
      position: "left-64 bottom-20",
      rotate: "0deg",
    },
    {
      text: "Peer to peer learning",
      color: "bg-primary-orange",
      position: "left-1/3 top-20",
      rotate: "8deg",
    },
    {
      text: "Food systems",
      color: "bg-primary-orange",
      position: "right-32 bottom-16",
      rotate: "0deg",
    },
    {
      text: "Stewardship",
      color: "bg-primary-orange",
      position: "left-1/2 bottom-20",
      rotate: "5deg",
    },

    // Green
    {
      text: "System Thinking",
      color: "bg-primary-green",
      position: "left-36 top-24",
      rotate: "-8deg",
    },
    {
      text: "Data Literacy",
      color: "bg-primary-green",
      position: "left-1/4 bottom-10",
      rotate: "0deg",
    },
    {
      text: "Land Rights",
      color: "bg-green-800",
      position: "right-48 top-16",
      rotate: "0deg",
    },
    {
      text: "Networking",
      color: "bg-primary-green",
      position: "left-1/3 bottom-10",
      rotate: "3deg",
    },
    {
      text: "Evidence-based",
      color: "bg-primary-green",
      position: "left-1/2 bottom-10",
      rotate: "0deg",
    },
    {
      text: "Co-creation",
      color: "bg-primary-green",
      position: "right-1/3 bottom-20",
      rotate: "0deg",
    },
    {
      text: "Agriculture",
      color: "bg-primary-green",
      position: "right-20 top-24",
      rotate: "-4deg",
    },
    {
      text: "Mentorship",
      color: "bg-primary-green",
      position: "right-1/4 bottom-10",
      rotate: "0deg",
    },
  ];

  // Categories for the banner with translations
  const categories = ["Environment", "Agriculture", "Land", "Food system", "Climate"];

  return (
    <WhoWeArePageContent>
      <main className="flex flex-col min-h-screen">
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
              <TranslatableText>WHO WE ARE</TranslatableText>
            </h2>
            <h1 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold mb-2 leading-tight">
              <span className=" font-normal ">
                <TranslatableText>Empowering Africa's Future</TranslatableText>
              </span>{" "}
              <span className="font-normal">
                <TranslatableText>Food System</TranslatableText>
              </span>
              <br />
              <span className=" font-normal">
                <TranslatableText>Leaders</TranslatableText>
              </span>
            </h1>
          </div>
        </section>

        <HeaderBelt />

        {/* A Transformative Partner Section */}
        <section className="py-8 md:py-12">
          {/* <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto"> */}
          {/* Left side - Images (hidden on mobile, visible on lg screens) */}
          {/* <div className="hidden lg:block lg:w-1/2">
              <div className="relative mx-auto" style={{ width: 'fit-content' }}>
                <div className="rounded-full overflow-hidden w-[300px] h-[300px] md:w-[400px] md:h-[400px] border-4 border-transparent">
                  <Image
                    src="/images/Presenting.jpg"
                    alt="Hands holding grain"
                    width={400}
                    height={400}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="absolute -bottom-10 -left-10 rounded-full overflow-hidden w-[120px] h-[120px] md:w-[150px] md:h-[150px] border-4 border-green-700">
                  <Image
                    src="/images/GroupMico.jpeg"
                    alt="Smiling person"
                    width={150}
                    height={150}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div> */}

          {/* Right side - Text content */}
          {/* <div className="w-full lg:w-1/2">
              <div className="flex justify-left mb-4">
                <DecoratedHeading
                  firstText={
                    dict?.about?.transformative_partner?.heading_first ||
                    "A Transformative"
                  }
                  secondText={
                    dict?.about?.transformative_partner?.heading_second || "Partner"
                  }
                />
              </div>
              <div className="max-w-full lg:max-w-xl space-y-4 text-justify">
                <p className="text-gray-700 text-sm sm:text-base">
                  {dict?.about?.transformative_partner?.paragraph_1 ||
                    "Africa is a young, fast-growing continent with almost boundless potential. To take full advantage of the opportunities ahead, African leaders need to address several priorities, including creating impactful jobs for youth and improving agriculture, which employs more Africans than any other sector. GanzAfrica offers an innovative training, mentorship, and work placement program that meets both pressing needs at once—and prepares African youth to take the future in their hands."}
                </p>

                <p className="text-gray-700 text-sm sm:text-base">
                  {dict?.about?.transformative_partner?.paragraph_2 ||
                    "GanzAfrica provides holistic career preparation for transformative food systems leaders. Our curriculum integrates best practices around agriculture, the environment, sustainable land management, and land rights to break siloed patterns of thinking and unlock opportunities at the intersections of these fields. We stress data literacy and analytical capabilities to equip youth with the necessary skills to provide the right support to state and non-state organizations to make evidence-based decisions."}
                </p>

                <p className="text-gray-700 text-sm sm:text-base">
                  {dict?.about?.transformative_partner?.paragraph_3 ||
                    "Our program also connects fellows to a rich community of mentors and places them in government and non-government sector jobs where they gain both real-world experience and the beginnings of a professional network."}
                </p>

                <p className="text-gray-700 text-sm sm:text-base">
                  {dict?.about?.transformative_partner?.paragraph_4 ||
                    "In the end, GanzAfrica connects youth to fulfilling careers that draw on their passion and skills to deliver on the promise of a healthy, prosperous future for the continent."}
                </p>
              </div>
            </div> */}
          {/* </div>
        </div> */}
          <TransformativePartner />
        </section>

        {/* OUR ASPIRATIONS SECTION */}
        <section className="py-8 sm:py-12 md:py-16 bg-white">
          <div className="flex justify-center mb-8 md:mb-12">
            <div className="relative inline-block">
              <div className="flex justify-center">
                <DecoratedHeading firstText="Our" secondText="Aspirations" />
              </div>
            </div>
          </div>

          <div className="w-full px-6 sm:px-8 md:px-4">
            <div className="flex flex-col md:flex-row gap-6 sm:gap-8 max-w-7xl mx-auto">
              {/* Left side - Team Image */}
              <div className="w-full md:w-1/2 mb-6 md:mb-0">
                <div className="rounded-md overflow-hidden h-[80px] sm:h-[300px] md:h-[400px]">
                  <Image
                    src="/images/_BAB8852.jpg"
                    alt="GanzAfrica team members"
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                </div>
              </div>
              {/* Right side - Mission Cards */}
              <div className="w-full md:w-1/2 flex flex-col space-y-6 sm:space-y-8">
                <div className="bg-[#073392] rounded-md p-6 sm:p-8 relative mr-5">
                  <div className="flex items-center mb-4">
                    <div className="bg-primary-orange text-white font-bold md:text-xl  rounded-full px-3 py-1 sm:px-4 sm:py-2 flex items-center justify-center text-xs sm:text-sm font-medium">
                      <span className="mr-2"></span>
                      <TranslatableText>Our Vision</TranslatableText>
                    </div>
                  </div>
                  <p className="text-base md:text-x  text-white">
                    <TranslatableText>
                      To advance a prosperous and sustainable food systems transformation in Africa
                      through locally driven, system-focused solutions.
                    </TranslatableText>
                  </p>

                  <div
                    className="absolute -top-1 -right-1 w-16 h-16 sm:w-24 sm:h-24 bg-white"
                    style={{ borderBottomLeftRadius: "100%" }}
                  />

                  <div className="absolute -top-5 -right-5 bg-primary-orange rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center shadow-lg">
                    <Goal className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                </div>

                <div className="bg-green-800 rounded-md p-6 sm:p-8 relative mr-5">
                  <div className="flex items-center mb-4">
                    <div className="bg-green-500 text-white md:text-xl font-bold rounded-full px-3 py-1 sm:px-4 sm:py-2 flex items-center justify-center text-xs sm:text-sm">
                      <span className="mr-2"></span>
                      <TranslatableText>Our Mission</TranslatableText>
                    </div>
                  </div>
                  <p className="text-base md:text-x  text-gray-900 text-white">
                    <TranslatableText>
                      To strengthen institutions, and the individuals who will shape and lead them,
                      by equipping and placing youth with data-driven, systems-focused skills for
                      improving food systems.
                    </TranslatableText>
                  </p>
                  <div
                    className="absolute -top-1 -right-1 w-16 h-16 sm:w-24 sm:h-24 bg-white"
                    style={{ borderBottomLeftRadius: "100%" }}
                  />
                  <div className="absolute -top-5 -right-5 bg-green-600 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center shadow-lg">
                    <Telescope className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* OUR VALUES SECTION */}
        <section className="py-16 md:py-24 bg-[#F5F5F5] bg-opacity-75">
          <div className="container mx-auto px-4">
            {/* Title and Subtitle */}
            <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
              <div className="mb-6">
                <DecoratedHeading firstText="Our" secondText="Values" />
              </div>
              <p className="text-gray-600 text-base sm:text-lg mx-auto">
                <TranslatableText>
                  At GanzAfrica, our values shape everything we do. They guide our decisions,
                  influence our actions, and define our relationships with partners and communities.
                </TranslatableText>
              </p>
            </div>

            {/* Values Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
              {/* Evidence Based Card */}
              <div className="bg-white rounded-md p-6 sm:p-8">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-primary-green rounded-full flex items-center justify-center mb-6">
                    <BarChart3 className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    <TranslatableText>Evidence Based</TranslatableText>
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base">
                    <TranslatableText>
                      In-depth research and data-driven insights shape the solutions we co-create,
                      leveraging local knowledge and building analytical expertise to ensure the
                      best possible outcomes.
                    </TranslatableText>
                  </p>
                </div>
              </div>

              {/* Integrity Card */}
              <div className="bg-primary-green rounded-md p-6 sm:p-8">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6">
                    <ShieldCheck className="w-8 h-8 text-primary-green" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">
                    <TranslatableText>Integrity</TranslatableText>
                  </h3>
                  <p className="text-white/90 text-sm sm:text-base">
                    <TranslatableText>
                      We work with authenticity and transparency. We are collaborative but not
                      subject to influence or partiality.
                    </TranslatableText>
                  </p>
                </div>
              </div>

              {/* Stewardship Card */}
              <div className="bg-white rounded-md p-6 sm:p-8 sm:col-span-2 lg:col-span-1">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-primary-green rounded-full flex items-center justify-center mb-6">
                    <Leaf className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    <TranslatableText>Stewardship</TranslatableText>
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base">
                    <TranslatableText>
                      We pattern the highest respect for human, financial, and natural resources and
                      diligence in their utilization. The solutions we co-create enshrine this,
                      alongside equality of access to resources now and for the future.
                    </TranslatableText>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Promise */}
        <section className="py-8 sm:py-12 md:py-16 bg-white text-base md:text-xl">
          <div className="flex justify-center mb-6 sm:mb-10">
            <DecoratedHeading firstText="Our" secondText="Promise" />
          </div>
          <div className="flex flex-col md:flex-row gap-4 sm:gap-6 px-6 sm:px-8 md:px-4 max-w-6xl mx-auto">
            {/* Left side - Image */}
            <div className="w-full md:w-1/2 mb-4 md:mb-0">
              <div className="rounded-md overflow-hidden h-[300px] sm:h-[400px] md:h-[710px] lg:h-[660px] xl:h-[612px]">
                <Image
                  src="/images/_BAB8908.jpg"
                  alt="Two professionals shaking hands at Ministry of Environment event"
                  width={600}
                  height={500}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>
            </div>

            {/* Right side - Content */}
            <div className="w-full md:w-1/2 flex flex-col space-y-4 sm:space-y-6 ">
              <PromiseCard
                type="Partners"
                items={[
                  "Create a pipeline of highly motivated GanzAfrica fellows with land, climate, and agricultural training, leadership skills, and analytical capabilities.",
                  "Enhance cross-generational linkages to help foster blended solutions combining novel and traditional ideas.",
                ]}
              />

              <PromiseCard
                type="Fellows"
                content={[
                  "Provide up to 2 years of holistic training with a focus on data & analytics and leadership skills",
                  "Welcome fellows into a network of value-driven young Africans committed to leading Africa's transformation",
                  "Deliver work secondments with one of our partners to apply skills learned",
                ]}
                marginRight="mr-5"
                hasCurvedCorner={true}
              />
            </div>
          </div>
        </section>

        {/* Building Sustainable Solutions Section */}
        <BuildingSolutionsSection categories={categories} tags={tags} />
      </main>
    </WhoWeArePageContent>
  );
}
