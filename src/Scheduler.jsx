import React, { useState } from "react";
import "./Scheduler.css";

// --------------------------------------------------
// TIME FUNCTIONS
// --------------------------------------------------

// Convert your H.MM style into minutes:
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
// RED + ❗ if current > max + 5h
//
function getPersonColor(person) {
  const current = person.hours; // minutes
  const max = person.maxHours * 60; // minutes

  // More than 5 hours over max → RED + ALERT
  if (current > max + 300) return "red-person alert";

  // More than 10 hours below max → RED
  if (current < max - 600) return "red-person";

  // Between 10 hours and 5 hours below max → YELLOW
  if (current >= max - 600 && current < max - 300) return "yellow-person";

  // Within 5 hours below max up to 5 hours over max → GREEN
  return "green-person";
}

// --------------------------------------------------
// CONFIG — ALL YOUR SHIFTS EXACTLY AS GIVEN
// --------------------------------------------------

const shifts = [
  { id: "ank-sun-1", day: "Sun", label: "Overnight Run", hours: 6 },
  { id: "ank-mon-1", day: "Mon", label: "Overnight Run", hours: 6 },
  { id: "ank-tue-1", day: "Tue", label: "Overnight Run", hours: 6 },
  { id: "ank-wed-1", day: "Wed", label: "Overnight Run", hours: 6 },
  { id: "ank-thu-1", day: "Thu", label: "Overnight Run", hours: 6 },
  { id: "ank-fri-1", day: "Fri", label: "Overnight Run", hours: 6 },
  { id: "ank-sat-1", day: "Sat", label: "Overnight Run", hours: 6 },

  { id: "sf-sun-1", day: "Sun", label: "Overnight Run", hours: 6 },
  { id: "sf-mon-1", day: "Mon", label: "Overnight Run", hours: 6 },
  { id: "sf-tue-1", day: "Tue", label: "Overnight Run", hours: 6 },
  { id: "sf-wed-1", day: "Wed", label: "Overnight Run", hours: 6 },
  { id: "sf-thu-1", day: "Thu", label: "Overnight Run", hours: 6 },
  { id: "sf-fri-1", day: "Fri", label: "Overnight Run", hours: 6 },
  { id: "sf-sat-1", day: "Sat", label: "Overnight Run", hours: 6 },

  { id: "ber-sun-1", day: "Sun", label: "1st Run", hours: 6.15 },
  { id: "ber-mon-1", day: "Mon", label: "1st Run", hours: 6.15 },
  { id: "ber-tue-1", day: "Tue", label: "1st Run", hours: 6.15 },
  { id: "ber-wed-1", day: "Wed", label: "1st Run", hours: 6.15 },
  { id: "ber-thu-1", day: "Thu", label: "1st Run", hours: 6.15 },
  { id: "ber-fri-1", day: "Fri", label: "1st Run", hours: 6.15 },
  { id: "ber-sat-1", day: "Sat", label: "1st Run", hours: 6.15 },

  { id: "mon-10", day: "Mon", label: "1st Run", hours: 4.5 },
  { id: "mon-11", day: "Mon", label: "1st Run", hours: 4.5 },
  { id: "mon-12", day: "Mon", label: "1st Run", hours: 4.5 },

  { id: "tue-10", day: "Tue", label: "1st Run", hours: 4.5 },
  { id: "tue-11", day: "Tue", label: "1st Run", hours: 4.5 },
  { id: "tue-12", day: "Tue", label: "1st Run", hours: 4.5 },

  { id: "wed-4", day: "Wed", label: "1st Run", hours: 4.5 },

  { id: "mon-13", day: "Mon", label: "1st Run", hours: 4.45 },
  { id: "mon-14", day: "Mon", label: "1st Run", hours: 4.45 },
  { id: "mon-15", day: "Mon", label: "1st Run", hours: 4.45 },

  { id: "tue-13", day: "Tue", label: "1st Run", hours: 4.45 },
  { id: "tue-14", day: "Tue", label: "1st Run", hours: 4.45 },
  { id: "tue-15", day: "Tue", label: "1st Run", hours: 4.45 },

  { id: "wed-5", day: "Wed", label: "1st Run", hours: 4.45 },

  { id: "mon-16", day: "Mon", label: "1st Run", hours: 2.5 },
  { id: "mon-17", day: "Mon", label: "1st Run", hours: 2.5 },
  { id: "mon-18", day: "Mon", label: "1st Run", hours: 2.5 },

  { id: "tue-16", day: "Tue", label: "1st Run", hours: 2.5 },
  { id: "tue-17", day: "Tue", label: "1st Run", hours: 2.5 },
  { id: "tue-18", day: "Tue", label: "1st Run", hours: 2.5 },

  { id: "wed-6", day: "Wed", label: "1st Run", hours: 2.5 },
];

// PEOPLE — hours stored as MINUTES, with maxHours
const initialPeople = [
  { id: "p1", name: "Nicholas", hours: 0, maxHours: 40 },
  { id: "p2", name: "Basim", hours: 0, maxHours: 40 },
  { id: "p3", name: "Chelsee", hours: 0, maxHours: 40 },
  { id: "p4", name: "Quentin", hours: 0, maxHours: 40 },
];

// RULES
const rules = {
  p1: ["ank-sun-1, ank-mon-1, ank-tue-1, ank-thur-1, ank-fri-1, ank-sat-1,"], // example, adjust if you want
  p2: ["mon-1", "tue-1"],
};

const groupHeadings = ["Ankeny", "SF", "Bermuda", "Lincoln", "Fremont", "ITE"];

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

// --------------------------------------------------
// COMPONENT (Tap driver → tap slot, mobile-friendly)
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

    // NO DRIVER SELECTED → tap slot to clear it (if occupied)
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
    // We only color slots based on assignment + restriction relative
    // to the currently selected driver (if any)
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
