import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

export default function SavedAlertsSection() {
  const alerts = [
    {
      id: 1,
      condition: "BTC/USD > $70,000",
      status: "active",
    },
    {
      id: 2,
      condition: "AAPL volume spike > 20%",
      status: "active",
    },
    {
      id: 3,
      condition: "ETH < $3,500",
      status: "paused",
    },
  ];

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-white mb-2">Saved Alerts</h1>
          <p className="text-[#94A3B8]">Manage your price and volume alerts</p>
        </div>
        <Button variant="outline" className="border-[#00D4FF] text-[#00D4FF] hover:bg-[#00D4FF] hover:text-white">
          <Plus className="w-4 h-4 mr-2" />
          Create Alert
        </Button>
      </div>

      <div className="space-y-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="bg-[#14181F] border border-[#1E293B] rounded-lg p-5 flex items-center justify-between hover:border-[#2D3748] transition-colors"
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-2 h-2 rounded-full ${
                  alert.status === "active" ? "bg-[#10B981]" : "bg-[#94A3B8]"
                }`}
              />
              <div>
                <div className="text-white">{alert.condition}</div>
                <Badge
                  variant="secondary"
                  className={`mt-2 ${
                    alert.status === "active"
                      ? "bg-[#10B981]/20 text-[#10B981]"
                      : "bg-[#94A3B8]/20 text-[#94A3B8]"
                  }`}
                >
                  {alert.status === "active" ? "Active" : "Paused"}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 text-[#94A3B8] hover:text-[#00D4FF] transition-colors">
                <Edit className="w-4 h-4" />
              </button>
              <button className="p-2 text-[#94A3B8] hover:text-[#EF4444] transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {alerts.length === 0 && (
        <div className="bg-[#14181F] border border-[#1E293B] rounded-lg p-12 text-center">
          <p className="text-[#94A3B8]">No alerts set up yet. Create your first alert!</p>
        </div>
      )}
    </div>
  );
}
