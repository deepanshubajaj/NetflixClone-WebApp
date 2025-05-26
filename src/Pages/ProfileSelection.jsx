import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Fade } from "react-reveal";
import { getAuth, updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../Firebase/FirebaseConfig";
import { AuthContext } from "../Context/UserContext";

function ProfileSelection() {
  const { User, setUser } = useContext(AuthContext);
  const [profiles, setProfiles] = useState([]);
  const navigate = useNavigate();
  // Add a refresh key to force re-fetching profiles
  const [refreshKey, setRefreshKey] = useState(0);

  const addNewProfile = async () => {
    try {
      const profilesRef = doc(db, "Profiles", User.uid);
      const profilesSnap = await getDoc(profilesRef);
      
      if (profilesSnap.exists()) {
        const existingProfiles = profilesSnap.data().profiles || [];
        
        // Check if the profile already exists
        const profileExists = existingProfiles.some(profile => profile.id === "guest");
        
        if (!profileExists) {
          // Add the new profile
          const newProfile = {
            id: "guest",
            name: "Guest",
            photoURL: "https://pro2-bar-s3-cdn-cf1.myportfolio.com/dddb0c1b4ab622854dd81280840458d3/98032aebff601c1d993e12a0_rw_600.png",
            isMain: false
          };
          
          // Find the index of the "kids" profile
          const kidsIndex = existingProfiles.findIndex(profile => profile.id === "kids");
          
          // Create a new array with the guest profile inserted before kids
          let updatedProfiles;
          if (kidsIndex !== -1) {
            updatedProfiles = [
              ...existingProfiles.slice(0, kidsIndex),
              newProfile,
              ...existingProfiles.slice(kidsIndex)
            ];
          } else {
            // If kids profile doesn't exist, just append to the end
            updatedProfiles = [...existingProfiles, newProfile];
          }
          
          // Update Firestore with the new profile added
          await setDoc(profilesRef, { 
            profiles: updatedProfiles
          });
          
          // Update local state
          setProfiles(updatedProfiles);
        }
      }
    } catch (error) {
      console.error("Error adding new profile:", error);
    }
  };

  useEffect(() => {
    // Check if user is logged in
    if (!User) {
      navigate("/signin");
      return;
    }

    const fetchProfiles = async () => {
      try {
        console.log("Fetching profiles for user:", User.uid);
        const profilesRef = doc(db, "Profiles", User.uid);
        const profilesSnap = await getDoc(profilesRef);
        
        if (profilesSnap.exists() && profilesSnap.data().profiles?.length > 0) {
          const fetchedProfiles = profilesSnap.data().profiles;
          console.log("Profiles loaded:", fetchedProfiles);
          setProfiles(fetchedProfiles);
        } else {
          console.log("No profiles found, creating default profiles");
          // Create default profiles if none exist
          const defaultProfiles = [
            {
              id: "main",
              name: User.displayName || "Main",
              photoURL: User.photoURL || "https://i.pinimg.com/originals/ba/2e/44/ba2e4464e0d7b1882cc300feceac683c.png",
              isMain: true
            },
            {
              id: "family",
              name: "Family",
              photoURL: "https://i.pinimg.com/736x/db/70/dc/db70dc468af8c93749d1f587d74dcb08.jpg",
              isMain: false
            },
            {
              id: "extra",
              name: "Extra",
              photoURL: "https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png",
              isMain: false
            },
            {
              id: "guest",
              name: "Guest",
              photoURL: "https://i.pinimg.com/736x/db/70/dc/db70dc468af8c93749d1f587d74dcb08.jpg",
              isMain: false
            },
            {
              id: "kids",
              name: "Children",
              photoURL: "https://ih0.redbubble.net/image.618363037.0853/flat,1000x1000,075,f.u2.jpg",
              isMain: false
            }
          ];
          
          // Save default profiles to Firestore
          await setDoc(profilesRef, { profiles: defaultProfiles });
          setProfiles(defaultProfiles);
        }
      } catch (error) {
        console.error("Error fetching profiles:", error);
      }
    };
    
    // Check if we're returning from profile management or the profile page
    const returnFromManage = sessionStorage.getItem("returnFromManageProfiles");
    const returnFromProfile = sessionStorage.getItem("returnFromProfile");
    
    if (returnFromManage) {
      console.log("Returning from manage profiles, refreshing data");
      // Clear the flag
      sessionStorage.removeItem("returnFromManageProfiles");
    }
    
    if (returnFromProfile) {
      console.log("Returning from profile page, refreshing data");
      // Clear the flag
      sessionStorage.removeItem("returnFromProfile");
    }
    
    // Always fetch profiles when component mounts or refreshKey changes
    fetchProfiles();
    
  }, [User, navigate, refreshKey]);

  const selectProfile = async (profile) => {
    try {
      // Update current profile in user's session
      const auth = getAuth();
      if (auth.currentUser) {
        console.log("Selecting profile:", profile);
        // Update display name to include profile name
        await updateProfile(auth.currentUser, {
          displayName: profile.name,
          photoURL: profile.photoURL
        });
        
        // Store selected profile in localStorage for persistence
        localStorage.setItem("selectedProfile", JSON.stringify(profile));
        
        // Navigate to home page
        navigate("/home");
      }
    } catch (error) {
      console.error("Error selecting profile:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-16 bg-black text-white">
      <Fade>
        <h1 className="text-5xl font-bold mb-16">Who's watching?</h1>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-20">
          {profiles.map((profile) => (
            <div 
              key={profile.id} 
              className="flex flex-col items-center cursor-pointer group"
              onClick={() => selectProfile(profile)}
            >
              <div className="w-[120px] h-[120px] overflow-hidden rounded-md border-2 border-transparent group-hover:border-white transition-all duration-200">
                <img 
                  src={profile.photoURL} 
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="mt-3 text-gray-400 group-hover:text-white">{profile.name}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-10">
          <Link to="/manage-profiles" className="border border-gray-600 text-gray-400 hover:text-white px-4 py-2 rounded">
            Manage Profiles
          </Link>
        </div>
      </Fade>
    </div>
  );
}

export default ProfileSelection;
