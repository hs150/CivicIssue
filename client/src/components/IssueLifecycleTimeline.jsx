import { useState } from "react";
import { Check, MapPin } from "lucide-react";
import potholeAfterImg from "../assets/pothole_repaired_after.jpg";

export default function IssueLifecycleTimeline() {
  const steps = [
    {
      id: "submitted",
      title: "Submitted",
      timestamp: "18 Sep 2024, 07:24 PM",
      desc: "Issue reported by citizen"
    },
    {
      id: "verified",
      title: "Verified",
      timestamp: "18 Sep 2024, 07:26 PM",
      desc: "Image and location verified"
    },
    {
      id: "assigned",
      title: "Assigned",
      timestamp: "19 Sep 2024, 10:12 AM",
      desc: "Assigned to Municipal Corporation"
    },
    {
      id: "inprogress",
      title: "In Progress",
      timestamp: "19 Sep 2024, 02:30 PM",
      desc: "Work in progress"
    },
    {
      id: "resolved",
      title: "Resolved",
      timestamp: "20 Sep 2024, 11:15 AM",
      desc: "Issue marked as resolved"
    }
  ];

  const details = [
    { label: "Category", value: "Roads" },
    { label: "Priority", value: "High" },
    { label: "Department", value: "Municipal Corporation" },
    { label: "Assigned To", value: "Road Maintenance Team" },
    { label: "Reported On", value: "18 Sep 2024, 07:24 PM" },
    { label: "Resolved On", value: "20 Sep 2024, 11:15 AM" }
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#07111F]">
            Track an Issue
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[#64748B]">
            Follow the complete lifecycle of a civic issue.
          </p>
        </div>

        {/* Issue Selector Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-white px-3.5 py-1.5 text-xs font-mono shadow-2xs">
          <span className="font-semibold text-[#07111F]">Issue #CC-45821</span>
          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-[#00A881] border border-emerald-200">
            Resolved
          </span>
        </div>
      </div>

      {/* Two Column Grid: Left = Timeline, Right = Issue Details Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* LEFT COLUMN: Vertical Timeline (7 Cols) */}
        <div className="lg:col-span-7 space-y-6 pt-2">
          <div className="relative pl-6 space-y-7 before:absolute before:left-2.5 before:top-2 before:bottom-3 before:w-0.5 before:bg-[#00A881]">
            {steps.map((step) => (
              <div key={step.id} className="relative flex items-start gap-4">
                
                {/* Green Circle Checkmark */}
                <div className="relative z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#00A881] text-white shadow-xs">
                  <Check size={11} strokeWidth={3.5} />
                </div>

                {/* Step Content */}
                <div className="flex-1 -mt-0.5">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <h4 className="text-sm font-bold text-[#07111F]">
                      {step.title}
                    </h4>
                    <span className="text-xs text-[#94A3B8] font-medium">
                      {step.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Issue Card with Image & Details Table (5 Cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-[#E2E8F0] bg-white overflow-hidden shadow-sm">
          
          {/* Resolved Photo with "After" Pill */}
          <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-100">
            <img
              src={potholeAfterImg}
              alt="Repaired Pothole on Main Road"
              className="h-full w-full object-cover"
            />
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-[#00A881] border border-emerald-200 backdrop-blur-md">
                <Check size={10} strokeWidth={3} />
                <span>After</span>
              </span>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-5">
            <h3 className="text-base font-bold text-[#07111F]">
              Pothole on Main Road
            </h3>
            
            <p className="mt-1 text-xs text-[#64748B] flex items-center gap-1">
              <MapPin size={12} className="text-[#94A3B8]" />
              <span>Lanka, Varanasi</span>
            </p>

            {/* Key-Value Details Table (Matches Screenshot) */}
            <div className="mt-4 divide-y divide-[#F1F5F9] border-t border-[#F1F5F9] text-xs">
              {details.map((row) => (
                <div key={row.label} className="py-2 flex items-center justify-between">
                  <span className="text-[#94A3B8]">{row.label}</span>
                  <span className="font-semibold text-[#07111F]">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </section>
  );
}
