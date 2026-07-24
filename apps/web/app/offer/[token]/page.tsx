import { OfferResponder } from "@/components/recruitment/OfferResponder";

export const metadata = {
  title: "Your Offer | GanzAfrica",
  robots: { index: false, follow: false },
};

export default function OfferPage({ params }: { params: { token: string } }) {
  return <OfferResponder token={params.token} />;
}
