import type { ElementType } from "react";
import type { HeroShortcutColor } from "@/types";
import {
  Headset,
  ListTodo,
  ToolCaseIcon,
  Globe,
  FileIcon,
  MailIcon,
  Calendar,
  Users,
  Briefcase,
  ClipboardList,
  MessageSquare,
  Phone,
  Video,
  Image,
  Link2,
  BarChart3,
  Shield,
  Bell,
  Home,
  Building2,
  Package,
  Printer,
  HelpCircle,
  Settings,
  BookOpen,
  Wrench,
  Database,
  CreditCard,
} from "lucide-react";
import {
  FaFacebookF,
  FaYoutube,
  FaHouseDamage,
  FaLinkedin,
  FaInstagram,
  FaWhatsapp,
} from "react-icons/fa";

// Curated icon set for the Hero shortcut-button admin picker. Keys are what
// get stored as `iconName` on a HeroShortcut and looked up here for rendering.
export const HERO_SHORTCUT_ICONS: Record<string, ElementType> = {
  Headset,
  ListTodo,
  ToolCaseIcon,
  Globe,
  FileIcon,
  MailIcon,
  Calendar,
  Users,
  Briefcase,
  ClipboardList,
  MessageSquare,
  Phone,
  Video,
  Image,
  Link2,
  BarChart3,
  Shield,
  Bell,
  Home,
  Building2,
  Package,
  Printer,
  HelpCircle,
  Settings,
  BookOpen,
  Wrench,
  Database,
  CreditCard,
  FaFacebookF,
  FaYoutube,
  FaHouseDamage,
  FaLinkedin,
  FaInstagram,
  FaWhatsapp,
};

export const HERO_SHORTCUT_ICON_NAMES = Object.keys(HERO_SHORTCUT_ICONS);

export const HERO_SHORTCUT_COLORS: Record<
  HeroShortcutColor,
  { iconBg: string; iconColor: string }
> = {
  blue: {
    iconBg: "bg-blue-100 group-hover:bg-blue-200",
    iconColor: "text-blue-600",
  },
  violet: {
    iconBg: "bg-violet-100 group-hover:bg-violet-200",
    iconColor: "text-violet-600",
  },
  orange: {
    iconBg: "bg-orange-100 group-hover:bg-orange-200",
    iconColor: "text-orange-600",
  },
  teal: {
    iconBg: "bg-teal-100 group-hover:bg-teal-200",
    iconColor: "text-teal-600",
  },
  indigo: {
    iconBg: "bg-indigo-100 group-hover:bg-indigo-200",
    iconColor: "text-indigo-600",
  },
  sky: {
    iconBg: "bg-sky-100 group-hover:bg-sky-200",
    iconColor: "text-sky-600",
  },
  red: {
    iconBg: "bg-red-100 group-hover:bg-red-200",
    iconColor: "text-red-600",
  },
  emerald: {
    iconBg: "bg-emerald-100 group-hover:bg-emerald-200",
    iconColor: "text-emerald-600",
  },
  amber: {
    iconBg: "bg-amber-100 group-hover:bg-amber-200",
    iconColor: "text-amber-600",
  },
  slate: {
    iconBg: "bg-slate-100 group-hover:bg-slate-200",
    iconColor: "text-slate-600",
  },
};

export const HERO_SHORTCUT_COLOR_NAMES = Object.keys(
  HERO_SHORTCUT_COLORS,
) as HeroShortcutColor[];
