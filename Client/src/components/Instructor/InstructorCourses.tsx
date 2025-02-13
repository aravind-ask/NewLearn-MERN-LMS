import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Delete, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";

const InstructorCourses = () => {
  const navigate = useNavigate();
  return (
    <Card>
      <CardHeader className="flex justify-between flex-row items-center">
        <CardTitle className="text-3xl font-extrabold">All Courses</CardTitle>
        <Button
          className="p-5 cursor-pointer"
          onClick={() => navigate("/instructor/create-new-course")}
        >
          Create New Course
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">
                  ReactJS Full Course 2025
                </TableCell>
                <TableCell>100</TableCell>
                <TableCell>$5000</TableCell>
                <TableCell className="text-right">
                  <Button className="cursor-pointer" variant="ghost" size="sm">
                    <Edit className="h-6 w-6" />
                  </Button>
                  <Button className="cursor-pointer" variant="ghost" size="sm">
                    <Delete className="h-6 w-6" />
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default InstructorCourses;
