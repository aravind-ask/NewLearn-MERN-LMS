import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  Mountain,
  ShoppingCart,
  Heart,
  Search,
  Home,
  Book,
  Info,
  Mail,
  User,
  LogOut,
  Sparkles,
} from "lucide-react";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { AvatarDropdown } from "../AvatarDropDown";
import SearchBar from "../SearchBar";
import { logout } from "@/redux/slices/authSlice";
import { useLogoutMutation } from "@/redux/services/authApi";
import NotificationDropdown from "./NotificationDropdown";
import { useState } from "react";

export default function Navbar() {
  const { user } = useSelector((state: RootState) => state.auth);
  const role = user?.role;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [logoutMutation] = useLogoutMutation();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleLogout = async () => {
    try {
      if (!user) {
        throw new Error("No user found");
      }
      await logoutMutation({ userId: user.id });
      dispatch(logout());
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleLinkClick = (path) => {
    setIsSheetOpen(false);
    navigate(path);
  };

  if (role === "admin") {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center bg-gradient-to-r from-teal-800 to-purple-800 px-6 text-white shadow-lg">
        <div className="flex w-full items-center justify-between">
          <h1 className="text-xl font-semibold">Admin Dashboard</h1>
          <p className="text-sm">Managing NewLearn with Excellence</p>
        </div>
        <Button variant="outline" className="w-20 ml-4" onClick={handleLogout}>
          Logout
        </Button>
      </header>
    );
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center bg-white px-4 lg:px-8 shadow-md border-b border-gray-200">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 mr-4 lg:mr-6">
        <Mountain className="h-6 w-6 text-teal-600" />
        <span className="text-xl font-bold bg-gradient-to-r from-teal-600 to-purple-600 bg-clip-text text-transparent">
          NewLearn
        </span>
      </Link>

      <div className="flex-1 flex items-center mx-2 lg:hidden">
        <SearchBar />
      </div>

      <nav className="hidden lg:flex items-center gap-6 flex-1 justify-center">
        <Link
          to="/"
          className="text-sm font-medium text-gray-600 hover:text-teal-600 transition-colors"
        >
          Home
        </Link>
        <Link
          to="/all-courses"
          className="text-sm font-medium text-gray-600 hover:text-teal-600 transition-colors"
        >
          Courses
        </Link>
        <Link
          to="/about"
          className="text-sm font-medium text-gray-600 hover:text-teal-600 transition-colors"
        >
          About
        </Link>
        <Link
          to="/contact-us"
          className="text-sm font-medium text-gray-600 hover:text-teal-600 transition-colors"
        >
          Contact
        </Link>
        <Link
          to="/instructor/apply"
          className="text-sm font-medium text-gray-600 hover:text-teal-600 transition-colors"
        >
          Teach on NewLearn
        </Link>
        {user && (
          <Link
            to="/mock-interview"
            className="text-sm font-medium text-gray-600 hover:text-teal-600 transition-colors"
          >
            AI Mock Interview
          </Link>
        )}
      </nav>

      <div className="hidden lg:flex items-center flex-1 justify-center mx-4">
        <SearchBar />
      </div>

      <div className="hidden lg:flex items-center gap-4">
        {user ? (
          <>
            <Link
              to="/profile/cart"
              className="relative text-gray-600 hover:text-teal-600 transition-colors"
            >
              <ShoppingCart className="h-6 w-6" />
            </Link>
            <Link
              to="/profile/wishlist"
              className="relative text-gray-600 hover:text-teal-600 transition-colors"
            >
              <Heart className="h-6 w-6" />
            </Link>
            <NotificationDropdown />
            <AvatarDropdown />
          </>
        ) : (
          <>
            <Button
              variant="outline"
              onClick={() => navigate("/login")}
              className="border-teal-600 text-teal-600 hover:bg-teal-50"
            >
              Login
            </Button>
            <Button
              onClick={() => navigate("/signup")}
              className="bg-gradient-to-r from-teal-600 to-purple-600 text-white hover:from-teal-700 hover:to-purple-700"
            >
              Signup
            </Button>
          </>
        )}
      </div>

      {/* Mobile Menu */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-gray-600 hover:text-teal-600 ml-auto"
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-72 bg-white p-6">
          <div className="flex flex-col gap-6">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2 mb-4"
              onClick={() => setIsSheetOpen(false)}
            >
              <Mountain className="h-6 w-6 text-teal-600" />
              <span className="text-xl font-bold text-gray-800">NewLearn</span>
            </Link>

            {/* Navigation Section */}
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-semibold text-gray-700 border-b pb-1">
                Navigation
              </h3>
              <Link
                to="/"
                className="flex items-center gap-4 text-sm font-medium text-gray-600 hover:text-teal-600 transition-colors"
                onClick={() => setIsSheetOpen(false)}
              >
                <Home className="h-5 w-5" />
                Home
              </Link>
              <Link
                to="/all-courses"
                className="flex items-center gap-4 text-sm font-medium text-gray-600 hover:text-teal-600 transition-colors"
                onClick={() => setIsSheetOpen(false)}
              >
                <Book className="h-5 w-5" />
                Courses
              </Link>
              <Link
                to="/about"
                className="flex items-center gap-4 text-sm font-medium text-gray-600 hover:text-teal-600 transition-colors"
                onClick={() => setIsSheetOpen(false)}
              >
                <Info className="h-5 w-5" />
                About
              </Link>
              <Link
                to="/contact-us"
                className="flex items-center gap-4 text-sm font-medium text-gray-600 hover:text-teal-600 transition-colors"
                onClick={() => setIsSheetOpen(false)}
              >
                <Mail className="h-5 w-5" />
                Contact
              </Link>
              <Link
                to="/instructor/apply"
                className="flex items-center gap-4 text-sm font-medium text-gray-600 hover:text-teal-600 transition-colors"
                onClick={() => setIsSheetOpen(false)}
              >
                <Mountain className="h-5 w-5" />
                Teach on NewLearn
              </Link>
              {user && (
                <Link
                  to="/mock-interview"
                  className="flex items-center gap-4 text-sm font-medium text-gray-600 hover:text-teal-600 transition-colors"
                  onClick={() => setIsSheetOpen(false)}
                >
                  <Sparkles className="h-5 w-5" />
                  AI Mock Interview
                </Link>
              )}
            </div>

            {/* Profile Section */}
            {user ? (
              <div className="flex flex-col gap-4 mt-4">
                <h3 className="text-sm font-semibold text-gray-700 border-b pb-1">
                  Profile
                </h3>
                <div className="flex items-center gap-3 mb-2">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={user?.photoUrl || "https://github.com/shadcn.png"}
                      alt={user?.name}
                    />
                    <AvatarFallback>
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-base font-semibold text-gray-800">
                    {user.name}
                  </span>
                  <NotificationDropdown />
                </div>
                <Link
                  to="/profile"
                  className="flex items-center gap-4 text-sm font-medium text-gray-600 hover:text-teal-600 transition-colors"
                  onClick={() => setIsSheetOpen(false)}
                >
                  <User className="h-5 w-5" />
                  Profile
                </Link>
                <Link
                  to="/profile/cart"
                  className="flex items-center gap-4 text-sm font-medium text-gray-600 hover:text-teal-600 transition-colors"
                  onClick={() => setIsSheetOpen(false)}
                >
                  <ShoppingCart className="h-5 w-5" />
                  Cart
                </Link>
                <Link
                  to="/profile/wishlist"
                  className="flex items-center gap-4 text-sm font-medium text-gray-600 hover:text-teal-600 transition-colors"
                  onClick={() => setIsSheetOpen(false)}
                >
                  <Heart className="h-5 w-5" />
                  Wishlist
                </Link>
                <Button
                  variant="ghost"
                  className="flex items-center gap-4 text-sm font-medium text-gray-600 hover:text-teal-600 transition-colors justify-start p-0"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5 text-red-600" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => handleLinkClick("/login")}
                  className="border-teal-600 text-teal-600 hover:bg-teal-50"
                >
                  Login
                </Button>
                <Button
                  onClick={() => handleLinkClick("/signup")}
                  className="bg-gradient-to-r from-teal-600 to-purple-600 text-white hover:from-teal-700 hover:to-purple-700"
                >
                  Signup
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
