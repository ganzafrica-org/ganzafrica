'use client';

import { CircleCheck } from 'lucide-react';
import { TranslatableText } from "@/components/translate";
import { default as HeaderBelt } from "@/components/layout/headerBelt";
import Image from "next/image";

const policySections = [
    {
        title: "Personal Data Collection",
        color: "#f8b712",
        content: (
            <div className="space-y-4">
                <p>GanzAfrica may collect, store, and use the following kinds of personal information:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Information that you provide to us for the purpose of enquiring about our work, including fellowship applications and all communications submitted via our website;</li>
                    <li>Information that you provide for the purpose of applying for an employment role;</li>
                    <li>Any other information that you choose to send to us;</li>
                    <li>4. Your data, including information about your device, IP address, geographical location, browser type, and usage patterns (such as visit length, page views, and entry/exit points), is securely stored by GoDaddy, our trusted third-party hosting provider. This information is collected to improve our website, enhance user experience, and communications, and is protected using industry-standard security measures, including encryption and regular updates.</li>
                </ul>
            </div>
        )
    },
    {
        title: "Using Personal Data",
        color: "#073392",
        content: (
            <div className="space-y-4">
                <p>Personal information submitted to us via our website, directly via email or post, over the telephone, in person or by any other means will be used for the purposes specified in this privacy statement or in relevant parts of the website. We may process your personal data for the reasons detailed below:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Fellowship applicants:</strong> Personal information provided to us via our website or directly via email or post for the purpose of submitting an application to our fellowship program will be used as appropriate to complete a thorough assessment of your application. By providing us with your information, including personal data, signifying consent on the online application form you will be providing your explicit consent to the collection and retention of any information you provide on our database. We may approach referees you provide, who have interacted with you previously, and share information with them. We may use your data to send you email notifications related to a fellowship application and send you general non-marketing communications.</li>
                    <li><strong>General enquiries:</strong> If you have not communicated to us before and you contact us via our website, telephone, email or post to make an enquiry, the information that you provide will be held as necessary for our legitimate interests in dealing with your enquiry and analysis of enquiries received.</li>
                    <li><strong>Job applicants:</strong> Personal data submitted for the purpose of applying for an employment role at GanzAfrica will be retained for as long as we need to use it for the purpose of considering you for a vacancy. If we determine that we cannot offer you the role, we will retain your details on file for up to 6 months before securely destroying the data.</li>
                    <li><strong>Website users:</strong> Our website does not use cookies.</li>
                    <li><strong>Other:</strong> Any other personal information knowingly provided to us, including but not limited to the purpose of contracting with us, will only be used for the purpose for which it was given. The data will not be kept for longer than necessary and will be destroyed securely. Your personal information will not be shared with third parties unless it is required by law, for example, for the detection or prevention of crime.</li>
                </ul>
            </div>
        )
    },
    {
        title: "Justification",
        color: "#FFD700",
        content: (
            <div className="space-y-4">
                <p>This information is processed according to Article 6 of the General Data Protection Regulation (UK) for the following reasons:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>as necessary for the performance of tasks carried out in the public interest, in accordance with GanzAfrica’s charitable objectives as necessary in the pursuit of the legitimate interests of the organization, in this case, to acquire the information necessary to process fellowship applications</li>
                    <li>for compliance with legal obligations, in this case to provide full and accurate information to the Charity Commission concerning GanzAfrica trustees.</li>
                </ul>
            </div>
        )
    },
    {
        title: "Retention Period",
        color: "#00A15D",
        content: (
            <div className="space-y-4">
                <p>GanzAfrica reserves the right to hold data related to fellowship applications for archive purposes, to help inform future fellowship recruitment policy/processes, and to facilitate a high standard of due diligence which will enable the charity to continue to fulfil its charitable objects. GanzAfrica reserves the right to hold data related to unsuccessful job applications for no longer that 6 months, before all data is securely destroyed.</p>
            </div>
        )
    },
    {
        title: "Personal Data Security",
        color: "#f8b712",
        content: (
            <div className="space-y-4">
                <p>We will take reasonable technical and organisational precautions to prevent the loss, misuse or alteration of your personal information.</p>
                <p>GanzAfrica will store all the personal data you provide on its secure cloud-based services, including Google Workspace and Office 365, as well as an additional encrypted backup on a hard drive. Data submitted through our online application form is stored with our website hosting company, GoDaddy, which acts as a trusted third-party service provider. This information is protected using password management tools, data encryption, and two-factor authentication wherever possible.</p>
            </div>
        )
    },
    {
        title: "Disclosures",
        color: "#073392",
        content: (
            <div className="space-y-4">
                <p>We may disclose information about you to any of our employees, trustees, officers, agents, suppliers or subcontractors insofar as reasonably necessary for the purposes as set out in this privacy statement.</p>
                <p>In addition, we may disclose your personal information:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>To the extent that we are required to do so by law;</li>
                    <li>In connection with any legal proceedings or prospective legal proceedings;</li>
                    <li>To establish, exercise or defend our legal rights (including providing information to others for the purposes of fraud prevention and reducing credit risk); and</li>
                    <li>To any person who we reasonably believe may apply to a court or other competent authority for disclosure of that personal information where, in our reasonable opinion, such court or authority would be reasonably likely to order disclosure of that personal information.</li>
                </ul>
                <p>Except as provided in this privacy statement, we will not provide your information to third parties.</p>
            </div>
        )
    },
    {
        title: "Cross-Border Data Transfers",
        color: "#FFD700",
        content: (
            <div className="space-y-4">
                <p>Information that GanzAfrica collects may be stored and processed in and transferred between any of the countries in which the organization is operational, in accordance with this privacy statement. In addition, personal information that you submit for publication on the website will be published on the internet and may be available around the world.</p>
            </div>
        )
    },
    {
        title: "Your Rights",
        color: "#00A15D",
        content: (
            <div className="space-y-4">
                <p>You may instruct us to provide you with any personal information we hold about you. Provision of such information will be subject to the supply of appropriate evidence of your identity.</p>
                <p>In some circumstances you may also have the right to:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Request that we erase any personal data held about you;</li>
                    <li>Restrict our processing of your personal data (for example to ask to suspend the processing of personal information to establish its accuracy or the reasons for processing it); Data portability (i.e. to request the transfer of personal data to a third party); and Object to our processing of your personal data.</li>
                </ul>
                <p>Requests in respect of the above should be made in writing to GanzAfrica, 196 Grove Park, Cheshire WA16 8QE, or info@ganzafrica.org. Please contact us at the same address or email if you have any reason to believe that information we hold about you is inaccurate. We will aim to respond to your request within one month from the date of receiving the request. Please note that we may, where legally permitted, reject any such request or limit the scope of our response (for example if, in the circumstances, the right does not apply to you).</p>
                <p>You will not generally have to pay a fee to exercise any of your rights described above. However, we may charge a reasonable fee if you make a request to see a copy of your personal information which is clearly unfounded or excessive. Alternatively, we may refuse to comply with your request in such circumstances. We may also charge a reasonable fee if you request further copies of the data following a request. The fee will be based on the administrative costs of providing further copies.</p>
                <p>If you have concerns about how we use your data, you have the right to complain to the Information Commissioner’s Office.</p>
            </div>
        )
    },
    {
        title: "Privacy Statement Update",
        color: "#f8b712",
        content: (
            <div className="space-y-4">
                <p>We may update this privacy statement from time-to-time by posting a new version on our website. You should check this page occasionally to ensure you are happy with any changes.</p>
                <p>We may also notify you of changes to our privacy statement by email.</p>
            </div>
        )
    },
    {
        title: "Other Websites",
        color: "#073392",
        content: (
            <div className="space-y-4">
                <p>The website contains links to other websites that are not under the control of and are not maintained by GanzAfrica. We are not responsible for the content or reliability of the linked websites. GanzAfrica provides these links for your convenience only but does not endorse the material on these sites.</p>
            </div>
        )
    },
    {
        title: "Contact Us",
        color: "#FFD700",
        content: (
            <div className="space-y-4">
                <p>If you have any questions about this privacy statement or our treatment of your personal information, please write to us by email to info@ganzafrica.org or by post to 196 Grove Park, Cheshire WA16 8QE.</p>
                <div className="pt-4">
                    <p className="font-bold">GanzAfrica Foundation</p>
                    <p>Registration no.</p>
                    <p>64/RGB/FDN/LP/07/2024</p>
                </div>
                <div className="pt-2">
                    <p className="font-bold">GanzAfrica CIO</p>
                    <p>Registration no.</p>
                    <p>1210487</p>
                </div>
            </div>
        )
    }
];

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative w-full h-[400px] sm:h-[500px] overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/images/SHIR5142-Enhanced-NR.jpg"
                        alt="Agricultural fields"
                        fill
                        className="object-cover"
                        priority
                    />
                </div>
                <div className="absolute inset-0 bg-black opacity-70 z-0"></div>
                <div className="relative container mx-auto px-4 h-full flex flex-col justify-center items-center text-center z-20">
                    <h2 className="text-primary-orange text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-wider mt-6 mb-6">
                        <TranslatableText>PRIVACY POLICY</TranslatableText>
                    </h2>
                    <h1 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold mb-2 leading-tight">
                        <span className=" font-normal ">
                            <TranslatableText>Your privacy is important to us at GanzAfrica. Learn how we protect your data.</TranslatableText>
                        </span>
                    </h1>
                </div>
            </section>

            <HeaderBelt />

            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16">
                <div className="space-y-12">
                    {/* Introduction */}
                    <div className="space-y-6">
                        <div className="flex justify-between">
                            <h2 className="text-3xl md:text-4xl font-bold text-[#0F172A]">
                                <TranslatableText>Privacy Policy</TranslatableText>
                            </h2>
                            <p className="text-sm text-gray-100 uppercase tracking-wider font-semibold">
                                <TranslatableText>Last Updated: October 2024</TranslatableText>
                            </p>
                        </div>
                        <p className="text-gray-600 text-lg leading-relaxed">
                            <TranslatableText>
                                Your privacy is important to GanzAfrica. We are committed to safeguarding the privacy of our website visitors; this privacy statement sets out how we will treat your personal information.
                            </TranslatableText>
                        </p>
                    </div>

                    {/* Policy Sections */}
                    {policySections.map((item, index) => (
                        <div key={index} className="space-y-6">
                            <div className="flex flex-col">
                                <div className="flex items-start">
                                    <CircleCheck className="h-6 w-6 flex-shrink-0" style={{ color: item.color }} />
                                    <div
                                        className="h-[2px] flex-grow rounded-full mt-3"
                                        style={{ backgroundColor: item.color }}
                                    />
                                </div>
                                <h3 className="text-2xl md:text-3xl font-bold mt-4 text-[#0F172A]">
                                    <TranslatableText>{item.title}</TranslatableText>
                                </h3>
                            </div>
                            <div className="text-gray-600 text-lg leading-relaxed">
                                {item.content}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
