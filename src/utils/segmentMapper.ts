export type Segment = "CIC_FEEDS" | "CIC_VET_CARE" | "CIC_POULTRY" | "AISA_VET";

export const segmentLabels: Record<Segment, string> = {
    CIC_FEEDS: "CIC Feeds",
    CIC_POULTRY: "CIC Poulry",
    CIC_VET_CARE: "CIC Vetcare",
    AISA_VET: "Asiavet",
};

export const roleLabels: Record<string, string> = {
    TOP_MANAGEMENT: "Top Management",
    STAFF: "Staff",
    POLICY_MANAGER: "Policy Manager",
    PREMIER_MANAGER: "Premier Manager",
    SENIOR_MANAGER: "Senior Manager",
    MANAGER_LEVEL_1: "Manager Level 1",
    MANAGER_LEVEL_2: "Manager Level 2",
    JUNIOR_MANAGER: "Junior Manager",
    SENIOR_EXECUTIVE: "Senior Execuitive",
    EXECUTIVE: "Executive",
    JUNIOR_EXECUTIVE: "Junior Executive"
};

export const userRoleLabels: Record<string, string> = {
    SUPER_ADMIN: "Super Admin",
    ADMIN: "Admin",
    AUTHORIZED: "Authorized",
    SERVICE: "Service",
    HOD_LEVEL: "HOD Level"
};