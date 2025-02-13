import InstructorCourses from "@/components/Instructor/InstructorCourses";
import InstructorDashboard from "@/components/Instructor/InstructorDashboard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { BarChart, BookOpen, LogOut } from "lucide-react";
import React from "react";
import { useLogoutMutation } from "@/redux/services/authApi";
import { logout } from "@/redux/slices/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "@/redux/store";

const InstructorDashboardPage = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = React.useState("dashboard");
  const [logoutMutation] = useLogoutMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const menuItems = [
    {
      icon: BarChart,
      label: "Dashboard",
      value: "dashboard",
      component: <InstructorDashboard />,
    },
    {
      icon: BookOpen,
      label: "Courses",
      value: "courses",
      component: <InstructorCourses />,
    },
    {
      icon: LogOut,
      label: "Logout",
      value: "logout",
      component: null,
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
    <div className="flex h-full min-h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-md hidden md:block">
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-4">Instructor Dashboard</h2>
          <nav>
            {menuItems.map((menuItem) => (
              <Button
                key={menuItem.value}
                variant={activeTab === menuItem.value ? "secondary" : "ghost"}
                className="w-full justify-start mb-2"
                onClick={
                  menuItem.value === "logout"
                    ? handleLogout
                    : () => setActiveTab(menuItem.value)
                }
              >
                <menuItem.icon className="mr-2 h-4 w-4" />
                {menuItem.label}
              </Button>
            ))}
          </nav>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">DashBoard</h1>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {menuItems.map((menuItem) => (
              <TabsContent value={menuItem.value} key={menuItem.value}>
                {menuItem.component !== null ? menuItem.component : null}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default InstructorDashboardPage;
