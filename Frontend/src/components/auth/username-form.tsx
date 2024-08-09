import React from 'react';
import { useDispatch } from 'react-redux';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { UsernameSchema } from '@/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateUsername } from "../../features/user/UserSlice"
import { AppDispatch } from '../../app/store';

interface UsernameFormProps {
    username: string;
}

const UsernameForm: React.FC<UsernameFormProps> = ({ username }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { 
        register, 
        handleSubmit, 
        formState: { errors, isSubmitting } 
    } = useForm<z.infer<typeof UsernameSchema>>({
        resolver: zodResolver(UsernameSchema),
        defaultValues: {
            username: username
        }
    });

    const onSubmit: SubmitHandler<z.infer<typeof UsernameSchema>> = (data) => {
        dispatch(updateUsername({ username: data.username }));
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-2">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="username" className="text-right">
                        Username
                    </Label>
                    <Input 
                        id="username" 
                        {...register('username')} 
                        className="col-span-2" 
                    />
                    <Button type="submit" disabled={isSubmitting}>
                        Save Changes
                    </Button>
                </div>
                {errors.username && (
                    <div className="col-span-4 text-red-600">
                        {errors.username.message}
                    </div>
                )}
            </div>
        </form>
    );
};

export default UsernameForm;
