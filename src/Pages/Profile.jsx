import React, { useState, useContext, useEffect, useRef } from "react";
import { getAuth, updateProfile, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { Fade } from 'react-awesome-reveal';
import toast, { Toaster } from "react-hot-toast";
import { uploadToCloudinary } from "../utils/cloudinaryConfig";
import { AuthContext } from "../Context/UserContext";
import WelcomePageBanner from "../images/WelcomePageBanner.jpg";
import Loading from "../componets/Loading/Loading";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../Firebase/FirebaseConfig";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

function Profile() {
  const { User, setUser } = useContext(AuthContext);

  const [profilePic, setProfilePic] = useState("");
  const [newProfielPicURL, setNewProfielPicURL] = useState("");
  const [newProfielPic, setNewProfielPic] = useState("");
  const [isUserNameChanged, setIsUserNameChanged] = useState(false);
  const [userName, setUserName] = useState("");
  const [isMyListUpdated, setisMyListUpdated] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (User != null) {
      console.log(User.photoURL);
      setProfilePic(User.photoURL);
    }
  }, [User, refreshKey]);

  const inputRef = useRef(null);

  const handleClick = () => {
    inputRef.current.click();
  };

  function notify() {
    toast.success("  Data Updated Sucessfuly  ");
  }

  const handleFileChange = (event) => {
    const fileObj = event.target.files && event.target.files[0];
    if (!fileObj) {
      return;
    }

    // Check file type
    if (!fileObj.type.match('image.*')) {
      toast.error("Please select an image file");
      return;
    }

    // Check file size (limit to 5MB)
    if (fileObj.size > 5 * 1024 * 1024) {
      toast.error("File size too large. Please select an image under 5MB");
      return;
    }

    setNewProfielPic(fileObj);
    setNewProfielPicURL(URL.createObjectURL(fileObj));
    console.log("fileObj is", fileObj);
    event.target.value = null;
  };

  const changeUserName = async (e) => {
    e.preventDefault();
    console.log("Save button clicked");

    // Show loading toast
    const loadingToast = toast.loading("Updating profile...");
    setIsUploading(true);

    try {
      const auth = getAuth();

      // Update username if changed
      if (isUserNameChanged && userName !== "") {
        await updateProfile(auth.currentUser, { displayName: userName });
        console.log("Username updated successfully");
      }

      // Upload profile picture if selected
      let imageUrl = profilePic;
      if (newProfielPic) {
        try {
          console.log("Uploading profile picture:", newProfielPic);

          // Upload to Cloudinary
          imageUrl = await uploadToCloudinary(newProfielPic);
          console.log("Image uploaded to Cloudinary:", imageUrl);

          // Update Firebase profile with Cloudinary URL
          await updateProfile(auth.currentUser, { photoURL: imageUrl });
          console.log("Profile picture updated successfully");

          // Update local state
          setProfilePic(imageUrl);
        } catch (error) {
          console.error("Error uploading image:", error);
          toast.dismiss(loadingToast);
          toast.error("Failed to upload image: " + (error.message || "Unknown error"));
          setIsUploading(false);
          return;
        }
      }

      // Update the profile in Profiles collection
      try {
        // Get the selected profile from localStorage
        const selectedProfileStr = localStorage.getItem("selectedProfile");
        if (selectedProfileStr) {
          const selectedProfile = JSON.parse(selectedProfileStr);
          console.log("Selected profile:", selectedProfile);

          // Get all profiles
          const profilesRef = doc(db, "Profiles", User.uid);
          const profilesSnap = await getDoc(profilesRef);

          if (profilesSnap.exists()) {
            const profiles = profilesSnap.data().profiles || [];
            console.log("All profiles before update:", profiles);

            // Update the selected profile
            const updatedProfiles = profiles.map(profile => {
              if (profile.id === selectedProfile.id) {
                console.log(`Updating profile ${profile.id} from ${profile.name} to ${userName || profile.name}`);
                return {
                  ...profile,
                  name: isUserNameChanged && userName !== "" ? userName : profile.name,
                  photoURL: newProfielPic ? imageUrl : profile.photoURL
                };
              }
              return profile;
            });

            console.log("All profiles after update:", updatedProfiles);

            // Save updated profiles back to Firestore
            await setDoc(profilesRef, { profiles: updatedProfiles });
            console.log("Profile updated in Profiles collection");

            // Update the selected profile in localStorage
            const updatedSelectedProfile = {
              ...selectedProfile,
              name: isUserNameChanged && userName !== "" ? userName : selectedProfile.name,
              photoURL: newProfielPic ? imageUrl : selectedProfile.photoURL
            };
            localStorage.setItem("selectedProfile", JSON.stringify(updatedSelectedProfile));
            console.log("Updated selected profile in localStorage:", updatedSelectedProfile);
          }
        }
      } catch (error) {
        console.error("Error updating profile in Profiles collection:", error);
      }

      // Success - dismiss loading toast and show success toast
      toast.dismiss(loadingToast);
      toast.success("Profile updated successfully");

      // Reset states
      setisMyListUpdated(true);
      setNewProfielPic("");
      setNewProfielPicURL("");
      setIsUserNameChanged(false);
      setIsUploading(false);

      // Show loading screen
      setIsLoading(true);

      // Wait a moment to show the success toast
      setTimeout(() => {
        // Set a flag in sessionStorage to indicate we're returning from the profile page
        sessionStorage.setItem("returnFromProfile", "true");

        // Navigate to profiles page to see the updated profile
        navigate("/profiles");
        setIsLoading(false);
      }, 1500);

    } catch (error) {
      console.error("Error updating profile:", error);
      toast.dismiss(loadingToast);
      toast.error("Failed to update profile: " + (error.message || "Unknown error"));
      setIsUploading(false);
    }
  };

  const updateProfilePic = async (imageURL) => {
    const auth = getAuth();
    try {
      // Update Firebase Auth profile
      await updateProfile(auth.currentUser, { photoURL: imageURL });
      setProfilePic(imageURL);

      // Update the profile in Profiles collection
      const selectedProfileStr = localStorage.getItem("selectedProfile");
      if (selectedProfileStr) {
        const selectedProfile = JSON.parse(selectedProfileStr);

        // Get all profiles
        const profilesRef = doc(db, "Profiles", User.uid);
        const profilesSnap = await getDoc(profilesRef);

        if (profilesSnap.exists()) {
          const profiles = profilesSnap.data().profiles || [];

          // Update the selected profile
          const updatedProfiles = profiles.map(profile =>
            profile.id === selectedProfile.id
              ? { ...profile, photoURL: imageURL }
              : profile
          );

          // Save updated profiles back to Firestore
          await setDoc(profilesRef, { profiles: updatedProfiles });
          console.log("Profile picture updated in Profiles collection");

          // Update the selected profile in localStorage
          const updatedSelectedProfile = {
            ...selectedProfile,
            photoURL: imageURL
          };
          localStorage.setItem("selectedProfile", JSON.stringify(updatedSelectedProfile));
        }
      }

      notify();
    } catch (error) {
      alert(error.message);
    }
  };

  const SignOut = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        navigate("/");
      })
      .catch((error) => {
        alert(error.message);
      });
  };

  return (
    <div>
      {isLoading ? (
        <Loading />
      ) : (
        <div
          className="flex h-screen justify-center items-center"
          style={{
            backgroundImage: `linear-gradient(0deg, hsl(0deg 0% 0% / 73%) 0%, hsl(0deg 0% 0% / 73%) 35%), url(${WelcomePageBanner})`,
          }}
        >
          {isMyListUpdated ? (
            <Toaster
              toastOptions={{
                style: {
                  padding: "1.5rem",
                  backgroundColor: "##f4fff4",
                  borderLeft: "6px solid green",
                },
              }}
            />
          ) : null}
          <Fade>
            <div className="bg-[#000000bf] p-5 md:p-12 rounded-md">
              <h1 className="text-4xl text-white font-bold mb-4 md:mb-8">
                Edit your Profile
              </h1>
              <div className="flex justify-center flex-col items-center md:flex-row md:items-start">
                <img
                  className={
                    profilePic
                      ? "h-28 w-28 rounded-full cursor-pointer mb-3 md:mr-16"
                      : "h-28 w-28 rounded-full cursor-pointer mb-3 md:mr-16"
                  }
                  src={
                    profilePic
                      ? `${profilePic}`
                      : `https://www.citypng.com/public/uploads/preview/profile-user-round-red-icon-symbol-download-png-11639594337tco5j3n0ix.png`
                  }
                  alt="NETFLIX"
                />
                <div>
                  <hr className="mb-2 h-px bg-gray-500 border-0 dark:bg-gray-700"></hr>
                  <h1 className="text-white text-lg font-medium mb-2">
                    User Name
                  </h1>
                  <input
                    type="text"
                    onChange={(e) =>
                      setUserName(e.target.value) || setIsUserNameChanged(true)
                    }
                    className="block w-full rounded-md bg-stone-900 text-white border-gray-300 p-2 mb-6 focus:border-indigo-500 focus:ring-indigo-500 sm:text-base"
                    placeholder={User ? User.displayName : null}
                  />
                  <h1 className="text-white text-lg font-medium mb-2">Email</h1>
                  <h1 className="text-white text-xl bg-stone-900 p-2 rounded mb-4 md:pr-52">
                    {User ? User.email : null}
                  </h1>
                  <h1 className="text-white text-xl p-2 rounded mb-4">
                    Unique ID : {User ? User.uid : null}
                  </h1>
                  <hr className="h-px bg-gray-500 border-0 mb-4 md:mb-10 dark:bg-gray-700"></hr>

                  <h1 className="text-white text-lg font-medium mb-4">
                    Who is Watching ?
                  </h1>
                  <div className="flex justify-between cursor-pointer mb-4 md:mb-8">
                    <img
                      onClick={() =>
                        updateProfilePic(
                          "https://i.pinimg.com/originals/ba/2e/44/ba2e4464e0d7b1882cc300feceac683c.png"
                        )
                      }
                      className="w-16 h-16 rounded-md cursor-pointer"
                      src="https://i.pinimg.com/originals/ba/2e/44/ba2e4464e0d7b1882cc300feceac683c.png"
                    />
                    <img
                      onClick={() =>
                        updateProfilePic(
                          "https://i.pinimg.com/736x/db/70/dc/db70dc468af8c93749d1f587d74dcb08.jpg"
                        )
                      }
                      className="w-16 h-16 rounded-md cursor-pointer"
                      src="https://i.pinimg.com/736x/db/70/dc/db70dc468af8c93749d1f587d74dcb08.jpg"
                    />
                    <img
                      onClick={() =>
                        updateProfilePic(
                          "https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png"
                        )
                      }
                      className="w-16 h-16 rounded-md cursor-pointer"
                      src="https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png"
                    />
                    <img
                      onClick={() =>
                        updateProfilePic(
                          "https://ih0.redbubble.net/image.618363037.0853/flat,1000x1000,075,f.u2.jpg"
                        )
                      }
                      className="w-16 h-16 rounded-md cursor-pointer"
                      src="https://ih0.redbubble.net/image.618363037.0853/flat,1000x1000,075,f.u2.jpg"
                    />
                    <input
                      style={{ display: "none" }}
                      ref={inputRef}
                      type="file"
                      onChange={handleFileChange}
                    />
                    <svg
                      onClick={handleClick}
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 text-stone-600 cursor-pointer"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  {newProfielPicURL ? (
                    <img className="h-30 w-72" src={newProfielPicURL} />
                  ) : null}
                </div>
              </div>
              <div className="flex justify-between mt-4">
                <button
                  onClick={SignOut}
                  className="flex items-center border-[0.7px] border-white text-white font-medium sm:font-bold text-xs px-14 md:px-24 md:text-xl  py-3 rounded shadow hover:shadow-lg hover:bg-white hover:border-white hover:text-red-700 outline-none focus:outline-none mr-3 mb-1 ease-linear transition-all duration-150"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6 mr-2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M22 10.5h-6m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z"
                    />
                  </svg>
                  SignOut
                </button>
                {userName != "" || newProfielPic != "" ? (
                  <button
                    onClick={changeUserName}
                    disabled={isUploading}
                    className={`bg-red-600 text-white py-2 px-4 rounded ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-700'}`}
                  >
                    {isUploading ? 'Updating...' : 'Save and continue'}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      // Set a flag in sessionStorage to indicate we're returning from the profile page
                      sessionStorage.setItem("returnFromProfile", "true");
                      navigate("/profiles");
                    }}
                    className="flex items-center bg-red-700 text-white font-medium sm:font-bold text-xs px-10 md:px-16 md:text-xl py-3 rounded shadow hover:shadow-lg hover:bg-white hover:text-red-700 outline-none focus:outline-none mr-3 mb-1 ease-linear transition-all duration-150"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-6 h-6 mr-2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                      />
                    </svg>
                    Back to Profiles
                  </button>
                )}
              </div>
            </div>
          </Fade>
        </div>
      )}
    </div>
  );
}

export default Profile;
