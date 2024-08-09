// src/components/SignIn.js

import { useDispatch } from 'react-redux';
import { login } from '@/features/auth/AuthSlice';
import { AppDispatch } from '@/app/store';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import CardWrapper from '@/components/auth/card-wrapper';
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { SigninSchema } from '@/schema';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { fetchUser } from '@/features/user/UserSlice';



export const SignIn: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  
  const form = useForm<z.infer<typeof SigninSchema>>({
    resolver: zodResolver(SigninSchema),
    defaultValues: {
      email: "",
      password: "",
    }
  })

  const handleLogin = async (credentials: z.infer<typeof SigninSchema>) => {
    // const credentials = { email: 'test@example.com', password: 'password' };
    const resultAction = await dispatch(login(credentials));
    if (login.fulfilled.match(resultAction)) {
      navigate('/');
      dispatch(fetchUser())
    } else {
      console.error(resultAction.payload || 'Failed to login');
    }
  };

  return (
    <div className='flex flex-col h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-400 to-slate-800'>
      <CardWrapper
        headerLabel='Welcome Back'
        backButtonLabel="Don't have an account?"
        backButtonHref="/sign-up"
        showSocial
      >
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleLogin)}
            className="space-y-6"
          >
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Email</FormLabel>
                    <FormControl>
                      <Input
                        // disabled={isPending}
                        {...field}
                        type="email"
                        placeholder="Enter Your Email Here"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Password</FormLabel>
                    <FormControl>
                      <Input
                        // disabled={isPending}
                        {...field}
                        type="password"
                        placeholder="Enter Your Password Here"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button
              // disabled={isPending}
              type="submit"
              className="w-full"
            >
              Sign In
            </Button>
          </form>
        </Form>
      </CardWrapper>
    </div>
  );
};
