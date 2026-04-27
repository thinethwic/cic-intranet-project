export interface Document {
    id: number;
    title: string;
    type: "PDF" | "XLSX" | "DOCS";
    fileUrl: string;
    category: string;
    segment: string;
    access: "PUBLIC" | "PRIVATE";
    isPinned: boolean;
    allowView: boolean;
    allowDownload: boolean;
}

export interface News {
    id: number;
    title: string;
    description: string;
    content: string;
    image: string;
    category: string;
    isHot: boolean;
    createdAt: string; // ✅ add this
}

export interface Announcement {
    id: number;
    title: string;
    category: string;
    segment: string;
    isRead: boolean;
}

export interface Event {
    id: number;
    title: string;
    image: string;
    date: string;
    time: string;
    location: string;
    segment: string;
}

export interface Gallery {
    id: number;
    image: string;
    description: string;
}

export interface video {
    id: number;
    title: string;
    description: string;
    videoLink: string;
    createdAt: string;      // no segment
}
export interface Member {
    id: number;
    title: string;
    role: string;
    firstName: string;
    lastName: string;
    dob: string;
    email: string;
    phoneNo: string;
    joinedDate: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    active: boolean;
}