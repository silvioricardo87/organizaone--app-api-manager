import { ComponentProps, useState, useEffect } from "react"
import { DayPicker } from "react-day-picker"
import ChevronLeft from "lucide-react/dist/esm/icons/chevron-left"
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSettings } from "@/hooks/use-settings"

export type CalendarProps = ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const { t } = useSettings()
  const currentYear = new Date().getFullYear()
  const [month, setMonth] = useState<Date>(() => {
    const propsWithMode = props as any
    if (propsWithMode.selected && propsWithMode.selected instanceof Date) {
      return propsWithMode.selected
    }
    return new Date()
  })

  useEffect(() => {
    const propsWithMode = props as any
    if (propsWithMode.selected && propsWithMode.selected instanceof Date) {
      setMonth(propsWithMode.selected)
    }
  }, [(props as any).selected])

  const handleMonthChange = (value: string) => {
    const newDate = new Date(month)
    newDate.setMonth(parseInt(value))
    setMonth(newDate)
  }

  const handleYearChange = (value: string) => {
    const newDate = new Date(month)
    newDate.setFullYear(parseInt(value))
    setMonth(newDate)
  }

  const years = Array.from({ length: 101 }, (_, i) => currentYear - 50 + i)
  const months = t.dates.months

  return (
    <div className="w-[336px] h-[420px] flex flex-col bg-popover">
      <div className="flex gap-2 px-4 pt-4 pb-3 border-b border-border">
        <Select value={month.getMonth().toString()} onValueChange={handleMonthChange}>
          <SelectTrigger className="flex-1 h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {months.map((monthName, index) => (
              <SelectItem key={index} value={index.toString()}>
                {monthName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={month.getFullYear().toString()} onValueChange={handleYearChange}>
          <SelectTrigger className="w-[110px] h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex-1 overflow-hidden flex items-start">
        <DayPicker
          month={month}
          onMonthChange={setMonth}
          showOutsideDays={showOutsideDays}
          className={cn("p-4 w-full", className)}
          classNames={{
            months: "flex flex-col w-full",
            month: "flex flex-col gap-3 w-full",
            caption: "hidden",
            caption_label: "hidden",
            nav: "hidden",
            nav_button: "hidden",
            nav_button_previous: "hidden",
            nav_button_next: "hidden",
            table: "w-full border-collapse border-spacing-0",
            head_row: "flex w-full mb-1",
            head_cell:
              "text-muted-foreground rounded-md w-10 font-medium text-xs uppercase",
            row: "flex w-full mt-1",
            cell: cn(
              "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
              props.mode === "range"
                ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
                : ""
            ),
            day: cn(
              buttonVariants({ variant: "ghost" }),
              "size-10 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground transition-colors"
            ),
            day_range_start:
              "day-range-start aria-selected:bg-primary aria-selected:text-primary-foreground aria-selected:rounded-l-md",
            day_range_end:
              "day-range-end aria-selected:bg-primary aria-selected:text-primary-foreground aria-selected:rounded-r-md",
            day_selected:
              "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-md",
            day_today: "bg-accent text-accent-foreground font-semibold",
            day_outside:
              "day-outside text-muted-foreground/50 aria-selected:text-muted-foreground/50",
            day_disabled: "text-muted-foreground/30 opacity-50",
            day_range_middle:
              "aria-selected:bg-accent aria-selected:text-accent-foreground aria-selected:rounded-none",
            day_hidden: "invisible",
            ...classNames,
          }}
          components={{
            PreviousMonthButton: ({ className, ...props }) => (
              <ChevronLeft className={cn("size-4", className)} {...props} />
            ),
            NextMonthButton: ({ className, ...props }) => (
              <ChevronRight className={cn("size-4", className)} {...props} />
            ),
          }}
          {...props}
        />
      </div>
    </div>
  )
}

export { Calendar }
