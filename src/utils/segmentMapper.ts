export type Segment = "CIC_FEEDS" | "CIC_VET_CARE" | "CIC_POULTRY" | "AISA_VET";

// Backend enum → URL path
const segmentToPath: Record<Segment, string> = {
    CIC_FEEDS: "our-segments/cic-feeds",
    CIC_VET_CARE: "our-segments/cic-vet-care",
    CIC_POULTRY: "our-segments/cic-poultry",
    AISA_VET: "our-segments/aisa-vet",
};

// URL path → Backend enum
const pathToSegment: Record<string, Segment> = {
    "our-segments/cic-feeds": "CIC_FEEDS",
    "our-segments/cic-vet-care": "CIC_VET_CARE",
    "our-segments/cic-poultry": "CIC_POULTRY",
    "our-segments/aisa-vet": "AISA_VET",
};

export const mapPathToSegment = (path: string): Segment | undefined => {
    return pathToSegment[path];
};

export const mapSegmentToPath = (segment: Segment): string => {
    return segmentToPath[segment];
};