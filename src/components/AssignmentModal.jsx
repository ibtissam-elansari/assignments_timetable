import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setShowAddAssignmentModal,
  addAssignment,
  updateAssignment,
  deleteAssignment,
} from "../redux/slices";
import { Captions, Play, Pause, User, Users, Plus, Save, Trash2 } from "lucide-react";

export default function AssignmentModal() {
  const dispatch = useDispatch();
  const showAddAssignmentModal = useSelector(
    (state) => state.scheduler.showAddAssignmentModal
  );
  const hours = useSelector((state) => state.scheduler.hours);
  const selectedDay = useSelector((state) => state.scheduler.selectedDay);
  const selectedStartTime = useSelector(
    (state) => state.scheduler.selectedStartTime
  );
  const selectedEndTime = useSelector((state) => state.scheduler.selectedEndTime);
  const assignments = useSelector((state) => state.scheduler.assignments);
  const selectedGroupe = useSelector((state) => state.scheduler.selectedGroupe);
  const selectedFormateur = useSelector(
    (state) => state.scheduler.selectedFormateur
  );
  const salles = useSelector((state) => state.scheduler.salles || []); // Default to empty array if undefined

  // Memoize timeSlots to avoid recomputation unless hours changes
  const timeSlots = useMemo(() => hours?.flatMap((hour) => hour.subHours) || [], [hours]);

  // Memoize existingAssignment to stabilize its reference
  const existingAssignment = useMemo(() => {
    return assignments.find(
      (assignment) =>
        assignment.day === selectedDay &&
        assignment.startTime === selectedStartTime &&
        assignment.endTime === selectedEndTime &&
        (assignment.groupe.codeGroupe === selectedGroupe || assignment.formateur.matricule === selectedFormateur)
    );
  }, [assignments, selectedDay, selectedStartTime, selectedEndTime, selectedGroupe, selectedFormateur]);

  // Memoize unique groups and formateurs for select options
  const uniqueGroups = useMemo(() => {
    return assignments
      .map((assignment) => assignment.groupe)
      .filter(
        (groupe, index, self) => groupe && index === self.findIndex((g) => g.codeGroupe === groupe.codeGroupe)
      );
  }, [assignments]);

  const uniqueFormateurs = useMemo(() => {
    return assignments
      .map((assignment) => assignment.formateur)
      .filter(
        (formateur, index, self) =>
          formateur && index === self.findIndex((f) => f.matricule === formateur.matricule)
      );
  }, [assignments]);

  const [assignmentData, setAssignmentData] = useState({
    title: "",
    formateur: {
      matricule: "",
      nom: "",
      email: "",
      secteur: "",
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
      assignments.find((assignment) => assignment.groupe.codeGroupe === codeGroupe)?.groupe || {}
    );
  };

  const findFormateurDetails = (matricule) => {
    return (
      assignments.find((assignment) => assignment.formateur.matricule === matricule)?.formateur || {}
    );
  };

  const getFormateursForGroup = (group) => {
    return assignments
      .filter((assignment) => assignment.groupe.codeGroupe === group?.codeGroupe)
      .map((assignment) => assignment.formateur)
      .filter(
        (formateur, index, self) =>
          formateur &&
          index === self.findIndex((f) => f?.matricule === formateur?.matricule)
      );
  };

  const getGroupsForFormateur = (formateur) => {
    return assignments
      .filter((assignment) => assignment.formateur?.matricule === formateur?.matricule)
      .map((assignment) => assignment.groupe)
      .filter(
        (groupe, index, self) =>
          groupe &&
          index === self.findIndex((g) => g?.codeGroupe === groupe?.codeGroupe)
      );
  };

  useEffect(() => {
    if (showAddAssignmentModal && selectedStartTime && selectedEndTime) {
      if (existingAssignment) {
        setAssignmentData(existingAssignment);
      } else {
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
  }, [showAddAssignmentModal, selectedStartTime, selectedEndTime, selectedGroupe, selectedFormateur]);

  const handleClose = () => {
    dispatch(setShowAddAssignmentModal(false));
    resetForm();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { title, startTime, endTime, formateur, salle } = assignmentData;
    if (!title || !startTime || !endTime || !formateur.matricule || !salle) {
      alert("Please fill in all required fields.");
      return;
    }

    const updatedAssignmentData = {
      ...assignmentData,
      day: selectedDay || assignmentData.day,
    };

    if (updatedAssignmentData.id) {
      dispatch(updateAssignment(updatedAssignmentData));
    } else {
      dispatch(
        addAssignment({
          ...updatedAssignmentData,
          id: Date.now().toString(),
        })
      );
    }
    handleClose();
  };

  const handleDelete = () => {
    if (assignmentData.id) {
      dispatch(deleteAssignment(assignmentData.id));
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
        secteur: "",
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

  const renderFields = () => {
    // Show select dropdowns for both if neither selectedGroupe nor selectedFormateur is selected
    if (!selectedGroupe && !selectedFormateur) {
      return (
        <>
          <div className="form-control">
            <label className="label">
              <span className="label-text flex items-center gap-2">
                <Users className="w-4 h-4" />
                Groupe
              </span>
            </label>
            <select
              value={assignmentData.groupe?.codeGroupe || ""}
              onChange={(e) => {
                const codeGroupe = e.target.value;
                const selectedGroup = uniqueGroups.find((g) => g.codeGroupe === codeGroupe) || {
                  codeGroupe: "",
                  intituleGroupe: "",
                  filiere: "",
                  secteur: "",
                };
                setAssignmentData({
                  ...assignmentData,
                  groupe: selectedGroup,
                  formateur: { matricule: "", nom: "", email: "", secteur: "" }, // Clear formateur
                });
              }}
              className="select select-bordered w-full"
              required
            >
              <option value="">Select Groupe</option>
              {uniqueGroups.map((group, index) => (
                <option key={index} value={group.codeGroupe}>
                  {group.intituleGroupe} ({group.codeGroupe})
                </option>
              ))}
            </select>
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text flex items-center gap-2">
                <User className="w-4 h-4" />
                Formateur
              </span>
            </label>
            <select
              value={assignmentData.formateur?.matricule || ""}
              onChange={(e) => {
                const matricule = e.target.value;
                const selectedFormateur = uniqueFormateurs.find((f) => f.matricule === matricule) || {
                  matricule: "",
                  nom: "",
                  email: "",
                  secteur: "",
                };
                setAssignmentData({
                  ...assignmentData,
                  formateur: selectedFormateur,
                  groupe: { codeGroupe: "", intituleGroupe: "", filiere: "", secteur: "" }, // Clear groupe
                });
              }}
              className="select select-bordered w-full"
              required
            >
              <option value="">Select Formateur</option>
              {uniqueFormateurs.map((formateur, index) => (
                <option key={index} value={formateur.matricule}>
                  {formateur.nom} ({formateur.matricule})
                </option>
              ))}
            </select>
          </div>
        </>
      );
    }

    // Existing logic for when either selectedGroupe or selectedFormateur is selected
    const fieldsConfig = selectedGroupe
      ? [
          {
            label: "Formateur",
            icon: User,
            value: assignmentData.formateur?.matricule || "",
            options: getFormateursForGroup(assignmentData.groupe).map((formateur) => ({
              value: formateur.matricule,
              label: formateur.nom,
            })),
            onChange: (matricule) =>
              setAssignmentData({
                ...assignmentData,
                formateur: getFormateursForGroup(assignmentData.groupe).find(
                  (f) => f.matricule === matricule
                ) || { matricule: "", nom: "", email: "", secteur: "" },
              }),
          },
        ]
      : [
          {
            label: "Groupe",
            icon: Users,
            value: assignmentData.groupe?.codeGroupe || "",
            options: getGroupsForFormateur(assignmentData.formateur).map((groupe) => ({
              value: groupe.codeGroupe,
              label: groupe.intituleGroupe,
            })),
            onChange: (codeGroupe) =>
              setAssignmentData({
                ...assignmentData,
                groupe: getGroupsForFormateur(assignmentData.formateur).find(
                  (g) => g.codeGroupe === codeGroupe
                ) || { codeGroupe: "", intituleGroupe: "", filiere: "", secteur: "" },
              }),
          },
        ];

    return fieldsConfig.map((field, index) => (
      <div key={index} className="form-control">
        <label className="label">
          <span className="label-text flex items-center gap-2">
            <field.icon className="w-4 h-4" />
            {field.label}
          </span>
        </label>
        <select
          value={field.value}
          onChange={(e) => field.onChange(e.target.value)}
          className="select select-bordered w-full"
          required
        >
          <option value="">Select {field.label}</option>
          {field.options.map((option, idx) => (
            <option key={idx} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    ));
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md bg-gray-500/20">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-200">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">
          {assignmentData.id ? "Edit Assignment" : "Add Assignment"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="form-control">
            <label className="label">
              <span className="label-text flex items-center gap-2">
                <Captions className="w-4 h-4" />
                Title
              </span>
            </label>
            <input
              type="text"
              value={assignmentData.title}
              onChange={(e) =>
                setAssignmentData({ ...assignmentData, title: e.target.value })
              }
              className="input input-bordered w-full text-gray-900"
              placeholder="Assignment title"
              required
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text flex items-center gap-2">
                <Play className="w-4 h-4" />
                Start Time
              </span>
            </label>
            <select
              value={assignmentData.startTime}
              onChange={(e) =>
                setAssignmentData({ ...assignmentData, startTime: e.target.value })
              }
              className="select select-bordered w-full text-gray-900"
              required
            >
              <option value="">Select Start Time</option>
              {timeSlots.map((slot, index) => (
                <option key={index} value={slot.startTime}>
                  {slot.startTime}
                </option>
              ))}
            </select>
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text flex items-center gap-2">
                <Pause className="w-4 h-4" />
                End Time
              </span>
            </label>
            <select
              value={assignmentData.endTime}
              onChange={(e) =>
                setAssignmentData({ ...assignmentData, endTime: e.target.value })
              }
              className="select select-bordered w-full text-gray-900"
              required
            >
              <option value="">Select End Time</option>
              {timeSlots.map((slot, index) => (
                <option key={index} value={slot.endTime}>
                  {slot.endTime}
                </option>
              ))}
            </select>
          </div>
          {renderFields()}
          <div className="form-control">
            <label className="label">
              <span className="label-text flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Salle
              </span>
            </label>
            <select
              value={assignmentData.salle}
              onChange={(e) =>
                setAssignmentData({ ...assignmentData, salle: e.target.value })
              }
              className="select select-bordered w-full text-gray-900"
              required
            >
              <option value="">Select la salle</option>
              {salles.map((salle, index) => (
                <option key={index} value={salle}>
                  {salle}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-between items-center mt-6">
            <button type="submit" className="btn btn-primary" aria-label="Save Assignment">
              <Save className="w-4 h-4 mr-2" />
              {assignmentData.id ? "Update" : "Add"}
            </button>
            {assignmentData.id && (
              <button
                type="button"
                className="btn btn-error"
                onClick={handleDelete}
                aria-label="Delete Assignment"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
            )}
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-ghost text-gray-900"
              aria-label="Close Modal"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}