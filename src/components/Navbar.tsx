import { Home, User, Lightbulb, FolderKanban, Award, Images, Mail } from "lucide-react"
import { NavBar } from "@/components/ui/tubelight-navbar"
import { useLanguage } from "@/contexts/LanguageContext"

const Navbar = () => {
  const { t } = useLanguage();
  
  const navItems = [
    { name: t("nav.home"), url: "/", icon: Home },
    { name: t("nav.about"), url: "/about", icon: User },
    { name: t("nav.skills"), url: "/skills", icon: Lightbulb },
    { name: t("nav.projects"), url: "/projects", icon: FolderKanban },
    { name: t("nav.certificates"), url: "/certificates", icon: Award },
    { name: t("nav.showcase"), url: "/showcase", icon: Images },
    { name: t("nav.contact"), url: "/contact", icon: Mail },
  ]

  return <NavBar items={navItems} />
}

export default Navbar