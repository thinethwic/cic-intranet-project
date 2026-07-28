import { createContext, useContext, useState, type ReactNode } from "react";
import type { Segment } from "@/utils/segmentMapper";

export type CompanyFilter = Segment | "ALL";

interface CompanyFilterContextValue {
  selectedCompany: CompanyFilter;
  setSelectedCompany: (company: CompanyFilter) => void;
}

const CompanyFilterContext = createContext<CompanyFilterContextValue | null>(null);

// Shared between the navbar's company selector and any page that needs to
// filter its content (Announcements, Documents, ...) by the selected segment.
export function CompanyFilterProvider({ children }: { children: ReactNode }) {
  const [selectedCompany, setSelectedCompany] = useState<CompanyFilter>("ALL");
  return (
    <CompanyFilterContext.Provider value={{ selectedCompany, setSelectedCompany }}>
      {children}
    </CompanyFilterContext.Provider>
  );
}

export function useCompanyFilter(): CompanyFilterContextValue {
  const ctx = useContext(CompanyFilterContext);
  if (!ctx) {
    throw new Error("useCompanyFilter must be used within a CompanyFilterProvider");
  }
  return ctx;
}
