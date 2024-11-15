import { createSlice } from "@reduxjs/toolkit";
import dayjs from "dayjs";

const initialState = {
  startOfWeek: dayjs().startOf("week").add(1, "day").format('YYYY-MM-DD'),
  assignments: [],
  hours: Array.from({ length: 10 }, (_, i) => {
    const startTime = dayjs().hour(8 + i).minute(30);  // Adjusted for accurate time calculation
    return {
      startTime: startTime.format('HH:mm'),
      endTime: startTime.add(1, 'hour').format('HH:mm'),
      subHours: [
        {
          startTime: startTime.format('HH:mm'),
          endTime: startTime.add(30, 'minute').format('HH:mm'), // Correct 30-min interval
        },
        {
          startTime: startTime.add(30, 'minute').format('HH:mm'),
          endTime: startTime.add(1, 'hour').format('HH:mm'), // Correct end time to next full hour
        }
      ],
    };
  }),
  showAddAssignmentModal: false,
  selectedDay: null,
  selectedStartTime: "", 
  selectedEndTime: ""
};

const slice = createSlice({
  name: "calendar",
  initialState,
  reducers: {
    setSelectedDay(state, action) {
      state.selectedDay = action.payload;
    },
    setSelectedStartTime(state, action) {
      state.selectedStartTime = action.payload;
    },
    setSelectedEndTime(state, action) {
      state.selectedEndTime = action.payload;
    },
    setShowAddAssignmentModal(state, action) {
      state.showAddAssignmentModal = action.payload;
    },
    addAssignment(state, action) {
      state.assignments.push(action.payload);
    },
    updateAssignment(state, action) {
      const index = state.assignments.findIndex((event) => event.id === action.payload.id);
      if (index !== -1) {
        state.assignments[index] = action.payload;
      }
    },
    deleteAssignment(state, action) {
      state.assignments = state.assignments.filter((event) => event.id !== action.payload.id);
    },
  },
});

export const { 
  setSelectedDay,
  setSelectedStartTime,
  setSelectedEndTime,
  setShowAddAssignmentModal,
  addAssignment,
  updateAssignment,
  deleteAssignment 
} = slice.actions;

export default slice.reducer;
