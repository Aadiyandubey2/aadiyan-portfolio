import { Home, User, Lightbulb, FolderKanban, Award, Images, Mail } from "lucide-react"
import { NavBar } from "@/components/ui/tubelight-navbar"

const navItems = [
  { name: "Home", url: "/", icon: Home },
  { name: "About", url: "/about", icon: User },
  { name: "Skills", url: "/skills", icon: Lightbulb },
  { name: "Projects", url: "/projects", icon: FolderKanban },
  { name: "Certificates", url: "/certificates", icon: Award },
  { name: "Showcase", url: "/showcase", icon: Images },
  { name: "Contact", url: "/contact", icon: Mail },
]

const Navbar = () => {
  return <NavBar items={navItems} />
}

export default Navbar
