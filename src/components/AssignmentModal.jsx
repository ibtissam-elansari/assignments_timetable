import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setShowAddAssignmentModal,
  addAssignmentAsync,
  updateAssignmentAsync,
  deleteAssignmentAsync,
} from "../redux/slices";

export default function AssignmentModal() {
  const dispatch = useDispatch();
  const showAddAssignmentModal = useSelector(
    (state) => state.calendar.showAddAssignmentModal
  );
  const hours = useSelector((state) => state.calendar.hours);
  const selectedDay = useSelector((state) => state.calendar.selectedDay);
  const selectedStartTime = useSelector(
    (state) => state.calendar.selectedStartTime
  );
  const selectedEndTime = useSelector((state) => state.calendar.selectedEndTime);
  const assignments = useSelector((state) => state.calendar.assignments);
  const selectedGroupe = useSelector((state) => state.calendar.selectedGroupe);
  const selectedFormateur = useSelector(
    (state) => state.calendar.selectedFormateur
  );

  const timeSlots = hours.flatMap((hour) => hour.subHours);
  const existingAssignment = assignments.find(
    (assignment) =>
      assignment.day === selectedDay &&
      assignment.startTime === selectedStartTime &&
      assignment.endTime === selectedEndTime && 
      (assignment.groupe.codeGroupe === selectedGroupe || assignment.formateur.matricule === selectedFormateur)
  );

  const [assignmentData, setAssignmentData] = useState({
    title: "",
    formateur: {
      matricule: "",
      nom: "",
      email: "",
      secteur: ""
    },
    groupe: {
      codeGroupe: selectedGroupe || "",
      intituleGroupe: "",
      filiere: "",
      secteur: "",
    },
    salle: "",
    day: "",
    startTime: "",
    endTime: "",
    id: null,
  });

  const findGroupDetails = (codeGroupe) => {
    return (
      assignments.find(
        (assignment) => assignment.groupe.codeGroupe === codeGroupe
      )?.groupe || {}
    );
  };

  const findFormateurDetails = (matricule) => {
    return (
      assignments.find(
        (assignment) => assignment.formateur.matricule === matricule
      )?.formateur || {}
    );
  };
  

  const getFormateursForGroup = (group) => {
    return assignments
      .filter((assignment) => assignment.groupe.codeGroupe === group?.codeGroupe)
      .map((assignment) => assignment.formateur)
      .filter(
        (formateur, index, self) =>
          formateur &&
          index ===
            self.findIndex((f) => f?.matricule === formateur?.matricule)
      );
  };

  const getGroupsForFormateur = (formateur) => {
    return assignments
      .filter(
        (assignment) =>
          assignment.formateur?.matricule === formateur?.matricule
      )
      .map((assignment) => assignment.groupe)
      .filter(
        (groupe, index, self) =>
          groupe &&
          index === self.findIndex((g) => g?.codeGroupe === groupe?.codeGroupe)
      );
  };

  useEffect(() => {
    if (showAddAssignmentModal && selectedStartTime && selectedEndTime ) {
      if (existingAssignment) {
        setAssignmentData(existingAssignment);
      } else {
        // Update assignment data when a group or formateur is selected
        const groupDetails = selectedGroupe ? findGroupDetails(selectedGroupe) : {};
        const formateurDetails = selectedFormateur ? findFormateurDetails(selectedFormateur) : {};

        setAssignmentData((prevData) => ({
          ...prevData,
          startTime: selectedStartTime,
          endTime: selectedEndTime,
          groupe: { ...prevData.groupe, ...groupDetails },
          formateur: { ...prevData.formateur, ...formateurDetails },
          id: null,
        }));
      }
    }
  }, [
    showAddAssignmentModal,
    selectedStartTime,
    selectedEndTime,
    existingAssignment,
    selectedGroupe,
    selectedFormateur,
  ]);

  const handleClose = () => {
    dispatch(setShowAddAssignmentModal(false));
    resetForm();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { title, startTime, endTime, formateur } = assignmentData;
    if (!title || !startTime || !endTime || !formateur.matricule) {
      alert("Please fill in all required fields.");
      return;
    }

    const updatedAssignmentData = {
      ...assignmentData,
      day: selectedDay || assignmentData.day,
    };

    if (updatedAssignmentData.id) {
      dispatch(updateAssignmentAsync(updatedAssignmentData));
    } else {
      dispatch(
        addAssignmentAsync({
          ...updatedAssignmentData,
          id: Date.now().toString(),
        })
      );
    }
    handleClose();
  };

  const handleDelete = () => {
    if (assignmentData.id) {
      dispatch(deleteAssignmentAsync(assignmentData.id));
      handleClose();
    }
  };

  const resetForm = () => {
    setAssignmentData({
      title: "",
      formateur: {
        matricule: "",
        nom: "",
        email: "",
        secteur: ""
      },
      groupe: {
        codeGroupe: selectedGroupe || "",
        intituleGroupe: "",
        filiere: "",
        secteur: "",
      },
      salle: "",
      day: "",
      startTime: "",
      endTime: "",
      id: null,
    });
  };

  if (!showAddAssignmentModal) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <form
        className="bg-white rounded-lg shadow-2xl w-1/3 p-4"
        onSubmit={handleSubmit}
      >
        <header className="flex justify-between items-center border-b pb-2 mb-4">
          <h2 className="text-xl font-semibold">
            {assignmentData.id ? "Edit Assignment" : "Add Assignment"}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            &times;
          </button>
        </header>
        <div className="mb-4">
          <input
            type="text"
            name="title"
            placeholder="Assignment title"
            value={assignmentData.title}
            onChange={(e) =>
              setAssignmentData({ ...assignmentData, title: e.target.value })
            }
            className="w-full border-b-2 border-gray-300 focus:border-blue-500 outline-none py-2 text-lg"
            required
          />
        </div>
        <label className="block mb-2">
          Start Time:
          <select
            value={assignmentData.startTime}
            onChange={(e) =>
              setAssignmentData({ ...assignmentData, startTime: e.target.value })
            }
            required
            className="w-full border-b-2 border-gray-300 focus:border-blue-500 outline-none py-1"
          >
            <option value="">Select Start Time</option>
            {timeSlots.map((slot, index) => (
              <option key={index} value={slot.startTime}>
                {slot.startTime}
              </option>
            ))}
          </select>
        </label>
        <label className="block mb-4">
          End Time:
          <select
            value={assignmentData.endTime}
            onChange={(e) =>
              setAssignmentData({ ...assignmentData, endTime: e.target.value })
            }
            required
            className="w-full border-b-2 border-gray-300 focus:border-blue-500 outline-none py-1"
          >
            <option value="">Select End Time</option>
            {timeSlots.map((slot, index) => (
              <option key={index} value={slot.endTime}>
                {slot.endTime}
              </option>
            ))}
          </select>
        </label>
        {selectedGroupe ? (
          <>
            <label className="block mb-2">
              Groupe:
              <input
                type="text"
                value={assignmentData.groupe.codeGroupe}
                disabled
                className="w-full border-b-2 border-gray-300 focus:border-blue-500 outline-none py-1"
              />
            </label>
            <label className="block mb-4">
              Formateur:
              <select
                value={assignmentData.formateur?.matricule || ""}
                onChange={(e) =>
                  setAssignmentData({
                    ...assignmentData,
                    formateur: getFormateursForGroup(
                      assignmentData.groupe
                    ).find((f) => f.matricule === e.target.value),
                  })
                }
                required
                className="w-full border-b-2 border-gray-300 focus:border-blue-500 outline-none py-1"
              >
                <option value="">Select Formateur</option>
                {getFormateursForGroup(assignmentData.groupe).map(
                  (formateur, index) => (
                    <option key={index} value={formateur.matricule}>
                      {formateur.nom}
                    </option>
                  )
                )}
              </select>
            </label>
          </>
        ) : (
          <>
            <label className="block mb-2">
              Formateur:
              <input
                type="text"
                value={assignmentData.formateur?.nom || ""}
                disabled
                className="w-full border-b-2 border-gray-300 focus:border-blue-500 outline-none py-1"
              />
            </label>
            <label className="block mb-4">
              Groupe:
              <select
                value={assignmentData.groupe?.codeGroupe || ""}
                onChange={(e) =>
                  setAssignmentData({
                    ...assignmentData,
                    groupe: getGroupsForFormateur(
                      assignmentData.formateur
                    ).find((g) => g.codeGroupe === e.target.value),
                  })
                }
                required
                className="w-full border-b-2 border-gray-300 focus:border-blue-500 outline-none py-1"
              >
                <option value="">Select Groupe</option>
                {getGroupsForFormateur(assignmentData.formateur).map(
                  (groupe, index) => (
                    <option key={index} value={groupe.codeGroupe}>
                      {groupe.intituleGroupe}
                    </option>
                  )
                )}
              </select>
            </label>
          </>
        )}
        <div className="flex justify-end space-x-2">
          {assignmentData.id && (
            <button
              type="button"
              onClick={handleDelete}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Delete
            </button>
          )}
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            {assignmentData.id ? "Update" : "Add"}
          </button>
        </div>
      </form>
    </div>
  );
}
