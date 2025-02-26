import { IndianRupee, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

const InstructorDashboard = ({ data }) => {
  console.log(data);

  function calculateTotalStudentsAndProfit() {
    const { totalStudents, totalProfit, studentList } =
      data.data.courses.reduce(
        (acc, course) => {
          const studentCount = course.students.length;
          acc.totalStudents += studentCount;
          acc.totalProfit += studentCount * course.pricing;

          course.students.forEach((student) => {
            acc.studentList.push({
              courseTitle: course.title,
              studentName: student.studentName,
              studentEmail: student.studentEmail,
            });
          });
          return acc;
        },
        { totalStudents: 0, totalProfit: 0, studentList: [] }
      );
    return { totalStudents, totalProfit, studentList };
  }

  console.log(calculateTotalStudentsAndProfit());

  const config = [
    {
      icon: Users,
      label: "Students",
      value: calculateTotalStudentsAndProfit().totalStudents,
    },
    {
      icon: IndianRupee,
      label: "Revenue",
      value: calculateTotalStudentsAndProfit().totalProfit,
    },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {config.map((item, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {item.label}
              </CardTitle>
              <item.icon className="h-4 w-4 text-muted-foreground " />
            </CardHeader>
            <CardContent className="text-2xl font-bold">
              {item.value}
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Student List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Student Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {calculateTotalStudentsAndProfit().studentList.map(
                  (student, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-bold">
                        {student.courseTitle}
                      </TableCell>
                      <TableCell>{student.studentName}</TableCell>
                      <TableCell>{student.studentEmail}</TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InstructorDashboard;
