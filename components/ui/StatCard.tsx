import { Card, CardContent } from "@/components/ui/card";

export default function StatCard({
    title,
    value,
    icon,
  }: {
    title: string;
    value: string | number;
    icon?: string;
  }) {
    return (
      <Card className="shadow-sm hover:shadow-md transition">
        <CardContent className="flex items-center justify-between p-6">
          <div>
            <h4 className="text-sm text-gray-500">{title}</h4>
            <p className="text-2xl font-semibold text-gray-800">{value}</p>
          </div>
          {icon && <span className="text-3xl">{icon}</span>}
        </CardContent>
      </Card>
    );
}
