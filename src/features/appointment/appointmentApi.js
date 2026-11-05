import { baseApi } from "../../utils/apiBaseQuery";

export const appointmentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllAppointments: builder.query({
      query: (params) => ({
        url: "/appointments",
        method: "GET",
        params,
      }),
      providesTags: ["Appointments"],
    }),
  }),
});

export const { useGetAllAppointmentsQuery } = appointmentApi;

