import { baseApi } from "../../utils/apiBaseQuery";

export const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyProfile: builder.query({
      query: () => ({
        url: "/profile/me",
        method: "GET",
      }),
      providesTags: ["Profile"],
    }),
    updateProfile: builder.mutation({
      query: (data) => ({
        url: "/profile/update",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Profile"],
    }),
    changePassword: builder.mutation({
      query: (data) => ({
        url: "/profile/change-password",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  useGetMyProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
} = profileApi;

