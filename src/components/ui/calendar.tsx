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
    <div className="w-[320px] flex flex-col bg-popover rounded-lg shadow-lg p-3">
      <div className="flex gap-2 mb-3 shrink-0">
        <Select value={month.getMonth().toString()} onValueChange={handleMonthChange}>
          <SelectTrigger className="flex-1 h-9 text-sm font-medium">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-[280px]">
            {months.map((monthName, index) => (
              <SelectItem key={index} value={index.toString()}>
                {monthName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={month.getFullYear().toString()} onValueChange={handleYearChange}>
          <SelectTrigger className="w-[100px] h-9 text-sm font-medium">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-[280px]">
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <DayPicker
          month={month}
          onMonthChange={setMonth}
          showOutsideDays={false}
          fixedWeeks
          className={cn("w-full flex flex-col", className)}
          classNames={{
            months: "flex flex-col",
            month: "flex flex-col space-y-3",
            caption: "hidden",
            caption_label: "hidden",
            nav: "hidden",
            nav_button: "hidden",
            nav_button_previous: "hidden",
            nav_button_next: "hidden",
            month_grid: "w-full border-collapse",
            weekdays: "flex w-full",
            weekday:
              "text-muted-foreground w-[40px] font-medium text-[0.7rem] text-center uppercase tracking-wide pb-2",
            week: "flex w-full mt-1",
            day_button: cn(
              buttonVariants({ variant: "ghost" }),
              "h-[40px] w-[40px] p-0 font-normal text-sm aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground transition-colors rounded-md"
            ),
            day: "h-[40px] w-[40px] p-0 relative",
            range_start:
              "aria-selected:bg-primary aria-selected:text-primary-foreground aria-selected:rounded-l-md",
            range_end:
              "aria-selected:bg-primary aria-selected:text-primary-foreground aria-selected:rounded-r-md",
            selected:
              "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-md font-medium",
            today: "bg-accent/50 text-accent-foreground font-semibold",
            outside:
              "text-muted-foreground/40 aria-selected:text-muted-foreground/40",
            disabled: "text-muted-foreground/20 opacity-50 cursor-not-allowed",
            range_middle:
              "aria-selected:bg-accent aria-selected:text-accent-foreground aria-selected:rounded-none",
            hidden: "invisible",
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
