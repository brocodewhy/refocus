import { GoalsPlanner } from "@/components/goals-planner";
import { FadeIn } from "@/components/motion";
import { SectionHeading } from "@/components/section-heading";

export default function GoalsPage(){return <div><SectionHeading eyebrow="PLAN WITH INTENTION" title="Goals & study planner." subtitle="Make your next step clear. Start with a realistic goal, then adjust as you learn what works for you."/><FadeIn><GoalsPlanner/></FadeIn></div>}
