"use client";
import { DashboardCard } from "@/components/admin/DashboardCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Activity = { id: string; message: string; time: string };

const demoStats = [
  { title: "Total Posts", value: 128, helper: "+5 this week" },
  { title: "Drafts", value: 17, helper: "Need review" },
  { title: "Categories", value: 9 },
  { title: "Admins", value: 3 },
];

const demoActivity: Activity[] = [
  { id: "1", message: "Published “October Update”", time: "2h ago" },
  { id: "2", message: "Edited category “Guides”", time: "6h ago" },
  { id: "3", message: "Invited user alice@acme.com", time: "yesterday" },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {demoStats.map((s) => (
          <DashboardCard
            key={s.title}
            title={s.title}
            value={s.value}
            helper={s.helper}
          />
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Traffic (placeholder)</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="h-48 w-full rounded-md border bg-muted"
              aria-label="Chart placeholder"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {demoActivity.map((a) => (
                <li
                  key={a.id}
                  className="flex items-start justify-between rounded-lg border p-3"
                >
                  <span className="text-sm">{a.message}</span>
                  <span className="text-xs text-muted-foreground">
                    {a.time}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
