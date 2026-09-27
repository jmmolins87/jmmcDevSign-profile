/* SPEC 07 — Paso 3: Panel "Citas de hoy" con 4 items. */

"use client";

import { MOCK_APPOINTMENTS, type Appointment } from "@/lib/data/software";
import { useDict } from "@/lib/i18n/I18nProvider";

export default function Appointments() {
  const { appointments } = useDict().sections.demosSoftware;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between mb-5">
        <span className="font-label-caps text-[11px] px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface font-medium">
          {appointments.todayCount}
        </span>
      </div>
      {MOCK_APPOINTMENTS.map((appt: Appointment) => (
        <div
          key={appt.time}
          className="p-3 bg-surface-container-low rounded-xl flex items-start justify-between hover:bg-surface-container transition-colors"
          data-anim="stagger-in"
        >
          <div className="flex items-start gap-3">
            <span className="font-mono-code text-mono-code font-bold text-primary pt-0.5">
              {appt.time}
            </span>
            <div>
              <div className="font-body-md text-[14px] font-medium text-on-surface leading-snug">
                {appt.title}
              </div>
              <div className="font-body-sm text-[12px] text-on-surface-variant">
                {appt.client}
              </div>
            </div>
          </div>
          {appt.type === "meet" ? (
            <a className="text-on-surface-variant hover:text-primary transition-colors p-1" href="#" title={appointments.meetTitle}>
              <span className="material-symbols-outlined text-[18px]">videocam</span>
            </a>
          ) : (
            <span className="font-label-caps text-[10px] text-secondary font-medium self-center bg-surface px-2 py-0.5 rounded">
              {appointments.inPerson}
            </span>
          )}
        </div>
      ))}
      <button className="mt-4 w-full py-2 bg-surface-container-high hover:bg-surface-container-highest rounded-lg text-on-surface font-label-caps text-label-caps tracking-widest text-center transition-colors" type="button">
        {appointments.viewCalendar}
      </button>
    </div>
  );
}