import { Button } from "@workspace/ui/components/button"

export default function Page() {
    return (
        <div className="flex items-center justify-center min-h-svh">
            <div className="flex flex-col items-center justify-center gap-4">
                <h1 className="text-2xl font-bold">GanzAfrica Portal</h1>
                <Button size="sm" variant="outline">Admin Portal</Button>
            </div>
        </div>
    )
}