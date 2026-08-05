export const schedule = {
  updated: "2026-06-30",

  groupClasses: [
    {
      days: ["Monday", "Tuesday", "Wednesday", "Friday"],
      start: "5:00 PM",
      end: "6:00 PM",
      audience: "Youth + Teen",
      ages: "5–17",
      format: "Gi"
    },
    {
      days: ["Monday", "Tuesday", "Wednesday", "Friday"],
      start: "6:00 PM",
      end: "7:00 PM",
      audience: "Adult",
      ages: "18+",
      format: "Gi"
    },
    {
      days: ["Saturday"],
      start: "10:30 AM",
      end: "11:30 AM",
      audience: "Adult No-Gi",
      format: "No-Gi",
      note: "Youth and teens require Sandy's approval."
    }
  ],

  privateCoaching: [
    { day: "Tuesday", start: "6:30 AM", end: "7:30 AM" },
    { day: "Wednesday", start: "10:30 AM", end: "11:30 AM", label: "mid-morning" },
    { day: "Friday", start: "10:30 AM", end: "11:30 AM", label: "mid-morning" }
  ]
};
