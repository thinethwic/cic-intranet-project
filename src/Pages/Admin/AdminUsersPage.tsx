import { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  ShieldCheck,
  ShieldOff,
  Users,
  UserCheck,
  UserX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { authHeaders } from "@/lib/api/authHeaders";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const API = `${BASE_URL}/api/v1/users`;

interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  role: "ADMIN" | "AUTHORIZED";
  active: boolean;
  createdAt?: string;
}

const ROLE_OPTIONS = ["ADMIN", "AUTHORIZED"];
const FILTER_ROLES = ["All", "ADMIN", "AUTHORIZED"];
const FILTER_STATUS = ["All", "Active", "Inactive"];

const EMPTY_FORM = {
  username: "",
  name: "",
  email: "",
  password: "",
  role: "AUTHORIZED" as "ADMIN" | "AUTHORIZED",
  active: true,
};

const EMPTY_EDIT_FORM = {
  username: "",
  name: "",
  email: "",
  password: "",
  role: "AUTHORIZED" as "ADMIN" | "AUTHORIZED",
  active: true,
};

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-4">
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-2xl font-semibold">{value}</p>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);

  const [createForm, setCreateForm] = useState({ ...EMPTY_FORM });
  const [editForm, setEditForm] = useState({ ...EMPTY_EDIT_FORM });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}?page=0&size=100`, {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data.content ?? []);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      (u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q)) &&
      (roleFilter === "All" || u.role === roleFilter) &&
      (statusFilter === "All" ||
        (statusFilter === "Active" && u.active) ||
        (statusFilter === "Inactive" && !u.active))
    );
  });

  const adminCount = users.filter((u) => u.role === "ADMIN").length;
  const activeCount = users.filter((u) => u.active).length;
  const inactiveCount = users.filter((u) => !u.active).length;

  // ── Create ───────────────────────────────────────────────
  const handleCreate = async () => {
    if (
      !createForm.username.trim() ||
      !createForm.email.trim() ||
      !createForm.password.trim()
    )
      return;
    try {
      setSaving(true);
      const res = await fetch(API, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(createForm),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.message || "Failed to create user");
        return;
      }
      await fetchUsers();
      setCreateForm({ ...EMPTY_FORM });
      setShowCreate(false);
    } catch (err) {
      console.error("Failed to create user", err);
    } finally {
      setSaving(false);
    }
  };

  // ── Open Edit ────────────────────────────────────────────
  const openEdit = (user: User) => {
    setEditUser(user);
    setEditForm({
      username: user.username,
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      active: user.active,
    });
  };

  // ── Save Edit ────────────────────────────────────────────
  const handleSaveEdit = async () => {
    if (!editUser) return;
    try {
      setSaving(true);
      const payload: any = {
        username: editForm.username,
        name: editForm.name,
        email: editForm.email,
        role: editForm.role,
        active: editForm.active,
      };
      if (editForm.password.trim()) {
        payload.password = editForm.password;
      }
      const res = await fetch(`${API}/${editUser.id}`, {
        method: "PUT",
        headers: {
          ...authHeaders(),
          "Content-Type": "application/json", // ✅ override the wrong content-type
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.message || "Failed to update user");
        return;
      }
      await fetchUsers();
      setEditUser(null);
    } catch (err) {
      console.error("Failed to update user", err);
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ───────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteUser) return;
    try {
      await fetch(`${API}/${deleteUser.id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      await fetchUsers();
      setDeleteUser(null);
    } catch (err) {
      console.error("Failed to delete user", err);
    }
  };

  // ── Toggle active ────────────────────────────────────────
  const toggleActive = async (user: User) => {
    try {
      await fetch(`${API}/${user.id}`, {
        method: "PUT",
        headers: {
          ...authHeaders(),
          "Content-Type": "application/json", // ✅ add this
        },
        body: JSON.stringify({
          ...user,
          active: !user.active,
        }),
      });
      await fetchUsers();
    } catch (err) {
      console.error("Failed to toggle user status", err);
    }
  };

  const fmtDate = (d?: string) => {
    if (!d) return "—";
    try {
      return new Date(d).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return d;
    }
  };

  const roleColor = (role: string) =>
    role === "ADMIN"
      ? "bg-purple-50 text-purple-800 border-purple-200"
      : "bg-blue-50 text-blue-800 border-blue-200";

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage admin and authorized user accounts
          </p>
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
        >
          <Plus className="w-4 h-4" /> Add user
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total users"
          value={loading ? "..." : users.length}
          icon={Users}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          label="Admins"
          value={loading ? "..." : adminCount}
          icon={ShieldCheck}
          color="bg-purple-50 text-purple-600"
        />
        <StatCard
          label="Active"
          value={loading ? "..." : activeCount}
          icon={UserCheck}
          color="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          label="Inactive"
          value={loading ? "..." : inactiveCount}
          icon={UserX}
          color="bg-red-50 text-red-600"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            className="pl-9 h-9"
            placeholder="Search by name, email or username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Role filter */}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button
              variant="outline"
              className={`h-9 text-sm ${roleFilter !== "All" ? "border-blue-500 text-blue-600" : ""}`}
            >
              {roleFilter === "All" ? "All roles" : roleFilter}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {FILTER_ROLES.map((r) => (
              <DropdownMenuItem key={r} onClick={() => setRoleFilter(r)}>
                {r === "All" ? "All roles" : r}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Status filter */}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button
              variant="outline"
              className={`h-9 text-sm ${statusFilter !== "All" ? "border-blue-500 text-blue-600" : ""}`}
            >
              {statusFilter === "All" ? "All status" : statusFilter}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {FILTER_STATUS.map((s) => (
              <DropdownMenuItem key={s} onClick={() => setStatusFilter(s)}>
                {s === "All" ? "All status" : s}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <Card className="border border-slate-200 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wide pl-5">
                  User
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Username
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Role
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Status
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Created
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wide text-right pr-5">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-14 text-slate-400 text-sm"
                  >
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-14 text-slate-400 text-sm"
                  >
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-25" />
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((user) => (
                  <TableRow
                    key={user.id}
                    className="group border-b border-slate-100 hover:bg-slate-50/70"
                  >
                    <TableCell className="pl-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                          <span className="text-xs font-semibold text-blue-700">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5 text-sm text-slate-500">
                      @{user.username}
                    </TableCell>
                    <TableCell className="py-3.5">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-medium px-2 ${roleColor(user.role)}`}
                      >
                        {user.role === "ADMIN" ? (
                          <>
                            <ShieldCheck className="w-2.5 h-2.5 mr-1 inline" />
                            ADMIN
                          </>
                        ) : (
                          <>
                            <ShieldOff className="w-2.5 h-2.5 mr-1 inline" />
                            AUTHORIZED
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3.5">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={user.active}
                          onCheckedChange={() => toggleActive(user)}
                          className="scale-75"
                        />
                        <span
                          className={`text-xs ${user.active ? "text-emerald-600" : "text-slate-400"}`}
                        >
                          {user.active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5 text-xs text-slate-400">
                      {fmtDate(user.createdAt)}
                    </TableCell>
                    <TableCell className="py-3.5 pr-5 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 hover:bg-blue-50 hover:text-blue-600"
                          onClick={() => openEdit(user)}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 hover:bg-red-50 hover:text-red-600"
                          onClick={() => setDeleteUser(user)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {filtered.length > 0 && (
        <p className="text-xs text-slate-400 text-right">
          Showing {filtered.length} of {users.length} users
        </p>
      )}

      {/* ── Create Dialog ── */}
      <Dialog
        open={showCreate}
        onOpenChange={(o) => {
          if (!o) {
            setCreateForm({ ...EMPTY_FORM });
          }
          setShowCreate(o);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-600" /> Add user
            </DialogTitle>
            <DialogDescription>
              Create a new admin or authorized user account.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-600">
                  Full name
                </Label>
                <Input
                  placeholder="John Doe"
                  value={createForm.name}
                  onChange={(e) =>
                    setCreateForm((p) => ({ ...p, name: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-600">
                  Username
                </Label>
                <Input
                  placeholder="johndoe"
                  value={createForm.username}
                  onChange={(e) =>
                    setCreateForm((p) => ({ ...p, username: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">
                Email
              </Label>
              <Input
                type="email"
                placeholder="john@cic.lk"
                value={createForm.email}
                onChange={(e) =>
                  setCreateForm((p) => ({ ...p, email: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">
                Password
              </Label>
              <Input
                type="password"
                placeholder="Min 8 characters"
                value={createForm.password}
                onChange={(e) =>
                  setCreateForm((p) => ({ ...p, password: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Role</Label>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button
                    variant="outline"
                    className="w-full justify-between text-sm font-normal"
                  >
                    {createForm.role}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  {ROLE_OPTIONS.map((r) => (
                    <DropdownMenuItem
                      key={r}
                      onClick={() =>
                        setCreateForm((p) => ({ ...p, role: r as any }))
                      }
                    >
                      {r}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-slate-100">
              <div>
                <p className="text-sm font-medium">Active</p>
                <p className="text-xs text-slate-400">
                  User can log in immediately
                </p>
              </div>
              <Switch
                checked={createForm.active}
                onCheckedChange={(v) =>
                  setCreateForm((p) => ({ ...p, active: v }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCreateForm({ ...EMPTY_FORM });
                setShowCreate(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={
                !createForm.username.trim() ||
                !createForm.email.trim() ||
                !createForm.password.trim() ||
                saving
              }
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {saving ? "Creating..." : "Create user"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Dialog ── */}
      <Dialog
        open={!!editUser}
        onOpenChange={(o) => {
          if (!o) setEditUser(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-4 h-4 text-blue-600" /> Edit user
            </DialogTitle>
            <DialogDescription>
              Update user details. Leave password blank to keep it unchanged.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-600">
                  Full name
                </Label>
                <Input
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, name: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-600">
                  Username
                </Label>
                <Input
                  value={editForm.username}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, username: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">
                Email
              </Label>
              <Input
                type="email"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, email: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">
                New password{" "}
                <span className="text-slate-400 font-normal">(optional)</span>
              </Label>
              <Input
                type="password"
                placeholder="Leave blank to keep current"
                value={editForm.password}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, password: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Role</Label>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button
                    variant="outline"
                    className="w-full justify-between text-sm font-normal"
                  >
                    {editForm.role}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  {ROLE_OPTIONS.map((r) => (
                    <DropdownMenuItem
                      key={r}
                      onClick={() =>
                        setEditForm((p) => ({ ...p, role: r as any }))
                      }
                    >
                      {r}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-slate-100">
              <div>
                <p className="text-sm font-medium">Active</p>
                <p className="text-xs text-slate-400">
                  Allow this user to log in
                </p>
              </div>
              <Switch
                checked={editForm.active}
                onCheckedChange={(v) =>
                  setEditForm((p) => ({ ...p, active: v }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Dialog ── */}
      <Dialog open={!!deleteUser} onOpenChange={() => setDeleteUser(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mb-2">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <DialogTitle>Delete user?</DialogTitle>
            <DialogDescription>
              "{deleteUser?.name}" will be permanently removed. This cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteUser(null)}>
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
