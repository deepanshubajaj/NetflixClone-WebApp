import React, { useContext, useState } from "react";
import { updateDoc, doc, arrayUnion, arrayRemove, setDoc, getDoc } from "firebase/firestore";
import { db } from "../Firebase/FirebaseConfig";
import { AuthContext } from "../Context/UserContext";
import toast, { Toaster } from "react-hot-toast";

function useUpdateLikedMovies() {
  const { User } = useContext(AuthContext);
  const [Error, setError] = useState(false);

  function notify() {
    toast.success("  Movie added to Liked List  ");
  }
  function removeNotify() {
    toast.success("  Movie removed from Liked List  ");
  }
  function alertError(message) {
    toast.error(message);
  }

  const addToLikedMovies = (movie) => {
    // First check if the document exists
    getDoc(doc(db, "LikedMovies", User.uid))
      .then((docSnap) => {
        if (docSnap.exists()) {
          // Document exists, update it
          updateDoc(doc(db, "LikedMovies", User.uid), {
            movies: arrayUnion(movie),
          })
            .then(() => {
              notify();
            })
            .catch((error) => {
              console.log(error.code);
              console.log(error.message);
              alertError(error.message);
              setError(true);
            });
        } else {
          // Document doesn't exist, create it
          setDoc(doc(db, "LikedMovies", User.uid), { movies: [movie] })
            .then(() => {
              console.log("LikedMovies created and movie added");
              notify();
            })
            .catch((error) => {
              console.log(error.code);
              console.log(error.message);
              alertError(error.message);
              setError(true);
            });
        }
      })
      .catch((error) => {
        console.log(error.code);
        console.log(error.message);
        alertError(error.message);
        setError(true);
      });
  };

  const removeFromLikedMovies = (movie) => {
    updateDoc(doc(db, "LikedMovies", User.uid), {
      movies: arrayRemove(movie),
    })
      .then(() => {
        removeNotify();
      })
      .catch((error) => {
        console.log(error.code);
        console.log(error.message);
        alertError(error.message);
        setError(true);
      });
  };

  const LikedMoviePopupMessage = (
    <Toaster
      toastOptions={{
        style: {
          padding: "1.5rem",
          backgroundColor: Error ? "#fff4f4" : "#f4fff4",
          borderLeft: Error ? "6px solid red" : "6px solid lightgreen",
        },
      }}
    />
  );

  return { addToLikedMovies, removeFromLikedMovies, LikedMoviePopupMessage };
}

export default useUpdateLikedMovies;
