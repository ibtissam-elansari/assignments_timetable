import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setSelectedFormateur,
  setSelectedGroupe,
} from '../redux/slices';
import { User, Users } from 'lucide-react';
import SidebarCollapsible, { SidebarItem } from './SidebarCollapsible';

function Sidebar() {
  const selectedGroupe = useSelector((state) => state.scheduler.selectedGroupe);
  const selectedFormateur = useSelector((state) => state.scheduler.selectedFormateur);
  const assignments = useSelector((state) => state.scheduler.assignments);
  const dispatch = useDispatch();

  // Memoize uniqueGroups to stabilize its reference
  const uniqueGroups = useMemo(() => {
    return assignments
      .map((assignment) => assignment.groupe)
      .filter(
        (groupe, index, self) => groupe && index === self.findIndex((g) => g.codeGroupe === groupe.codeGroupe)
      );
  }, [assignments]);

  // Memoize uniqueFormateurs to stabilize its reference
  const uniqueFormateurs = useMemo(() => {
    return assignments
      .map((assignment) => assignment.formateur)
      .filter(
        (formateur, index, self) =>
          formateur && index === self.findIndex((f) => f.matricule === formateur.matricule)
      );
  }, [assignments]);

  // Memoize filieres to stabilize its reference
  const filieres = useMemo(() => {
    return uniqueGroups
      .map((group) => ({
        filiere: group?.filiere,
        secteur: group?.secteur,
      }))
      .filter((filiere) => filiere.filiere && filiere.secteur);
  }, [uniqueGroups]);

  const [selectedSecteur, setSelectedSecteur] = useState('');
  const [selectedFiliere, setSelectedFiliere] = useState('');
  const [filteredFilieres, setFilteredFilieres] = useState([]);
  const [selectedFormateurSecteur, setSelectedFormateurSecteur] = useState('');
  const [filteredFormateurs, setFilteredFormateurs] = useState(uniqueFormateurs);

  // Memoize secteurs to avoid recomputation
  const secteurs = useMemo(() => {
    return [...new Set(uniqueGroups.map((group) => group?.secteur).filter(Boolean))];
  }, [uniqueGroups]);

  // Filter formateurs by selected secteur
  useEffect(() => {
    if (selectedFormateurSecteur) {
      const updatedFormateurs = uniqueFormateurs.filter(
        (formateur) => formateur?.secteur === selectedFormateurSecteur
      );
      // Only update if different
      if (updatedFormateurs.length !== filteredFormateurs.length ||
          updatedFormateurs.some((f, i) => f?.matricule !== filteredFormateurs[i]?.matricule)) {
        setFilteredFormateurs(updatedFormateurs);
      }
    } else {
      if (uniqueFormateurs.length !== filteredFormateurs.length ||
          uniqueFormateurs.some((f, i) => f?.matricule !== filteredFormateurs[i]?.matricule)) {
        setFilteredFormateurs(uniqueFormateurs);
      }
    }
  }, [uniqueFormateurs, selectedFormateurSecteur]);

  // Update filtered filieres when secteur changes
  useEffect(() => {
    if (selectedSecteur) {
      const updatedFilieres = filieres
        .filter((filiere) => filiere.secteur === selectedSecteur)
        .map((filiere) => filiere.filiere);
      // Only update if different
      if (JSON.stringify(updatedFilieres) !== JSON.stringify(filteredFilieres)) {
        setFilteredFilieres(updatedFilieres);
      }
    } else {
      const allFilieres = [...new Set(filieres.map((filiere) => filiere.filiere))];
      if (JSON.stringify(allFilieres) !== JSON.stringify(filteredFilieres)) {
        setFilteredFilieres(allFilieres);
      }
    }
  }, [selectedSecteur, filieres]);

  // Automatically update secteur when filiere changes
  useEffect(() => {
    if (selectedFiliere) {
      const associatedSecteur = filieres.find(
        (filiere) => filiere.filiere === selectedFiliere
      )?.secteur;
      if (associatedSecteur && associatedSecteur !== selectedSecteur) {
        setSelectedSecteur(associatedSecteur);
      }
    }
  }, [selectedFiliere, filieres, selectedSecteur]);

  // Filter groups based on selected secteur and filiere
  const filteredGroups = uniqueGroups.filter((group) => {
    const secteurMatches = selectedSecteur ? group?.secteur === selectedSecteur : true;
    const filiereMatches = selectedFiliere ? group?.filiere === selectedFiliere : true;
    return secteurMatches && filiereMatches;
  });

  const handleSelectGroupe = (groupe) => {
    dispatch(setSelectedGroupe(groupe));
    dispatch(setSelectedFormateur(null)); // Clear formateur selection when selecting a group
  };

  const handleSelectFormateur = (formateur) => {
    dispatch(setSelectedFormateur(formateur));
    dispatch(setSelectedGroupe(null)); // Clear group selection when selecting a formateur
  };

  return (
    <SidebarCollapsible>
      <SidebarItem icon={<Users size={20} />} text="Groups" id="groups">
        <div className="flex flex-col space-y-4">
          <div className="space-y-2">
            <select
              value={selectedSecteur}
              onChange={(e) => {
                setSelectedSecteur(e.target.value);
                setSelectedFiliere('');
              }}
              className="select select-bordered w-full"
            >
              <option value="">All Secteurs</option>
              {secteurs.map((secteur) => (
                <option key={secteur} value={secteur}>
                  {secteur}
                </option>
              ))}
            </select>

            <select
              value={selectedFiliere}
              onChange={(e) => setSelectedFiliere(e.target.value)}
              className="select select-bordered w-full"
            >
              <option value="">All Filieres</option>
              {filteredFilieres.map((filiere, index) => (
                <option key={index} value={filiere}>
                  {filiere}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4 overflow-y-auto flex-1 max-h-[300px]">
            <div className="space-y-2">
              {filteredGroups.length > 0 ? (
                filteredGroups.map((group, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border transition-all ${
                      selectedGroupe === group.codeGroupe
                        ? 'bg-primary text-primary-content hover:bg-primary/90'
                        : 'hover:bg-gray-100'
                    } cursor-pointer`}
                    onClick={() => handleSelectGroupe(group.codeGroupe)}
                  >
                    <h4 className="text-sm font-semibold">{group?.intituleGroupe || 'Unknown Group'}</h4>
                    <p className="text-xs text-gray-500">{group?.filiere || 'N/A'}</p>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500">No groups found.</p>
              )}
            </div>
          </div>
        </div>
      </SidebarItem>

      <SidebarItem icon={<User size={20} />} text="Formateurs" id="formateurs">
        <div className="flex flex-col space-y-4">
          <div className="space-y-2">
            <select
              value={selectedFormateurSecteur}
              onChange={(e) => setSelectedFormateurSecteur(e.target.value)}
              className="select select-bordered w-full"
            >
              <option value="">All Secteurs</option>
              {secteurs.map((secteur) => (
                <option key={secteur} value={secteur}>
                  {secteur}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4 overflow-y-auto flex-1 max-h-[300px]">
            <div className="space-y-2">
              {filteredFormateurs.length > 0 ? (
                filteredFormateurs.map((formateur, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border transition-all ${
                      selectedFormateur === formateur.matricule
                        ? 'bg-primary text-primary-content hover:bg-primary/90'
                        : 'hover:bg-gray-100'
                    } cursor-pointer`}
                    onClick={() => handleSelectFormateur(formateur.matricule)}
                  >
                    <h4 className="text-sm font-semibold">{formateur?.nom || 'Unknown Formateur'}</h4>
                    <p className="text-xs text-gray-500">{formateur?.email || 'N/A'}</p>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500">No formateurs found.</p>
              )}
            </div>
          </div>
        </div>
      </SidebarItem>
    </SidebarCollapsible>
  );
}

export default Sidebar;