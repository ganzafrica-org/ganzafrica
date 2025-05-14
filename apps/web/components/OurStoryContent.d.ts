import React from "react";
import { getDictionary } from "@/lib/get-dictionary";
type Props = {
    dict: Awaited<ReturnType<typeof getDictionary>>;
    isFrench: boolean;
};
export default function OurStoryContent({ dict, isFrench }: Props): React.JSX.Element;
export {};
//# sourceMappingURL=OurStoryContent.d.ts.map