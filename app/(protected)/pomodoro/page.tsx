import { PomodoroTimer } from "@/components/pomodoro-timer";
import { SectionHeading } from "@/components/section-heading";
import { FadeIn } from "@/components/motion";
export default function PomodoroPage() {
  return <div><SectionHeading eyebrow="FOCUS IN CYCLES" title="Pomodoro studio." subtitle="Work in a focused interval, then take a real break. Adjust each interval to fit your needs."/><FadeIn className="mx-auto max-w-3xl"><PomodoroTimer/></FadeIn></div>;
}
