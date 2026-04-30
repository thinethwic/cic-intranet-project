export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type TicketCategory = "IT" | "HR" | "FINANCE" | "FACILITIES" | "OTHER";

export interface Ticket {
    id: number;
    ticketNumber: string;
    title: string;
    description: string;
    category: TicketCategory;
    priority: TicketPriority;
    status: TicketStatus;
    segment: string;
    submittedBy: { id: number; name: string; email: string };
    assignedTo?: { id: number; name: string; email: string };
    createdAt: string;
    updatedAt: string;
    resolvedAt?: string;
}

export interface TicketComment {
    id: number;
    message: string;
    commentedBy: { id: number; name: string };
    isInternal: boolean;
    createdAt: string;
}

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
    userId?: number | null;     // ✅ from backend response
}

export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    active: boolean;
}