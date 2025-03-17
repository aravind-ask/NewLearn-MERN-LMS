import { api } from "./apiSetup";

export const courseApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCourses: builder.query({
      query: ({
        page,
        limit,
        search,
        category,
        difficulty,
        sortBy,
        sortOrder,
      }) => ({
        url: "/courses",
        params: {
          page,
          limit,
          search,
          category,
          difficulty,
          sortBy,
          sortOrder,
        },
      }),
      providesTags: ["Courses"],
    }),
    createCourse: builder.mutation({
      query: (courseData) => ({
        url: "/courses",
        method: "POST",
        body: courseData,
      }),
      invalidatesTags: ["Courses"],
    }),
    updateCourse: builder.mutation({
      query: (courseEditData) => ({
        url: `/courses`,
        method: "PUT",
        body: courseEditData,
      }),
      invalidatesTags: ["Courses"],
    }),
    deleteCourse: builder.mutation({
      query: (courseId) => ({
        url: `/courses/${courseId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Courses"],
    }),
    getCourseDetails: builder.query({
      query: (courseId) => ({
        url: `/courses/${courseId}`,
      }),
      providesTags: ["Details"],
    }),
    getCourseEnrollent: builder.query({
      query: (courseId) => ({
        url: `/courses/enrolled/:${courseId}`,
      }),
    }),
    addToCart: builder.mutation({
      query: ({ courseId, offer }) => ({
        url: `/cart`,
        method: "POST",
        body: { courseId, offer },
      }),
      invalidatesTags: ["Cart"],
    }),
    removeFromCart: builder.mutation({
      query: (courseId) => ({
        url: `/cart/${courseId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Cart"],
    }),
    addToWishlist: builder.mutation({
      query: (courseId) => ({
        url: `/wishlist/add`,
        method: "POST",
        body: { courseId },
      }),
      invalidatesTags: ["Wishlist"],
    }),
    removeFromWishlist: builder.mutation({
      query: (courseId) => ({
        url: `/wishlist/remove`,
        method: "DELETE",
        body: { courseId },
      }),
      invalidatesTags: ["Wishlist"],
    }),
    getCart: builder.query({
      query: () => ({
        url: `/cart`,
      }),
      providesTags: ["Cart"],
    }),
    getWishlist: builder.query({
      query: () => ({
        url: `/wishlist`,
      }),
      providesTags: ["Wishlist"],
    }),
  }),
});

export const {
  useCreateCourseMutation,
  useGetCoursesQuery,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
  useGetCourseDetailsQuery,
  useGetCourseEnrollentQuery,
  useAddToCartMutation,
  useRemoveFromCartMutation,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useGetCartQuery,
  useGetWishlistQuery,
} = courseApi;
