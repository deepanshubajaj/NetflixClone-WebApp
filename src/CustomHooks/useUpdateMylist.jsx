import React, { useContext, useState } from "react";
import { updateDoc, doc, arrayUnion, arrayRemove, setDoc, getDoc } from "firebase/firestore";
import { db } from "../Firebase/FirebaseConfig";
import { AuthContext } from "../Context/UserContext";
import toast, { Toaster } from "react-hot-toast";

function useUpdateMylist() {
  const { User } = useContext(AuthContext);
  const [isMyListUpdates, setisMyListUpdates] = useState(false);

  function notify() {
    toast.success("  Movie added to MyList  ");
  }
  function alertError(message) {
    toast.error(message);
  }

  const addToMyList = (movie) => {
    // First check if the document exists
    getDoc(doc(db, "MyList", User.uid))
      .then((docSnap) => {
        if (docSnap.exists()) {
          // Document exists, update it
          updateDoc(doc(db, "MyList", User.uid), { movies: arrayUnion(movie) })
            .then(() => {
              console.log("Data added to my List");
              notify();
              setisMyListUpdates(true);
            })
            .catch((error) => {
              console.log(error.code);
              console.log(error.message);
              alertError(error.message);
            });
        } else {
          // Document doesn't exist, create it
          setDoc(doc(db, "MyList", User.uid), { movies: [movie] })
            .then(() => {
              console.log("MyList created and data added");
              notify();
              setisMyListUpdates(true);
            })
            .catch((error) => {
              console.log(error.code);
              console.log(error.message);
              alertError(error.message);
            });
        }
      })
      .catch((error) => {
        console.log(error.code);
        console.log(error.message);
        alertError(error.message);
      });
  };

  const removeFromMyList = (movie) => {
    updateDoc(doc(db, "MyList", User.uid), { movies: arrayRemove(movie) })
      .then(() => {
        toast.success(" Movie removed from MyList  ");
        setisMyListUpdates(true);
      })
      .catch((error) => {
        console.log(error.code);
        console.log(error.message);
      });
  };

  const PopupMessage = (
    <Toaster
      toastOptions={{
        style: {
          padding: "1.5rem",
          backgroundColor: "#f4fff4",
          borderLeft: "6px solid lightgreen",
        },
      }}
    />
  );

  return { addToMyList, removeFromMyList, PopupMessage, isMyListUpdates };
}

export default useUpdateMylist;
