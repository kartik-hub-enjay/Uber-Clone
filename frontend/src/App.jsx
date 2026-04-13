import React from "react";
import "./app.css";
import { Routes, Route } from "react-router-dom";
import UserLogin from "./pages/UserLogin";
import UserSignup from "./pages/UserSignup";
import CaptainLogin from "./pages/CaptainLogin";
import CaptainSignup from "./pages/CaptainSignup";
import UserProtectedWrapper from "./pages/UserProtectedWrapper";
import UserLogout from "../src/pages/UserLogout";
import Start from "./pages/Start";
import Home from "./pages/Home";
import CaptainHome from "./pages/CaptainHome";
import CaptainProtectedWrapper from "./pages/CaptainProtectedWrapper";
import CaptainLogout from "./pages/CaptainLogout";
import Riding from "./pages/Riding";
import CaptainRiding from "./pages/CaptainRiding";
import 'remixicon/fonts/remixicon.css'


const App = () => {
  return (
    <div className="min-h-screen bg-neutral-100">
      <div className="mx-auto w-full max-w-107.5 min-h-screen bg-white relative overflow-hidden md:shadow-2xl">
        <Routes>
          <Route path="/" element={<Start />} />
          <Route path="/login" element={<UserLogin />} />
          <Route path="/signup" element={<UserSignup />} />
          <Route path="/captain-login" element={<CaptainLogin />} />
          <Route path="/captain-signup" element={<CaptainSignup />} />
          <Route path="/riding" element={<Riding/>}/>
          <Route path="/captain-riding" element={<CaptainRiding/>}/>
          <Route
            path="/home"
            element={
              <UserProtectedWrapper>
                <Home />
              </UserProtectedWrapper>
            }
          />
          <Route
            path="/user-logout"
            element={
              <UserProtectedWrapper>
                <UserLogout />
              </UserProtectedWrapper>
            }
          />
          <Route
            path="/captain-home"
            element={
              <CaptainProtectedWrapper>
                <CaptainHome />
              </CaptainProtectedWrapper>
            }
          />
          <Route
          path="/captain-logout"
          element={
            <CaptainProtectedWrapper>
              <CaptainLogout />
            </CaptainProtectedWrapper>
          }
        />
        </Routes>
      </div>
    </div>
  );
};

export default App;
