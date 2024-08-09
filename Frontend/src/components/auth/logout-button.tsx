import { useDispatch } from 'react-redux';
import { logout } from '../../features/auth/AuthSlice';
import { AppDispatch } from '../../app/store';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';

const LogoutBtn = () => {
    const dispatch: AppDispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        try {
            dispatch(logout())
            navigate('/sign-in')
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div>
            <Button onClick={handleLogout}>Logout</Button>
        </div>
    )
}

export default LogoutBtn
