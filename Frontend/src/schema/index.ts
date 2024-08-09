import * as z from 'zod'

export const SigninSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1, { message: "Password is required"})
})

export const SignupSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6, { message: "Minimum 6 characters required"}).max(30, { message: "Password should be less than 30 characters"}),
    username: z.string().min(1, { message: "Name is required"}).max(30, { message: "Userame should be less than 30 characters"}),
})

export const UsernameSchema = z.object({
    username: z.string().min(1, { message: "Name is required"}).max(30, { message: "Userame should be less than 30 characters"}),
})

export const PasswordSchema = z.object({
    oldPassword: z.string(),
    newPassword: z.string().min(6, { message: "Minimum 6 characters required"}).max(30, { message: "Password should be less than 30 characters"}),
})
