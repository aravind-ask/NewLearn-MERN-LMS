import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/redux/slices/authSlice";
import { Award, Book, LogOut, ScanFace, User2 } from "lucide-react";
import Users from "@/components/Admin/Users";
import Courses from "@/components/Admin/Courses";
import Sales from "@/components/Admin/Sales";
import { useLogoutMutation } from "@/redux/services/authApi";
import { useNavigate } from "react-router-dom";
import { RootState } from "@/redux/store";
import AdminInstructorRequests from "@/components/Admin/InstructorRequests";
import Category from "@/components/Admin/Category";

const AdminDashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [selectedTab, setSelectedTab] = useState("users");
  const [logoutMutation] = useLogoutMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const tabs = [
    { key: "users", label: "Users", icon: <User2 size={20} /> },
    {
      key: "instructorRequests",
      label: "Instructor Requests",
      icon: <User2 size={20} />,
    },

    { key: "courses", label: "Courses", icon: <Book size={20} /> },
    {
      key: "sales",
      label: "Sales",
      icon: <Award size={20} />,
    },
    {
      key: "category",
      label: "Category",
      icon: <ScanFace size={20} />,
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
        <h2 className="text-xl font-bold text-center mb-4">Admin Dashboard</h2>
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
          className="flex items-center gap-2 width-full justify-start"
        >
          <LogOut size={20} />
          Logout
        </Button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <Card className="p-4">
          {selectedTab === "users" && <Users />}
          {selectedTab === "courses" && <Courses />}
          {selectedTab === "sales" && <Sales />}
          {selectedTab === "instructorRequests" && <AdminInstructorRequests />}
          {selectedTab === "category" && <Category />}
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;
