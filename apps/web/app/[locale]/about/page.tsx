import { getDictionary } from "@/lib/get-dictionary";
import Image from "next/image";
import { PersonIcon, BikeIcon } from "@/components/ui/icons";
import { DecoratedHeading } from "@/components/layout/headertext";
import CategoriesBanner from "@/components/layout/headerBanner";
import LanguageSwitcher from "@/components/layout/language-switcher";
import { FC } from "react";

import { 
  Users, Bike, Award, BookOpen, LandPlot, Calendar, 
  BarChart, Heart, Leaf, Handshake, Globe, Database
} from "lucide-react";
// Types for props
interface MissionCardProps {
  bgColor: string;
  labelColor: string;
  iconColor: string;
  textColor?: string;
  label: string;
  content: string;
  hasCurvedCorner?: boolean;
}

interface ValueCardProps {
  bgColor: string;
  iconBgColor: string;
  iconColor?: string;
  title: string;
  titleColor: string;
  textColor?: string;
  description: string;
}

interface FloatingTagProps {
  text: string;
  position: string;
  color: string;
  rotate?: string;
}

interface PromiseCardProps {
  type: "partners" | "fellows";
  items?: string[];
  content?: string | string[];
  hasCurvedCorner?: boolean;
}

interface PageProps {
  params: { locale: string };
}

// Reusable Mission Card component
const MissionCard: FC<MissionCardProps> = ({
  bgColor,
  labelColor,
  iconColor,
  textColor = "text-gray-900",
  label,
  content,
  hasCurvedCorner = false,
  // icon = <Bike /> // Default icon
}) => (
  <div className="relative w-full">
    <div className={`${bgColor} rounded-3xl p-4 sm:p-6 md:p-8 overflow-hidden h-full`}>
      <div className="flex items-center mb-4 md:mb-">
        <div
          className={`${labelColor} text-white rounded-full px-3 py-1 sm:px-4 sm:py-2 flex items-center justify-center text-sm font-medium`}
        >
          <span className="mr-2">●</span> {label}
        </div>
      </div>

      <p className={`text-base sm:text-lg md:text-xl font-bold ${textColor}`}>{content}</p>

      {hasCurvedCorner && (
        <div
          className="absolute top-0 right-0 w-16 md:w-24 h-16 md:h-24 bg-white"
          style={{
            borderBottomLeftRadius: "100%",
          }}
        ></div>
      )}

      {/* Circular icon */}
      <div
        className={`absolute -top-4 -right-4 ${iconColor} rounded-full w-14 h-14 md:w-20 md:h-20 flex items-center justify-center shadow-lg`}
      >
        <BikeIcon />
      </div>
    </div>
  </div>
);

// Reusable Value Card component
const ValueCard: FC<ValueCardProps> = ({
  bgColor,
  iconBgColor,
  iconColor = "white",
  title,
  titleColor,
  textColor = "text-gray-800",
  description,
}) => (
  <div
    className={`w-full md:w-1/3 ${bgColor} rounded-3xl p-4 sm:p-6 md:p-8 relative transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer`}
  >
    <div className="flex justify-center mb-4 md:mb-6">
      <div
        className={`${iconBgColor} rounded-full sm:w-20 sm:h-20 md:w-24 md:h-24 w-24 h-24 flex items-center justify-center shadow-md transition-transform duration-300 hover:scale-110`}
      >
        <BikeIcon
          className="w-14 h-14 transition-transform duration-300 hover:scale-125"
          color={iconColor}
        />
      </div>
    </div>

    <h3
      className={`text-xl sm:text-2xl font-bold text-center ${titleColor} mb-2 md:mb-4 transition-colors duration-300 hover:text-primary-orange`}
    >
      {title}
    </h3>

    <p
      className={`${textColor} text-center text-sm sm:text-base transition-all duration-300 hover:font-medium`}
    >
      {description}
    </p>
  </div>
);

// Floating Tag component
const FloatingTag: FC<FloatingTagProps> = ({
  text,
  position,
  color,
  rotate = "0deg",
}) => (
  <div
    className={`absolute ${position}`}
    style={{ transform: `rotate(${rotate})` }}
  >
    <span
      className={`${color} text-white rounded-full px-4 py-2 inline-block font-medium text-sm shadow-md whitespace-nowrap`}
    >
      {text}
    </span>
  </div>
);

// Promise Card component
const PromiseCard: FC<PromiseCardProps> = ({
  type,
  items,
  content,
  hasCurvedCorner = false,
}) => {
  const bgColor = type === "partners" ? "bg-yellow-50" : "bg-green-800";
  const labelColor = type === "partners" ? "secondary-yellow" : "bg-green-500";
  const textColor = type === "partners" ? "text-gray-800" : "text-white";
  const label = `Promise to ${type}`;

  if (type === "partners" && items) {
    return (
      <div className={`${bgColor} rounded-3xl p-6`}>
        <div className="flex items-center mb-4">
          <div
            className={`${labelColor} text-white rounded-full px-4 py-2 flex items-center justify-center text-xs font-bold`}
          >
            {label}
          </div>
        </div>

        <ul className="space-y-6">
          {items.map((item, index) => (
            <li key={index} className="flex items-start">
              <span className="text-black font-bold mr-3 mt-1">•</span>
              <span className="text-gray-800 font-medium text-lg">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        className={`${bgColor} ${textColor} rounded-3xl p-6 overflow-hidden`}
      >
        <div className="flex items-center mb-4">
          <div
            className={`${labelColor} text-white rounded-full px-4 py-2 flex items-center justify-center text-xs font-bold`}
          >
            {label}
          </div>
        </div>

        {Array.isArray(content) ? (
          <ul className="space-y-4">
            {content.map((item, index) => (
              <li key={index} className="flex items-start">
                <span className="text-white font-bold mr-3 mt-1">•</span>
                <span className="text-white font-medium">{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xl font-bold">{content}</p>
        )}

        {hasCurvedCorner && (
          <div
            className="absolute top-0 right-0 w-16 h-16 bg-white"
            style={{
              borderBottomLeftRadius: "100%",
            }}
          ></div>
        )}
      </div>
    </div>
  );
};

export default async function AboutPage({ params: { locale } }: PageProps) {
  const dict = await getDictionary(locale);

  // Tag data with translations
  const tags = [
    // Yellow
    {
      text: dict?.about?.tags?.youth_empowerment || "Youth Empowerment",
      color: "secondary-yellow",
      position: "left-56 bottom-10",
      rotate: "-5deg",
    },
    {
      text: dict?.about?.tags?.land_management || "Land Management",
      color: "secondary-yellow",
      position: "left-64 bottom-20",
      rotate: "0deg",
    },
    {
      text: dict?.about?.tags?.peer_learning || "Peer to peer learning",
      color: "secondary-yellow",
      position: "left-1/3 top-20",
      rotate: "8deg",
    },
    {
      text: dict?.about?.tags?.food_systems || "Food systems",
      color: "secondary-yellow",
      position: "right-32 bottom-16",
      rotate: "0deg",
    },
    {
      text: dict?.about?.tags?.stewardship || "Stewardship",
      color: "secondary-yellow",
      position: "left-1/2 bottom-20",
      rotate: "5deg",
    },

    // Green
    {
      text: dict?.about?.tags?.system_thinking || "System Thinking",
      color: "bg-primary-green",
      position: "left-36 top-24",
      rotate: "-8deg",
    },
    {
      text: dict?.about?.tags?.data_literacy || "Data Literacy",
      color: "bg-primary-green",
      position: "left-1/4 bottom-10",
      rotate: "0deg",
    },
    {
      text: dict?.about?.tags?.land_rights || "Land Rights",
      color: "bg-green-800",
      position: "right-48 top-16",
      rotate: "0deg",
    },
    {
      text: dict?.about?.tags?.networking || "Networking",
      color: "bg-primary-green",
      position: "left-1/3 bottom-10",
      rotate: "3deg",
    },
    {
      text: dict?.about?.tags?.evidence_based || "Evidence-based",
      color: "bg-primary-green",
      position: "left-1/2 bottom-10",
      rotate: "0deg",
    },
    {
      text: dict?.about?.tags?.co_creation || "Co-creation",
      color: "bg-primary-green",
      position: "right-1/3 bottom-20",
      rotate: "0deg",
    },
    {
      text: dict?.about?.tags?.agriculture || "Agriculture",
      color: "bg-primary-green",
      position: "right-20 top-24",
      rotate: "-4deg",
    },
    {
      text: dict?.about?.tags?.mentorship || "Mentorship",
      color: "bg-primary-green",
      position: "right-1/4 bottom-10",
      rotate: "0deg",
    },
  ];

  // Categories for the banner with translations
  const categories = [
    dict?.about?.categories?.environment || "Environment",
    dict?.about?.categories?.agriculture || "Agriculture",
    dict?.about?.categories?.land || "Land",
    dict?.about?.categories?.food_system || "Food system",
    dict?.about?.categories?.climate || "Climate",
  ];

  return (
    <main className="flex flex-col min-h-screen">
      {/* Language Switcher */}
      <div className="flex justify-end p-4">
        <LanguageSwitcher />
      </div>

      {/* Hero Section with Background Image */}
      <section className="relative bg-green-900 text-white py-24">
        <div className="absolute inset-0 z-0">
          <Image
            src="/api/placeholder/1920/600"
            alt="Agricultural fields"
            fill
            className="object-cover opacity-50"
            priority
          />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {dict?.about?.hero?.title_1 || "Empowering"}{" "}
            <span className="text-white">
              {dict?.about?.hero?.title_2 || "Africa's Future"}
            </span>
          </h1>
          <h2 className="text-2xl md:text-3xl font-medium mb-6">
            {dict?.about?.hero?.subtitle || "Through Transformative"}
          </h2>
          <h2 className="text-3xl md:text-4xl font-bold text-primary-orange mb-8">
            {dict?.about?.hero?.who_we_are || "WHO WE ARE"}
          </h2>
        </div>
      </section>

      {/* Our Approach Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-center mb-8">
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
          
          <div className="max-w-4xl mx-auto text-left">
            <p className="text-gray-700 mb-6">
              {dict?.about?.transformative_partner?.paragraph_1 ||
                "Africa is a young, fast-growing continent with almost boundless potential. To take full advantage of the opportunities ahead, African leaders need to address several priorities, including creating impactful jobs for youth and improving agriculture, which employs more Africans than any other sector. GanzAfrica offers an innovative training, mentorship, and work placement program that meets both pressing needs at once—and prepares African youth to take the future in their hands."}
            </p>
            <p className="text-gray-700 mb-8">
              {dict?.about?.transformative_partner?.paragraph_2 ||
                "GanzAfrica provides holistic career preparation for transformative food systems leaders. Our curriculum integrates best practices around agriculture, the environment, sustainable land management, and land rights to break siloed patterns of thinking and unlock opportunities at the intersections of these fields. We stress data literacy and analytical capabilities to equip youth with the necessary skills to provide the right support to state and non-state organizations to make evidence-based decisions."}
            </p>
            <p className="text-gray-700 mb-8">
              {dict?.about?.transformative_partner?.paragraph_3 ||
                "Our program also connects fellows to a rich community of mentors and places them in government and non-government sector jobs where they gain both real-world experience and the beginnings of a professional network."}
            </p>
            <p className="text-gray-700 mb-8">
              {dict?.about?.transformative_partner?.paragraph_4 ||
                "In the end, GanzAfrica connects youth to fulfilling careers that draw on their passion and skills to deliver on the promise of a healthy, prosperous future for the continent."}
            </p>
          </div>
        </div>
      </section>

      {/* OUR ASPIRATIONS SECTION */}
      <section className="py-16 bg-white">
        <div className="flex justify-center mb-12">
          <div className="relative inline-block">
            <div className="flex justify-center">
              <DecoratedHeading
                firstText={dict?.about?.aspirations?.heading_first || "Our"}
                secondText={
                  dict?.about?.aspirations?.heading_second || "Aspirations"
                }
              />
            </div>
          </div>
        </div>

        <div className="w-full px-4">
          <div className="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto">
            {/* Left side - Team Image */}
            <div className="md:w-1/2">
              <div className="rounded-3xl overflow-hidden h-full">
                <Image
                  src="/images/team.png"
                  alt="GanzAfrica team members"
                  width={600}
                  height={400}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Right side - Mission Cards */}
            <div className="md:w-1/2 flex flex-col space-y-8">
              <MissionCard
                bgColor="bg-yellow-50"
                labelColor="secondary-yellow"
                iconColor="secondary-yellow"
                label={dict?.about?.aspirations?.mission_label || "Our Mission"}
                content={
                  dict?.about?.aspirations?.mission_1 ||
                  "To advance a prosperous and sustainable food systems transformation in Africa through locally driven, system-focused solutions"
                }
              />

              <MissionCard
                bgColor="bg-green-800"
                labelColor="bg-green-500"
                iconColor="bg-green-600"
                textColor="text-white"
                label={dict?.about?.aspirations?.mission_label || "Our Mission"}
                content={
                  dict?.about?.aspirations?.mission_2 ||
                  "To strengthen institutions, and the individuals who will shape and lead them, by equipping and placing youth with data-driven, systems-focused skills for improving food systems."
                }
                hasCurvedCorner={true}
              />
            </div>
          </div>
        </div>
      </section>

      {/* OUR VALUES SECTION */}
      <section className="py-16 bg-white">
        <div className="flex justify-center mb-16">
          <div className="relative inline-block">
            <div className="flex justify-center mb-10">
              <DecoratedHeading
                firstText={dict?.about?.values?.heading_first || "Our"}
                secondText={dict?.about?.values?.heading_second || "Values"}
              />
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto">
            <ValueCard
              bgColor="bg-yellow-50"
              iconBgColor="secondary-yellow"
              title={dict?.about?.values?.evidence_title || "Evidence based"}
              titleColor="text-yellow-400"
              description={
                dict?.about?.values?.evidence_description ||
                "In-depth research and data-driven insights shape the solutions we co-create, leveraging local knowledge and building analytical expertise to ensure the best possible outcomes."
              }
            />

            <ValueCard
              bgColor="bg-green-800"
              iconBgColor="bg-white"
              iconColor="#006837"
              title={dict?.about?.values?.integrity_title || "Integrity"}
              titleColor="text-white"
              textColor="text-white"
              description={
                dict?.about?.values?.integrity_description ||
                "We work with authenticity and transparency. We are collaborative but not subject to influence or partiality."
              }
            />

            <ValueCard
              bgColor="bg-yellow-50"
              iconBgColor="secondary-yellow"
              title={dict?.about?.values?.stewardship_title || "Stewardship"}
              titleColor="text-yellow-400"
              description={
                dict?.about?.values?.stewardship_description ||
                "We pattern the highest respect for human, financial, and natural resources and diligence in their utilization. The solutions we co-create enshrine this, alongside equality of access to resources now and for the future."
              }
            />
          </div>
        </div>
      </section>

      {/* Building Sustainable Solutions Section */}
      <section className="py-16 bg-white relative overflow-hidden">
        {/* Main heading */}
        <div className="container mx-auto px-4 mb-8">
          <h2 className="text-4xl font-bold text-center">
            <span className="text-green-800">
              {dict?.about?.building_solutions?.heading_1 ||
                "Building Sustainable "}
            </span>
            <span className="text-primary-orange">
              {dict?.about?.building_solutions?.heading_2 || "Solutions With"}
            </span>
            <br />
            <span className="text-primary-orange">
              {dict?.about?.building_solutions?.heading_3 ||
                "African Communities!"}
            </span>
          </h2>
        </div>

        {/* Floating tags cloud - horizontal layout */}
        <div className="w-full relative h-60 mb-8 overflow-visible">
          {tags.map((tag, index) => (
            <FloatingTag
              key={`tag-${index}`}
              text={tag.text}
              position={tag.position}
              color={tag.color}
              rotate={tag.rotate}
            />
          ))}
        </div>

        {/* Categories Banner Component - full width with slanted design */}
        <div className="w-full">
          <CategoriesBanner categories={categories} />
        </div>
      </section>

      {/* Our Approach Grid Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-center mb-10">
            <DecoratedHeading
              firstText={dict?.about?.approach?.heading_first || "Our"}
              secondText={dict?.about?.approach?.heading_second || "Approach"}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {/* Left Column - Identify */}
            <div>
              <div style={{ backgroundColor: "#FFFDEB" }} className="p-6 h-80">
                <div className="w-24 h-24 secondary-yellow rounded-full flex items-center justify-center mb-4">
                  <PersonIcon className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-primary-orange mb-3">
                  {dict?.about?.approach?.identify_title || "Identify"}
                </h2>
                <p className="text-gray-800">
                  {dict?.about?.approach?.identify_text ||
                    "Identify leaders who are committed and passionate about the sustainable stewardship of land, agriculture, and the environment, and who can be trained and capacitated to provide expertise to public, and private sectors and communities."}
                </p>
              </div>

              {/* Bottom-left image */}
              <div className="h-80">
                <Image
                  src="/images/team-members-2.jpg"
                  alt="GanzAfrica Office"
                  width={400}
                  height={320}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Middle Column - Main Image + Establish */}
            <div>
              {/* Main center image */}
              <div className="h-80">
                <Image
                  src="/images/team-members-1.jpg"
                  alt="GanzAfrica Team"
                  width={400}
                  height={320}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Establish section */}
              <div style={{ backgroundColor: "#F9F9FB" }} className="p-6 h-80">
                <div className="w-24 h-24 bg-green-800 rounded-full flex items-center justify-center mb-4">
                  <PersonIcon className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-green-800 mb-3">
                  {dict?.about?.approach?.establish_title || "Establish"}
                </h2>
                <p className="text-gray-800">
                  {dict?.about?.approach?.establish_text ||
                    "Establish in-person digital training and incubation centres, enabling hands-on capacity enhancement programmes, professional development and networking designed to respond to specific challenges."}
                </p>
              </div>
            </div>

            {/* Right Column - Deploy + Image */}
            <div>
              {/* Deploy section */}
              <div style={{ backgroundColor: "#FFFDEB" }} className="p-6 h-80">
                <div className="w-24 h-24 secondary-yellow rounded-full flex items-center justify-center mb-4">
                  <PersonIcon className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-primary-orange mb-3">
                  {dict?.about?.approach?.deploy_title || "Deploy"}
                </h2>
                <p className="text-gray-800">
                  {dict?.about?.approach?.deploy_text ||
                    "Deploy trained young professionals to support the design and implementation of co-created, community-focused solutions for livelihood improvement."}
                </p>
              </div>

              {/* Bottom-right image */}
              <div className="h-80">
                <Image
                  src="/images/team-group-photo.jpg"
                  alt="GanzAfrica Team Members"
                  width={400}
                  height={320}
                  className="w-full h-full object-cover object-center"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Promise */}
      <section className="py-16 bg-white">
        <div className="flex justify-center mb-10">
          <DecoratedHeading
            firstText={dict?.about?.promise?.heading_first || "Our"}
            secondText={dict?.about?.promise?.heading_second || "Promise"}
          />
        </div>
        <div className="flex flex-col md:flex-row gap-6 p-4 max-w-6xl mx-auto">
          {/* Left side - Image */}
          <div className="md:w-1/2">
            <div className="rounded-3xl overflow-hidden">
              <Image
                src="/images/Subtract.png"
                alt="Two professionals shaking hands at Ministry of Environment event"
                width={600}
                height={500}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right side - Content */}
          <div className="md:w-1/2 flex flex-col space-y-6">
            <PromiseCard
              type="partners"
              items={
                dict?.about?.promise?.partners_items || [
                  "Create a pipeline of highly motivated GanzAfrica fellows with land, climate, and agricultural training, leadership skills, and analytical capabilities.",
                  "Enhance cross-generational linkages to help foster blended solutions combining novel and traditional ideas.",
                ]
              }
            />

            <PromiseCard
              type="fellows"
              content={
                dict?.about?.promise?.fellows_items || [
                  "Provide up to 2 years of holistic training with a focus on data & analytics and leadership skills",
                  "Welcome fellows into a network of value-driven young Africans committed to leading Africa's transformation",
                  "Deliver work secondments with one of our partners to apply skills learned",
                ]
              }
              hasCurvedCorner={true}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
