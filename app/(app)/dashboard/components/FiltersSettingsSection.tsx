import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Slider } from "./ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Checkbox } from "./ui/checkbox";

export default function FiltersSettingsSection() {
  const timeframes = ["1m", "5m", "15m", "1h", "4h", "1D"];
  const exchanges = ["NYSE", "NASDAQ", "Binance", "Coinbase", "Kraken"];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-white mb-2">Filters & Settings</h1>
        <p className="text-[#94A3B8]">Customize your screener preferences</p>
      </div>

      <div className="space-y-12">
        {/* Asset Filters */}
        <div>
          <h2 className="text-white mb-6">Asset Filters</h2>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label className="text-[#94A3B8]">Asset Type</Label>
              <Select>
                <SelectTrigger className="bg-[#1A1F2E] border-[#2D3748] text-white focus:border-[#00D4FF]">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1F2E] border-[#2D3748] text-white">
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="forex">Forex</SelectItem>
                  <SelectItem value="crypto">Crypto</SelectItem>
                  <SelectItem value="stocks">Stocks</SelectItem>
                  <SelectItem value="commodities">Commodities</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label className="text-[#94A3B8]">Market Cap</Label>
              <Select>
                <SelectTrigger className="bg-[#1A1F2E] border-[#2D3748] text-white focus:border-[#00D4FF]">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1F2E] border-[#2D3748] text-white">
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="large">Large Cap</SelectItem>
                  <SelectItem value="mid">Mid Cap</SelectItem>
                  <SelectItem value="small">Small Cap</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-3">
              <Label className="text-[#94A3B8]">Exchanges</Label>
              <div className="space-y-3">
                {exchanges.map((exchange) => (
                  <div key={exchange} className="flex items-center gap-2">
                    <Checkbox id={exchange} className="border-[#2D3748] data-[state=checked]:bg-[#00D4FF] data-[state=checked]:border-[#00D4FF]" />
                    <label htmlFor={exchange} className="text-white cursor-pointer">
                      {exchange}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Timeframe Preferences */}
        <div>
          <h2 className="text-white mb-6">Timeframe Preferences</h2>
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              {timeframes.map((tf) => (
                <button
                  key={tf}
                  className="px-4 py-2 rounded-md bg-[#1A1F2E] border border-[#2D3748] text-[#94A3B8] hover:border-[#00D4FF] hover:text-[#00D4FF] transition-colors"
                >
                  {tf}
                </button>
              ))}
            </div>

            <div className="grid gap-3">
              <Label className="text-[#94A3B8]">Default View</Label>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="intraday"
                    name="defaultView"
                    className="w-4 h-4 text-[#00D4FF] border-[#2D3748]"
                  />
                  <label htmlFor="intraday" className="text-white cursor-pointer">
                    Intraday
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="daily"
                    name="defaultView"
                    className="w-4 h-4 text-[#00D4FF] border-[#2D3748]"
                    defaultChecked
                  />
                  <label htmlFor="daily" className="text-white cursor-pointer">
                    Daily
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="all"
                    name="defaultView"
                    className="w-4 h-4 text-[#00D4FF] border-[#2D3748]"
                  />
                  <label htmlFor="all" className="text-white cursor-pointer">
                    All
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Display Settings */}
        <div>
          <h2 className="text-white mb-6">Display Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-white">Show mini charts</Label>
              <Switch className="data-[state=checked]:bg-[#00D4FF]" />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-white">Auto-refresh data</Label>
              <Switch className="data-[state=checked]:bg-[#00D4FF]" defaultChecked />
            </div>
            <div className="grid gap-3">
              <Label className="text-white">Refresh interval (30s - 5min)</Label>
              <Slider
                defaultValue={[60]}
                min={30}
                max={300}
                step={30}
                className="[&_[role=slider]]:bg-[#00D4FF] [&_[role=slider]]:border-[#00D4FF]"
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div>
          <h2 className="text-white mb-6">Notifications</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-white">Email alerts</Label>
              <Switch className="data-[state=checked]:bg-[#00D4FF]" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-white">Browser notifications</Label>
              <Switch className="data-[state=checked]:bg-[#00D4FF]" />
            </div>
          </div>
        </div>

        <Button className="bg-[#00D4FF] hover:bg-[#00B8E6] text-white">
          Save Changes
        </Button>
      </div>
    </div>
  );
}
