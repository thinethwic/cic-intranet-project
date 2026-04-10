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
interface NewsItem {
  id: number;
  title: string;
  description: string;
  image: string;
  date?: string;
  readTime: string;
  isHot: boolean;
  author?: string;
  category?: string;
  content?: string; // full article body
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
      "CIC Holdings continues to lead the way in poultry production across Sri Lanka, offering world-class feed additives that enhance productivity and animal health nationwide.",
    image: news1,
    category: "Agriculture",
    author: "CIC Editorial",
    date: "April 7, 2026",
    readTime: "4 min read",
    isHot: false,
    content: `CIC Holdings has long been a cornerstone of Sri Lanka's agricultural sector, and its poultry division continues to set benchmarks for quality and innovation across the island.

The company's range of poultry feed additives is formulated to meet international standards, supporting farmers in achieving higher yield and healthier flocks. From vitamins and minerals to specialized growth supplements, CIC's product line addresses the full lifecycle of poultry farming.

In recent quarters, CIC has expanded its distribution network to reach smallholder farmers in the Northern and Eastern provinces, a move that has been welcomed by rural farming communities who previously had limited access to premium-grade inputs.

The company's research and development team has also been working closely with the Department of Animal Production and Health to develop locally optimized formulas that account for Sri Lanka's tropical climate and indigenous feed sources.

Looking ahead, CIC Holdings plans to invest further in precision nutrition technologies and expand its cold-chain logistics to ensure product integrity from factory to farm.`,
  },
  {
    id: 2,
    title: "Pre School Development Programme Launched Across Rural Districts",
    description:
      "A new pre-school development initiative supported by CIC aims to improve early childhood education infrastructure in underserved rural communities across Sri Lanka.",
    image: news3,
    category: "Education",
    author: "CSR Desk",
    date: "April 5, 2026",
    readTime: "3 min read",
    isHot: false,
    content: `CIC Holdings has announced the launch of a comprehensive pre-school development programme targeting rural districts with limited access to quality early childhood education.

The initiative, part of the company's broader corporate social responsibility agenda, will fund the construction and renovation of pre-school facilities in Anuradhapura, Polonnaruwa, and Monaragala districts during its first phase.

Each facility will be equipped with age-appropriate learning materials, trained educators, and nutritious meal programmes — all of which have been shown to significantly improve long-term educational outcomes for children aged three to five.

The programme will be implemented in partnership with local government bodies and community organizations, ensuring that initiatives are culturally relevant and sustainably managed beyond the initial funding period.

CIC's Group Chairman noted that investing in early childhood is one of the highest-return social investments a company can make, and that the programme reflects the company's long-term commitment to the communities in which it operates.`,
  },
  {
    id: 3,
    title:
      "Poultry Production Sri Lanka | Poultry Feed Additives | CIC Holdings",
    description:
      "CIC's latest poultry feed formulations have demonstrated measurable improvements in broiler growth rates and feed conversion ratios in independent trials conducted this quarter.",
    image: news2,
    category: "Agriculture",
    author: "CIC Editorial",
    date: "April 3, 2026",
    readTime: "5 min read",
    isHot: false,
    content: `Independent trials conducted in partnership with the University of Peradeniya's Faculty of Veterinary Medicine and Animal Science have confirmed that CIC's latest broiler feed formulation delivers a 12% improvement in feed conversion ratio compared to the previous generation product.

The trials, which ran over a 16-week period across three farms in the Kurunegala district, also recorded a notable reduction in mortality rates and improved uniformity of flock weight at the point of slaughter.

These results are significant for Sri Lankan poultry farmers who operate on tight margins and for whom feed efficiency directly determines profitability. CIC's technical team worked iteratively throughout the trial, adjusting amino acid profiles and enzyme combinations based on real-time performance data.

The new formulation is now available across CIC's nationwide distributor network and is compatible with both conventional and cage-free production systems. A dedicated on-farm advisory service will also accompany the product rollout to assist farmers with transition planning.`,
  },
];

export const HotnewsList: NewsItem[] = [
  {
    id: 1,
    title:
      "Poultry Production Sri Lanka | Poultry Feed Additives | CIC Holdings",
    description:
      "CIC Holdings continues to lead the way in poultry production across Sri Lanka, offering world-class feed additives that enhance productivity and animal health nationwide.",
    image: news1,
    category: "Agriculture",
    author: "CIC Editorial",
    date: "April 7, 2026",
    readTime: "4 min read",
    isHot: false,
    content: `CIC Holdings has long been a cornerstone of Sri Lanka's agricultural sector, and its poultry division continues to set benchmarks for quality and innovation across the island.

The company's range of poultry feed additives is formulated to meet international standards, supporting farmers in achieving higher yield and healthier flocks. From vitamins and minerals to specialized growth supplements, CIC's product line addresses the full lifecycle of poultry farming.

In recent quarters, CIC has expanded its distribution network to reach smallholder farmers in the Northern and Eastern provinces, a move that has been welcomed by rural farming communities who previously had limited access to premium-grade inputs.

The company's research and development team has also been working closely with the Department of Animal Production and Health to develop locally optimized formulas that account for Sri Lanka's tropical climate and indigenous feed sources.

Looking ahead, CIC Holdings plans to invest further in precision nutrition technologies and expand its cold-chain logistics to ensure product integrity from factory to farm.`,
  },
  {
    id: 2,
    title: "Pre School Development Programme Launched Across Rural Districts",
    description:
      "A new pre-school development initiative supported by CIC aims to improve early childhood education infrastructure in underserved rural communities across Sri Lanka.",
    image: news3,
    category: "Education",
    author: "CSR Desk",
    date: "April 5, 2026",
    readTime: "3 min read",
    isHot: false,
    content: `CIC Holdings has announced the launch of a comprehensive pre-school development programme targeting rural districts with limited access to quality early childhood education.

The initiative, part of the company's broader corporate social responsibility agenda, will fund the construction and renovation of pre-school facilities in Anuradhapura, Polonnaruwa, and Monaragala districts during its first phase.

Each facility will be equipped with age-appropriate learning materials, trained educators, and nutritious meal programmes — all of which have been shown to significantly improve long-term educational outcomes for children aged three to five.

The programme will be implemented in partnership with local government bodies and community organizations, ensuring that initiatives are culturally relevant and sustainably managed beyond the initial funding period.

CIC's Group Chairman noted that investing in early childhood is one of the highest-return social investments a company can make, and that the programme reflects the company's long-term commitment to the communities in which it operates.`,
  },
  {
    id: 3,
    title:
      "Poultry Production Sri Lanka | Poultry Feed Additives | CIC Holdings",
    description:
      "CIC's latest poultry feed formulations have demonstrated measurable improvements in broiler growth rates and feed conversion ratios in independent trials conducted this quarter.",
    image: news2,
    category: "Agriculture",
    author: "CIC Editorial",
    date: "April 3, 2026",
    readTime: "5 min read",
    isHot: false,
    content: `Independent trials conducted in partnership with the University of Peradeniya's Faculty of Veterinary Medicine and Animal Science have confirmed that CIC's latest broiler feed formulation delivers a 12% improvement in feed conversion ratio compared to the previous generation product.

The trials, which ran over a 16-week period across three farms in the Kurunegala district, also recorded a notable reduction in mortality rates and improved uniformity of flock weight at the point of slaughter.

These results are significant for Sri Lankan poultry farmers who operate on tight margins and for whom feed efficiency directly determines profitability. CIC's technical team worked iteratively throughout the trial, adjusting amino acid profiles and enzyme combinations based on real-time performance data.

The new formulation is now available across CIC's nationwide distributor network and is compatible with both conventional and cage-free production systems. A dedicated on-farm advisory service will also accompany the product rollout to assist farmers with transition planning.`,
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
