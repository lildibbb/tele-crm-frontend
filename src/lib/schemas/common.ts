import { z } from "zod/v4";

// Generic API response wrapper matching backend { statusCode, message, data }
export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    statusCode: z.number(),
    message: z.string(),
    data: dataSchema,
    total: z.number().optional(),
  });

export type ApiResponse<T> = {
  statusCode: number;
  message: string;
  data: T;
  total?: number;
};

export type PaginatedApiResponse<T> = ApiResponse<T> & {
  total: number;
  pageCount: number;
};
