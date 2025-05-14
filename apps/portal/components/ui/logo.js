import { cn } from "@workspace/ui/lib/utils";
import Image from "next/image";
export function Logo({ className }) {
    return (<div className={cn("text-primary font-bold text-3xl", className)}>
      <Image src="/logo.png" alt="Logo" width={500} height={500}/>
    </div>);
}
