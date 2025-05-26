import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Fade } from 'react-awesome-reveal';
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../Firebase/FirebaseConfig";
import { AuthContext } from "../Context/UserContext";
import toast, { Toaster } from "react-hot-toast";
import "./ManageProfiles.css"; // Add this import for custom CSS

function ManageProfiles() {
  const { User } = useContext(AuthContext);
  const [profiles, setProfiles] = useState([]);
  const [editingProfile, setEditingProfile] = useState(null);
  const [editedName, setEditedName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!User) {
      navigate("/signin");
      return;
    }

    const fetchProfiles = async () => {
      try {
        const profilesRef = doc(db, "Profiles", User.uid);
        const profilesSnap = await getDoc(profilesRef);
        
        if (profilesSnap.exists() && profilesSnap.data().profiles?.length > 0) {
          setProfiles(profilesSnap.data().profiles);
        }
      } catch (error) {
        console.error("Error fetching profiles:", error);
      }
    };
    
    fetchProfiles();
  }, [User, navigate]);

  const startEditing = (profile) => {
    setEditingProfile(profile);
    setEditedName(profile.name);
  };

  const saveProfileChanges = async () => {
    if (!editingProfile || !editedName.trim()) return;

    try {
      // Create updated profiles array with the edited profile
      const updatedProfiles = profiles.map(profile => 
        profile.id === editingProfile.id 
          ? { ...profile, name: editedName.trim() } 
          : profile
      );

      // Update Firestore
      const profilesRef = doc(db, "Profiles", User.uid);
      await setDoc(profilesRef, { profiles: updatedProfiles });

      // Update local state
      setProfiles(updatedProfiles);
      setEditingProfile(null);
      
      // Show success message
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  // Add a function to handle returning to profiles page
  const returnToProfiles = () => {
    // Set a flag in sessionStorage to indicate we're returning from profile management
    sessionStorage.setItem("returnFromManageProfiles", "true");
    navigate("/profiles");
  };

  const cancelEditing = () => {
    setEditingProfile(null);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <Toaster />
      <Fade>
        <h1 className="text-5xl font-bold mb-16">Manage Profiles</h1>
        
        {editingProfile ? (
          <div className="flex flex-col items-center mb-20">
            <div className="w-[150px] h-[150px] overflow-hidden rounded-md mb-6">
              <img 
                src={editingProfile.photoURL} 
                alt={editingProfile.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className="bg-gray-700 text-white px-4 py-2 rounded mb-6 w-64"
              placeholder="Profile Name"
            />
            
            <div className="flex space-x-4">
              <button 
                onClick={saveProfileChanges}
                className="bg-white text-black px-6 py-2 rounded hover:bg-gray-300"
              >
                Save
              </button>
              <button 
                onClick={cancelEditing}
                className="bg-transparent border border-gray-600 text-gray-400 px-6 py-2 rounded hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-20">
              {profiles.map((profile) => (
                <div 
                  key={profile.id} 
                  className="flex flex-col items-center cursor-pointer group"
                  onClick={() => startEditing(profile)}
                >
                  <div className="relative w-[120px] h-[120px] overflow-hidden rounded-md border-2 border-transparent group-hover:border-white transition-all duration-200">
                    <img 
                      src={profile.photoURL} 
                      alt={profile.name}
                      className="w-full h-full object-cover opacity-50"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </div>
                  </div>
                  <p className="mt-3 text-gray-400 group-hover:text-white">{profile.name}</p>
                </div>
              ))}
            </div>
          </>
        )}
        
        {/* Always show the Done button at the same position */}
        <div className="fixed-position">
          <button 
            onClick={returnToProfiles}
            className="border border-gray-600 text-gray-400 hover:text-white px-4 py-2 rounded"
          >
            Done
          </button>
        </div>
      </Fade>
    </div>
  );
}

export default ManageProfiles;
