import { z } from "zod";

export const PROFILE_PHOTO_SIZE = 512;
export const PHOTO_FILE_LIMIT = 5 * 1024 * 1024;
export const PHOTO_ENCODED_LIMIT = 220_000;
export const photoCommand = z
  .object({
    revision: z.number().int().nonnegative(),
    image: z
      .string()
      .max(PHOTO_ENCODED_LIMIT)
      .regex(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/)
      .nullable(),
  })
  .strict();
export type ProfilePhoto = {
  revision: number;
  data: {
    image: string;
    width: number;
    height: number;
    savedAt: string;
  } | null;
};
