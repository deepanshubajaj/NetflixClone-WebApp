import React from "react";
import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Fade } from 'react-awesome-reveal';
import { ClipLoader } from "react-spinners";
import {
  getAuth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail
} from "firebase/auth";
import { setDoc, doc, getDoc } from "firebase/firestore";
import { db } from "../Firebase/FirebaseConfig";
import { AuthContext } from "../Context/UserContext";
import toast, { Toaster } from "react-hot-toast";

import GoogleLogo from "../images/GoogleLogo.png";
import WelcomePageBanner from "../images/WelcomePageBanner.jpg";

function SignIn() {
  const { User, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [ErrorMessage, setErrorMessage] = useState("");
  const [loader, setLoader] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();

    if (!email) {
      setErrorMessage("Please enter your email address to reset your password");
      return;
    }

    setLoader(true);
    const auth = getAuth();

    sendPasswordResetEmail(auth, email)
      .then(() => {
        setLoader(false);
        setResetEmailSent(true);
        setErrorMessage("");
        toast.success("Password reset email sent! Check your inbox.");
      })
      .catch((error) => {
        setLoader(false);
        const errorMessage = error.message;
        setErrorMessage(errorMessage);
        console.log(errorMessage);
        toast.error("Failed to send reset email: " + errorMessage);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoader(true);

    const auth = getAuth();
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        console.log(user);
        if (user != null) {
          navigate("/profiles"); // Changed from "/" to "/profiles"
        }
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        setErrorMessage(error.message);
        setLoader(false);
        console.log(errorCode);
        console.log(errorMessage);
      });
  };

  const loginWithGoogle = (e) => {
    e.preventDefault();
    const auth = getAuth();
    const provider = new GoogleAuthProvider();

    signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user;
        console.log(user);
        const EmptyArray = [];

        setDoc(
          doc(db, "Users", user.uid),
          {
            email: user.email,
            Uid: user.uid,
          },
          { merge: true }
        ).then(() => {
          getDoc(doc(db, "MyList", user.uid)).then((result) => {
            if (result.exists()) {
              // Data exist in MyList section for this user
            } else {
              // Creating a new MyList, WatchedMovies List, LikedMovies List for the user in the database
              setDoc(
                doc(db, "MyList", user.uid),
                {
                  movies: EmptyArray,
                },
                { merge: true }
              );
              setDoc(
                doc(db, "WatchedMovies", user.uid),
                {
                  movies: EmptyArray,
                },
                { merge: true }
              );
              setDoc(
                doc(db, "LikedMovies", user.uid),
                {
                  movies: EmptyArray,
                },
                { merge: true }
              ).then(() => {
                navigate("/profiles"); // Changed from "/" to "/profiles"
              });
            }
          });
        });
        if (user != null) {
          navigate("/profiles"); // Changed from "/" to "/profiles"
        }
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        setErrorMessage(error.message);
        setLoader(false);
        // The email of the user's account used.
        const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
      });
  };

  return (
    <section
      className="h-[100vh] bg-gray-50 dark:bg-gray-900"
      style={{
        background: `linear-gradient(0deg, hsl(0deg 0% 0% / 73%) 0%, hsl(0deg 0% 0% / 73%) 35%),url(${WelcomePageBanner})`,
      }}
    >
      <Toaster position="top-center" />
      <div className="h-[100vh] flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <div className="w-full bg-[#000000a2] rounded-lg shadow sm:my-0 md:mt-0 sm:max-w-lg xl:p-0 border-2 border-stone-800 lg:border-0">
          <Fade>
            <div>
              <div className="p-6 space-y-4 md:space-y-6 sm:p-12">
                <h1 className="text-xl font-bold leading-tight tracking-tight text-white md:text-2xl dark:text-white">
                  Sign in to your account
                </h1>
                <h1 className="text-white text-2xl p-3 text-center border-2 border-red-700 rounded-sm">
                  Not Real Netflix
                </h1>
                <form
                  onSubmit={handleSubmit}
                  className="space-y-4 md:space-y-6"
                  action="#"
                >
                  <div>
                    <label
                      for="email"
                      className="block mb-2 text-sm font-medium text-white dark:text-white"
                    >
                      Your email
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      className={
                        ErrorMessage
                          ? "bg-stone-700 text-white sm:text-sm rounded-sm focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 border-2 border-red-700  dark:placeholder-white dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 placeholder:text-white"
                          : "bg-stone-700 text-white sm:text-sm rounded-sm focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:placeholder-white dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 placeholder:text-white"
                      }
                      placeholder="name@email.com"
                      required=""
                      onChange={(e) => setEmail(e.target.value)}
                    ></input>
                  </div>
                  <div>
                    <label
                      for="password"
                      className="block mb-2 text-sm font-medium text-white dark:text-white"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        id="password"
                        placeholder="••••••••"
                        className={
                          ErrorMessage
                            ? "bg-stone-700 text-white sm:text-sm rounded-sm focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5  border-2 border-red-700 dark:bg-gray-700 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 placeholder:text-white"
                            : "bg-stone-700 text-white sm:text-sm rounded-sm focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 placeholder:text-white"
                        }
                        required=""
                        onChange={(e) => setPassword(e.target.value)}
                      ></input>
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-white"
                        onClick={togglePasswordVisibility}
                      >
                        {showPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    {ErrorMessage && (
                      <h1 className="flex text-white font-bold p-4 bg-red-700 rounded text-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-6 h-6 mr-1"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                          />
                        </svg>
                        {ErrorMessage}
                      </h1>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="remember"
                          aria-describedby="remember"
                          type="checkbox"
                          className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800"
                          required=""
                        ></input>
                      </div>
                      <div className="ml-3 text-sm">
                        <label
                          for="remember"
                          className="text-gray-500 dark:text-gray-300"
                        >
                          Remember me
                        </label>
                      </div>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className={`w-full text-white ${loader
                        ? `bg-stone-700`
                        : `bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-primary-300`
                      } transition ease-in-out font-medium rounded-sm text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800`}
                  >
                    {loader ? <ClipLoader color="#ff0000" /> : `Sign in`}
                  </button>
                  <button
                    onClick={loginWithGoogle}
                    className={`flex justify-center items-center w-full text-white ${loader
                        ? `bg-stone-700`
                        : `bg-blue-600 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-primary-300`
                      } transition ease-in-out font-medium rounded-sm text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:focus:ring-primary-800`}
                  >
                    {loader ? (
                      <ClipLoader color="#ff0000" />
                    ) : (
                      <>
                        <img className="w-8" src={GoogleLogo}></img>{" "}
                        <p className="ml-1">Sign in with Google</p>
                      </>
                    )}
                  </button>
                  <div className="text-center mt-4">
                    {resetEmailSent ? (
                      <p className="text-sm font-medium text-green-500">
                        Password reset email sent! Check your inbox.
                      </p>
                    ) : (
                      <button
                        onClick={handleForgotPassword}
                        className="text-sm font-medium text-white hover:underline dark:text-primary-500"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <p className="text-sm font-light text-gray-500 dark:text-gray-400 mt-2">
                    Don't have an account yet?{" "}
                    <Link
                      className="font-medium text-white hover:underline dark:text-primary-500"
                      to={"/signup"}
                    >
                      Sign up
                    </Link>
                  </p>
                </form>
              </div>
            </div>
          </Fade>
        </div>
      </div>
    </section>
  );
}

export default SignIn;
