"use client";

import Image from "next/image";
const SafeImage = Image as unknown as React.ComponentType<any>;
import SectionWithScrollAnimation from "@/components/layout/SectionWithScroll";
import React, { useState, useRef } from "react";
import HeaderBelt from "@/components/layout/headerBelt";
import {
    PersonIcon,
    AudioMutedIcon,
    AudioUnmutedIcon,
    FullscreenIcon
} from "@/components/ui/icons";
import { trackVideoEvent, trackEvent } from "@/components/analytics/google-analytics";
import VideoPlayer from "@/components/VideoPlayer";
import { TranslatableText } from "@/components/translate/TranslatableText";


    export default function OurStoryContent({ }) {
    const contentClass = "flex-1 overflow-y-auto pr-2";
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isMuted, setIsMuted] = useState(true);

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !videoRef.current.muted;
            setIsMuted(!isMuted);

            // Track mute/unmute action
            trackEvent('video_mute_toggle', {
                video_title: 'Our Story - Fellow Success Video',
                action: isMuted ? 'unmute' : 'mute',
                page: 'our_story'
            });
        }
    };

    const toggleFullScreen = () => {
        if (videoRef.current) {
            if (document.fullscreenElement) {
                document.exitFullscreen();
                trackEvent('video_fullscreen_toggle', {
                    video_title: 'Our Story - Fellow Success Video',
                    action: 'exit_fullscreen',
                    page: 'our_story'
                });
            } else {
                videoRef.current.requestFullscreen();
                trackEvent('video_fullscreen_toggle', {
                    video_title: 'Our Story - Fellow Success Video',
                    action: 'enter_fullscreen',
                    page: 'our_story'
                });
            }
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative w-full h-[400px] sm:h-[500px] overflow-hidden">
                {/* Background Image - Modified positioning to center on faces */}
                <div className="absolute inset-0 z-0">
                    <SafeImage
                        src="/images/SHIR5142-Enhanced-NR.jpg"
                        alt="Agricultural fields"
                        fill
                        className="object-cover object-center"
                        style={{ objectPosition: "center 30%" }}
                        priority
                        fetchPriority="high"
                    />
                </div>

                {/* Dark overlay - Reduced opacity for better visibility */}
                <div className="absolute inset-0 bg-black opacity-60 z-0"></div>

                {/* Content */}

                <div className="relative container mx-auto px-4 h-full flex flex-col justify-center items-center text-center z-20">
                    <h2 className="text-primary-orange text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-wider mt-6 mb-6">
                        <TranslatableText>OUR STORY</TranslatableText>
                    </h2>
                    <h1 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold mb-2 leading-tight">
                        <span className=" font-normal "><TranslatableText>Building  Sustainable</TranslatableText></span>{" "}
                        <span className="font-normal"><TranslatableText>Solutions With</TranslatableText></span>
                        <br />
                        <span className=" font-normal"><TranslatableText>African Communities!</TranslatableText></span>
                    </h1>
                </div>

            </section>
            <HeaderBelt />

            <div className="pt-12 px-4 md:px-12 lg:px-20 xl:px-4 max-w-7xl mx-auto">
                {/* Section01 */}
                <SectionWithScrollAnimation
                    number="01"
                    title="Origin and Inspiration (Before 2022)"
                    text="Nearly three years ago, I established GanzAfrica with a clear mission: to build local human capital to champion the use of data and evidence to support public services and development agencies in decision-making, as they deliver essential programs to enhance people's standard of living, health, climate and environment, all critical food systems sectors. This initiative stemmed from many years of learning and experience gained working closely with public institutions and policy implementing partners. Over time, I noticed significant gaps in local capacity, efficiency and innovation potential, which resulted in slow progress and below-par developmental outcomes—especially within food systems sectors. Although GanzAfrica was officially founded in 2022, its roots go back much further. The ideas germinated from years of observing how well-meaning policies often fell short in implementation, primarily due to a lack of capacity. This has hampered progress across many African countries, where even good solutions have also been ineffective due to their application without contextual consideration."
                    imageUrl="/images/thiery.png"
                    imageAlt="GanzAfrica lessons"
                    bgColor="bg-[#F9F9FB]"
                    accentColor="bg-primary-green"
                    textColor="text-primary-green"
                    imageFirst={false}
                    contentClass={contentClass}
                />

                {/* Section 2: The Vision and Approach - Yellow background */}
                <SectionWithScrollAnimation
                    number="02"
                    title="The Vision and Approach"
                    text="I realized that bridging these gaps would require a unique approach, one that involved equipping young, talented graduates with the tools to support impactful initiatives. These professionals would need to be embedded within very institutions that needed transformation. The GanzAfrica program embodies this vision. It identifies promising young professionals with the right attitudes and equips them with the skills to support mandated institutions, make evidence-based decisions, adopt systems thinking, and drive sustainable change. Fellows are strategically placed as change agents in partner public institutions, where they gain invaluable real-world experience while contributing fresh ideas. The interplay between personal skills, theoretical training and practical application is at the heart of what makes GanzAfrica unique and impactful."
                    imageUrl="/images/SHIR5183-Enhanced-NR.jpg"
                    imageAlt="GanzAfrica team"
                    bgColor="bg-[#FFFDEB]"
                    accentColor="bg-primary-orange"
                    textColor="text-primary-orange"
                    imageFirst={true}
                    contentClass={contentClass}
                />

                {/* Section 3 */}
                <SectionWithScrollAnimation
                    number="03"
                    title="Progress and Impact (2022-2024)"
                    text="In just over two years since our first cohort of fellows joined public institutions, we have witnessed tangible results. Not only have our fellows brought fresh perspectives and innovative approaches to their roles, but they also facilitated operational efficiencies that are supporting institutional decision-makers to yield better outcomes within these institutions. Their contributions range from analyzing data sets, providing policy insights, and fostering a culture of accountability. Importantly, their work is starting to have a lasting impact on how institutions in the broader East African food systems, ensuring they are more sustainable, inclusive, and responsive to the needs of the population. Yet all this could not be achieved without the collaborative efforts of dedicated partners in these institutions, whose support has played a crucial role in making GA a reality. Their commitment and belief in our mission have been instrumental in driving the success of GanzAfrica."
                    imageUrl="/images/_BAB8914.jpg"
                    imageAlt="GanzAfrica lessons"
                    bgColor="bg-[#F9F9FB]"
                    accentColor="bg-primary-green"
                    textColor="text-primary-green"
                    imageFirst={false}
                    contentClass={contentClass}
                />

                {/* Section 4 - Fellow Success Stories */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10 overflow-hidden">
                    {/* Video - First on mobile and desktop */}
                    <div className="h-full w-full order-1 relative">
                        <VideoPlayer src="/videos/lysa.mp4" />
                    </div>

                    {/* Text content - Second on mobile and desktop */}
                    <div className="p-6 md:p-10 bg-[#FFFDEB] min-h-full lg:h-[510px] w-full rounded-sm order-2">
                        <div className="flex flex-col h-full w-full">
                            <div className="bg-primary-orange text-white w-16 h-16 flex items-center justify-center text-2xl rounded-md font-bold mb-2">
                                04
                            </div>
                            <h2 className="text-primary-orange sm:font-h5 md:font-h4 mb-2">
                                <TranslatableText>Fellow Success Stories</TranslatableText>
                            </h2>
                            <div className={contentClass}>
                                <p className="text-black font-regular-small text-sm text-justify">
                                    <TranslatableText>We are equally proud of the individual journeys of our fellows. Many have leveraged their experience with GanzAfrica to secure meaningful and impactful roles within the public sector and beyond. Reinforcing our core belief in the power of investing in young professionals and equipping them with the skills to lead. At GanzAfrica, we see our fellows not just as participants in a program but as changemakers who will continue to drive transformation long after their time with us.</TranslatableText>
                                </p>

                                {/* Added Person Icon */}
                                <div className="mt-4 flex items-center justify-center">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 5*/}
                <SectionWithScrollAnimation
                    number="05"
                    title="Lessons Learned and Adaptation"
                    text="As we reflect on our first two years of implementation, we remain steadfast in our commitment to continuous learning and adaptation. Each challenge and lesson shapes our strategy for the future. For instance, we have learned the importance of tailoring our training to address the specific needs of the institutions we partner with. We have also seen the value of fostering strong relationships with these organizations to ensure that the placement of fellows leads to long-term, systemic change rather than temporary solutions."
                    imageUrl="/images/Fellows3.jpeg"
                    imageAlt="GanzAfrica lessons"
                    bgColor="bg-[#F9F9FB]"
                    accentColor="bg-primary-green"
                    textColor="text-primary-green"
                    imageFirst={false}
                    contentClass={contentClass}
                />

                {/* Section 6 */}
                <SectionWithScrollAnimation
                    number="06"
                    title="Future Vision and Expansion"
                    text="Looking ahead, we are excited about expanding the reach and impact of the GanzAfrica program. Our goal is to continue driving meaningful change, scale our operations, and build a growing network of technically skilled, innovative leaders who are passionate about transforming food systems and addressing other critical societal challenges. The journey has just begun, but we are already witnessing the positive impact of our work across the region. Together with our partners, fellows, and host institutions, we are committed to continued growth, shaping a sustainable future for Africa with innovation, efficiency, and excellence."
                    imageUrl="/images/_BAB8908.jpg"
                    imageAlt="GanzAfrica team members"
                    bgColor="bg-[#FFFDEB]"
                    accentColor="bg-primary-orange"
                    textColor="text-primary-orange"
                    imageFirst={true}
                    contentClass={contentClass}
                />
            </div>
        </div>
    );
}