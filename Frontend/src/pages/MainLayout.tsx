import UserButton from "@/components/auth/user-button"
import { ModeToggle } from "@/components/theme/mode-toggle"


const MainLayout = () => {
  return (
    <div>
      <UserButton/>
      <ModeToggle/>
    </div>
  )
}

export default MainLayout
