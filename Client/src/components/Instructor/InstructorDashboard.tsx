import { useState } from "react";
import { IndianRupee, Users, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { DataTable } from "../common/DataTable";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

interface Student {
  studentName: string;
  studentEmail: string;
}

interface Course {
  title: string;
  students: Student[];
  pricing: number;
}

interface InstructorData {
  data?: {
    courses?: Course[];
  };
}

interface StudentListItem {
  courseTitle: string;
  studentName: string;
  studentEmail: string;
}

const InstructorDashboard = ({ data }: { data?: InstructorData }) => {
  const [page, setPage] = useState(1);
  const limit = 5; // Number of students per page

  // Calculate totals and student list with defensive checks
  const calculateTotalStudentsAndProfit = () => {
    if (!data?.data?.courses || !Array.isArray(data.data.courses)) {
      return {
        totalStudents: 0,
        totalProfit: 0,
        studentList: [] as StudentListItem[],
      };
    }

    return data.data.courses.reduce(
      (acc, course) => {
        const studentCount = course.students?.length || 0;
        acc.totalStudents += studentCount;
        acc.totalProfit += studentCount * (course.pricing || 0);

        if (course.students) {
          course.students.forEach((student) => {
            acc.studentList.push({
              courseTitle: course.title || "Unknown Course",
              studentName: student.studentName || "Unknown",
              studentEmail: student.studentEmail || "N/A",
            });
          });
        }
        return acc;
      },
      {
        totalStudents: 0,
        totalProfit: 0,
        studentList: [] as StudentListItem[],
      }
    );
  };

  const { totalStudents, totalProfit, studentList } =
    calculateTotalStudentsAndProfit();
  const totalPages = Math.ceil(studentList.length / limit) || 1;

  // Paginate the student list
  const paginatedStudentList = studentList.slice(
    (page - 1) * limit,
    page * limit
  );

  const config = [
    {
      icon: Users,
      label: "Students",
      value: totalStudents,
    },
    {
      icon: IndianRupee,
      label: "Revenue",
      value: totalProfit,
    },
  ];

  const columns = [
    {
      header: "Course",
      accessor: "courseTitle",
      render: (student: StudentListItem) => (
        <span className="font-bold text-gray-900">{student.courseTitle}</span>
      ),
    },
    {
      header: "Student Name",
      accessor: "studentName",
    },
    {
      header: "Student Email",
      accessor: "studentEmail",
    },
  ];

  // Handle undefined or empty data
  if (!data || !data.data || !data.data.courses) {
    return (
      <div className="space-y-8">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load instructor data. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {config.map((item, index) => (
          <Card key={index} className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gray-50 border-b">
              <CardTitle className="text-sm font-medium text-gray-700">
                {item.label}
              </CardTitle>
              <item.icon className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-gray-900">
                {item.label === "Revenue"
                  ? `₹${item.value.toLocaleString("en-IN")}`
                  : item.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle className="text-xl font-semibold text-gray-800">
            Student List
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <DataTable
            columns={columns}
            data={paginatedStudentList}
            isLoading={false} // Data is passed as prop, no loading state needed
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
          {studentList.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              No students enrolled yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InstructorDashboard;
