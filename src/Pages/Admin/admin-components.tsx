import type * as React from "react";
import type { LucideIcon } from "lucide-react";
import { ChevronLeft, ChevronRight, MoreHorizontal, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type AdminCardProps = React.ComponentProps<typeof Card>;

export function AdminCard({ className, ...props }: AdminCardProps) {
  return (
    <Card
      className={cn(
        "rounded-2xl border border-border/70 bg-card shadow-sm transition-shadow hover:shadow-md",
        className,
      )}
      {...props}
    />
  );
}

export function AdminSectionHeader({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-start justify-between gap-4",
        className,
      )}
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  tone = "blue",
}: {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  tone?: "blue" | "emerald" | "amber" | "rose" | "violet" | "slate";
}) {
  const tones = {
    blue: "bg-blue-50 text-blue-600 ring-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    amber: "bg-amber-50 text-amber-600 ring-amber-100",
    rose: "bg-rose-50 text-rose-600 ring-rose-100",
    violet: "bg-violet-50 text-violet-600 ring-violet-100",
    slate: "bg-slate-50 text-slate-600 ring-slate-100",
  };

  return (
    <AdminCard>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-semibold tracking-tight">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div className={cn("rounded-2xl p-3 ring-1", tones[tone])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </AdminCard>
  );
}

export function AdminSearchInput({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}) {
  return (
    <div className={cn("relative min-w-[220px] flex-1", className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        className="h-10 rounded-2xl bg-background pl-9"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

export function ActionDropdown({
  actions,
}: {
  actions: {
    label: string;
    icon?: LucideIcon;
    onClick: () => void;
    destructive?: boolean;
  }[];
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {actions.map((action) => (
          <DropdownMenuItem
            key={action.label}
            onClick={action.onClick}
            variant={action.destructive ? "destructive" : "default"}
          >
            {action.icon && <action.icon className="h-4 w-4" />}
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function FilterPillGroup({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <Button
          key={option}
          type="button"
          variant={value === option ? "default" : "outline"}
          size="sm"
          className="rounded-2xl"
          onClick={() => onChange(option)}
        >
          {option}
        </Button>
      ))}
    </div>
  );
}

export function DataTable<T>({
  columns,
  data,
  getRowKey,
  emptyLabel = "No records found",
}: {
  columns: {
    key: string;
    header: string;
    className?: string;
    cell: (row: T) => React.ReactNode;
  }[];
  data: T[];
  getRowKey: (row: T) => string | number;
  emptyLabel?: string;
}) {
  return (
    <AdminCard className="overflow-hidden">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={cn(
                    "px-4 text-xs font-medium uppercase text-muted-foreground",
                    column.className,
                  )}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-28 text-center text-sm text-muted-foreground"
                >
                  {emptyLabel}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <TableRow key={getRowKey(row)} className="hover:bg-muted/30">
                  {columns.map((column) => (
                    <TableCell key={column.key} className="px-4 py-4">
                      {column.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </AdminCard>
  );
}

export function StatusBadge({
  children,
  tone = "slate",
}: {
  children: React.ReactNode;
  tone?: "blue" | "emerald" | "amber" | "rose" | "violet" | "slate";
}) {
  const tones = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    rose: "bg-rose-50 text-rose-700 border-rose-200",
    violet: "bg-violet-50 text-violet-700 border-violet-200",
    slate: "bg-slate-50 text-slate-700 border-slate-200",
  };

  return (
    <Badge variant="outline" className={cn("rounded-xl", tones[tone])}>
      {children}
    </Badge>
  );
}

export function AdminCardTitle({
  title,
  meta,
}: {
  title: string;
  meta?: string;
}) {
  return (
    <CardHeader className="flex flex-row items-center justify-between gap-4 px-6">
      <CardTitle className="text-lg font-medium">{title}</CardTitle>
      {meta && (
        <span className="rounded-2xl bg-muted px-3 py-1 text-xs text-muted-foreground">
          {meta}
        </span>
      )}
    </CardHeader>
  );
}

export function AdminPagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  itemLabel = "items",
  onPageChange,
  pageSizeOptions,
  onPageSizeChange,
}: {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  itemLabel?: string;
  onPageChange: (page: number) => void;
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
}) {
  if (totalItems === 0) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).filter(
    (value) =>
      value === 1 ||
      value === totalPages ||
      Math.abs(value - page) <= 1,
  );

  const pageTokens: Array<number | "ellipsis"> = [];

  pages.forEach((value, index) => {
    if (index > 0 && value - pages[index - 1] > 1) {
      pageTokens.push("ellipsis");
    }
    pageTokens.push(value);
  });

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <p className="text-xs text-muted-foreground">
          Showing {start}-{end} of {totalItems} {itemLabel}
        </p>
        {pageSizeOptions && onPageSizeChange && pageSizeOptions.length > 1 && (
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Rows</span>
            <select
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              className="h-8 rounded-xl border border-border/70 bg-background px-2 text-xs text-foreground outline-none focus:ring-2 focus:ring-blue-200"
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div className="flex items-center gap-1 self-end sm:self-auto">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-xl"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {pageTokens.map((token, index) =>
          token === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className="px-2 text-xs text-muted-foreground"
            >
              ...
            </span>
          ) : (
            <Button
              key={token}
              type="button"
              variant={token === page ? "default" : "outline"}
              size="sm"
              className="h-8 min-w-8 rounded-xl px-2"
              onClick={() => onPageChange(token)}
            >
              {token}
            </Button>
          ),
        )}

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-xl"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
