import { baseApi } from "../../utils/apiBaseQuery";

export const servicesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllServices: builder.query({
      query: (params) => ({
        url: "/services",
        method: "GET",
        params,
      }),
      providesTags: ["Services"],
    }),
  }),
});

export const { useGetAllServicesQuery } = servicesApi;

