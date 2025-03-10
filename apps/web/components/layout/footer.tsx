import Link from 'next/link';

export default function Footer({ locale, dict }: { locale: string; dict: any }) {
    return (
        <footer className="bg-muted py-10">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* About */}
                    <div>
                        <h3 className="font-medium text-lg mb-3">{dict.footer.about}</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href={`/${locale}/about`}
                                    className="text-muted-foreground hover:text-primary transition-colors"
                                    prefetch={true}
                                >
                                    {dict.about.who_we_are}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={`/${locale}/about/policies`}
                                    className="text-muted-foreground hover:text-primary transition-colors"
                                    prefetch={true}
                                >
                                    {dict.footer.policies}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={`/${locale}/faqs`}
                                    className="text-muted-foreground hover:text-primary transition-colors"
                                    prefetch={true}
                                >
                                    {dict.footer.faqs}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={`/${locale}/contact`}
                                    className="text-muted-foreground hover:text-primary transition-colors"
                                    prefetch={true}
                                >
                                    {dict.footer.contact}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Programs */}
                    <div>
                        <h3 className="font-medium text-lg mb-3">{dict.footer.programs}</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href={`/${locale}/programs/fellowship`}
                                    className="text-muted-foreground hover:text-primary transition-colors"
                                    prefetch={true}
                                >
                                    {dict.programs.fellowship.title}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={`/${locale}/programs/alumni`}
                                    className="text-muted-foreground hover:text-primary transition-colors"
                                    prefetch={true}
                                >
                                    {dict.programs.alumni.title}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={`/${locale}/programs/policy-support`}
                                    className="text-muted-foreground hover:text-primary transition-colors"
                                    prefetch={true}
                                >
                                    {dict.programs.policy_support.title}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* What We Do */}
                    <div>
                        <h3 className="font-medium text-lg mb-3">{dict.footer.what_we_do}</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href={`/${locale}/what-we-do/food-systems`}
                                    className="text-muted-foreground hover:text-primary transition-colors"
                                    prefetch={true}
                                >
                                    {dict.what_we_do.food_systems}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={`/${locale}/what-we-do/climate-change-adaptation`}
                                    className="text-muted-foreground hover:text-primary transition-colors"
                                    prefetch={true}
                                >
                                    {dict.what_we_do.climate_change_adaptation}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Explore */}
                    <div>
                        <h3 className="font-medium text-lg mb-3">{dict.footer.explore}</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="/login"
                                    className="text-muted-foreground hover:text-primary transition-colors"
                                >
                                    {dict.footer.login}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={`/${locale}/opportunities`}
                                    className="text-muted-foreground hover:text-primary transition-colors"
                                    prefetch={true}
                                >
                                    {dict.footer.opportunities}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={`/${locale}/research`}
                                    className="text-muted-foreground hover:text-primary transition-colors"
                                    prefetch={true}
                                >
                                    {dict.footer.research}
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-6 border-t border-border">
                    <p className="text-center text-sm text-muted-foreground">
                        {dict.footer.copyright}
                    </p>
                </div>
            </div>
        </footer>
    );
}