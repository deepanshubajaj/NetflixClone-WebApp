import React, { useContext, useState } from "react";
import { updateDoc, doc, arrayUnion, arrayRemove, setDoc, getDoc } from "firebase/firestore";
import { db } from "../Firebase/FirebaseConfig";
import { AuthContext } from "../Context/UserContext";
import toast, { Toaster } from "react-hot-toast";

function useUpdateWatchedMovies() {
  const { User } = useContext(AuthContext);
  const [Error, setError] = useState(false);

  function notify() {
    toast.success("  Movie added to Watched List  ");
  }
  function removeNotify() {
    toast.success("  Movie removed from Watched List  ");
  }
  function alertError(message) {
    toast.error(message);
  }

  const addToWatchedMovies = (movie) => {
    // First check if the document exists
    getDoc(doc(db, "WatchedMovies", User.uid))
      .then((docSnap) => {
        if (docSnap.exists()) {
          // Document exists, update it
          updateDoc(doc(db, "WatchedMovies", User.uid), {
            movies: arrayUnion(movie),
          })
            .then(() => {
              console.log("Movie added to Watched List");
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
          setDoc(doc(db, "WatchedMovies", User.uid), { movies: [movie] })
            .then(() => {
              console.log("WatchedMovies created and movie added");
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

  const removeFromWatchedMovies = (movie) => {
    updateDoc(doc(db, "WatchedMovies", User.uid), {
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

  const removePopupMessage = (
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

  return { addToWatchedMovies, removeFromWatchedMovies, removePopupMessage };
}

export default useUpdateWatchedMovies;
