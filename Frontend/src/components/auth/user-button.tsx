import { useRef } from 'react';
import { Button } from "../ui/button";
import { Avatar, AvatarImage } from "../ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../ui/dialog";
import LogoutBtn from "./logout-button";
import UsernameForm from "./username-form";
import PasswordForm from "./password-form";
import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentUser, updateAvatar, updateCoverImage } from '@/features/user/UserSlice';
import { AppDispatch } from '@/app/store';

// const user = {
//     id: "jf489jrf9458598te46gd",
//     username: "Jovial Kanwadia",
//     email: "jovialkanwadia@gmail.com",
//     avatar.url: "https://github.com/shadcn.png",
//     coverImage.url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcXVpcnesw3j5p4_hflMMzyZSpbDfL5HwQQg&s",
// }

const UserButton = () => {
    const user = useSelector(selectCurrentUser);
    const dispatch = useDispatch<AppDispatch>()

    const avatarInputRef = useRef<HTMLInputElement | null>(null);
    const coverImageInputRef = useRef<HTMLInputElement | null>(null);

    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const avatarFile = event.target.files[0];
            dispatch(updateAvatar({ avatar: avatarFile }))
            // console.log('Selected avatar:', avatarFile);
        }
    };

    const handleCoverImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const coverImageFile = event.target.files[0];
            dispatch(updateCoverImage({ coverImage: coverImageFile }))
            // console.log('Selected cover image:', coverImageFile);
        }
    };

    return (
        <>
            <Dialog>
                <DialogTrigger asChild>
                    <Avatar>
                        <AvatarImage src={user?.avatar?.url ?? 'https://github.com/shadcn.png'} alt="@shadcn" className='cursor-pointer'/>
                    </Avatar>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[525px]">
                    <div className="w-full h-36 relative">
                        <div className="w-full h-36 overflow-hidden">
                            <img src={user?.coverImage?.url ?? 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcXVpcnesw3j5p4_hflMMzyZSpbDfL5HwQQg&s'} className="absolute rounded-xl inset-0 w-full h-full object-cover" alt="Cover Image" />
                        </div>
                        <img src={user?.avatar?.url ?? 'https://github.com/shadcn.png'} className="absolute bottom-0 left-0 transform translate-y-1/2 w-24 h-24 rounded-full border-4 border-white" alt="Avatar" style={{ width: '6rem', height: '6rem' }} />
                    </div>
                    <DialogHeader className="mt-10">
                        <DialogTitle>{user?.username ?? 'Jovial Kanwadia'}</DialogTitle>
                        <DialogDescription>
                            Make changes to your profile here.
                        </DialogDescription>
                    </DialogHeader>

                    {/* User Name Form Component */}
                    <UsernameForm username={user?.username ?? 'Jovial Kanwadia'} />

                    <div className="border border-slate-800"></div>
                    <div className="grid gap-4 py-2">
                        <PasswordForm />
                        <DialogFooter>
                            <Button onClick={() => avatarInputRef.current?.click()}>Change Avatar</Button>
                            <input
                                type="file"
                                ref={avatarInputRef}
                                style={{ display: 'none' }}
                                onChange={handleAvatarChange}
                                accept="image/*"
                            />
                            <Button onClick={() => coverImageInputRef.current?.click()}>Change Cover Image</Button>
                            <input
                                type="file"
                                ref={coverImageInputRef}
                                style={{ display: 'none' }}
                                onChange={handleCoverImageChange}
                                accept="image/*"
                            />
                            <LogoutBtn />
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default UserButton;
