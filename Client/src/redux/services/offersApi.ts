import { api } from "./apiSetup";

export const offerApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getOffers: builder.query({
      query: ({ page = 1, limit = 10 }) =>
        `/offers?page=${page}&limit=${limit}`,
      providesTags: ["Offers"],
    }),
    createOffer: builder.mutation({
      query: (offerData) => ({
        url: "/offers",
        method: "POST",
        body: offerData,
      }),
      invalidatesTags: ["Offers"],
    }),
    updateOffer: builder.mutation({
      query: ({ id, offerData }) => ({
        url: `/offers/${id}`,
        method: "PUT",
        body: offerData,
      }),
      invalidatesTags: ["Offers"],
    }),
    deleteOffer: builder.mutation({
      query: (id) => ({
        url: `/offers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Offers"],
    }),
  }),
});

export const {
  useGetOffersQuery,
  useCreateOfferMutation,
  useUpdateOfferMutation,
  useDeleteOfferMutation,
} = offerApi;