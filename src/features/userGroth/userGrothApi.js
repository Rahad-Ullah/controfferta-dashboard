import { baseApi } from "../../utils/apiBaseQuery";

export const userGrothApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    userGroth: builder.query({
      query: (year) => ({
        url: "/overview/user-growth",
        method: "GET",
        params: { year },
      }),
      providesTags: ["UserGrowth"],
    }),
  }),
});

export const { useUserGrothQuery } = userGrothApi;

