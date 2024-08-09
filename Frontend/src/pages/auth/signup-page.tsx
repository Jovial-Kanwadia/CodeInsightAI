import { login } from '@/features/auth/AuthSlice';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/app/store';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import CardWrapper from "@/components/auth/card-wrapper"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { SignupSchema } from "@/schema"
import { 
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import axios from 'axios';
import { fetchUser } from '@/features/user/UserSlice';
import { displayError } from '@/lib/utils';
import { extractErrorMessage } from '@/lib/utils';

export const SignUp: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof SignupSchema>>({
    resolver: zodResolver(SignupSchema),
    defaultValues: {
        email: "",
        password: "",
        username: "",
    }
});

  const handleRegister = async(credentials: z.infer<typeof SignupSchema>) => {
    //Register from backend
    try {
      const response = await axios.post('http://localhost:8000/api/v1/users/register', credentials);
      //Login User
      const resultAction = await dispatch(login(credentials));
      if (login.fulfilled.match(resultAction)) {
        console.log(response.data.message);
        await dispatch(fetchUser())
        navigate('/');
      } else {
        console.error(resultAction.payload || 'Failed to login');
        const errorMessage = extractErrorMessage(resultAction.payload as string)
        displayError(errorMessage || "Failed to login")
      } 
    } catch (error: any) {
      if (error.response && error.response.data) {
        displayError(error.response.data.message || "An error occurred during registration.");
      } else {
        displayError("Error in handleRegister try-catch");
      }
    } 
  };

  return (
    <div className='flex flex-col h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-400 to-slate-800'>
        <CardWrapper
        headerLabel = 'Welcome To Stuconnect'
        backButtonLabel = "Already have an account?"
        backButtonHref = "/sign-in"
        showSocial
        >
            <Form {...form}>
            <form 
            onSubmit={form.handleSubmit(handleRegister)}
            className="space-y-6"
            >
                <div className="space-y-4">
                <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-lg">Userame</FormLabel>
                            <FormControl>
                                <Input
                                // disabled={isPending}
                                {...field}
                                type="text"
                                placeholder="Enter Your Userame Here"
                                />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                    />
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
                            <FormMessage/>
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
                            <FormMessage/>
                        </FormItem>
                    )}
                    />
                </div>
                <Button
                // disabled={isPending}
                type="submit"
                className="w-full"
                >
                    Create an account
                </Button>
            </form>
            </Form>
        </CardWrapper>
        </div>
  );
};
