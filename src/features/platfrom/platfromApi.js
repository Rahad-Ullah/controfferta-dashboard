import { baseApi } from "../../utils/apiBaseQuery";

export const platfromApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPlatfrom: builder.query({
      query: () => ({
        url: "/platform",
        method: "GET",
      }),
      providesTags: ["Platform"],
    }),
    updatePlatfrom: builder.mutation({
      query: (data) => ({
        url: "/platform",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Platform"],
    }),
  }),
});

export const { useGetPlatfromQuery, useUpdatePlatfromMutation } = platfromApi;

