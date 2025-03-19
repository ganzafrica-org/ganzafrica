import React from "react";
import Image from "next/image";
import { getDictionary } from "@/lib/get-dictionary";

export default async function OurStory({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const dict = await getDictionary(locale);

  return (
    <div className="min-h-screen pt-20 px-4 max-w-7xl mx-auto">
      {/* Section01 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
        <div className="p-4 bg-[#F9F9FB] rounded-lg h-96 w-full">
          <div className="flex flex-col h-full w-full">
            <div className="bg-primary-green text-white w-10 h-10 flex items-center justify-center text-lg font-bold mb-2">
              01
            </div>
            <h2 className="text-primary-green font-h4 mb-2">
              {dict?.about?.origin_title ||
                "Origin and Inspiration (Before 2022)"}
            </h2>
            <p className="text-dark font-regular-small text-sm">
              {dict?.about?.origin_text ||
                "Nearly three years ago, I established GanzAfrica with a clear mission: to build local human capital to champion the use of data and evidence to support public services and development agencies in decision-making, as they deliver essential programs to enhance people's standard of living, health, climate and environment, all critical food systems sectors. This initiative stemmed from many years of learning and experience gained working closely with public institutions and policy implementing partners. Over time, I noticed significant gaps in local capacity, efficiency and innovation potential, which resulted in slow progress and below-par developmental outcomes—especially within food systems sectors. Although GanzAfrica was officially founded in 2022, its roots go back much further. The ideas germinated from years of observing how well-meaning policies often fell short in implementation, primarily due to a lack of capacity. This has hampered progress across many African countries, where even good solutions have also been ineffective due to their application without contextual consideration."}
            </p>
          </div>
        </div>
        <div className="p-4 h-96 w-full">
          <div className="w-full h-full">
            <img
              src="/images/team-group-photo.jpg"
              alt={dict?.about?.team_photo_alt || "GanzAfrica lessons"}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        </div>
      </div>
      {/* Section 2: The Vision and Approach - Yellow background */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
        <div className="p-4 h-96 w-full">
          <div className="w-full h-full">
            <img
              src="/images/team-group-photo.jpg"
              alt={dict?.about?.team_photo_alt || "GanzAfrica team"}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        </div>
        <div className="p-4 bg-[#FFFDEB] rounded-lg h-96 w-full">
          <div className="flex flex-col h-full w-full">
            <div className="bg-primary-orange text-white w-10 h-10 flex items-center justify-center text-lg font-bold mb-2">
              02
            </div>
            <h2 className="text-primary-orange font-h4 mb-2">
              {dict?.about?.vision_title || "The Vision and Approach"}
            </h2>
            <p className="text-dark font-regular-small text-sm">
              {dict?.about?.vision_text ||
                "I realized that bridging these gaps would require a unique approach, one that involved equipping young, talented graduates with the tools to support impactful initiatives. These professionals would need to be embedded within very institutions that needed transformation. The GanzAfrica program embodies this vision. It identifies promising young professionals with the right attitudes and equips them with the skills to support mandated institutions, make evidence-based decisions, adopt systems thinking, and drive sustainable change. Fellows are strategically placed as change agents in partner public institutions, where they gain invaluable real-world experience while contributing fresh ideas. The interplay between personal skills, theoretical training and practical application is at the heart of what makes GanzAfrica unique and impactful."}
            </p>
          </div>
        </div>
      </div>
      {/* Section 3 */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
        <div className="p-4 bg-[#F9F9FB] rounded-lg h-96 w-full">
          <div className="flex flex-col h-full w-full">
            <div className="bg-primary-green text-white w-10 h-10 flex items-center justify-center text-lg font-bold mb-2">
              03
            </div>
            <h2 className="text-primary-green font-h4 mb-2">
              {dict?.about?.progress_title || "Progress and Impact (2022-2024)"}
            </h2>
            <p className="text-dark font-regular-small text-sm">
              {dict?.about?.progress_text ||
                "In just over two years since our first cohort of fellows joined public institutions, we have witnessed tangible results. Not only have our fellows brought fresh perspectives and innovative approaches to their roles, but they also facilitated operational efficiencies that are supporting institutional decision-makers to yield better outcomes within these institutions. Their contributions range from analyzing data sets, providing policy insights, and fostering a culture of accountability. Importantly, their work is starting to have a lasting impact on how institutions in the broader East African food systems, ensuring they are more sustainable, inclusive, and responsive to the needs of the population. Yet all this could not be achieved without the collaborative efforts of dedicated partners in these institutions, whose support has played a crucial role in making GA a reality. Their commitment and belief in our mission have been instrumental in driving the success of GanzAfrica."}
            </p>
          </div>
        </div>
        <div className="p-4 h-96 w-full">
          <div className="w-full h-full">
            <img
              src="/images/team-group-photo.jpg"
              alt={dict?.about?.team_photo_alt || "GanzAfrica lessons"}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Section 4 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
        <div className="p-4 h-96 w-full">
          <div className="w-full h-full">
            <img
              src="/images/team-group-photo.jpg"
              alt={dict?.about?.fellows_photo_alt || "GanzAfrica fellows"}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        </div>
        <div className="p-4 bg-[#FFFDEB] rounded-lg h-96 w-full">
          <div className="flex flex-col h-full w-full">
            <div className="bg-primary-orange text-white w-10 h-10 flex items-center justify-center text-lg font-bold mb-2">
              04
            </div>
            <h2 className="text-primary-orange font-h4 mb-2">
              {dict?.about?.success_title || "Fellow Success Stories"}
            </h2>
            <p className="text-dark font-regular-small text-sm">
              {dict?.about?.success_text ||
                "We are equally proud of the individual journeys of our fellows. Many have leveraged their experience with GanzAfrica to secure meaningful and impactful roles within the public sector and beyond. Reinforcing our core belief in the power of investing in young professionals and equipping them with the skills to lead. At GanzAfrica, we see our fellows not just as participants in a program but as changemakers who will continue to drive transformation long after their time with us."}
            </p>
          </div>
        </div>
      </div>

      {/* Section 5*/}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
        <div className="p-4 bg-[#F9F9FB] rounded-lg h-96 w-full">
          <div className="flex flex-col h-full w-full">
            <div className="bg-primary-green text-white w-10 h-10 flex items-center justify-center text-lg font-bold mb-2">
              05
            </div>
            <h2 className="text-primary-green font-h4 mb-2">
              {dict?.about?.lessons_title || "Lessons Learned and Adaptation"}
            </h2>
            <p className="text-dark font-regular-small text-sm">
              {dict?.about?.lessons_text ||
                "As we reflect on our first two years of implementation, we remain steadfast in our commitment to continuous learning and adaptation. Each challenge and lesson shapes our strategy for the future. For instance, we have learned the importance of tailoring our training to address the specific needs of the institutions we partner with. We have also seen the value of fostering strong relationships with these organizations to ensure that the placement of fellows leads to long-term, systemic change rather than temporary solutions."}
            </p>
          </div>
        </div>
        <div className="p-4 h-96 w-full">
          <div className="w-full h-full">
            <img
              src="/images/team-group-photo.jpg"
              alt={dict?.about?.lessons_photo_alt || "GanzAfrica lessons"}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Section 6 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
        <div className="p-4 h-96 w-full">
          <div className="w-full h-full">
            <img
              src="/images/team-group-photo.jpg"
              alt={dict?.about?.team_members_alt || "GanzAfrica team members"}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        </div>
        <div className="p-4 bg-[#FFFDEB] rounded-lg h-96 w-full">
          <div className="flex flex-col h-full w-full">
            <div className="bg-primary-orange text-white w-10 h-10 flex items-center justify-center text-lg font-bold mb-2">
              06
            </div>
            <h2 className="text-primary-orange font-h4 mb-2">
              {dict?.about?.future_title || "Future Vision and Expansion"}
            </h2>
            <p className="text-dark font-regular-small text-sm">
              {dict?.about?.future_text ||
                "Looking ahead, we are excited about expanding the reach and impact of the GanzAfrica program. Our goal is to continue driving meaningful change, scale our operations, and build a growing network of technically skilled, innovative leaders who are passionate about transforming food systems and addressing other critical societal challenges. The journey has just begun, but we are already witnessing the positive impact of our work across the region. Together with our partners, fellows, and host institutions, we are committed to continued growth, shaping a sustainable future for Africa with innovation, efficiency, and excellence."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
