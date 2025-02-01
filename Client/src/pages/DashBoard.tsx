import { useState } from "react";
import { Home, Book, Award, LogOut } from "lucide-react";
import Profile from "@/components/dashboard/Profile";
import MyLearnings from "@/components/dashboard/MyLearnings";
import Certificates from "@/components/dashboard/MyCertificates";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useDispatch } from "react-redux";
import { logout } from "@/redux/slices/authSlice";

const Dashboard = () => {
  const [selectedTab, setSelectedTab] = useState("profile");
  const dispatch = useDispatch();

  const tabs = [
    { key: "profile", label: "Profile", icon: <Home size={20} /> },
    { key: "my-learnings", label: "My Learnings", icon: <Book size={20} /> },
    {
      key: "certificates",
      label: "Certificates",
      icon: <Award size={20} />,
    },
  ];

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
          onClick={() => dispatch(logout())}
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

export default Dashboard;
