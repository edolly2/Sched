import React, { useState } from "react";
import "./Scheduler.css";

// --------------------------------------------------
// TIME FUNCTIONS
// --------------------------------------------------

// Convert H.MM style into minutes:
// 6      -> 6h 0m
// 6.15   -> 6h 15m
// 4.45   -> 4h 45m
// 4.5    -> 4h 30m  (half hour)
// 2.5    -> 2h 30m  (half hour)
function hmToMinutes(num) {
  const [hStr, mStr] = num.toString().split(".");
  const h = parseInt(hStr, 10) || 0;

  if (!mStr) return h * 60;

  let minutes;

  if (mStr.length === 1) {
    // Single digit means decimal (.5 = 30 min)
    const frac = parseFloat(`0.${mStr}`);
    minutes = Math.round(frac * 60);
  } else {
    // Two digits are literal minutes (.15 = 15 min, .45 = 45 min)
    minutes = parseInt(mStr, 10) || 0;
  }

  return h * 60 + minutes;
}

// Format minutes into human-readable text
function formatMinutesForDisplay(totalMinutes) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;

  if (m === 0) return `${h} hrs`;
  return `${h} hrs ${m} min`;
}

// --------------------------------------------------
// COLOR LOGIC (BASED ONLY ON CURRENT HOURS)
// --------------------------------------------------
//
// RED if current < max - 10h
// YELLOW if between 10h and 5h below max
// GREEN if within 5h below max up to 5h over max
// RED + !! if current > max + 5h
//
function getPersonColor(person) {
  const current = person.hours; // minutes
  const max = person.maxHours * 60; // minutes

  // More than 5 hours over max = RED + ALERT
  if (current > max + 300) return "red-person alert";

  // More than 10 hours below max = RED
  if (current < max - 600) return "red-person";

  // Between 10 hours and 5 hours below max = YELLOW
  if (current >= max - 600 && current < max - 300) return "yellow-person";

  // Within 5 hours below max up to 5 hours over max = GREEN
  return "green-person";
}

// --------------------------------------------------
// CONFIG
// --------------------------------------------------

const shifts = [
  // --------------------------------------------------
  // Overnight
  // --------------------------------------------------

  // Ankeny
  { id: "ank-sun-1", day: "Sun", label: "Overnight Run", hours: 6 },
  { id: "ank-mon-1", day: "Mon", label: "Overnight Run", hours: 6 },
  { id: "ank-tue-1", day: "Tue", label: "Overnight Run", hours: 6 },
  { id: "ank-wed-1", day: "Wed", label: "Overnight Run", hours: 6 },
  { id: "ank-thu-1", day: "Thu", label: "Overnight Run", hours: 6 },
  { id: "ank-fri-1", day: "Fri", label: "Overnight Run", hours: 6 },
  { id: "ank-sat-1", day: "Sat", label: "Overnight Run", hours: 6 },

  // SF
  { id: "sf-sun-1", day: "Sun", label: "Overnight Run", hours: 6 },
  { id: "sf-mon-1", day: "Mon", label: "Overnight Run", hours: 6 },
  { id: "sf-tue-1", day: "Tue", label: "Overnight Run", hours: 6 },
  { id: "sf-wed-1", day: "Wed", label: "Overnight Run", hours: 6 },
  { id: "sf-thu-1", day: "Thu", label: "Overnight Run", hours: 6 },
  { id: "sf-fri-1", day: "Fri", label: "Overnight Run", hours: 6 },
  { id: "sf-sat-1", day: "Sat", label: "Overnight Run", hours: 6 },

  // --------------------------------------------------
  // 1st Run
  // --------------------------------------------------

  // Bermuda 1
  { id: "ber-sun-1", day: "Sun", label: "1st Run", hours: 6.15 },
  { id: "ber-mon-1", day: "Mon", label: "1st Run", hours: 6.15 },
  { id: "ber-tue-1", day: "Tue", label: "1st Run", hours: 6.15 },
  { id: "ber-wed-1", day: "Wed", label: "1st Run", hours: 6.15 },
  { id: "ber-thu-1", day: "Thu", label: "1st Run", hours: 6.15 },
  { id: "ber-fri-1", day: "Fri", label: "1st Run", hours: 6.15 },
  { id: "ber-sat-1", day: "Sat", label: "1st Run", hours: 6.15 },

  // Lincoln 1
  { id: "lin-sun-1", day: "Sun", label: "1st Run", hours: 4.5 },
  { id: "lin-mon-1", day: "Mon", label: "1st Run", hours: 4.5 },
  { id: "lin-tue-1", day: "Tue", label: "1st Run", hours: 4.5 },
  { id: "lin-wed-1", day: "Wed", label: "1st Run", hours: 4.5 },
  { id: "lin-thu-1", day: "Thu", label: "1st Run", hours: 4.5 },
  { id: "lin-fri-1", day: "Fri", label: "1st Run", hours: 4.5 },
  { id: "lin-sat-1", day: "Sat", label: "1st Run", hours: 4.5 },

  // Fremont 1
  { id: "fre-sun-1", day: "Sun", label: "1st Run", hours: 4.45 },
  { id: "fre-mon-1", day: "Mon", label: "1st Run", hours: 4.45 },
  { id: "fre-tue-1", day: "Tue", label: "1st Run", hours: 4.45 },
  { id: "fre-wed-1", day: "Wed", label: "1st Run", hours: 4.45 },
  { id: "fre-thu-1", day: "Thu", label: "1st Run", hours: 4.45 },
  { id: "fre-fri-1", day: "Fri", label: "1st Run", hours: 4.45 },
  { id: "fre-sat-1", day: "Sat", label: "1st Run", hours: 4.45 },

  // ITE 1
  { id: "ite-sun-1", day: "Sun", label: "1st Run", hours: 2.5 },
  { id: "ite-mon-1", day: "Mon", label: "1st Run", hours: 2.5 },
  { id: "ite-tue-1", day: "Tue", label: "1st Run", hours: 2.5 },
  { id: "ite-wed-1", day: "Wed", label: "1st Run", hours: 2.5 },
  { id: "ite-thu-1", day: "Thu", label: "1st Run", hours: 2.5 },
  { id: "ite-fri-1", day: "Fri", label: "1st Run", hours: 2.5 },
  { id: "ite-sat-1", day: "Sat", label: "1st Run", hours: 2.5 },

  // --------------------------------------------------
  // 2nd Run
  // --------------------------------------------------

  // Bermuda 2
  { id: "ber-sun-2", day: "Sun", label: "2nd Run", hours: 6.15 },
  { id: "ber-mon-2", day: "Mon", label: "2nd Run", hours: 6.15 },
  { id: "ber-tue-2", day: "Tue", label: "2nd Run", hours: 6.15 },
  { id: "ber-wed-2", day: "Wed", label: "2nd Run", hours: 6.15 },
  { id: "ber-thu-2", day: "Thu", label: "2nd Run", hours: 6.15 },
  { id: "ber-fri-2", day: "Fri", label: "2nd Run", hours: 6.15 },
  { id: "ber-sat-2", day: "Sat", label: "2nd Run", hours: 6.15 },

  // Lincoln 2
  { id: "lin-sun-2", day: "Sun", label: "2nd Run", hours: 4.5 },
  { id: "lin-mon-2", day: "Mon", label: "2nd Run", hours: 4.5 },
  { id: "lin-tue-2", day: "Tue", label: "2nd Run", hours: 4.5 },
  { id: "lin-wed-2", day: "Wed", label: "2nd Run", hours: 4.5 },
  { id: "lin-thu-2", day: "Thu", label: "2nd Run", hours: 4.5 },
  { id: "lin-fri-2", day: "Fri", label: "2nd Run", hours: 4.5 },
  { id: "lin-sat-2", day: "Sat", label: "2nd Run", hours: 4.5 },

  // Fremont 2
  { id: "fre-sun-2", day: "Sun", label: "2nd Run", hours: 4.45 },
  { id: "fre-mon-2", day: "Mon", label: "2nd Run", hours: 4.45 },
  { id: "fre-tue-2", day: "Tue", label: "2nd Run", hours: 4.45 },
  { id: "fre-wed-2", day: "Wed", label: "2nd Run", hours: 4.45 },
  { id: "fre-thu-2", day: "Thu", label: "2nd Run", hours: 4.45 },
  { id: "fre-fri-2", day: "Fri", label: "2nd Run", hours: 4.45 },
  { id: "fre-sat-2", day: "Sat", label: "2nd Run", hours: 4.45 },

  // ITE 2
  { id: "ite-sun-2", day: "Sun", label: "2nd Run", hours: 2.5 },
  { id: "ite-mon-2", day: "Mon", label: "2nd Run", hours: 2.5 },
  { id: "ite-tue-2", day: "Tue", label: "2nd Run", hours: 2.5 },
  { id: "ite-wed-2", day: "Wed", label: "2nd Run", hours: 2.5 },
  { id: "ite-thu-2", day: "Thu", label: "2nd Run", hours: 2.5 },
  { id: "ite-fri-2", day: "Fri", label: "2nd Run", hours: 2.5 },
  { id: "ite-sat-2", day: "Sat", label: "2nd Run", hours: 2.5 },

  // --------------------------------------------------
  // 3rd Run
  // --------------------------------------------------

  // Lincoln 3
  { id: "lin-sun-3", day: "Sun", label: "3rd Run", hours: 4.5 },
  { id: "lin-mon-3", day: "Mon", label: "3rd Run", hours: 4.5 },
  { id: "lin-tue-3", day: "Tue", label: "3rd Run", hours: 4.5 },
  { id: "lin-wed-3", day: "Wed", label: "3rd Run", hours: 4.5 },
  { id: "lin-thu-3", day: "Thu", label: "3rd Run", hours: 4.5 },
  { id: "lin-fri-3", day: "Fri", label: "3rd Run", hours: 4.5 },
  { id: "lin-sat-3", day: "Sat", label: "3rd Run", hours: 4.5 },

  // Fremont 3
  { id: "fre-sun-3", day: "Sun", label: "3rd Run", hours: 4.45 },
  { id: "fre-mon-3", day: "Mon", label: "3rd Run", hours: 4.45 },
  { id: "fre-tue-3", day: "Tue", label: "3rd Run", hours: 4.45 },
  { id: "fre-wed-3", day: "Wed", label: "3rd Run", hours: 4.45 },
  { id: "fre-thu-3", day: "Thu", label: "3rd Run", hours: 4.45 },
  { id: "fre-fri-3", day: "Fri", label: "3rd Run", hours: 4.45 },
  { id: "fre-sat-3", day: "Sat", label: "3rd Run", hours: 4.45 },

  // ITE 3
  { id: "ite-sun-3", day: "Sun", label: "3rd Run", hours: 2.5 },
  { id: "ite-mon-3", day: "Mon", label: "3rd Run", hours: 2.5 },
  { id: "ite-tue-3", day: "Tue", label: "3rd Run", hours: 2.5 },
  { id: "ite-wed-3", day: "Wed", label: "3rd Run", hours: 2.5 },
  { id: "ite-thu-3", day: "Thu", label: "3rd Run", hours: 2.5 },
  { id: "ite-fri-3", day: "Fri", label: "3rd Run", hours: 2.5 },
  { id: "ite-sat-3", day: "Sat", label: "3rd Run", hours: 2.5 },
];

// PEOPLE - hours stored as MINUTES, with maxHours
const initialPeople = [
  { id: "p1", name: "Basim", hours: 0, maxHours: 24 },
  { id: "p2", name: "Chelsee", hours: 0, maxHours: 40 },
  { id: "p3", name: "Colin", hours: 0, maxHours: 40 },
  { id: "p4", name: "Edward", hours: 0, maxHours: 40 },
  { id: "p5", name: "Jeremy B", hours: 0, maxHours: 24 },
  { id: "p6", name: "Kid Diddler", hours: 0, maxHours: 24 },
  { id: "p7", name: "Lawrence", hours: 0, maxHours: 40 },
  { id: "p8", name: "Matt", hours: 0, maxHours: 40 },
  { id: "p9", name: "Michael L", hours: 0, maxHours: 40 },
  { id: "p10", name: "Nicholas", hours: 0, maxHours: 50 },
  { id: "p11", name: "Q", hours: 0, maxHours: 40 },
  { id: "p12", name: "Willis", hours: 0, maxHours: 30 },
];

// RULES
const rules = {
  p1: [
    "ank-sun-1",
    "ank-mon-1",
    "ank-tue-1",
    "ank-wed-1",
    "ank-thu-1",
    "ank-fri-1",
    "ank-sat-1",
    "sf-sun-1",
    "sf-mon-1",
    "sf-tue-1",
    "sf-wed-1",
    "sf-thu-1",
    "sf-fri-1",
    "sf-sat-1",
    "lin-sun-1",
    "lin-mon-1",
    "lin-tue-1",
    "lin-wed-1",
    "lin-thu-1",
    "lin-fri-1",
    "lin-sat-1",
    "fre-sun-1",
    "fre-mon-1",
    "fre-tue-1",
    "fre-wed-1",
    "fre-thu-1",
    "fre-fri-1",
    "fre-sat-1",
    "ber-sun-1",
    "ber-mon-1",
    "ber-tue-1",
    "ber-wed-1",
    "ber-thu-1",
    "ber-fri-1",
    "ber-sat-1",
    "ite-sun-1",
    "ite-mon-1",
    "ite-tue-1",
    "ite-wed-1",
    "ite-thu-1",
    "ite-fri-1",
    "ite-sat-1",
  ],
  p2: ["mon-1", "tue-1"],
};

const groupHeadings = ["Ankeny", "SF", "Bermuda", "Lincoln", "Fremont", "ITE"];

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    if (i === 7) {
      i = 0;
    }
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

// --------------------------------------------------
// COMPONENT
// --------------------------------------------------

export default function Scheduler() {
  const [people, setPeople] = useState(initialPeople);
  const [shiftAssignments, setShiftAssignments] = useState({});
  const [selectedPersonId, setSelectedPersonId] = useState(null);

  function handleSelectPerson(personId) {
    setSelectedPersonId((prev) => (prev === personId ? null : personId));
  }

  function handleSlotClick(slot) {
    const assignedPersonId = shiftAssignments[slot.id];
    const slotMinutes = hmToMinutes(slot.hours);

    // NO DRIVER SELECTED = tap slot to clear it (if occupied)
    if (!selectedPersonId) {
      if (!assignedPersonId) return;

      setShiftAssignments((prev) => {
        const updated = { ...prev };
        delete updated[slot.id];
        return updated;
      });

      setPeople((prev) =>
        prev.map((p) =>
          p.id === assignedPersonId ? { ...p, hours: p.hours - slotMinutes } : p
        )
      );

      return;
    }

    // DRIVER SELECTED
    // If slot is restricted for this driver, do nothing
    const restricted = rules[selectedPersonId]?.includes(slot.id);
    if (restricted) return;

    // If occupied by someone else, don't overwrite
    if (assignedPersonId && assignedPersonId !== selectedPersonId) return;

    // If already assigned to this same person, do nothing
    if (assignedPersonId === selectedPersonId) return;

    // Assign slot to selected driver
    setShiftAssignments((prev) => ({
      ...prev,
      [slot.id]: selectedPersonId,
    }));

    setPeople((prev) =>
      prev.map((p) =>
        p.id === selectedPersonId ? { ...p, hours: p.hours + slotMinutes } : p
      )
    );
  }

  function clearSlotContext(slot, e) {
    e.preventDefault();
    const assignedPersonId = shiftAssignments[slot.id];
    if (!assignedPersonId) return;

    const slotMinutes = hmToMinutes(slot.hours);

    setShiftAssignments((prev) => {
      const updated = { ...prev };
      delete updated[slot.id];
      return updated;
    });

    setPeople((prev) =>
      prev.map((p) =>
        p.id === assignedPersonId ? { ...p, hours: p.hours - slotMinutes } : p
      )
    );
  }

  function getSlotColor(slot) {
    // Only color slots based on assignment + restriction
    if (!selectedPersonId) return "slot";

    const occupied = shiftAssignments[slot.id];
    const restricted = rules[selectedPersonId]?.includes(slot.id);

    if (occupied) return "slot yellow";
    if (restricted) return "slot red";
    return "slot green";
  }

  const groupedShifts = chunkArray(shifts, 7);

  return (
    <div className="scheduler-container">
      {/* PEOPLE SIDEBAR */}
      <div className="people-panel">
        <h3>Drivers</h3>
        {people.map((person) => (
          <div
            key={person.id}
            className={`person ${getPersonColor(person)} ${
              selectedPersonId === person.id ? "person-selected" : ""
            }`}
            onClick={() => handleSelectPerson(person.id)}
          >
            {person.name} — {formatMinutesForDisplay(person.hours)}
          </div>
        ))}
      </div>

      {/* GRID */}
      <div className="grid">
        <h2>Weekly Schedule</h2>

        {groupedShifts.map((group, groupIndex) => (
          <div key={groupIndex} className="slot-group">
            <h3 className="group-heading">
              {groupHeadings[groupIndex] || `Block ${groupIndex + 1}`}
            </h3>

            <div className="grid-layout">
              {group.map((slot) => (
                <div
                  key={slot.id}
                  className={getSlotColor(slot)}
                  onClick={() => handleSlotClick(slot)} // mobile + desktop tap
                  onContextMenu={(e) => clearSlotContext(slot, e)} // right-click clear on desktop
                >
                  <div className="slot-container">
                    <b className="slot-day">{slot.day}</b>
                    <b className="slot-label">{slot.label}</b>
                    <em className="slot-hours">{slot.hours} hrs</em>
                  </div>

                  <div className="assigned">
                    {shiftAssignments[slot.id]
                      ? people.find((p) => p.id === shiftAssignments[slot.id])
                          ?.name
                      : ""}
                  </div>

                  <div className="clear-hint">
                    (tap with no driver selected to clear / right-click)
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
