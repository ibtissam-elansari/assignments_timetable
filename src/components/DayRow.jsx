import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setSelectedDay,
  setSelectedEndTime,
  setSelectedStartTime,
  setShowAddAssignmentModal
} from '../redux/slices';

const DayRow = ({ day, hours, assignments }) => {
  const dispatch = useDispatch();
  const selectedFormateur = useSelector(state => state.calendar.selectedFormateur);
  const selectedGroupe = useSelector(state => state.calendar.selectedGroupe);

  // Use effect to manage modal visibility based on selections
  useEffect(() => {
    if (!selectedFormateur || !selectedGroupe) {
      dispatch(setShowAddAssignmentModal(false));
    }
  }, [selectedFormateur, selectedGroupe, dispatch]);

  // Improved span count calculation for sub-cells
  const getSpanCount = (startTime, endTime) => {
    const flatSubHours = hours.flatMap(hour => hour.subHours);
    const startIndex = flatSubHours.findIndex(subHour => subHour.startTime === startTime);
    const endIndex = flatSubHours.findIndex(subHour => subHour.endTime === endTime);

    if (startIndex === -1 || endIndex === -1) {
      return 1; // Fallback in case time is not found
    }

    return endIndex - startIndex + 1;
  };

  // Helper to check if a sub-hour falls within the assignment range
  const isWithinAssignmentRange = (assignment, subHour) => {
    return (
      assignment.day === day.format('YYYY-MM-DD') &&
      subHour.startTime >= assignment.startTime &&
      subHour.endTime <= assignment.endTime
    );
  };

  return (
    <tr>
      <td className="px-1 py-5 border font-semibold text-gray-700">
        {day.format('dddd')}
      </td>
      {hours.map(hour =>
        hour.subHours.map((subHour, subHourIndex) => {
          // Check if an assignment covers this sub-hour
          const assignment = assignments.find(
            assignment => isWithinAssignmentRange(assignment, subHour)
          );

          if (selectedFormateur || selectedGroupe) {
            // If an assignment is found, render it with the correct colSpan
            if (assignment && subHour.startTime === assignment.startTime) {
              const spanCount = getSpanCount(assignment.startTime, assignment.endTime);
              return (
                <td
                  key={`${subHour.startTime}-${subHour.endTime}`}
                  colSpan={spanCount}
                  className="border p-2 cursor-pointer bg-blue-100"
                  onClick={() => {
                    dispatch(setSelectedDay(day.format('YYYY-MM-DD')));
                    dispatch(setSelectedStartTime(assignment.startTime));
                    dispatch(setSelectedEndTime(assignment.endTime));
                    dispatch(setShowAddAssignmentModal(true));
                  }}
                >
                  {assignment.title}
                </td>
              );
            }
          }

          // Check if this sub-cell is covered by a previously rendered assignment
          const isCellCovered = assignments.some(assignment => {
            const flatSubHours = hours.flatMap(hour => hour.subHours);
            const startIndex = flatSubHours.findIndex(subHour => subHour.startTime === assignment.startTime);
            const endIndex = flatSubHours.findIndex(subHour => subHour.endTime === assignment.endTime);
            const currentIndex = flatSubHours.findIndex(s => s.startTime === subHour.startTime);

            return (
              assignment.day === day.format('YYYY-MM-DD') &&
              currentIndex > startIndex &&
              currentIndex <= endIndex
            );
          });

          // Skip rendering this sub-cell if it is covered
          if (isCellCovered) {
            return null;
          }

          // Render an empty sub-cell
          return (
            <td
              key={`${subHour.startTime}-${subHour.endTime}`}
              className="border p-2 cursor-pointer"
              onClick={() => {
                if (selectedFormateur || selectedGroupe) {
                  dispatch(setSelectedDay(day.format('YYYY-MM-DD')));
                  dispatch(setSelectedStartTime(subHour.startTime));
                  dispatch(setSelectedEndTime(subHour.endTime));
                  dispatch(setShowAddAssignmentModal(true));
                }
              }}
            ></td>
          );
        })
      )}
    </tr>
  );
};

export default DayRow;
