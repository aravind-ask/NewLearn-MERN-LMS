// src/pages/SalesPage.tsx
import React, { useState } from "react";
import {
  useGetAllPaymentsQuery,
  useGetPaymentsByDateRangeQuery,
} from "../../redux/services/paymentApi";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import SalesChart from "@/components/SalesChart";

const SalesPage: React.FC = () => {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const {
    data: allPayments,
    isLoading: isAllPaymentsLoading,
    isError: isAllPaymentsError,
  } = useGetAllPaymentsQuery();

  const {
    data: paymentsByDateRange,
    isLoading: isDateRangeLoading,
    isError: isDateRangeError,
    refetch: refetchDateRange,
  } = useGetPaymentsByDateRangeQuery(
    { startDate: startDate?.toISOString(), endDate: endDate?.toISOString() },
    { skip: !startDate || !endDate }
  );

  const handleDateRangeSearch = () => {
    if (startDate && endDate) {
      refetchDateRange();
    }
  };

  const payments = startDate && endDate ? paymentsByDateRange : allPayments;

  const totalSales =
    payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
  const totalOrders = payments?.length || 0;
  const successfulPayments =
    payments?.filter((payment) => payment.paymentStatus === "completed").length ||
    0;
  const pendingPayments =
    payments?.filter((payment) => payment.paymentStatus === "pending").length ||
    0;

  const chartData = payments?.map((payment) => ({
    orderDate: format(new Date(payment.orderDate), "MMM dd, yyyy"),
    amount: payment.amount,
  }));

  if (isAllPaymentsLoading || isDateRangeLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (isAllPaymentsError || isDateRangeError) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        Error fetching payments
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Sales Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${totalSales.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalOrders}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Successful Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{successfulPayments}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Pending Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{pendingPayments}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium">Start Date</label>
          <Input
            type="date"
            value={startDate ? format(startDate, "yyyy-MM-dd") : ""}
            onChange={(e) => setStartDate(new Date(e.target.value))}
          />
        </div>
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium">End Date</label>
          <Input
            type="date"
            value={endDate ? format(endDate, "yyyy-MM-dd") : ""}
            onChange={(e) => setEndDate(new Date(e.target.value))}
          />
        </div>
        <Button onClick={handleDateRangeSearch} className="self-end">
          Search
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Sales Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <SalesChart data={chartData} />
        </CardContent>
      </Card>

        <Card>
        <CardHeader>
          <CardTitle className="text-xl">Sales Data</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>User Name</TableHead>
                <TableHead>User Email</TableHead>
                <TableHead>Order Status</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Order Date</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments?.map((payment) => (
                <TableRow key={payment._id}>
                  <TableCell>{payment.orderId}</TableCell>
                  <TableCell>{payment.userName}</TableCell>
                  <TableCell>{payment.userEmail}</TableCell>
                  <TableCell>{payment.orderStatus}</TableCell>
                  <TableCell>{payment.paymentMethod}</TableCell>
                  <TableCell>{payment.paymentStatus}</TableCell>
                  <TableCell>
                    {format(new Date(payment.orderDate), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>${payment.amount.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesPage;
