import { useState } from "react";
import { useGetPaymentHistoryQuery } from "@/redux/services/paymentApi";
import { Button } from "@/components/ui/button";
import { Download, AlertCircle, CheckCircle2 } from "lucide-react";
import { DataTable } from "@/components/common/DataTable";
import { format } from "date-fns";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Pagination as ShadcnPagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface Payment {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  orderStatus: string;
  paymentMethod: string;
  paymentStatus: string;
  orderId: string;
  paymentId: string;
  courses: {
    courseId: string;
    courseTitle: string;
    courseImage: string;
    coursePrice: number;
    instructorId: string;
    instructorName: string;
    _id: string;
  }[];
  amount: number;
  orderDate: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

const PaymentHistory = () => {
  const [page, setPage] = useState(1);
  const limit = 5; // Adjust as needed

  const {
    data: paymentHistory,
    isLoading,
    isError,
  } = useGetPaymentHistoryQuery({ page, limit });

  const generateInvoice = (payment: Payment) => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(40, 40, 40);
    doc.text("INVOICE", 20, 20);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text("NewLearn LMS", 20, 35);
    doc.text("123 Learning Street, Education City", 20, 45);
    doc.text("Email: support@newlearn.com", 20, 55);

    doc.setFontSize(11);
    doc.setTextColor(40, 40, 40);
    doc.text(`Invoice #: ${payment.orderId}`, 140, 35);
    doc.text(
      `Date: ${format(new Date(payment.orderDate), "MMMM dd, yyyy")}`,
      140,
      45
    );
    doc.text(`Payment Method: ${payment.paymentMethod.toUpperCase()}`, 140, 55);

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Bill To:", 20, 75);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(payment.userName, 20, 85);
    doc.text(payment.userEmail, 20, 95);

    const tableData = payment.courses.map((course, index) => [
      index + 1,
      course.courseTitle,
      `₹${course.coursePrice.toLocaleString()}`,
    ]);

    autoTable(doc, {
      startY: 110,
      head: [["#", "Course Title", "Amount"]],
      body: tableData,
      styles: { fontSize: 10, cellPadding: 4 },
      headStyles: {
        fillColor: [40, 40, 40],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      columnStyles: {
        0: { halign: "center", cellWidth: 15 },
        1: { halign: "left" },
        2: { halign: "right", cellWidth: 40 },
      },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Total Amount:", 140, finalY);
    doc.setFont("helvetica", "normal");
    doc.text(`₹${payment.amount.toLocaleString()}`, 180, finalY, {
      align: "right",
    });

    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text("Thank you for your purchase!", 20, finalY + 20);
    doc.text("For any queries, contact support@newlearn.com", 20, finalY + 30);

    doc.save(`invoice_${payment.orderId}.pdf`);
  };

  const columns = [
    {
      header: "Order Date",
      accessor: (item: Payment) => (
        <span>{format(new Date(item.orderDate), "MMM dd, yyyy HH:mm")}</span>
      ),
      align: "left" as const,
    },
    {
      header: "Courses",
      accessor: (item: Payment) => (
        <div className="flex flex-col gap-1">
          {item.courses.map((course) => (
            <span key={course._id} className="text-sm truncate max-w-xs">
              {course.courseTitle}
            </span>
          ))}
        </div>
      ),
      align: "left" as const,
    },
    {
      header: "Amount",
      accessor: (item: Payment) => (
        <span className="font-medium">₹{item.amount.toLocaleString()}</span>
      ),
      align: "right" as const,
    },
    {
      header: "Status",
      accessor: (item: Payment) => (
        <span
          className={`flex items-center gap-2 ${
            item.paymentStatus === "completed"
              ? "text-green-600"
              : "text-yellow-600"
          }`}
        >
          {item.paymentStatus === "completed" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          {item.paymentStatus.charAt(0).toUpperCase() +
            item.paymentStatus.slice(1)}
        </span>
      ),
      align: "center" as const,
    },
    {
      header: "Order ID",
      accessor: "orderId",
      align: "left" as const,
    },
    {
      header: "Actions",
      accessor: (item: Payment) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => generateInvoice(item)}
          disabled={item.paymentStatus !== "completed"}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Invoice
        </Button>
      ),
      align: "center" as const,
    },
  ];

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  if (isError || !paymentHistory?.success) {
    return (
      <div className="text-center py-10 text-red-500">
        Failed to fetch payment history.
      </div>
    );
  }

  const payments: Payment[] = paymentHistory?.data?.payments || [];
  const totalPages: number = paymentHistory?.data?.totalPages || 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Purchase History
      </h1>
      {payments.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <DataTable
            columns={columns}
            data={payments}
            isLoading={isLoading}
            page={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      ) : (
        <div className="text-center py-20">
          <AlertCircle className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            No Purchase History
          </h2>
          <p className="text-gray-500">
            You haven’t made any purchases yet. Start exploring courses!
          </p>
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;
