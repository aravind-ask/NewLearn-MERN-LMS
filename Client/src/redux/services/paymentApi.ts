import { api } from "./apiSetup";

export const paymentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Create a Razorpay order
    createRazorpayOrder: builder.mutation({
      query: (amount) => ({
        url: "/payments/create-order",
        method: "POST",
        body: { amount },
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
  }),
});

export const {
  useCreateRazorpayOrderMutation,
  useVerifyRazorpayPaymentMutation,
} = paymentApi;
