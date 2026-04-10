import news1 from "@/assets/slide1.png";
import news2 from "@/assets/slide2.png";
import news3 from "@/assets/Pre School-1.jpg";

interface Document {
  id: number;
  title: string;
  category: string;
  type: "PDF" | "XLSX" | "DOCS";
  isPinned: boolean;
  fileUrl: string; // 👈 add this
  segment: string;
}

// In your Mock-data types
export interface NewsItem {
  id: number;
  title: string;
  description: string;
  content: string;
  image: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  isHot: boolean;
}

export const announcements = [
  {
    id: 1,
    title: "Annual leave policy updated for 2026",
    date: "2026-04-08",
    category: "HR & Policies",
    segment: "our-segments/asia-vet",
    isRead: false,
  },
  {
    id: 2,
    title: "Q1 financial summary now available",
    date: "2026-04-05",
    category: "Finance",
    segment: "our-segments/asia-vet",
    isRead: true,
  },
  {
    id: 3,
    title: "Q1 financial summary now available",
    date: "2026-04-05",
    category: "Finance",
    segment: "our-segments/asia-vet",
    isRead: true,
  },
  {
    id: 3,
    title: "Q1 financial summary now available",
    date: "2026-04-05",
    category: "Finance",
    segment: "our-segments/asia-vet",
    isRead: true,
  },
  {
    id: 3,
    title: "Q1 financial summary now available",
    date: "2026-04-05",
    category: "Finance",
    segment: "our-segments/asia-vet",
    isRead: true,
  },
];

export const documents: Document[] = [
  {
    id: 1,
    title: "Employee Handbook 2026",
    category: "HR · Updated Today",
    type: "PDF",
    isPinned: true,
    fileUrl: "/documents/employee-handbook-2026.pdf",
    segment: "our-segments/cic-feeds", // ✅ matches /our-segments/cic-feeds
  },
  {
    id: 2,
    title: "Finance Report 2026",
    category: "Finance · Updated Today",
    type: "XLSX",
    isPinned: false,
    fileUrl: "/documents/finance-report-2026.xlsx",
    segment: "our-segments/cic-feeds", // ✅
  },
  {
    id: 3,
    title: "Leave Request Form",
    category: "HR · Standard form",
    type: "DOCS",
    isPinned: true,
    fileUrl: "/documents/leave-request-form.docx",
    segment: "our-segments/cic-feeds", // ✅
  },
  // Asia Vet docs
  {
    id: 4,
    title: "Asia Vet Handbook",
    category: "HR · Updated Today",
    type: "PDF",
    isPinned: true,
    fileUrl: "/documents/asia-vet-handbook.pdf",
    segment: "our-segments/asia-vet", // ✅ matches /our-segments/asia-vet
  },
];

export const newsList: NewsItem[] = [
  {
    id: 1,
    title:
      "Poultry Production Sri Lanka | Poultry Feed Additives | CIC Holdings",
    description:
      "CIC Holdings continues to lead the way in poultry production across Sri Lanka, offering world-class feed additives that enhance productivity and animal health.",
    content: `CIC Holdings has long been a cornerstone of Sri Lanka's agricultural sector, and its poultry division continues to set benchmarks for quality and innovation.\n\nThe company's range of poultry feed additives is formulated to meet international standards, supporting farmers in achieving higher yield and healthier flocks.\n\nIn recent quarters, CIC has expanded its distribution network to reach smallholder farmers in the Northern and Eastern provinces.`,
    image: news1,
    category: "Agriculture",
    author: "CIC Editorial",
    date: "2026-04-07",
    readTime: "4 min read",
    isHot: false,
  },
  {
    id: 2,
    title: "Pre School Development Programme Launched Across Rural Districts",
    description:
      "A new pre-school development initiative supported by CIC aims to improve early childhood education infrastructure in underserved rural communities.",
    content: `CIC Holdings has announced the launch of a comprehensive pre-school development programme targeting rural districts with limited access to quality early childhood education.\n\nThe initiative will fund the construction and renovation of pre-school facilities in Anuradhapura, Polonnaruwa, and Monaragala districts during its first phase.\n\nEach facility will be equipped with age-appropriate learning materials, trained educators, and nutritious meal programmes.`,
    image: news3,
    category: "Education",
    author: "CSR Desk",
    date: "2026-04-05",
    readTime: "3 min read",
    isHot: false,
  },
  {
    id: 3,
    title: "CIC Holdings Reports Strong Q1 Performance Across Key Divisions",
    description:
      "CIC Holdings has posted strong first-quarter results, with the agriculture and health divisions leading growth as the company continues its strategic expansion.",
    content: `CIC Holdings PLC has reported a robust performance for the first quarter of 2026, with consolidated revenue growing across its agriculture, healthcare, and consumer goods divisions.\n\nThe agriculture segment remained the largest contributor to group revenue, benefiting from strong domestic demand and improved export volumes.\n\nThe board has also approved a capital expenditure plan for the remainder of the year.`,
    image: news2,
    category: "Corporate",
    author: "Finance Desk",
    date: "2026-04-01",
    readTime: "4 min read",
    isHot: false,
  },
  {
    id: 4,
    title: "Sustainable Farming Initiative Gains Momentum in Northern Province",
    description:
      "CIC's sustainable agriculture programme is gaining strong traction in the Northern Province, with over 400 farmers enrolled in the latest growing season.",
    content: `CIC Holdings' sustainable farming initiative has now enrolled over 400 smallholder farmers across the Northern Province for the current growing season.\n\nThe programme provides participating farmers with subsidized inputs, agronomic training, and access to CIC's extension officer network.\n\nEarly results showed that participants achieved comparable yields while reducing input costs by an average of 18%.`,
    image: news2,
    category: "Agriculture",
    author: "CIC Editorial",
    date: "2026-03-29",
    readTime: "3 min read",
    isHot: false,
  },
  {
    id: 101,
    title: "Poultry Production Sri Lanka | Next-Gen Feed Additives Unveiled",
    description:
      "CIC Holdings unveils a next-generation line of poultry feed additives engineered for Sri Lanka's tropical conditions, promising better flock health and higher farm profitability.",
    content: `CIC Holdings has unveiled its next-generation poultry feed additive line at a press event held at its Colombo headquarters.\n\nThe new product range incorporates advanced probiotic and prebiotic compounds designed specifically for Sri Lanka's high-humidity, tropical climate conditions.\n\nThe launch marks a significant milestone for CIC's animal nutrition business, which has invested heavily in R&D over the past three years.`,
    image: news1,
    category: "Agriculture",
    author: "CIC Editorial",
    date: "2026-04-09",
    readTime: "4 min read",
    isHot: true,
  },
  {
    id: 102,
    title: "Pre School Network Expansion: 20 New Centres to Open by Mid-2026",
    description:
      "CIC's education arm confirms the opening of 20 new pre-school centres by mid-2026 as part of an accelerated rollout in response to community demand.",
    content: `Following overwhelming community interest in its initial pilot centres, CIC Holdings has confirmed the accelerated opening of 20 new pre-school facilities by June 2026.\n\nThe expansion responds directly to feedback gathered through community consultations held in late 2025.\n\nStaffing for the new centres is already underway, with CIC partnering with three teacher training colleges to fast-track the certification of 60 new educators.`,
    image: news3,
    category: "Education",
    author: "CSR Desk",
    date: "2026-04-08",
    readTime: "3 min read",
    isHot: true,
  },
  {
    id: 103,
    title: "CIC Wins National Export Award for Agricultural Products Division",
    description:
      "CIC Holdings has been recognised at the National Export Awards for outstanding performance in the agricultural products category.",
    content: `CIC Holdings PLC received the Gold Award in the Agricultural Products category at this year's National Export Awards ceremony.\n\nThe award recognises the company's consistent growth in export volumes over the past three years, with particular commendation for its expansion into Bangladesh, the Maldives, and Southeast Asian markets.\n\nExport revenue from CIC's agricultural division grew by 34% year-on-year.`,
    image: news3,
    category: "Corporate",
    author: "CIC Editorial",
    date: "2026-04-06",
    readTime: "3 min read",
    isHot: true,
  },
  {
    id: 104,
    title: "New Crop Protection Range Targets Climate-Resilient Farming",
    description:
      "CIC launches a new range of crop protection products designed to support farmers dealing with increasingly unpredictable weather patterns.",
    content: `CIC Holdings has introduced a new line of crop protection products specifically formulated to help farmers manage the growing challenges posed by climate variability.\n\nThe CIC ClimaSafe range includes fungicides, insecticides, and biostimulants trialled across multiple agroclimatic zones in Sri Lanka.\n\nCIC will support the rollout with a series of farmer field days across the major agricultural districts.`,
    image: news3,
    category: "Agriculture",
    author: "CIC Editorial",
    date: "2026-04-04",
    readTime: "4 min read",
    isHot: false,
  },
];

export const members = [
  {
    name: "John Silva",
    role: "Chief Executive Officer",
  },
  {
    name: "Nimal Perera",
    role: "Chief Operating Officer",
  },
  {
    name: "Kasun Fernando",
    role: "Head of Agriculture",
  },
  {
    name: "Saman Jayasinghe",
    role: "Finance Director",
  },
  {
    name: "John Silva",
    role: "Chief Executive Officer",
  },
  {
    name: "Nimal Perera",
    role: "Chief Operating Officer",
  },
  {
    name: "Kasun Fernando",
    role: "Head of Agriculture",
  },
  {
    name: "Saman Jayasinghe",
    role: "Finance Director",
  },
];

export const events = [
  {
    image: news1,
    title: "Tech Conference 2026",
    date: "2026-04-09",
    time: "6:00 PM",
    location: "Colombo",
    segment: "our-segments/asia-vet",
  },
  {
    image: news1,
    title: "Startup Meetup",
    date: "2026-04-09",
    time: "4:30 PM",
    location: "Negombo",
    segment: "our-segments/asia-vet",
  },
  {
    image: news1,
    title: "AI Workshop",
    date: "2026-09-10",
    time: "10:00 AM",
    location: "Colombo",
    segment: "our-segments/asia-vet",
  },
  {
    image: news1,
    title: "Tech Conference 2026",
    date: "2026-04-09",
    time: "6:00 PM",
    location: "Colombo",
    segment: "our-segments/asia-vet",
  },
  {
    image: news1,
    title: "Startup Meetup",
    date: "2026-04-09",
    time: "4:30 PM",
    location: "Negombo",
    segment: "our-segments/asia-vet",
  },
  {
    image: news1,
    title: "AI Workshop",
    date: "2026-09-10",
    time: "10:00 AM",
    location: "Colombo",
    segment: "our-segments/asia-vet",
  },
];

export const people = [
  "Thineth Wickramarachchi",
  "John Silva",
  "Nimal Perera",
  "Kasun Fernando",
  "Kasun Fernando",
  "Kasun Fernando",
  "Kasun Fernando",
];

export const upcoming = [
  {
    name: "Thineth Wickramarachchi",
    role: "Intern - IT",
    date: "Apr 30",
  },
  {
    name: "John Silva",
    role: "Manager",
    date: "May 02",
  },
  {
    name: "Nimal Perera",
    role: "Engineer",
    date: "May 05",
  },
  {
    name: "Nimal Perera",
    role: "Engineer",
    date: "May 05",
  },
];

export const videos = [
  {
    title:
      "Eid table with our scrumptious Chicken Cheese Balls – a delicious twist that promises to enchant your taste buds!",
    description: "",
    videoLink: "https://web.facebook.com/reel/911559260770038",
  },
  {
    title: "Honey Glazed Chicken With CIC Besto Chicken",
    description: "",
    videoLink: "https://web.facebook.com/reel/1150142429761266",
  },
  {
    title:
      "🏏 Elevate your T20 cricket viewing with our Crispy Chicken Bites! 🔥",
    description:
      "Watch our latest recipe video to learn how to make these crunchy, mouth-watering chicken bites that are perfect for game time snacking.",
    videoLink: "https://web.facebook.com/reel/853507733294017",
  },
  {
    title:
      "New Recipe Alert: Sri Lankan Chili Chicken with CIC Besto Pre-Cut Whole Chicken.",
    description: "",
    videoLink: "https://facebook.com/reel/702338548325656",
  },
  {
    title: "New Recipe Alert: Creamy Chicken Drumsticks",
    description: "",
    videoLink: "https://facebook.com/reel/7305548436180301",
  },
  {
    title: "New Recipe Alert: Creamy Chicken Drumsticks",
    description: "",
    videoLink: "https://facebook.com/reel/7305548436180301",
  },
  {
    title: "New Recipe Alert: Creamy Chicken Drumsticks",
    description: "",
    videoLink: "https://facebook.com/reel/7305548436180301",
  },
];
