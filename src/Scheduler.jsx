import React, { useState } from "react";
import "./Scheduler.css";

// --------------------------------------------------
// TIME FUNCTIONS
// --------------------------------------------------

// Convert H.MM style to minutes
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
    // Two digits are literal minutes (.15 = 15, .45 = 45)
    minutes = parseInt(mStr, 10) || 0;
  }

  return h * 60 + minutes;
}

function formatMinutesForDisplay(totalMinutes) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (m === 0) return `${h} hrs`;
  return `${h} hrs ${m} min`;
}

// --------------------------------------------------
// PERSON COLOR LOGIC (based only on hours vs max)
// --------------------------------------------------
//
// RED if current < max - 10h
// YELLOW if between 10h and 5h below max
// GREEN if within 5h below max up to 5h over max
// RED + !!! if current > max + 5h
//
function getPersonColor(person) {
  const current = person.hours; // minutes
  const max = person.maxHours * 60; // minutes

  if (current > max + 300) return "red-person alert"; // > 5h over
  if (current < max - 600) return "red-person"; // > 10h under
  if (current >= max - 600 && current < max - 300) return "yellow-person"; // between 10h & 5h under
  return "green-person"; // -5h .. +5h of max
}

// --------------------------------------------------
// ROUTE NAMES / ORDER
// --------------------------------------------------

const ROUTE_NAMES = {
  ank: "Ankeny",
  sf: "Sioux Falls",
  ber: "Bermuda",
  lin: "Lincoln",
  fre: "Fremont",
  ite: "In Town East",
};

const ROUTE_ORDER = ["ank", "sf", "ber", "lin", "fre", "ite"];

const RUN_ORDER = ["Overnight Run", "1st Run", "2nd Run", "3rd Run"];

function getRoutePrefix(id) {
  return id.split("-")[0];
}

// --------------------------------------------------
// SHIFTS (FULL LIST)
// --------------------------------------------------

const shifts = [
  // --------------------------------------------------
  // OVERNIGHT RUN — ANKENY
  // --------------------------------------------------
  { id: "ank-sun-1", day: "Sun", label: "Overnight Run", hours: 6 },
  { id: "ank-mon-1", day: "Mon", label: "Overnight Run", hours: 6 },
  { id: "ank-tue-1", day: "Tue", label: "Overnight Run", hours: 6 },
  { id: "ank-wed-1", day: "Wed", label: "Overnight Run", hours: 6 },
  { id: "ank-thu-1", day: "Thu", label: "Overnight Run", hours: 6 },
  { id: "ank-fri-1", day: "Fri", label: "Overnight Run", hours: 6 },
  { id: "ank-sat-1", day: "Sat", label: "Overnight Run", hours: 6 },

  // OVERNIGHT RUN — SIOUX FALLS
  { id: "sf-sun-1", day: "Sun", label: "Overnight Run", hours: 6 },
  { id: "sf-mon-1", day: "Mon", label: "Overnight Run", hours: 6 },
  { id: "sf-tue-1", day: "Tue", label: "Overnight Run", hours: 6 },
  { id: "sf-wed-1", day: "Wed", label: "Overnight Run", hours: 6 },
  { id: "sf-thu-1", day: "Thu", label: "Overnight Run", hours: 6 },
  { id: "sf-fri-1", day: "Fri", label: "Overnight Run", hours: 6 },
  { id: "sf-sat-1", day: "Sat", label: "Overnight Run", hours: 6 },

  // --------------------------------------------------
  // 1ST RUN — BERMUDA
  // --------------------------------------------------
  { id: "ber-sun-1", day: "Sun", label: "1st Run", hours: 6.15 },
  { id: "ber-mon-1", day: "Mon", label: "1st Run", hours: 6.15 },
  { id: "ber-tue-1", day: "Tue", label: "1st Run", hours: 6.15 },
  { id: "ber-wed-1", day: "Wed", label: "1st Run", hours: 6.15 },
  { id: "ber-thu-1", day: "Thu", label: "1st Run", hours: 6.15 },
  { id: "ber-fri-1", day: "Fri", label: "1st Run", hours: 6.15 },
  { id: "ber-sat-1", day: "Sat", label: "1st Run", hours: 6.15 },

  // 1ST RUN — LINCOLN
  { id: "lin-sun-1", day: "Sun", label: "1st Run", hours: 4.5 },
  { id: "lin-mon-1", day: "Mon", label: "1st Run", hours: 4.5 },
  { id: "lin-tue-1", day: "Tue", label: "1st Run", hours: 4.5 },
  { id: "lin-wed-1", day: "Wed", label: "1st Run", hours: 4.5 },
  { id: "lin-thu-1", day: "Thu", label: "1st Run", hours: 4.5 },
  { id: "lin-fri-1", day: "Fri", label: "1st Run", hours: 4.5 },
  { id: "lin-sat-1", day: "Sat", label: "1st Run", hours: 4.5 },

  // 1ST RUN — FREMONT
  { id: "fre-sun-1", day: "Sun", label: "1st Run", hours: 4.45 },
  { id: "fre-mon-1", day: "Mon", label: "1st Run", hours: 4.45 },
  { id: "fre-tue-1", day: "Tue", label: "1st Run", hours: 4.45 },
  { id: "fre-wed-1", day: "Wed", label: "1st Run", hours: 4.45 },
  { id: "fre-thu-1", day: "Thu", label: "1st Run", hours: 4.45 },
  { id: "fre-fri-1", day: "Fri", label: "1st Run", hours: 4.45 },
  { id: "fre-sat-1", day: "Sat", label: "1st Run", hours: 4.45 },

  // 1ST RUN — IN TOWN EAST (ITE)
  { id: "ite-sun-1", day: "Sun", label: "1st Run", hours: 2.5 },
  { id: "ite-mon-1", day: "Mon", label: "1st Run", hours: 2.5 },
  { id: "ite-tue-1", day: "Tue", label: "1st Run", hours: 2.5 },
  { id: "ite-wed-1", day: "Wed", label: "1st Run", hours: 2.5 },
  { id: "ite-thu-1", day: "Thu", label: "1st Run", hours: 2.5 },
  { id: "ite-fri-1", day: "Fri", label: "1st Run", hours: 2.5 },
  { id: "ite-sat-1", day: "Sat", label: "1st Run", hours: 2.5 },

  // --------------------------------------------------
  // 2ND RUN — BERMUDA
  // --------------------------------------------------
  { id: "ber-sun-2", day: "Sun", label: "2nd Run", hours: 6.15 },
  { id: "ber-mon-2", day: "Mon", label: "2nd Run", hours: 6.15 },
  { id: "ber-tue-2", day: "Tue", label: "2nd Run", hours: 6.15 },
  { id: "ber-wed-2", day: "Wed", label: "2nd Run", hours: 6.15 },
  { id: "ber-thu-2", day: "Thu", label: "2nd Run", hours: 6.15 },
  { id: "ber-fri-2", day: "Fri", label: "2nd Run", hours: 6.15 },
  { id: "ber-sat-2", day: "Sat", label: "2nd Run", hours: 6.15 },

  // 2ND RUN — LINCOLN
  { id: "lin-sun-2", day: "Sun", label: "2nd Run", hours: 4.5 },
  { id: "lin-mon-2", day: "Mon", label: "2nd Run", hours: 4.5 },
  { id: "lin-tue-2", day: "Tue", label: "2nd Run", hours: 4.5 },
  { id: "lin-wed-2", day: "Wed", label: "2nd Run", hours: 4.5 },
  { id: "lin-thu-2", day: "Thu", label: "2nd Run", hours: 4.5 },
  { id: "lin-fri-2", day: "Fri", label: "2nd Run", hours: 4.5 },
  { id: "lin-sat-2", day: "Sat", label: "2nd Run", hours: 4.5 },

  // 2ND RUN — FREMONT
  { id: "fre-sun-2", day: "Sun", label: "2nd Run", hours: 4.45 },
  { id: "fre-mon-2", day: "Mon", label: "2nd Run", hours: 4.45 },
  { id: "fre-tue-2", day: "Tue", label: "2nd Run", hours: 4.45 },
  { id: "fre-wed-2", day: "Wed", label: "2nd Run", hours: 4.45 },
  { id: "fre-thu-2", day: "Thu", label: "2nd Run", hours: 4.45 },
  { id: "fre-fri-2", day: "Fri", label: "2nd Run", hours: 4.45 },
  { id: "fre-sat-2", day: "Sat", label: "2nd Run", hours: 4.45 },

  // 2ND RUN — IN TOWN EAST (ITE)
  { id: "ite-sun-2", day: "Sun", label: "2nd Run", hours: 2.5 },
  { id: "ite-mon-2", day: "Mon", label: "2nd Run", hours: 2.5 },
  { id: "ite-tue-2", day: "Tue", label: "2nd Run", hours: 2.5 },
  { id: "ite-wed-2", day: "Wed", label: "2nd Run", hours: 2.5 },
  { id: "ite-thu-2", day: "Thu", label: "2nd Run", hours: 2.5 },
  { id: "ite-fri-2", day: "Fri", label: "2nd Run", hours: 2.5 },
  { id: "ite-sat-2", day: "Sat", label: "2nd Run", hours: 2.5 },

  // --------------------------------------------------
  // 3RD RUN — LINCOLN
  // --------------------------------------------------
  { id: "lin-sun-3", day: "Sun", label: "3rd Run", hours: 4.5 },
  { id: "lin-mon-3", day: "Mon", label: "3rd Run", hours: 4.5 },
  { id: "lin-tue-3", day: "Tue", label: "3rd Run", hours: 4.5 },
  { id: "lin-wed-3", day: "Wed", label: "3rd Run", hours: 4.5 },
  { id: "lin-thu-3", day: "Thu", label: "3rd Run", hours: 4.5 },
  { id: "lin-fri-3", day: "Fri", label: "3rd Run", hours: 4.5 },
  { id: "lin-sat-3", day: "Sat", label: "3rd Run", hours: 4.5 },

  // 3RD RUN — FREMONT
  { id: "fre-sun-3", day: "Sun", label: "3rd Run", hours: 4.45 },
  { id: "fre-mon-3", day: "Mon", label: "3rd Run", hours: 4.45 },
  { id: "fre-tue-3", day: "Tue", label: "3rd Run", hours: 4.45 },
  { id: "fre-wed-3", day: "Wed", label: "3rd Run", hours: 4.45 },
  { id: "fre-thu-3", day: "Thu", label: "3rd Run", hours: 4.45 },
  { id: "fre-fri-3", day: "Fri", label: "3rd Run", hours: 4.45 },
  { id: "fre-sat-3", day: "Sat", label: "3rd Run", hours: 4.45 },

  // 3RD RUN — IN TOWN EAST (ITE)
  { id: "ite-sun-3", day: "Sun", label: "3rd Run", hours: 2.5 },
  { id: "ite-mon-3", day: "Mon", label: "3rd Run", hours: 2.5 },
  { id: "ite-tue-3", day: "Tue", label: "3rd Run", hours: 2.5 },
  { id: "ite-wed-3", day: "Wed", label: "3rd Run", hours: 2.5 },
  { id: "ite-thu-3", day: "Thu", label: "3rd Run", hours: 2.5 },
  { id: "ite-fri-3", day: "Fri", label: "3rd Run", hours: 2.5 },
  { id: "ite-sat-3", day: "Sat", label: "3rd Run", hours: 2.5 },
];

// --------------------------------------------------
// PEOPLE
// --------------------------------------------------

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

// J.B. Done
// TODO: Basim done besides mandatory days off
// TODO: Chelsee
// TODO: Colin
// TODO: Edward
// TODO: Kid Diddler
// TODO: Lawrence
// TODO: Matt
// TODO: Michael L
// TODO: Nicholas
// TODO: Q
// TODO: Willis

// --------------------------------------------------
// RULES
// --------------------------------------------------

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

  p5: [
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
    "ite-sun-1",
    "ite-mon-1",
    "ite-tue-1",
    "ite-wed-1",
    "ite-thu-1",
    "ite-fri-1",
    "ite-sat-1",

    "lin-sun-2",
    "lin-mon-2",
    "lin-tue-2",
    "lin-wed-2",
    "lin-thu-2",
    "lin-fri-2",
    "lin-sat-2",
    "fre-sun-2",
    "fre-mon-2",
    "fre-tue-2",
    "fre-wed-2",
    "fre-thu-2",
    "fre-fri-2",
    "fre-sat-2",
    "ber-sun-2",
    "ber-mon-2",
    "ber-tue-2",
    "ber-wed-2",
    "ber-thu-2",
    "ber-fri-2",
    "ite-sun-2",
    "ite-mon-2",
    "ite-tue-2",
    "ite-wed-2",
    "ite-thu-2",
    "ite-fri-2",
    "ite-sat-2",
    "lin-sun-3",
    "lin-mon-3",
    "lin-tue-3",
    "lin-wed-3",
    "lin-thu-3",
    "lin-fri-3",
    "lin-sat-3",
    "fre-sun-3",
    "fre-mon-3",
    "fre-tue-3",
    "fre-wed-3",
    "fre-thu-3",
    "fre-fri-3",
    "fre-sat-3",
    "ite-sun-3",
    "ite-mon-3",
    "ite-tue-3",
    "ite-wed-3",
    "ite-thu-3",
    "ite-fri-3",
    "ite-sat-3",
  ],
  p2: ["mon-1", "tue-1"],
};

// --------------------------------------------------
// GROUPING HELPERS
// --------------------------------------------------

const DAY_ORDER = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function groupByRunAndRoute(shifts) {
  const byRun = {};
  shifts.forEach((s) => {
    if (!byRun[s.label]) byRun[s.label] = {};
    const prefix = getRoutePrefix(s.id);
    if (!byRun[s.label][prefix]) byRun[s.label][prefix] = [];
    byRun[s.label][prefix].push(s);
  });
  return byRun;
}

// --------------------------------------------------
// MAIN COMPONENT
// --------------------------------------------------

export default function Scheduler() {
  const [people, setPeople] = useState(initialPeople);
  const [shiftAssignments, setShiftAssignments] = useState({});
  const [selectedPersonId, setSelectedPersonId] = useState(null);
  const [openGroup, setOpenGroup] = useState(null);

  function handleSelectPerson(id) {
    setSelectedPersonId((prev) => (prev === id ? null : id));
  }

  function handleSlotClick(slot) {
    const assigned = shiftAssignments[slot.id];
    const mins = hmToMinutes(slot.hours);

    // No driver selected → tap clears slot (if assigned)
    if (!selectedPersonId) {
      if (!assigned) return;

      setShiftAssignments((prev) => {
        const u = { ...prev };
        delete u[slot.id];
        return u;
      });

      setPeople((prev) =>
        prev.map((p) =>
          p.id === assigned ? { ...p, hours: p.hours - mins } : p
        )
      );

      return;
    }

    // If restricted
    if (rules[selectedPersonId]?.includes(slot.id)) return;

    // If assigned to someone else, don't overwrite
    if (assigned && assigned !== selectedPersonId) return;

    // If already assigned to this driver, do nothing
    if (assigned === selectedPersonId) return;

    // Assign
    setShiftAssignments((prev) => ({
      ...prev,
      [slot.id]: selectedPersonId,
    }));

    setPeople((prev) =>
      prev.map((p) =>
        p.id === selectedPersonId ? { ...p, hours: p.hours + mins } : p
      )
    );
  }

  function clearSlotContext(slot, e) {
    e.preventDefault();
    const assigned = shiftAssignments[slot.id];
    if (!assigned) return;

    const mins = hmToMinutes(slot.hours);

    setShiftAssignments((prev) => {
      const u = { ...prev };
      delete u[slot.id];
      return u;
    });

    setPeople((prev) =>
      prev.map((p) => (p.id === assigned ? { ...p, hours: p.hours - mins } : p))
    );
  }

  function getSlotColor(slot) {
    if (!selectedPersonId) return "slot";
    const assigned = shiftAssignments[slot.id];
    const restricted = rules[selectedPersonId]?.includes(slot.id);

    if (assigned) return "slot yellow";
    if (restricted) return "slot red";
    return "slot green";
  }

  const groups = groupByRunAndRoute(shifts);

  return (
    <div className="scheduler-container">
      {/* LEFT: Drivers */}
      <div className="people-panel">
        <h3>Drivers</h3>
        {people.map((p) => (
          <div
            key={p.id}
            className={`person ${getPersonColor(p)} ${
              selectedPersonId === p.id ? "person-selected" : ""
            }`}
            onClick={() => handleSelectPerson(p.id)}
          >
            {p.name} — {formatMinutesForDisplay(p.hours)}
          </div>
        ))}
      </div>

      {/* RIGHT: Runs & Routes */}
      <div className="grid">
        <h2>Weekly Schedule</h2>

        {RUN_ORDER.map((runLabel) => {
          const routesForRun = groups[runLabel];
          if (!routesForRun) return null;

          return (
            <div key={runLabel} className="slot-group">
              {/* COLLAPSIBLE HEADER */}
              <h3
                className="group-heading"
                onClick={() =>
                  setOpenGroup((prev) => (prev === runLabel ? null : runLabel))
                }
                style={{ cursor: "pointer" }}
              >
                {runLabel} {openGroup === runLabel ? "▼" : "▶"}
              </h3>

              {/* BODY */}
              {openGroup === runLabel && (
                <div className="run-body">
                  {ROUTE_ORDER.map((prefix) => {
                    const slotsForRoute = routesForRun[prefix];
                    if (!slotsForRoute) return null;

                    const routeName = ROUTE_NAMES[prefix] || prefix;

                    // Sort by day order
                    const sortedSlots = [...slotsForRoute].sort(
                      (a, b) =>
                        DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day)
                    );

                    return (
                      <div key={prefix} className="route-row">
                        <div className="route-name">{routeName}</div>
                        <div className="grid-layout">
                          {sortedSlots.map((slot) => (
                            <div
                              key={slot.id}
                              className={getSlotColor(slot)}
                              onClick={() => handleSlotClick(slot)}
                              onContextMenu={(e) => clearSlotContext(slot, e)}
                            >
                              <div className="slot-container">
                                <b className="slot-day">{slot.day}</b>
                                <b className="slot-label">{slot.label}</b>
                                <em className="slot-hours">{slot.hours} hrs</em>
                              </div>

                              <div className="assigned">
                                {shiftAssignments[slot.id]
                                  ? people.find(
                                      (p) => p.id === shiftAssignments[slot.id]
                                    )?.name
                                  : ""}
                              </div>

                              <div className="clear-hint">
                                (tap to assign / clear)
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
