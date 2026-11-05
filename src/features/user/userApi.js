import { baseApi } from "../../utils/apiBaseQuery";

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllUser: builder.query({
      query: (params) => ({
        url: "/users",
        method: "GET",
        params,
      }),
      providesTags: ["Users"],
    }),
    updateStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/users/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Users"],
    }),
  }),
});

export const { useGetAllUserQuery, useUpdateStatusMutation } = userApi;

