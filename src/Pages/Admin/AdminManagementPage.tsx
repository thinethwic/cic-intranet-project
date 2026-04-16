import { useState } from "react";
import { Mail, MessageSquareText, Pencil, Plus, Save, Trash2, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ceoMessage, members, type CEOMessageConfig } from "@/Mock-data";

import {
  ActionDropdown,
  AdminCard,
  AdminSearchInput,
  AdminSectionHeader,
  DataTable,
  FilterPillGroup,
  StatCard,
  StatusBadge,
} from "./admin-components";

interface MemberItem {
  id: number;
  name: string;
  role: string;
  department: string;
  email: string;
  status: "Active" | "Draft";
}

const departments = ["All", "Executive", "Agriculture", "Finance", "Operations"];
const CEO_MESSAGE_STORAGE_KEY = "admin-ceo-message";

function getStoredCEOMessage() {
  try {
    const stored = localStorage.getItem(CEO_MESSAGE_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as CEOMessageConfig) : ceoMessage;
  } catch {
    return ceoMessage;
  }
}

const initialMembers: MemberItem[] = members.map((member, index) => ({
  id: index + 1,
  name: member.name,
  role: member.role,
  department:
    index % 4 === 0
      ? "Executive"
      : index % 4 === 1
        ? "Operations"
        : index % 4 === 2
          ? "Agriculture"
          : "Finance",
  email: `${member.name.toLowerCase().replaceAll(" ", ".")}@cic.lk`,
  status: "Active",
}));

export default function AdminManagementPage() {
  const [items, setItems] = useState<MemberItem[]>(initialMembers);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MemberItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<MemberItem | null>(null);
  const [form, setForm] = useState({
    name: "",
    role: "",
    department: "Executive",
    email: "",
    status: "Active" as MemberItem["status"],
  });
  const [ceoForm, setCeoForm] =
    useState<CEOMessageConfig>(getStoredCEOMessage);
  const [ceoSaved, setCeoSaved] = useState(false);

  const filtered = items.filter((member) => {
    const query = search.toLowerCase();
    return (
      (member.name.toLowerCase().includes(query) ||
        member.role.toLowerCase().includes(query)) &&
      (department === "All" || member.department === department)
    );
  });

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: "",
      role: "",
      department: "Executive",
      email: "",
      status: "Active",
    });
    setDialogOpen(true);
  };

  const openEdit = (member: MemberItem) => {
    setEditing(member);
    setForm({
      name: member.name,
      role: member.role,
      department: member.department,
      email: member.email,
      status: member.status,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;

    if (editing) {
      setItems((prev) =>
        prev.map((member) =>
          member.id === editing.id ? { ...member, ...form } : member,
        ),
      );
    } else {
      setItems((prev) => [{ id: Date.now(), ...form }, ...prev]);
    }

    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (!deleteItem) return;
    setItems((prev) => prev.filter((member) => member.id !== deleteItem.id));
    setDeleteItem(null);
  };

  const updateCEOMessage = (index: number, value: string) => {
    setCeoForm((prev) => ({
      ...prev,
      messages: prev.messages.map((message, messageIndex) =>
        messageIndex === index ? value : message,
      ),
    }));
    setCeoSaved(false);
  };

  const addCEOMessage = () => {
    setCeoForm((prev) => ({
      ...prev,
      messages: [...prev.messages, ""],
    }));
    setCeoSaved(false);
  };

  const removeCEOMessage = (index: number) => {
    setCeoForm((prev) => ({
      ...prev,
      messages:
        prev.messages.length > 1
          ? prev.messages.filter((_, messageIndex) => messageIndex !== index)
          : prev.messages,
    }));
    setCeoSaved(false);
  };

  const saveCEOMessage = () => {
    const cleanedContent = {
      ...ceoForm,
      name: ceoForm.name.trim(),
      image: ceoForm.image.trim() || ceoMessage.image,
      messages: ceoForm.messages
        .map((message) => message.trim())
        .filter(Boolean),
    };

    if (!cleanedContent.name || cleanedContent.messages.length === 0) return;

    localStorage.setItem(
      CEO_MESSAGE_STORAGE_KEY,
      JSON.stringify(cleanedContent),
    );
    setCeoForm(cleanedContent);
    setCeoSaved(true);
  };

  return (
    <div className="space-y-6 p-6">
      <AdminSectionHeader
        title="Management"
        description="Maintain leadership and management profiles shown across the intranet."
        action={
          <Button onClick={openCreate} className="gap-2 rounded-2xl">
            <Plus className="h-4 w-4" />
            Add Member
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <StatCard title="Profiles" value={items.length} icon={Users} tone="violet" />
        <StatCard
          title="Departments"
          value={new Set(items.map((member) => member.department)).size}
          icon={Users}
          tone="blue"
        />
        <StatCard
          title="Active"
          value={items.filter((member) => member.status === "Active").length}
          icon={Mail}
          tone="emerald"
        />
      </div>

      <AdminCard>
        <CardContent className="space-y-6 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <MessageSquareText className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-medium">CEO Message</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Update the CEO name, image path, and rotating homepage messages.
              </p>
            </div>
            <Button
              onClick={saveCEOMessage}
              disabled={
                !ceoForm.name.trim() ||
                ceoForm.messages.every((message) => !message.trim())
              }
              className="gap-2 rounded-2xl"
            >
              <Save className="h-4 w-4" />
              Save CEO Message
            </Button>
          </div>

          <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
            <div className="space-y-4 rounded-2xl border bg-muted/30 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-blue-50 text-lg font-semibold text-blue-700">
                  {ceoForm.image ? (
                    <img
                      src={ceoForm.image}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    ceoForm.name.charAt(0) || "C"
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {ceoForm.name || "Chief Executive Officer"}
                  </p>
                  <p className="text-xs text-muted-foreground">CEO Message</p>
                </div>
              </div>
              <p className="line-clamp-5 text-sm italic leading-relaxed text-blue-800">
                {ceoForm.messages.find((message) => message.trim()) ||
                  "Add at least one message to show on the homepage."}
              </p>
              {ceoSaved && (
                <StatusBadge tone="emerald">Saved to admin settings</StatusBadge>
              )}
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">CEO name</Label>
                  <Input
                    value={ceoForm.name}
                    onChange={(event) => {
                      setCeoForm((prev) => ({
                        ...prev,
                        name: event.target.value,
                      }));
                      setCeoSaved(false);
                    }}
                    placeholder="Mr. Ajith Weerasinghe"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Image path</Label>
                  <Input
                    value={ceoForm.image}
                    onChange={(event) => {
                      setCeoForm((prev) => ({
                        ...prev,
                        image: event.target.value,
                      }));
                      setCeoSaved(false);
                    }}
                    placeholder="/ceo.jpg"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <Label className="text-sm text-muted-foreground">
                    Rotating messages
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addCEOMessage}
                    className="gap-2 rounded-2xl"
                  >
                    <Plus className="h-4 w-4" />
                    Add Message
                  </Button>
                </div>
                {ceoForm.messages.map((message, index) => (
                  <div key={index} className="grid gap-2">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs text-muted-foreground">
                        Message {index + 1}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCEOMessage(index)}
                        disabled={ceoForm.messages.length === 1}
                        className="h-8 rounded-2xl text-destructive hover:text-destructive"
                      >
                        Remove
                      </Button>
                    </div>
                    <Textarea
                      value={message}
                      onChange={(event) =>
                        updateCEOMessage(index, event.target.value)
                      }
                      className="min-h-24 resize-none rounded-2xl"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </AdminCard>

      <div className="flex flex-wrap items-center gap-4">
        <AdminSearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search management..."
        />
        <FilterPillGroup options={departments} value={department} onChange={setDepartment} />
      </div>

      <DataTable
        data={filtered}
        getRowKey={(member) => member.id}
        emptyLabel="No management profiles found"
        columns={[
          {
            key: "name",
            header: "Name",
            cell: (member) => (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-50 text-sm font-semibold text-violet-700">
                  {member.name
                    .split(" ")
                    .map((part) => part[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-xs text-muted-foreground">{member.email}</p>
                </div>
              </div>
            ),
          },
          {
            key: "role",
            header: "Role",
            cell: (member) => member.role,
          },
          {
            key: "department",
            header: "Department",
            cell: (member) => <StatusBadge tone="blue">{member.department}</StatusBadge>,
          },
          {
            key: "status",
            header: "Status",
            cell: (member) => (
              <StatusBadge tone={member.status === "Active" ? "emerald" : "amber"}>
                {member.status}
              </StatusBadge>
            ),
          },
          {
            key: "actions",
            header: "",
            className: "text-right",
            cell: (member) => (
              <div className="flex justify-end">
                <ActionDropdown
                  actions={[
                    { label: "Edit", icon: Pencil, onClick: () => openEdit(member) },
                    {
                      label: "Delete",
                      icon: Trash2,
                      onClick: () => setDeleteItem(member),
                      destructive: true,
                    },
                  ]}
                />
              </div>
            ),
          },
        ]}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit member" : "Add member"}</DialogTitle>
            <DialogDescription>
              Keep profile details concise and ready for publishing.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Name</Label>
                <Input
                  value={form.name}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, email: event.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Role</Label>
              <Input
                value={form.role}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, role: event.target.value }))
                }
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Department</Label>
                <select
                  value={form.department}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, department: event.target.value }))
                  }
                  className="h-10 w-full rounded-2xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
                >
                  {departments
                    .filter((option) => option !== "All")
                    .map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Status</Label>
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      status: event.target.value as MemberItem["status"],
                    }))
                  }
                  className="h-10 w-full rounded-2xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
                >
                  <option>Active</option>
                  <option>Draft</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!form.name.trim()}>
              Save member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete profile?</DialogTitle>
            <DialogDescription>
              "{deleteItem?.name}" will be removed from management.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteItem(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
