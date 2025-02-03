import { useState } from "react";
import { Home, Book, Award, LogOut } from "lucide-react";
import Profile from "@/components/profile/Profile";
import MyLearnings from "@/components/profile/MyLearnings";
import Certificates from "@/components/profile/MyCertificates";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/redux/slices/authSlice";
import { useLogoutMutation } from "@/redux/services/authApi";
import { useNavigate } from "react-router-dom";
import { RootState } from "@/redux/store";

const ProfilePage = () => {
  const [selectedTab, setSelectedTab] = useState("profile");
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const [logoutMutation] = useLogoutMutation();
  const navigate = useNavigate();

  const tabs = [
    { key: "profile", label: "Profile", icon: <Home size={20} /> },
    { key: "my-learnings", label: "My Learnings", icon: <Book size={20} /> },
    {
      key: "certificates",
      label: "Certificates",
      icon: <Award size={20} />,
    },
  ];

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
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-4 flex flex-col gap-4">
        <h2 className="text-xl font-bold text-center mb-4">Dashboard</h2>

        {tabs.map((tab) => (
          <Button
            key={tab.key}
            variant={selectedTab === tab.key ? "default" : "outline"}
            onClick={() => setSelectedTab(tab.key)}
            className="flex items-center gap-2 w-full justify-start"
          >
            {tab.icon}
            {tab.label}
          </Button>
        ))}

        <Button
          variant="destructive"
          onClick={handleLogout}
          className="flex items-center gap-2 mt-auto"
        >
          <LogOut size={20} />
          Logout
        </Button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <Card className="p-4">
          {selectedTab === "profile" && <Profile />}
          {selectedTab === "my-learnings" && <MyLearnings />}
          {selectedTab === "certificates" && <Certificates />}
        </Card>
      </main>
    </div>
  );
};

export default ProfilePage;
