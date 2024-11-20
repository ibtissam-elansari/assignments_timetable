import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedFormateur, setSelectedGroupe } from '../redux/slices';

function Sidebar() {
  const selectedGroupe = useSelector((state) => state.calendar.selectedGroupe);
  const selectedFormateur = useSelector((state) => state.calendar.selectedFormateur);
  const assignments = useSelector((state) => state.calendar.assignments);
  const dispatch = useDispatch();

  // Extract unique groups and formateurs
  const uniqueGroups = assignments
    .map((assignment) => assignment.groupe)
    .filter(
      (groupe, index, self) =>
        index === self.findIndex((g) => g.codeGroupe === groupe.codeGroupe)
    );

  const uniqueFormateurs = assignments
    .map((assignment) => assignment.formateur)
    .filter(
      (formateur, index, self) =>
        index === self.findIndex((f) => f.matricule === formateur.matricule)
    );

  // State for filters
  const [selectedSecteur, setSelectedSecteur] = useState('');
  const [selectedFiliere, setSelectedFiliere] = useState('');
  const [filteredFilieres, setFilteredFilieres] = useState([]);
  const [selectedFormateurSecteur, setSelectedFormateurSecteur] = useState('');
  const [filteredFormateurs, setFilteredFormateurs] = useState(uniqueFormateurs);

  // Extract unique secteurs and filieres
  const secteurs = [...new Set(uniqueGroups.map((group) => group.secteur))];
  const filieres = uniqueGroups.map((group) => ({
    filiere: group.filiere,
    secteur: group.secteur,
  }));

  // Filter formateurs by selected secteur
  useEffect(() => {
    if (selectedFormateurSecteur) {
      const updatedFormateurs = uniqueFormateurs.filter(
        (formateur) => formateur.secteur === selectedFormateurSecteur
      );
      if (JSON.stringify(updatedFormateurs) !== JSON.stringify(filteredFormateurs)) {
        setFilteredFormateurs(updatedFormateurs);
      }
    } else if (filteredFormateurs.length !== uniqueFormateurs.length) {
      setFilteredFormateurs(uniqueFormateurs);
    }
  }, [uniqueFormateurs]);

  // Update filtered filieres when secteur changes
  useEffect(() => {
    if (selectedSecteur) {
      const updatedFilieres = filieres
        .filter((filiere) => filiere.secteur === selectedSecteur)
        .map((filiere) => filiere.filiere);
  
      // Only update if the new filtered list is different from the current one
      if (JSON.stringify(updatedFilieres) !== JSON.stringify(filteredFilieres)) {
        setFilteredFilieres(updatedFilieres);
      }
    } else {
      // Reset to all available filieres if no secteur is selected
      const allFilieres = [...new Set(filieres.map((filiere) => filiere.filiere))];
      if (JSON.stringify(allFilieres) !== JSON.stringify(filteredFilieres)) {
        setFilteredFilieres(allFilieres);
      }
    }
  }, [selectedSecteur, filieres]); // Trigger on changes to selectedSecteur or filieres
  
  

  // Automatically update secteur when filiere changes
  useEffect(() => {
    if (selectedFiliere) {
      const associatedSecteur = filieres.find(
        (filiere) => filiere.filiere === selectedFiliere
      )?.secteur;

      // Only update if the secteur is actually different
      if (associatedSecteur && associatedSecteur !== selectedSecteur) {
        setSelectedSecteur(associatedSecteur);
      }
    }
  }, [selectedFiliere, filieres, selectedSecteur]);

  // Define filteredGroups based on the selected secteur and filiere
  const filteredGroups = uniqueGroups.filter((group) => {
    const secteurMatches = selectedSecteur ? group.secteur === selectedSecteur : true;
    const filiereMatches = selectedFiliere ? group.filiere === selectedFiliere : true;
    return secteurMatches && filiereMatches;
  });

  const handleSelectGroupe = (groupe) => {
    if (selectedGroupe !== groupe) {
      dispatch(setSelectedGroupe(groupe)); // Set selected group
      dispatch(setSelectedFormateur(null)); // Clear formateur selection
    }
  };

  const handleSelectFormateur = (formateur) => {
    if (selectedFormateur !== formateur) {
      dispatch(setSelectedFormateur(formateur)); // Set selected formateur
      dispatch(setSelectedGroupe(null)); // Clear group selection
    }
  };

  return (
    <div className="w-41 p-4 bg-white shadow-lg rounded-lg flex flex-col space-y-4">
      <h2 className="text-xl font-semibold text-indigo-600 text-center">Groupes</h2>

      {/* Group Filters Section */}
      <div className="space-y-4">
        <div>
          <select
            value={selectedSecteur}
            onChange={(e) => {
              setSelectedSecteur(e.target.value);
              setSelectedFiliere('');
            }}
            className="w-full p-2 border border-teal-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All Secteurs</option>
            {secteurs.map((secteur, index) => (
              <option key={index} value={secteur}>
                {secteur}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedFiliere}
            onChange={(e) => setSelectedFiliere(e.target.value)}
            className="w-50 p-2 border border-teal-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All Filieres</option>
            {filteredFilieres.map((filiere, index) => (
              <option key={index} value={filiere}>
                {filiere}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Group List */}
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {filteredGroups.length > 0 ? (
          filteredGroups.map((group, index) => (
            <div
              key={index}
              className={`w-45 p-3 border border-teal-300 rounded-lg transition-transform duration-200 cursor-pointer hover:bg-teal-50  ${
                selectedGroupe === group.codeGroupe ? 'bg-teal-100 border-teal-500' : 'bg-white'
              }`}
              onClick={() => handleSelectGroupe(group.codeGroupe)}
            >
              <h3 className="text-sm font-medium text-teal-700 ">{group.intituleGroupe}</h3>
              <p className="text-xs text-gray-500 ">{group.filiere}</p>
              <p className="text-xs text-gray-500 ">{group.secteur}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center">No groups match the selected filters.</p>
        )}
      </div>

      {/* Formateurs Section */}
      <h2 className="text-xl font-semibold text-indigo-600 text-center">Formateurs</h2>
      <div className="space-y-4">
        <div>
          <select
            value={selectedFormateurSecteur}
            onChange={(e) => setSelectedFormateurSecteur(e.target.value)}
            className="w-full p-2 border border-teal-1000 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All Secteurs</option>
            {secteurs.map((secteur, index) => (
              <option key={index} value={secteur}>
                {secteur}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2 max-h-40 overflow-y-auto">
        {filteredFormateurs.length > 0 ? (
          filteredFormateurs.map((formateur, index) => (
            <div
              key={index}
              className={`w-45 p-3 border border-teal-300 rounded-lg transition-transform duration-200 cursor-pointer hover:bg-teal-50  ${
                selectedFormateur === formateur.matricule ? 'bg-teal-100 border-teal-500' : 'bg-white'
              }`}
              onClick={() => handleSelectFormateur(formateur.matricule)}
            >
              <h3 className="text-sm font-medium text-teal-700 ">{formateur.nom}</h3>
              <p className="text-xs text-gray-500 ">{formateur.email}</p>
              <p className="text-xs text-gray-500 ">{formateur.secteur}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center">No formateurs found.</p>
        )}
      </div>
    </div>
  );
}

export default Sidebar;
