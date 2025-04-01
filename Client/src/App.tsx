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
import CheckoutPage from "./pages/CheckOut";
import { OrderConfirmationPage } from "./pages/OrderConfirmation";
import EnrolledCourseDetailsPage from "./pages/EnrolledCourseDetailsPage";
import Profile from "./components/profile/Profile";
import MyLearnings from "./components/profile/MyLearnings";
import Certificates from "./components/profile/MyCertificates";
import Footer from "./components/Footer";
import VerifyCertificate from "./pages/VerifyCertificate";
import AboutPage from "./pages/AboutUsPage";
import ContactUsPage from "./pages/ContactUsPAge";
import { socket } from "@/lib/socket";
import { addNotification } from "@/redux/slices/notificationSlice";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { RootState } from "./redux/store";
import MockInterviewPage from "./pages/MockInterviewPage";
import { Generate } from "./components/generate";
import AIDashboard from "./pages/AIDashboard";
import CreateEditPage from "./pages/CreateEditPage";
import MockLoadPage from "./pages/MockLoadPage";
import InterviewPage from "./pages/InterviewPage";
import FeedBack from "./pages/FeedBack";

function App() {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!user?.id) return;

    // Join user room on connect
    const onConnect = () => {
      console.log("Socket connected, joining user room...");
      socket.emit("joinUser", { userId: user.id });
    };

    // Handle incoming notifications
    const onNewNotification = (notification: any) => {
      if (notification.userId === user.id) {
        console.log("Received notification:", notification);
        dispatch(addNotification(notification));
      }
    };

    socket.on("connect", onConnect);
    socket.on("newNotification", onNewNotification);

    if (!socket.connected) {
      socket.connect();
    } else {
      onConnect();
    }

    return () => {
      socket.emit("leaveUser", { userId: user.id });
      socket.off("connect", onConnect);
      socket.off("newNotification", onNewNotification);
    };
  }, [user?.id, dispatch]);

  return (
    <Router>
      <Navbar />
      <div className="pt-20">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact-us" element={<ContactUsPage />} />
          <Route path="/all-courses" element={<AllCourses />} />
          <Route path="/course/:courseId" element={<CourseDetails />} />
          <Route
            path="/verify-certificate/:certificateId"
            element={<VerifyCertificate />}
          />

          {/* Auth Routes (Login/Signup) */}
          <Route element={<AuthGuard />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Register />} />
          </Route>

          {/* Protected Routes (Authenticated Users) */}
          <Route element={<ProtectedRoute />}>
            {/* Profile Page with Nested Routes */}
            <Route path="/profile/*" element={<ProfilePage />}>
              <Route path="profile" element={<Profile />} />
              <Route path="cart" element={<Cart />} />
              <Route path="wishlist" element={<Wishlist />} />
              <Route path="my-courses" element={<MyLearnings />} />
              <Route path="certificates" element={<Certificates />} />
            </Route>

            <Route path="/checkout" element={<CheckoutPage />} />
            <Route
              path="/course/:courseId/learn"
              element={<EnrolledCourseDetailsPage />}
            />
            <Route
              path="/order-confirmation"
              element={<OrderConfirmationPage />}
            />
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
            <Route path="/mock-interview" element={<MockInterviewPage />} />
            <Route path="/generate" element={<Generate />}>
              <Route index element={<AIDashboard />} />
              <Route path=":interviewId" element={<CreateEditPage />} />
              <Route path="interview/:interviewId" element={<MockLoadPage />} />
              <Route path="interview/:interviewId/start" element={<InterviewPage />} />
              <Route path="feedback/:interviewId" element={<FeedBack />} />
            </Route>
          </Route>

          {/* Admin Routes */}
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route
            path="/dashboard/instructor/:applicationId"
            element={<InstructorApplicationDetails />}
          />

          {/* 404 Page */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <Toaster />
      </div>
      <Footer />
    </Router>
  );
}

export default App;
