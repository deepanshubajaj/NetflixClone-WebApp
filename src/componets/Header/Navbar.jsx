import React, { useState, useEffect, useContext, useRef } from "react";
import { Transition } from "@headlessui/react";
import { Fade } from 'react-awesome-reveal';
import { Link, useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { AuthContext } from "../../Context/UserContext";
import { API_KEY, imageUrl2 } from "../../Constants/Constance";
import usePlayMovie from "../../CustomHooks/usePlayMovie";
import notificationSound from "../../NotificationAlertAudioFile/notificationAlert.mp3";

function Navbar(props) {
  const { User } = useContext(AuthContext);
  const [profilePic, setProfilePic] = useState("");
  const { playMovie } = usePlayMovie();
  const navigate = useNavigate();
  const audioRef = useRef(null);
  const [audioLoaded, setAudioLoaded] = useState(false);

  // Add a function to handle logo click
  const handleLogoClick = () => {
    if (User) {
      navigate("/home");
    } else {
      navigate("/");
    }
  };

  useEffect(() => {
    if (User != null) {
      setProfilePic(User.photoURL);
    }
    window.addEventListener("scroll", transitionNavBar);
    console.log("Navbar", User);

    // Preload audio
    const audio = new Audio(notificationSound);
    audio.addEventListener('canplaythrough', () => {
      setAudioLoaded(true);
      console.log("Audio loaded successfully");
    });
    audio.addEventListener('error', (e) => {
      console.error("Audio loading error:", e);
    });

    return () => {
      window.removeEventListener("scroll", transitionNavBar);
      audio.removeEventListener('canplaythrough', () => { });
      audio.removeEventListener('error', () => { });
    };
  }, []);

  // Function to play notification sound
  const playNotificationSound = () => {
    console.log("Attempting to play notification sound");

    // Create a new Audio instance each time
    const audio = new Audio(notificationSound);

    // Play with user interaction
    const playPromise = audio.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log("Audio playback started successfully");
        })
        .catch(error => {
          console.error("Audio playback failed:", error);

          // Fallback method for browsers with strict autoplay policies
          document.addEventListener('click', function playOnClick() {
            audio.play();
            document.removeEventListener('click', playOnClick);
          }, { once: true });
        });
    }
  };

  const [isOpen, setIsOpen] = useState(false);

  const [show, handleShow] = useState(false);
  const transitionNavBar = () => {
    if (window.scrollY > 80) {
      handleShow(true);
    } else {
      handleShow(false);
    }
  };

  const NavBlack = () => {
    handleShow(true);
  };
  const NavTransparent = () => {
    handleShow(false);
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

  // Add these state variables at the top of your component
  const [showNotificationBadge, setShowNotificationBadge] = useState(false);
  const [showNotificationList, setShowNotificationList] = useState(false);
  const [upcomingMovies, setUpcomingMovies] = useState([]);

  // Add this function to handle notification options
  const handleNotificationOption = (option) => {
    switch (option) {
      case 'start':
        setShowNotificationBadge(true);
        setShowNotificationList(false);

        // Play notification sound
        playNotificationSound();
        break;
      case 'read':
        setShowNotificationBadge(false);
        fetchUpcomingMovies();
        setShowNotificationList(true);
        break;
      case 'none':
        setShowNotificationBadge(false);
        setShowNotificationList(false);
        break;
      default:
        break;
    }
  };

  // Add this function to fetch upcoming movies from TMDB
  const fetchUpcomingMovies = async () => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/upcoming?api_key=${API_KEY}&language=en-US&page=1`
      );
      const data = await response.json();
      setUpcomingMovies(data.results.slice(0, 3)); // Get only first 3 movies
    } catch (error) {
      console.error("Error fetching upcoming movies:", error);
    }
  };

  return (
    <Fade>
      {/* We'll use a different approach than the audio element */}

      <header
        className={
          props.playPage
            ? "fixed top-0 z-10 w-full backdrop-blur-sm"
            : "fixed top-0 z-10 w-full"
        }
      >
        <nav
          className={`transition duration-500 ease-in-out  ${show && "transition duration-500 ease-in-out bg-black "
            } `}
        >
          <div className="px-4 mx-auto max-w-8xl sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <img
                    className="h-6 cursor-pointer w-18"
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/1920px-Netflix_2015_logo.svg.png"
                    alt="NETFLIX"
                    onClick={handleLogoClick}
                  />
                </div>
                <div className="hidden md:block">
                  <div className="flex items-center ml-10 space-x-4">
                    <Link
                      to={"/home"}
                      className="py-2 font-medium text-white transition ease-in-out delay-150 rounded-md cursor-pointer hover:text-red-800 lg:px-3 text-m"
                    >
                      Home
                    </Link>

                    <Link
                      to={"/series"}
                      className="py-2 font-medium text-white transition ease-in-out delay-150 rounded-md cursor-pointer hover:text-red-800 lg:px-3 text-m"
                    >
                      Series
                    </Link>

                    <Link
                      to={"/history"}
                      className="py-2 font-medium text-white transition ease-in-out delay-150 rounded-md cursor-pointer hover:text-red-800 lg:px-3 text-m"
                    >
                      History
                    </Link>

                    <Link
                      to={"/liked"}
                      className="py-2 font-medium text-white transition ease-in-out delay-150 rounded-md cursor-pointer hover:text-red-800 lg:px-3 text-m"
                    >
                      Liked
                    </Link>

                    <Link
                      to={"/mylist"}
                      className="py-2 font-medium text-white transition ease-in-out delay-150 rounded-md cursor-pointer hover:text-red-800 lg:px-3 text-m"
                    >
                      My List
                    </Link>
                  </div>
                </div>
              </div>

              <div className="ml-auto">
                <div className="flex">
                  {/* Search Icon */}
                  <Link to={"/search"}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="items-center w-10 h-10 pr-4 mt-auto mb-auto text-white hover:text-red-800 cursor-pointer"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </Link>

                  {User ? (
                    <a className="items-center hidden pr-4 mt-auto mb-auto text-base font-medium text-white transition ease-in-out delay-150 cursor-pointer hover:text-red-800 md:flex">
                      {User.displayName}
                    </a>
                  ) : null}

                  {/* Notification icon */}
                  <div className="relative group">
                    {/* Bell Icon */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="items-center hidden w-10 h-10 pr-4 mt-auto mb-auto text-white cursor-pointer md:flex hover:text-red-800"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      />
                    </svg>

                    {/* Badge */}
                    {showNotificationBadge && (
                      <span className="absolute top-0 right-1 bg-red-600 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full">
                        3
                      </span>
                    )}

                    {/* Notification Dropdown */}
                    <ul className="absolute hidden text-white pt-1 -ml-32 group-hover:block transition ease-in-out delay-150 z-20">
                      <li>
                        <a
                          onClick={() => handleNotificationOption('start')}
                          className="cursor-pointer rounded-t bg-stone-900 font-bold hover:border-l-4 hover:bg-gradient-to-r from-[#ff000056] border-red-800 py-2 px-4 block whitespace-no-wrap transition ease-in-out delay-150"
                        >
                          Start Notification
                        </a>
                      </li>
                      <li>
                        <a
                          onClick={() => handleNotificationOption('read')}
                          className="cursor-pointer bg-stone-900 font-bold hover:border-l-4 hover:bg-gradient-to-r from-[#ff000056] border-red-800 py-2 px-4 block whitespace-no-wrap transition ease-in-out delay-150"
                        >
                          Read Notification
                        </a>
                      </li>
                      <li>
                        <a
                          onClick={() => handleNotificationOption('none')}
                          className="cursor-pointer rounded-b bg-stone-900 font-bold hover:border-l-4 hover:bg-gradient-to-r from-[#ff000056] border-red-800 py-2 px-4 block whitespace-no-wrap transition ease-in-out delay-150"
                        >
                          No Notification
                        </a>
                      </li>
                    </ul>
                  </div>

                  {/* Upcoming Movies Notification Panel */}
                  {showNotificationList && (
                    <div className="absolute right-0 mt-2 w-64 bg-stone-900 rounded-md shadow-lg z-20">
                      <div className="p-2 border-b border-gray-700 flex justify-between items-center">
                        <h3 className="text-white font-bold">Upcoming Movies</h3>
                        {/* Back button - arrow style */}
                        <button
                          onClick={() => setShowNotificationList(false)}
                          className="text-white hover:text-red-600 transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 19l-7-7m0 0l7-7m-7 7h18"
                            />
                          </svg>
                        </button>
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {upcomingMovies.length > 0 ? (
                          upcomingMovies.map((movie) => (
                            <div
                              key={movie.id}
                              className="p-2 border-b border-gray-700 hover:bg-stone-800 cursor-pointer"
                              onClick={() => {
                                playMovie(movie, "notification");
                                setShowNotificationList(false);
                              }}
                            >
                              <div className="flex">
                                <img
                                  src={
                                    movie.poster_path
                                      ? `${imageUrl2}${movie.poster_path}`
                                      : "https://i.ytimg.com/vi/Mwf--eGs05U/maxresdefault.jpg"
                                  }
                                  alt={movie.title}
                                  className="w-12 h-18 object-cover rounded mr-2"
                                />
                                <div>
                                  <p className="text-white font-medium">{movie.title}</p>
                                  <p className="text-gray-400 text-sm">{movie.release_date}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-2">
                            <p className="text-gray-400">Loading upcoming movies...</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="group inline-block relative transition ease-in-out delay-300">
                    <Link to={"/profile"} onClick={() => sessionStorage.setItem("returnFromProfile", "true")}>
                      <img
                        className="h-10 w-10 rounded-full cursor-pointer"
                        src={
                          profilePic
                            ? `${User.photoURL}`
                            : `https://www.citypng.com/public/uploads/preview/profile-user-round-red-icon-symbol-download-png-11639594337tco5j3n0ix.png`
                        }
                        alt="NETFLIX"
                      />
                    </Link>
                    <ul class="absolute hidden text-white pt-1 -ml-32 group-hover:block transition ease-in-out delay-150">
                      <li>
                        <Link
                          to={"/profile"}
                          className="cursor-pointer rounded-t bg-stone-900 font-bold hover:border-l-4 hover:bg-gradient-to-r from-[#ff000056] border-red-800 py-2 px-4 block whitespace-no-wrap transition ease-in-out delay-150"
                        >
                          Profile
                        </Link>
                      </li>
                      <li>
                        <Link
                          to={"/signin"}
                          className="cursor-pointer bg-stone-900 font-semibold hover:border-l-4 hover:bg-gradient-to-r from-[#ff000056] border-red-800 py-2 px-4 block whitespace-no-wrap transition ease-in-out delay-150"
                        >
                          Add another User
                        </Link>
                      </li>
                      <li>
                        <a
                          onClick={SignOut}
                          className="cursor-pointer rounded-b bg-stone-900 font-bold hover:border-l-4 hover:bg-gradient-to-r from-[#ff000056] border-red-800 py-2 px-4 block whitespace-no-wrap transition ease-in-out delay-150"
                        >
                          Sign Out
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex pl-4 -mr-2 md:hidden">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  type="button"
                  className="inline-flex items-center justify-center p-2 text-gray-400 bg-gray-900 rounded-md hover:text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                  aria-controls="mobile-menu"
                  aria-expanded="false"
                >
                  <span className="sr-only">Open main menu</span>
                  {!isOpen ? (
                    <svg
                      className="block w-6 h-6"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                      onClick={NavBlack}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="block w-6 h-6"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                      onClick={NavTransparent}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          <Transition
            show={isOpen}
            enter="transition ease-out duration-100 transform"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="transition ease-in duration-75 transform"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            {(ref) => (
              <div className="md:hidden" id="mobile-menu">
                <div ref={ref} className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                  <Link to={"/"}>
                    <a className="block px-3 py-2 text-base font-medium text-white rounded-md hover:bg-red-800">
                      Home
                    </a>
                  </Link>

                  <Link to={"/series"}>
                    <a className="block px-3 py-2 text-base font-medium text-gray-300 rounded-md hover:bg-red-800 hover:text-white">
                      TV-Series
                    </a>
                  </Link>

                  <Link to={"/history"}>
                    <a className="block px-3 py-2 text-base font-medium text-gray-300 rounded-md hover:bg-red-800 hover:text-white">
                      History
                    </a>
                  </Link>

                  <Link to={"/liked"}>
                    <a className="block px-3 py-2 text-base font-medium text-gray-300 rounded-md hover:bg-red-800 hover:text-white">
                      Liked
                    </a>
                  </Link>

                  <Link to={"/mylist"}>
                    <a className="block px-3 py-2 text-base font-medium text-gray-300 rounded-md hover:bg-red-800 hover:text-white">
                      My-List
                    </a>
                  </Link>

                  <Link to={"/signin"}>
                    <a className="block px-3 py-2 text-base font-medium text-gray-300 rounded-md hover:bg-red-800 hover:text-white">
                      Add another user
                    </a>
                  </Link>

                  <a
                    onClick={SignOut}
                    className="block px-3 py-2 text-base font-medium text-gray-300 rounded-md hover:bg-red-800 hover:text-white"
                  >
                    Sign Out
                  </a>
                </div>
              </div>
            )}
          </Transition>
        </nav>
      </header>
    </Fade>
  );
}

export default Navbar;
