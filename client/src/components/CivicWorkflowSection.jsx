import { FileText, Search, User, Settings, CheckCircle2, ArrowRight } from "lucide-react";

export const WORKFLOW_STEPS = [
  {
    step: "01",
    title: "Report",
    desc: "Submit an issue with photos and location.",
    icon: FileText
  },
  {
    step: "02",
    title: "Verification",
    desc: "We verify the issue details and authenticity.",
    icon: Search
  },
  {
    step: "03",
    title: "Assign",
    desc: "Relevant department is notified.",
    icon: User
  },
  {
    step: "04",
    title: "Action",
    desc: "Work is tracked in real-time.",
    icon: Settings
  },
  {
    step: "05",
    title: "Resolved",
    desc: "You get notified once it's fixed.",
    icon: CheckCircle2
  }
];

export default function CivicWorkflowSection() {
  return (
    <section id="how-it-works" className="scroll-mt-24 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      
      {/* Section Header */}
      <div className="text-left">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1 text-[11px] font-bold text-[#00A881]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#00A881]" />
          <span>PROCESS</span>
        </div>
        <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#07111F]">
          How CivicConnect Works
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-[#64748B]">
          From a simple report to a cleaner, safer city — in just a few steps.
        </p>
      </div>

      {/* 5 Connected Step Cards */}
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 relative">
        {WORKFLOW_STEPS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={item.step} className="relative flex items-center">
              
              {/* Step Card */}
              <div className="w-full flex flex-col items-start rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-xs hover:border-[#00A881]/50 hover:shadow-md transition-all group">
                
                {/* Number Badge Pill */}
                <span className="inline-flex items-center justify-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-mono font-bold text-[#00A881] border border-emerald-100">
                  {item.step}
                </span>

                {/* Center Icon */}
                <div className="mt-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-[#00A881] group-hover:scale-105 group-hover:bg-emerald-50 transition-all">
                  <Icon size={22} strokeWidth={2} />
                </div>

                {/* Title & Desc */}
                <h3 className="mt-4 text-base font-bold text-[#07111F]">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-xs text-[#64748B] leading-relaxed">
                  {item.desc}
                </p>
              </div>

              {/* Connecting Arrow between cards (hidden on last card and on mobile) */}
              {idx < WORKFLOW_STEPS.length - 1 && (
                <div className="hidden lg:flex absolute -right-3 z-10 h-6 w-6 items-center justify-center rounded-full bg-white border border-[#E2E8F0] text-[#94A3B8] shadow-xs pointer-events-none">
                  <ArrowRight size={12} strokeWidth={2.5} />
                </div>
              )}

            </div>
          );
        })}
      </div>

    </section>
  );
}
