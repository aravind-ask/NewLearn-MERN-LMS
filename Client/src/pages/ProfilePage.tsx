import { useState, useEffect } from "react";
import { Home, Book, Award, LogOut, ShoppingCart, Heart, ShoppingBag } from "lucide-react";
import Profile from "@/components/profile/Profile";
import MyLearnings from "@/components/profile/MyLearnings";
import Certificates from "@/components/profile/MyCertificates";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/redux/slices/authSlice";
import { useLogoutMutation } from "@/redux/services/authApi";
import { useNavigate, useLocation } from "react-router-dom";
import { RootState } from "@/redux/store";
import WishlistPage from "./Wishlist";
import CartPage from "./Cart";
import PaymentHistory from "@/components/profile/PaymentHistory";

const ProfilePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("profile");
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const [logoutMutation] = useLogoutMutation();

  const tabs = [
    { key: "profile", label: "Profile", icon: <Home size={20} /> },
    { key: "cart", label: "Cart", icon: <ShoppingCart size={20} /> },
    { key: "wishlist", label: "Wishlist", icon: <Heart size={20} /> },
    { key: "my-courses", label: "My Courses", icon: <Book size={20} /> },
    {
      key: "certificates",
      label: "Certificates",
      icon: <Award size={20} />,
    },
    {
      key: "paymentHistory",
      label: "Purchase History",
      icon: <ShoppingBag size={20} />,
    },
  ];

  useEffect(() => {
    const currentTab = location.pathname.split("/").pop();
    if (currentTab && tabs.some((tab) => tab.key === currentTab)) {
      setSelectedTab(currentTab);
    }
  }, [location]);

  const handleTabChange = (tabKey: string) => {
    setSelectedTab(tabKey);
    navigate(`/profile/${tabKey}`);
  };

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

  return (
    <div className="flex h-max bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 sticky top-28 bg-white shadow-md p-4 flex flex-col gap-4">
        <h2 className="text-xl font-bold text-center mb-4">Dashboard</h2>

        {tabs.map((tab) => (
          <Button
            key={tab.key}
            variant={selectedTab === tab.key ? "default" : "outline"}
            onClick={() => handleTabChange(tab.key)}
            className="flex items-center gap-2 w-full justify-start"
          >
            {tab.icon}
            {tab.label}
          </Button>
        ))}

        <Button
          variant="destructive"
          onClick={handleLogout}
          className="flex items-center gap-2"
        >
          <LogOut size={20} />
          Logout
        </Button>
      </aside>

      {/* Main Content */}
      <main className="h-full flex-1 p-6">
        <Card className="p-4">
          {selectedTab === "profile" && <Profile />}
          {selectedTab === "cart" && <CartPage />}
          {selectedTab === "wishlist" && <WishlistPage />}
          {selectedTab === "my-courses" && <MyLearnings />}
          {selectedTab === "certificates" && <Certificates />}
          {selectedTab === "paymentHistory" && <PaymentHistory />}
        </Card>
      </main>
    </div>
  );
};

export default ProfilePage;
