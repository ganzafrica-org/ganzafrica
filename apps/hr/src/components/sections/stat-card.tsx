import { LucideIcon, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface StatCardProps {
    title: string;
    value: string | number;
    trendText: string;
    icon: LucideIcon;
    className?: string;
}

export const StatCard = ({
    title,
    value,
    trendText,
    icon: Icon,
    className
}: StatCardProps) => {
    // Check if the className contains "from-" to determine if it's a gradient
    const isGradient = className?.includes('from-');
    
    return (
        <Card className={`${isGradient ? `bg-gradient-to-br ${className} text-white` : `bg-white text-gray-900 border shadow-sm`} border-0 shadow-lg hover:shadow-xl transition-all duration-300 flex-1 min-w-[240px]`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={`text-sm font-medium ${isGradient ? 'text-white/80' : 'text-gray-500'}`}>
                    {title}
                </CardTitle>
                <Icon className={`h-5 w-5 ${isGradient ? 'text-white/80' : 'text-green-500'}`} />
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold"> {value} </div>
                <p className={`text-xs flex items-center gap-1 mt-1 ${isGradient ? 'text-white/70' : 'text-gray-400'}`}>
                    <TrendingUp className="h-3 w-3" />
                    {trendText}
                </p>
            </CardContent>
        </Card>
    );
};