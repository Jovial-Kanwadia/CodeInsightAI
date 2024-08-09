import React from 'react';
import { Button } from '../ui/button';
import { DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { PasswordSchema } from "../../schema/index"
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/app/store';
import { updatePassword } from '@/features/user/UserSlice';


const PasswordForm: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { 
        register, 
        handleSubmit, 
        formState: { errors, isSubmitting } 
    } = useForm<z.infer<typeof PasswordSchema>>({
        resolver: zodResolver(PasswordSchema),
    });

    const onSubmit: SubmitHandler<z.infer<typeof PasswordSchema>> = data => {
        dispatch(updatePassword({ oldPassword: data.oldPassword, newPassword: data.newPassword }))
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-2">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="oldPassword" className="text-right">
                        Old Password
                    </Label>
                    <Input 
                        id="oldPassword" 
                        type="password"
                        {...register('oldPassword')} 
                        className="col-span-3 m-1" 
                    />
                    {errors.oldPassword && (
                        <div className="col-span-4 text-red-600">
                            {errors.oldPassword.message}
                        </div>
                    )}
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="newPassword" className="text-right">
                        New Password
                    </Label>
                    <Input 
                        id="newPassword" 
                        type="password"
                        {...register('newPassword')} 
                        className="col-span-3 m-2" 
                    />
                    {errors.newPassword && (
                        <div className="col-span-4 text-red-600">
                            {errors.newPassword.message}
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button type="submit" disabled={isSubmitting}>
                        Change Password
                    </Button>
                </DialogFooter>
            </div>
        </form>
    );
}

export default PasswordForm;
