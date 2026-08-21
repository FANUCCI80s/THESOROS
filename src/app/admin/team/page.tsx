"use client";

import { Button } from "@/components/ui/button";
import { Plus, Pencil, User } from "lucide-react";

const mockTeam = [
  {
    id: "t1",
    name: "Elena Voss",
    position: "Chief Investment Officer",
    imageUrl: null,
    isActive: true,
  },
  {
    id: "t2",
    name: "Marcus Chen",
    position: "Head of Operations",
    imageUrl: null,
    isActive: true,
  },
  {
    id: "t3",
    name: "Sofia Alvarez",
    position: "Compliance Lead",
    imageUrl: null,
    isActive: true,
  },
];

export default function AdminTeamPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl font-semibold">
            Team
          </h1>
          <p className="mt-1 text-sm text-foreground-muted">
            Manage team members displayed on the public site
          </p>
        </div>
        <Button variant="gold" size="md">
          <Plus className="h-4 w-4" />
          Add Member
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mockTeam.map((member) => (
          <div key={member.id} className="card-premium p-5 flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-background-hover text-foreground-subtle">
              {member.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={member.imageUrl}
                  alt={member.name}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <User className="h-6 w-6" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-foreground">{member.name}</h3>
              <p className="text-sm text-foreground-muted">{member.position}</p>
            </div>
            <Button variant="ghost" size="sm">
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
