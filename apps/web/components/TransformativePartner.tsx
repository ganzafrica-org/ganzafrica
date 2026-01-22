import Image from "next/image"
import { TranslatableText } from "@/components/translate/TranslatableText";

export const TransformativePartner = () => {
    return (
        <section className="relative py-16 md:py-24 overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-6xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8">
                            <div>
                                <h2 className="font-h4 md:font-h3 whitespace-normal font-black text-black">
                                    <TranslatableText>A transformative</TranslatableText> <span className="text-primary-green"><TranslatableText>Partner</TranslatableText></span>
                                </h2>
                            </div>
                            <div className="space-y-4 text-black">
                                <p className="text-lg">
                                    <TranslatableText>GanzAfrica runs a holistic program that combines training, mentorship, and work placements to prepare African youth for careers in transforming agriculture and land management.</TranslatableText>
                                </p>
                                <p>
                                    <TranslatableText>Its curriculum blends agriculture, environment, sustainable land use, and land rights, with a strong focus on data literacy and analytical skills so graduates can support evidence-based decisions in public and private institutions.</TranslatableText>
                                </p>
                                <p>
                                    <TranslatableText>Fellows join a community of mentors, gain real-world experience in government and non-government roles, and build professional networks that help them secure meaningful careers contributing to a healthy, prosperous future for Africa.</TranslatableText>
                                </p>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-4">
                                    <div className="aspect-square rounded-md overflow-hidden shadow-xl">
                                        <Image
                                            src="/images/GroupMico.jpeg"
                                            alt="Learning"
                                            width={100}
                                            height={100}
                                            className="w-full h-full object-cover rounded-md"
                                            unoptimized
                                        />
                                    </div>
                                    <div className="aspect-[4/3] rounded-md bg-primary-green/10 p-6 flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="text-4xl font-bold text-primary-green mb-2">15</div>
                                            <div className="text-sm font-medium"><TranslatableText>Fellows Trained</TranslatableText></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4 mt-8">
                                    <div className="aspect-[4/3] rounded-md bg-primary-orange/5 p-6 flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="text-4xl font-bold text-primary-green mb-2">25</div>
                                            <div className="text-sm font-medium"><TranslatableText>Alumni</TranslatableText></div>
                                        </div>
                                    </div>
                                    <div className="aspect-square rounded-md overflow-hidden shadow-xl">
                                        <Image
                                            src="/images/Presenting.jpg"
                                            alt="Students"
                                            width={100}
                                            height={100}
                                            className="w-full h-full object-cover rounded-md"
                                            unoptimized
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}