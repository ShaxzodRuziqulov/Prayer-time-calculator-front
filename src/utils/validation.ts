import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(3, "Username kamida 3 ta belgi bo‘lsin"),
  password: z.string().min(8, "Parol kamida 8 ta belgi bo‘lsin")
});

export const registerSchema = z.object({
  username: z.string().min(3, "Username kamida 3 ta belgi bo‘lsin"),
  email: z.string().email("Email noto‘g‘ri"),
  password: z.string().min(8, "Parol kamida 8 ta belgi bo‘lsin")
});

export const dateRangeSchema = z
  .object({
    fromDate: z.string().min(1, "Boshlanish sana majburiy"),
    toDate: z.string().min(1, "Tugash sana majburiy")
  })
  .refine((v) => v.fromDate <= v.toDate, {
    message: "fromDate toDate dan kichik yoki teng bo‘lishi kerak",
    path: ["toDate"]
  });

export const passwordSchema = z.object({
  oldPassword: z.string().min(8, "Joriy parol kamida 8 ta belgi bo‘lsin"),
  newPassword: z.string().min(8, "Yangi parol kamida 8 ta belgi bo‘lsin")
});

