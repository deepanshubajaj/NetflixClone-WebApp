import { useEffect, useContext, lazy, Suspense, useState } from "react";
import { useLocation } from "react-router-dom";
import "./App.css";

const Home = lazy(() => import("./Pages/Home"));
const Series = lazy(() => import("./Pages/Series"));
const Search = lazy(() => import("./Pages/Search"));
const Profile = lazy(() => import("./Pages/Profile"));
const MyList = lazy(() => import("./Pages/MyList"));
const SignIn = lazy(() => import("./Pages/SignIn"));
const SignUp = lazy(() => import("./Pages/SignUp"));
const Welcome = lazy(() => import("./Pages/Welcome"));
const ErrorPage = lazy(() => import("./Pages/ErrorPage"));
const Play = lazy(() => import("./Pages/Play"));
const LikedMovies = lazy(() => import("./Pages/LikedMovies"));
const History = lazy(() => import("./Pages/History"));
const ProfileSelection = lazy(() => import("./Pages/ProfileSelection"));
const ManageProfiles = lazy(() => import("./Pages/ManageProfiles"));

import { Routes, Route } from "react-router-dom";
import { AuthContext } from "./Context/UserContext";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Loading from "./componets/Loading/Loading";
import Navbar from "./componets/Header/Navbar";
import NavbarWithoutUser from "./componets/Header/NavbarWithoutUser";
import SplashScreen from "./SplashScreen/SplashScreen";

function App() {
  const { User, setUser } = useContext(AuthContext);
  const location = useLocation();
  const [showSplash, setShowSplash] = useState(true);
  
  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      setUser(user);
      console.log(user);
    });
  }, []);

  // Check if we're on the profiles page
  const isProfilesPage = location.pathname === "/profiles" || location.pathname === "/manage-profiles";

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <div>
      {User && !isProfilesPage ? <Navbar></Navbar> : !User ? <NavbarWithoutUser></NavbarWithoutUser> : null}
      <Suspense replace fallback={<Loading />}>
        <Routes>
          <Route index path="/" element={User ? <ProfileSelection /> : <Welcome />} />
          {User ? (
            <>
              <Route path="/profiles" element={<ProfileSelection />} />
              <Route path="/manage-profiles" element={<ManageProfiles />} />
              <Route path="/home" element={<Home />} />
              <Route path="/series" element={<Series />} />
              <Route path="/search" element={<Search />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/mylist" element={<MyList />} />
              <Route path="/liked" element={<LikedMovies />} />
              <Route path="/history" element={<History />} />
              <Route path="/play/:id" element={<Play />} />
            </>
          ) : null}
          <Route path="/play/:id" element={<Play />} />

          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
