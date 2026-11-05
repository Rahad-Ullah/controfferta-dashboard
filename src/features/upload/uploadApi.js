import { baseApi } from "../../utils/apiBaseQuery";

export const uploadApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    upload: builder.mutation({
      query: (formData) => ({
        url: "/upload",
        method: "POST",
        body: formData,
      }),
    }),
  }),
});

export const { useUploadMutation } = uploadApi;

