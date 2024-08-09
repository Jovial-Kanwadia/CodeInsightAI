"use client"

import { FcGoogle } from 'react-icons/fc'
import { FaGithub } from 'react-icons/fa'
import { Button } from '../ui/button'

export const Social = () => {
    return (
        <>
        <div className="flex items-center w-full gap-x-2">
        <Button
        size='lg'
        className='w-full bg-slate-200'
        variant="ghost"
        onClick={() => {}}
        >
            <FcGoogle className='h-5 w-5'/>
        </Button>
        <Button
        size='lg'
        variant="ghost"
        className='w-full bg-slate-200'
        onClick={() => {}}
        >
            <FaGithub className='h-5 w-5'/>
        </Button>
        </div>
        </>
    )
} 