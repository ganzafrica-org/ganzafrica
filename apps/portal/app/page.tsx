"use client"

import * as React from "react"

import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"
import { Calendar } from "@workspace/ui/components/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@workspace/ui/components/popover"

export default function Page() {
    const [date, setDate] = React.useState<Date | undefined>(new Date())
    return (
        <div className="flex items-center justify-center min-h-svh">
            <div className="flex flex-col items-center justify-center gap-4">
                <h1 className="text-2xl font-bold">GanzAfrica Portal</h1>
                <Button size="sm" variant="outline">Admin Portal</Button>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "w-[240px] justify-start text-left font-normal",
                                !date && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon />
                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    )
}