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
} from "lucide-react";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AvatarDropdown } from "./AvatarDropDown"; // Assuming this exists
import SearchBar from "./SearchBar";
import { logout } from "@/redux/slices/authSlice";
import { useLogoutMutation } from "@/redux/services/authApi";

export default function Navbar() {
  const { user } = useSelector((state: RootState) => state.auth);
  // Uncomment if cart and wishlist are implemented
  // const { cart, wishlist } = useSelector((state: RootState) => state.user);
  const role = user?.role;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [logoutMutation] = useLogoutMutation();
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

  // Admin Navbar
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

      {/* Search Bar - Visible on small screens */}
      <div className="flex-1 flex items-center mx-2 lg:hidden">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search courses..."
            className="pl-10 py-2 border-gray-300 focus:border-teal-500 focus:ring-teal-500 rounded-full"
          />
        </div>
      </div>

      {/* Desktop Navigation */}
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
      </nav>

      {/* Desktop Search Bar */}
      <SearchBar />
      {/* <div className="hidden lg:flex items-center flex-1 max-w-xs mx-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search courses..."
            className="pl-10 py-2 border-gray-300 focus:border-teal-500 focus:ring-teal-500 rounded-full"
          />
        </div>
      </div> */}

      {/* Desktop User Actions */}
      <div className="hidden lg:flex items-center gap-4">
        {user ? (
          <>
            <Link
              to="/profile/cart"
              className="relative text-gray-600 hover:text-teal-600 transition-colors"
            >
              <ShoppingCart className="h-6 w-6" />
              {/* {cart?.length > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-teal-600 text-white">
                  {cart.length}
                </Badge>
              )} */}
            </Link>
            <Link
              to="/profile/wishlist"
              className="relative text-gray-600 hover:text-teal-600 transition-colors"
            >
              <Heart className="h-6 w-6" />
              {/* {wishlist?.length > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-teal-600 text-white">
                  {wishlist.length}
                </Badge>
              )} */}
            </Link>
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

      {/* Mobile Menu Trigger - Moved to Right */}
      <Sheet>
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
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Mountain className="h-6 w-6 text-teal-600" />
              <span className="text-xl font-bold text-gray-800">NewLearn</span>
            </Link>
            {user && (
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={user?.photoUrl || "https://github.com/shadcn.png"}
                    alt={user?.name}
                  />
                  <AvatarFallback>
                    {user?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-lg font-semibold text-gray-800">
                  {user.name}
                </span>
              </div>
            )}
            <nav className="flex flex-col gap-4">
              <Link
                to="/"
                className="flex gap-4 text-sm font-medium text-gray-600 hover:text-teal-600 transition-colors"
              >
                <Home />
                Home
              </Link>
              <Link
                to="/all-courses"
                className="flex gap-4 text-sm font-medium text-gray-600 hover:text-teal-600 transition-colors"
              >
                <Book />
                Courses
              </Link>
              <Link
                to="/about"
                className="flex gap-4 text-sm font-medium text-gray-600 hover:text-teal-600 transition-colors"
              >
                <Info />
                About
              </Link>
              <Link
                to="/contact-us"
                className="flex gap-4 text-sm font-medium text-gray-600 hover:text-teal-600 transition-colors"
              >
                <Mail />
                Contact
              </Link>
              <Link
                to="/instructor/apply"
                className="flex gap-4 text-sm font-medium text-gray-600 hover:text-teal-600 transition-colors"
              >
                <Mountain />
                Teach on NewLearn
              </Link>
              {user && (
                <>
                  <Link
                    to="/profile/cart"
                    className="text-sm font-medium text-gray-600 hover:text-teal-600 flex items-center gap-4"
                  >
                    <ShoppingCart />
                    Cart
                    {/* {cart?.length > 0 && <Badge>{cart.length}</Badge>} */}
                  </Link>
                  <Link
                    to="/profile/wishlist"
                    className="text-sm font-medium text-gray-600 hover:text-teal-600 flex items-center gap-4"
                  >
                    <Heart />
                    Wishlist
                    {/* {wishlist?.length > 0 && <Badge>{wishlist.length}</Badge>} */}
                  </Link>
                </>
              )}
            </nav>
            {!user && (
              <div className="flex flex-col gap-2 mt-4">
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
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
