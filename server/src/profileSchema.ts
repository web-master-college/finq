import { z } from 'zod'

const currentYear = new Date().getFullYear()

const requiredText = (maxLength: number) => z.string().trim().min(1).max(maxLength)

const addressText = (maxLength: number) => z.string().trim().max(maxLength)

const streetNumberSchema = z
  .union([z.int(), z.string().trim().regex(/^\d+$/)])
  .transform((value) => (typeof value === 'number' ? value : Number(value)))
  .pipe(z.int().min(0).max(1_000_000))

const postcodeSchema = z
  .union([z.string(), z.number()])
  .transform((value) => String(value).trim())
  .pipe(z.string().max(32))

const nameSchema = requiredText(100)

const httpUrlSchema = z.string().trim().max(2048).pipe(z.httpUrl())

export const profileSchema = z.strictObject({
  id: z.uuid(),
  title: requiredText(32),
  firstName: nameSchema,
  lastName: nameSchema,
  gender: requiredText(32),
  country: addressText(100),
  phone: requiredText(64),
  email: z.string().trim().max(254).pipe(z.email()),
  age: z.int().min(0).max(120),
  birthYear: z.int().min(1900).max(currentYear),
  streetNumber: streetNumberSchema,
  streetName: addressText(120),
  city: addressText(100),
  state: addressText(100),
  postcode: postcodeSchema,
  thumbnailUrl: httpUrlSchema,
  largeImageUrl: httpUrlSchema,
})

export const profileNameUpdateSchema = z
  .strictObject({
    firstName: nameSchema.optional(),
    lastName: nameSchema.optional(),
  })
  .refine((value) => value.firstName !== undefined || value.lastName !== undefined)

export type Profile = z.infer<typeof profileSchema>
export type ProfileNameUpdate = z.infer<typeof profileNameUpdateSchema>
