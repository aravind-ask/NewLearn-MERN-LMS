import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Navbar from "./components/NavBar";
import AuthGuard from "./components/AuthGuard";
import ProtectedRoute from "./components/ProctedRoute";
import ProfilePage from "./pages/ProfilePage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRoute from "./components/AdminRoute";
import InstructorRegistration from "./pages/InstructorRegistration";
import InstructorDashboard from "./pages/InstructorDashboardPage";
import AddNewCourse from "./pages/AddNewCourse";
import AllCourses from "./pages/AllCourses";
import { Toaster } from "@/components/ui/toaster";
import CourseDetails from "./pages/CourseDetails";
import InstructorApplicationDetails from "./components/Admin/InstructorRequestDetails";
import NotFoundPage from "./pages/404ErrorPage";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import InstructorProfile from "./pages/InstructorProfile";

function App() {
  return (
    <Router>
      <Navbar />
      <div className="pt-20">
        <Routes>
          <Route element={<AdminRoute />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/all-courses" element={<AllCourses />} />
            <Route path="/course/:courseId" element={<CourseDetails />} />
          </Route>
          <Route element={<AuthGuard />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Register />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route
              path="/instructor/apply"
              element={<InstructorRegistration />}
            />
            <Route
              path="/instructor/dashboard"
              element={<InstructorDashboard />}
            />
            <Route
              path="/instructor/create-new-course"
              element={<AddNewCourse />}
            />
            <Route
              path="/instructor/edit-course/:courseId"
              element={<AddNewCourse />}
            />
            <Route
              path="/instructor/profile/:instructorId"
              element={<InstructorProfile />}
            />
          </Route>
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="*" element={<NotFoundPage />} />
          <Route
            path="/dashboard/instructor/:applicationId"
            element={<InstructorApplicationDetails />}
          />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
