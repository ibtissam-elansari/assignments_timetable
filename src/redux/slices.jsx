import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import dayjs from 'dayjs';

// URL for json-server
const API_URL = 'http://localhost:5000/assignments';

// Async thunks
export const fetchAssignmentsAsync = createAsyncThunk('calendar/fetchAssignments', async () => {
  const response = await axios.get(API_URL);
  return response.data;
});

export const addAssignmentAsync = createAsyncThunk('calendar/addAssignment', async (assignment) => {
  const response = await axios.post(API_URL, assignment);
  return response.data;
});

export const updateAssignmentAsync = createAsyncThunk('calendar/updateAssignment', async (assignment) => {
  const response = await axios.put(`${API_URL}/${assignment.id}`, assignment);
  return response.data;
});

export const deleteAssignmentAsync = createAsyncThunk('calendar/deleteAssignment', async (id) => {
  await axios.delete(`${API_URL}/${id}`);
  return id;
});

const initialState = {
  startOfWeek: dayjs().startOf("week").add(1, "day").format('YYYY-MM-DD'),
  assignments: [],
  hours: Array.from({ length: 10 }, (_, i) => {
    const startTime = dayjs().hour(8 + i).minute(30);
    return {
      startTime: startTime.format('HH:mm'),
      endTime: startTime.add(1, 'hour').format('HH:mm'),
      subHours: [
        {
          startTime: startTime.format('HH:mm'),
          endTime: startTime.add(30, 'minute').format('HH:mm'),
        },
        {
          startTime: startTime.add(30, 'minute').format('HH:mm'),
          endTime: startTime.add(1, 'hour').format('HH:mm'),
        }
      ],
    };
  }),
  showAddAssignmentModal: false,
  selectedDay: null,
  selectedStartTime: "",
  selectedEndTime: "",
  selectedGroupe: null,
  selectedFormateur: null
};

const slice = createSlice({
  name: 'calendar',
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
    setSelectedGroupe(state, action) { // New action to set selected group
      if(state.selectedGroupe !== action.payload){
          state.selectedGroupe = action.payload;
      }
    },
    setSelectedFormateur(state, action) { // New action to set selected group
      if(state.selectedFormateur !== action.payload){
        state.selectedFormateur = action.payload;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssignmentsAsync.fulfilled, (state, action) => {
        state.assignments = action.payload;
      })
      .addCase(addAssignmentAsync.fulfilled, (state, action) => {
        state.assignments.push(action.payload);
      })
      .addCase(updateAssignmentAsync.fulfilled, (state, action) => {
        const index = state.assignments.findIndex((event) => event.id === action.payload.id);
        if (index !== -1) {
          state.assignments[index] = action.payload;
        }
      })
      .addCase(deleteAssignmentAsync.fulfilled, (state, action) => {
        state.assignments = state.assignments.filter((event) => event.id !== action.payload);
      });
  },
});

export const {
  setSelectedDay,
  setSelectedStartTime,
  setSelectedEndTime,
  setShowAddAssignmentModal,
  setSelectedGroupe,
  setSelectedFormateur
} = slice.actions;

export default slice.reducer;