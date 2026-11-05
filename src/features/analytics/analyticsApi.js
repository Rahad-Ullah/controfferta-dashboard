import { baseApi } from "../../utils/apiBaseQuery";

export const analyticsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    userGroth: builder.query({
      query: (year) => ({
        url: "/overview/user-growth",
        method: "GET",
        params: { year },
      }),
      providesTags: ["Analytics"],
    }),
  }),
});

export const { useUserGrothQuery } = analyticsApi;

