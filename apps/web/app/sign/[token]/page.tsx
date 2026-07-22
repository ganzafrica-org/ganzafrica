import { SignDocument } from "@/components/signing/SignDocument";

export const metadata = {
  title: "Sign Document | GanzAfrica",
  robots: { index: false, follow: false },
};

export default function SignPage({ params }: { params: { token: string } }) {
  return <SignDocument token={params.token} />;
}
