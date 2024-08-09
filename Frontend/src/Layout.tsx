import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom"
import { RootState } from "./app/store";

const Layout: React.FC = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  return (
    <div>
    {isAuthenticated ? <Outlet /> : <Navigate replace to="/sign-in"/>}
    </div>
  );
};

export default Layout
