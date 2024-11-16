import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAssignmentsAsync, setSelectedGroupe } from '../redux/slices';
import DayRow from './DayRow';
import dayjs from 'dayjs';

export default function Week() {
  const dispatch = useDispatch();
  const startOfWeekString = useSelector((state) => state.calendar.startOfWeek);
  const startOfWeek = dayjs(startOfWeekString);
  const hours = useSelector((state) => state.calendar.hours);
  const daysOfWeek = Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, 'day'));
  const assignments = useSelector((state) => state.calendar.assignments);
  const selectedGroupe = useSelector((state) => state.calendar.selectedGroupe);

  useEffect(() => {
    dispatch(fetchAssignmentsAsync());
  }, [dispatch]);

  // Filter assignments based on the selected group
  const filteredAssignments = selectedGroupe
    ? assignments.filter((assignment) => assignment.groupe === selectedGroupe)
    : assignments;

  return (
    <div className="overflow-x-auto p-2">
      {/* Group selector */}
      <div className="mb-4">
        <label htmlFor="group-select" className="mr-2">Select Group:</label>
        <select
          id="group-select"
          value={selectedGroupe}
          onChange={(e) => dispatch(setSelectedGroupe(e.target.value))}
          className="border px-2 py-1"
        >
          <option value="">All Groups</option>
          {/* List unique groups */}
          {[...new Set(assignments.map(assignment => assignment.groupe))].map((group, index) => (
            <option key={index} value={group}>{group}</option>
          ))}
        </select>
      </div>

      <div className="inline-block min-w-full overflow-hidden rounded-lg border border-gray-300 shadow-md">
        <table className="min-w-full border-collapse text-center text-xs">
          <thead>
            <tr>
              <th className="px-1 py-1 border rounded-tl-lg">Day</th>
              {hours.map((hour, index) => (
                <th key={index} colSpan={2} className="px-1 py-1 border font-semibold">
                  {hour.startTime} - {hour.endTime}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {daysOfWeek.map((day, dayIndex) => (
              <DayRow
                key={dayIndex}
                day={day}
                hours={hours}
                assignments={filteredAssignments}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
