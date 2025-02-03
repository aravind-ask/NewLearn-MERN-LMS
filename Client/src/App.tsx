import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Navbar from "./components/NavBar";
import AuthGuard from "./components/AuthGuard";
import ProtectedRoute from "./components/ProctedRoute";
import ToastProvider from "./components/ToastProvider";
import ProfilePage from "./pages/ProfilePage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRoute from "./components/AdminRoute";
import InstructorRegistration from "./pages/InstructorRegistration";

function App() {
  return (
    <Router>
      <Navbar />
      <ToastProvider>
        <Routes>
          <Route element={<AdminRoute />}>
            <Route path="/" element={<HomePage />} />
          </Route>
          <Route element={<AuthGuard />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Register />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/instructor/apply" element={<InstructorRegistration />} />
          </Route>
          <Route path="/dashboard" element={<AdminDashboard />} />
        </Routes>
      </ToastProvider>
    </Router>
  );
}

export default App;
