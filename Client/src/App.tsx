import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DashBoard from "./pages/DashBoard";
import Navbar from "./components/NavBar";
import AuthGuard from "./components/AuthGuard";
import ProtectedRoute from "./components/ProctedRoute";
import ToastProvider from "./components/ToastProvider";

function App() {
  return (
    <Router>
      <Navbar />
      <ToastProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route element={<AuthGuard />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Register />} />
          </Route>
          {/* <Route element={<ProtectedRoute />}> */}
          <Route path="/profile" element={<DashBoard />} />
          {/* </Route> */}
        </Routes>
      </ToastProvider>
    </Router>
  );
}

export default App;
