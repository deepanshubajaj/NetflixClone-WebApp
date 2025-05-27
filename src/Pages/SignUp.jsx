import React from "react";
import { useState, useContext } from "react";

import { Link, useNavigate } from "react-router-dom";
import { Fade } from 'react-awesome-reveal';
import {
  getAuth,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { db } from "../Firebase/FirebaseConfig";
import { AuthContext } from "../Context/UserContext";
import { ClipLoader } from "react-spinners";
import WelcomePageBanner from "../images/WelcomePageBanner.jpg";

function SignUp() {
  const { User, setUser } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [ErrorMessage, setErrorMessage] = useState("");
  const [loader, setLoader] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoader(true);

    const auth = getAuth();
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        onAuthStateChanged(auth, (user) => {
          const EmptyArray = [];
          setDoc(doc(db, "Users", user.uid), {
            email: email,
            Uid: user.uid,
          }).then(() => {
            setDoc(
              doc(db, "MyList", user.uid),
              {
                movies: EmptyArray,
              },
              { merge: true }
            ).then(() => {
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
              );
            });
          });
        });

        const user = userCredential.user;
        if (user != null) {
          navigate("/profiles"); // Changed from "/" to "/profiles"
        }
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        setLoader(false);
        setErrorMessage(errorMessage);
        console.log(errorCode);
        console.log(errorMessage);
      });
  };

  return (
    <section
      className="h-[100vh] bg-gray-500"
      style={{
        background: `linear-gradient(0deg, hsl(0deg 0% 0% / 73%) 0%, hsl(0deg 0% 0% / 73%) 35%),url(${WelcomePageBanner})`,
      }}
    >
      <div className="h-[100vh] flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <div className="w-full bg-[#000000a2] rounded-lg shadow sm:my-0 md:mt-0 sm:max-w-lg xl:p-0 border-2 border-stone-800 lg:border-0">
          <Fade>
            <div>
              <div className="p-6 space-y-4 md:space-y-6 sm:p-12">
                <h1 className="text-xl font-bold leading-tight tracking-tight text-white md:text-2xl dark:text-white">
                  Create a new account
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
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      name="email"
                      id="email"
                      className={
                        ErrorMessage
                          ? "bg-stone-700 text-white sm:text-sm rounded-sm border-2 border-red-700 focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:text-white "
                          : "bg-stone-700 text-white sm:text-sm rounded-sm focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:text-white "
                      }
                      placeholder="name@emil.com"
                      required=""
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
                        onChange={(e) => setPassword(e.target.value)}
                        type={showPassword ? "text" : "password"}
                        name="password"
                        id="password"
                        placeholder="••••••••"
                        className={
                          ErrorMessage
                            ? "bg-stone-700 text-white sm:text-sm rounded-sm border-2 border-red-700 focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                            : "bg-stone-700 text-white sm:text-sm rounded-sm focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:text-white"
                        }
                        required=""
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
                          className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 "
                          required=""
                        ></input>
                      </div>
                      <div className="ml-3 text-sm">
                        <label for="remember" className="text-gray-500">
                          Remember me
                        </label>
                      </div>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className={`w-full text-white ${loader
                        ? `bg-stone-700`
                        : `bg-red-800 focus:ring-4 focus:outline-none focus:ring-primary-300`
                      } font-medium rounded-sm text-sm px-5 py-2.5 text-center`}
                  >
                    {loader ? <ClipLoader color="#ff0000" /> : "Create now"}
                  </button>
                  <p className="text-sm font-light text-gray-500">
                    Already have one?{" "}
                    <Link
                      className="font-medium text-white hover:underline"
                      to={"/signin"}
                    >
                      Sign in
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

export default SignUp;
