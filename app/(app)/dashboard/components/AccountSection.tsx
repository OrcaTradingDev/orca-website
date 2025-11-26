import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export default function AccountSection() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-white mb-2">Account Settings</h1>
        <p className="text-[#94A3B8]">Manage your profile and preferences</p>
      </div>

      <div className="space-y-12">
        {/* Profile Information */}
        <div>
          <h2 className="text-white mb-6">Profile Information</h2>
          <div className="space-y-4 max-w-md">
            <div className="grid gap-2">
              <Label className="text-[#94A3B8]">Full Name</Label>
              <Input
                type="text"
                placeholder="John Doe"
                defaultValue="John Doe"
                className="bg-[#1A1F2E] border-[#2D3748] text-white focus:border-[#00D4FF]"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-[#94A3B8]">Email</Label>
              <Input
                type="email"
                placeholder="john@example.com"
                defaultValue="john@example.com"
                className="bg-[#1A1F2E] border-[#2D3748] text-white focus:border-[#00D4FF]"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-[#94A3B8]">Username</Label>
              <Input
                type="text"
                placeholder="trader_john"
                defaultValue="trader_john"
                className="bg-[#1A1F2E] border-[#2D3748] text-white focus:border-[#00D4FF]"
              />
            </div>
          </div>
        </div>

        {/* Security */}
        <div>
          <h2 className="text-white mb-6">Security</h2>
          <div className="space-y-4 max-w-md">
            <div className="grid gap-2">
              <Label className="text-[#94A3B8]">Current Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                className="bg-[#1A1F2E] border-[#2D3748] text-white focus:border-[#00D4FF]"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-[#94A3B8]">New Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                className="bg-[#1A1F2E] border-[#2D3748] text-white focus:border-[#00D4FF]"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-[#94A3B8]">Confirm Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                className="bg-[#1A1F2E] border-[#2D3748] text-white focus:border-[#00D4FF]"
              />
            </div>
            <Button className="bg-[#00D4FF] hover:bg-[#00B8E6] text-white">
              Change Password
            </Button>
          </div>
        </div>

        {/* Preferences */}
        <div>
          <h2 className="text-white mb-6">Preferences</h2>
          <div className="space-y-4 max-w-md">
            <div className="grid gap-2">
              <Label className="text-[#94A3B8]">Timezone</Label>
              <Select defaultValue="utc">
                <SelectTrigger className="bg-[#1A1F2E] border-[#2D3748] text-white focus:border-[#00D4FF]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1F2E] border-[#2D3748] text-white">
                  <SelectItem value="utc">UTC</SelectItem>
                  <SelectItem value="est">EST</SelectItem>
                  <SelectItem value="pst">PST</SelectItem>
                  <SelectItem value="cet">CET</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label className="text-[#94A3B8]">Date Format</Label>
              <Select defaultValue="mdy">
                <SelectTrigger className="bg-[#1A1F2E] border-[#2D3748] text-white focus:border-[#00D4FF]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1F2E] border-[#2D3748] text-white">
                  <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                  <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                  <SelectItem value="ymd">YYYY/MM/DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-white">Two-factor authentication</Label>
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
