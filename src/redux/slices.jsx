import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import dayjs from 'dayjs';
import axios from 'axios';

const API_URL = 'http://localhost:3000/assignments';

export const fetchAssignments = createAsyncThunk('scheduler/fetchAssignments', async () => {
  const response = await axios.get(API_URL);
  return response.data;
});

export const addAssignment = createAsyncThunk('scheduler/addAssignment', async (assignment) => {
  const response = await axios.post(API_URL, assignment);
  return response.data;
});

export const updateAssignment = createAsyncThunk('scheduler/updateAssignment', async (assignment) => {
  const response = await axios.put(`${API_URL}/${assignment.id}`, assignment);
  return response.data;
});

export const deleteAssignment = createAsyncThunk('scheduler/deleteAssignment', async (id) => {
  await axios.delete(`${API_URL}/${id}`);
  return id;
});

const handleAsyncCases = (builder, thunk, operation, onSuccess) => {
  builder
    .addCase(thunk.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.currentOperation = operation;
    })
    .addCase(thunk.fulfilled, (state, action) => {
      state.loading = false;
      onSuccess(state, action);
      state.currentOperation = null;
    })
    .addCase(thunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.currentOperation = null;
    });
};

const initialState = {
  assignments: [],
  startOfWeek: dayjs().startOf('week').add(1, 'day').format('YYYY-MM-DD'),
  hours: Array.from({ length: 10 }, (_, i) => {
    const startTime = dayjs()
      .hour(8 + i)
      .minute(30);
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
        },
      ],
    };
  }),
  showAddAssignmentModal: false,
  selectedDay: null,
  selectedStartTime: '',
  selectedEndTime: '',
  selectedGroupe: null,
  selectedFormateur: null,
  isAddAssignmentButtonClicked: false,
  salles: [
    'info 01',
    'info 02',
    'info 03',
    'salle de dessin',
    'salle 1',
    'salle 2',
    'salle 3',
    'salle 4',
    'salle 5',
    'salle 6',
    'salle 7',
    'salle 8',
    'salle 9',
  ],
};

const schedulerSlice = createSlice({
  name: 'scheduler',
  initialState,
  reducers: {
    nextWeek: (state) => {
      state.startOfWeek = dayjs(state.startOfWeek).add(1, 'week').format('YYYY-MM-DD');
    },
    prevWeek: (state) => {
      state.startOfWeek = dayjs(state.startOfWeek).subtract(1, 'week').format('YYYY-MM-DD');
    },
    setSelectedDay: (state, action) => {
      state.selectedDay = action.payload;
    },
    setSelectedStartTime: (state, action) => {
      state.selectedStartTime = action.payload;
    },
    setSelectedEndTime: (state, action) => {
      state.selectedEndTime = action.payload;
    },
    setShowAddAssignmentModal: (state, action) => {
      state.showAddAssignmentModal = action.payload;
    },
    setSelectedGroupe: (state, action) => {
      console.log('Setting selectedGroupe:', action.payload);
      state.selectedGroupe = action.payload;
    },
    setSelectedFormateur: (state, action) => {
      console.log('Setting selectedFormateur:', action.payload);
      state.selectedFormateur = action.payload;
    },
    setAddAssignmentButtonClicked(state, action) {
      state.isAddAssignmentButtonClicked = action.payload;
    },
  },
  extraReducers: (builder) => {
    handleAsyncCases(builder, fetchAssignments, 'fetch', (state, action) => {
      state.assignments = action.payload;
      console.log('Assignments fetched, selectedGroupe:', state.selectedGroupe, 'selectedFormateur:', state.selectedFormateur);
    });

    handleAsyncCases(builder, addAssignment, 'add', (state, action) => {
      state.assignments.push(action.payload);
      console.log('Assignment added, selectedGroupe:', state.selectedGroupe, 'selectedFormateur:', state.selectedFormateur);
    });

    handleAsyncCases(builder, updateAssignment, 'update', (state, action) => {
      const index = state.assignments.findIndex(
        (assignment) => assignment.id === action.payload.id
      );
      if (index !== -1) {
        state.assignments[index] = action.payload;
      }
      console.log('Assignment updated, selectedGroupe:', state.selectedGroupe, 'selectedFormateur:', state.selectedFormateur);
    });

    handleAsyncCases(builder, deleteAssignment, 'delete', (state, action) => {
      state.assignments = state.assignments.filter(
        (assignment) => assignment.id !== action.payload
      );
      console.log('Assignment deleted, selectedGroupe:', state.selectedGroupe, 'selectedFormateur:', state.selectedFormateur);
    });
  },
});

export const {
  nextWeek,
  prevWeek,
  setSelectedDay,
  setSelectedStartTime,
  setSelectedEndTime,
  setShowAddAssignmentModal,
  setSelectedGroupe,
  setSelectedFormateur,
  setAddAssignmentButtonClicked,
} = schedulerSlice.actions;

export default schedulerSlice.reducer;