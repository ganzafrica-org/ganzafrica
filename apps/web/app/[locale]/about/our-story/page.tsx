import { getDictionary } from "@/lib/get-dictionary";
import OurStoryContent from "@/components/OurStoryContent";

type Params = { locale: string };

export default async function OurStoryPage(
	{ params }: { params: Params }
): Promise<JSX.Element> {
	const { locale } = params;
	const dict = await getDictionary(locale);
	const isFrench = locale === "fr";

	return <OurStoryContent dict={dict} isFrench={isFrench} />;
}
