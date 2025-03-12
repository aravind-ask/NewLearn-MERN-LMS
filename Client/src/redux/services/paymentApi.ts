import { api } from "./apiSetup";

export const paymentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Create a Razorpay order
    createRazorpayOrder: builder.mutation({
      query: ({ amount, courses, userId, userName, userEmail }) => ({
        url: "/payments/create-order",
        method: "POST",
        body: { amount, courses, userId, userName, userEmail },
      }),
    }),

    // Verify Razorpay payment
    verifyRazorpayPayment: builder.mutation({
      query: (paymentData) => ({
        url: "/payments/verify",
        method: "POST",
        body: paymentData,
      }),
    }),

    // Fetch all payments
    getAllPayments: builder.query({
      query: () => ({
        url: "/payments",
        method: "GET",
      }),
    }),

    // Fetch payments by date range
    getPaymentsByDateRange: builder.query({
      query: ({ startDate, endDate }) => ({
        url: "/payments/date-range",
        method: "GET",
        params: { startDate, endDate },
      }),
    }),
    getPaymentHistory: builder.query({
      query: ({ page, limit }) => ({
        url: "/payments/payment-history",
        method: "GET",
        params: { page, limit },
      }),
    }),
  }),
});

export const {
  useCreateRazorpayOrderMutation,
  useVerifyRazorpayPaymentMutation,
  useGetAllPaymentsQuery,
  useGetPaymentsByDateRangeQuery,
  useGetPaymentHistoryQuery,
} = paymentApi;
