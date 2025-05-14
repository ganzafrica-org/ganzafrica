import { getDictionary } from "@/lib/get-dictionary";
import OurStoryContent from "@/components/OurStoryContent";
export default async function OurStoryPage({ params }) {
    const { locale } = await params;
    const dict = await getDictionary(locale);
    const isFrench = locale === "fr";
    return <OurStoryContent dict={dict} isFrench={isFrench}/>;
}
