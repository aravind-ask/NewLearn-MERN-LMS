import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MenuIcon, MountainIcon, ShoppingCart, Heart } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import SearchBar from "./SearchBar";
import { AvatarDropdown } from "./AvatarDropDown";
import { Badge } from "./ui/badge";

export default function Navbar() {
  const { user } = useSelector((state: RootState) => state.auth);
  // const { cart, wishlist } = useSelector((state: RootState) => state.user);
  const role = user?.role;
  console.log("Current User:", user);

  // Admin-specific Navbar
  if (role === "admin") {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 flex h-20 w-full items-center bg-gray-800 px-8 text-white shadow-lg">
        <div className="flex w-full items-center justify-between">
          <h1 className="text-2xl font-bold">Welcome, Admin!</h1>
          <p className="text-lg">Thank you for managing our platform.</p>
        </div>
      </header>
    );
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-20 w-full items-center bg-white px-8 shadow-lg">
      {/* Mobile Menu */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="lg:hidden">
            <MenuIcon className="h-6 w-6" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 bg-gray-100">
          <div className="flex flex-col gap-4 py-6">
            <Link to="#" className="flex items-center gap-2">
              <MountainIcon className="h-6 w-6" />
              <span className="text-lg font-semibold">NewLearn</span>
            </Link>
            {user && (
              <>
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarImage
                      src={user?.photoUrl || "https://github.com/shadcn.png"}
                      alt="@shadcn"
                    />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <span className="text-lg font-semibold">{user.name}</span>
                </div>
                <Link
                  to="/cart"
                  className="text-lg font-semibold hover:text-gray-700 flex items-center gap-2"
                >
                  <ShoppingCart className="h-5 w-5" />
                  Cart
                  {/* {cart.length > 0 && (
                <Badge variant="secondary">{cart.length}</Badge>
              )} */}
                </Link>
                <Link
                  to="/wishlist"
                  className="text-lg font-semibold hover:text-gray-700 flex items-center gap-2"
                >
                  <Heart className="h-5 w-5" />
                  Wishlist
                  {/* {wishlist.length > 0 && (
                <Badge variant="secondary">{wishlist.length}</Badge>
              )} */}
                </Link>
              </>
            )}
            <Link to="/" className="text-lg font-semibold hover:text-gray-700">
              Home
            </Link>
            <Link
              to="/all-courses"
              className="text-lg font-semibold hover:text-gray-700"
            >
              Courses
            </Link>
            <Link to="#" className="text-lg font-semibold hover:text-gray-700">
              About
            </Link>
            <Link to="#" className="text-lg font-semibold hover:text-gray-700">
              Contact
            </Link>
            <Link
              to="/instructor/apply"
              className="text-lg font-semibold hover:text-gray-700"
            >
              Teach on NewLearn
            </Link>
          </div>
        </SheetContent>
      </Sheet>

      {/* Logo */}
      <Link to="#" className="mr-6 hidden lg:flex items-center gap-2">
        <MountainIcon className="h-6 w-6" />
        <span className="text-xl font-bold">NewLearn</span>
      </Link>

      {/* Search Bar */}
      <div className="flex-1 mx-4">
        <SearchBar />
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden lg:flex items-center gap-6">
        <Link
          to="/"
          className="text-sm font-medium hover:text-gray-700 transition-colors"
        >
          Home
        </Link>
        <Link
          to="/all-courses"
          className="text-sm font-medium hover:text-gray-700 transition-colors"
        >
          Courses
        </Link>
        <Link
          to="#"
          className="text-sm font-medium hover:text-gray-700 transition-colors"
        >
          About
        </Link>
        <Link
          to="#"
          className="text-sm font-medium hover:text-gray-700 transition-colors"
        >
          Contact
        </Link>
        <Link
          to="/instructor/apply"
          className="text-sm font-medium hover:text-gray-700 transition-colors"
        >
          Teach on NewLearn
        </Link>

        {user ? (
          <>
            <Link
              to="/cart"
              className="text-sm font-medium hover:text-gray-700 transition-colors flex items-center gap-2"
            >
              <ShoppingCart className="h-5 w-5" />
              Cart
              {/* {cart.length > 0 && <Badge variant="secondary">{cart.length}</Badge>} */}
            </Link>
            <Link
              to="/wishlist"
              className="text-sm font-medium hover:text-gray-700 transition-colors flex items-center gap-2"
            >
              <Heart className="h-5 w-5" />
              Wishlist
              {/* {wishlist.length > 0 && (
            <Badge variant="secondary">{wishlist.length}</Badge>
          )} */}
            </Link>
            <AvatarDropdown />
          </>
        ) : (
          <div className="flex gap-4">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 text-sm font-medium bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Signup
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
