export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "UNRESOLVED";
export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface Ticket {
    id: number;
    ticketNumber: string;
    title: string;
    description: string;
    category: string;
    priority: TicketPriority;
    status: TicketStatus;
    segment: string;
    submittedBy: { id: number; name: string; email: string };
    assignedTo?: { id: number; name: string; email: string };
    department: string | null,
    createdAt: string;
    updatedAt: string;
    resolvedAt?: string;
    attachments?: string | null;
    submittedByName: string;
}

export interface TicketComment {
    id: number;
    message: string;
    commentedBy: {
        id: number;
        name: string;
        role: "ADMIN" | "AUTHORIZED" | "SERVICE"; // ← add this
    };
    isInternal: boolean;
    createdAt: string;
}

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export interface TaskAttachment {
    id: number;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    contentType: string;
    uploadedAt: string;
}

export interface Task {
    id: number;
    title: string;
    description: string | null;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate: string | null;
    createdAt: string;
    updatedAt: string;
    owner: { id: number; name: string; email: string };
    attachments: TaskAttachment[];
}

// An attachment as it appears in the aggregated "My Documents" view — same
// file, plus which task it's linked to so it can be opened from there.
export interface TaskDocument extends TaskAttachment {
    taskId: number;
    taskTitle: string;
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
    hotSince: string | null;
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
    imgeURL: string;
    userId?: number | null;     // ✅ from backend response
}

export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    active: boolean;
}

export type AlertSeverity = "critical" | "warning" | "info";

export interface Alert {
    id: number;
    title: string;
    body: string;
    severity: AlertSeverity;
    date?: string;
    href?: string;
    flyerImage?: string;
}

export type HeroShortcutColor =
    | "blue"
    | "violet"
    | "orange"
    | "teal"
    | "indigo"
    | "sky"
    | "red"
    | "emerald"
    | "amber"
    | "slate";

export interface HeroShortcut {
    id: number;
    label: string;
    url: string;
    iconName: string;
    color: HeroShortcutColor;
    groupId: number;
    sortOrder: number;
}

export interface HeroShortcutGroup {
    id: number;
    name: string;
    sortOrder: number;
    shortcuts: HeroShortcut[];
}