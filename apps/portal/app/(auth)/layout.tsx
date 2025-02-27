export default function AuthLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
            <header className="p-4 border-b bg-background">
                <div className="container mx-auto flex justify-center">
                    <h1 className="text-xl font-bold">GanzAfrica</h1>
                </div>
            </header>
            <main className="flex-1">
                {children}
            </main>
            <footer className="py-4 text-center text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} GanzAfrica. All rights reserved.
            </footer>
        </div>
    )
}