export type Segment = "CIC_FEEDS" | "CIC_VET_CARE" | "CIC_POULTRY" | "AISA_VET";

const pathToSegment: Record<string, Segment> = {
    "our-segments/cic-feeds": "CIC_FEEDS",
    "our-segments/cic-vetcare": "CIC_VET_CARE",   // ✅ matches route
    "our-segments/cic-poulry": "CIC_POULTRY",    // ✅ matches route
    "our-segments/asia-vet": "AISA_VET",        // ✅ matches route
};

const segmentToPath: Record<Segment, string> = {
    CIC_FEEDS: "our-segments/cic-feeds",
    CIC_VET_CARE: "our-segments/cic-vetcare",
    CIC_POULTRY: "our-segments/cic-poulry",
    AISA_VET: "our-segments/asia-vet",
};

export const mapPathToSegment = (path: string): Segment | undefined => {
    const clean = path.replace(/^\//, "").replace(/\/$/, "");
    return pathToSegment[clean];
};

export const mapSegmentToPath = (segment: Segment): string => {
    return segmentToPath[segment];
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