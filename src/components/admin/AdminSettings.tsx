"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { adminSettingsService } from "@/lib/firebaseServices";
import { Settings, Shield, CheckCircle, Clock, AlertTriangle, Info } from "lucide-react";

export function AdminSettings() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Load current settings
  const loadSettings = async () => {
    try {
      setLoading(true);
      const currentSettings = await adminSettingsService.getSettings();
      setSettings(currentSettings);
    } catch (error) {
      console.error('Error loading admin settings:', error);
      setMessage({ type: 'error', text: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleToggleAutoApprove = async (enabled: boolean) => {
    try {
      setSaving(true);
      setMessage(null);

      const updatedSettings = {
        ...settings,
        autoApproveProjects: enabled
      };

      await adminSettingsService.updateSettings(updatedSettings);
      setSettings(updatedSettings);
      
      setMessage({ 
        type: 'success', 
        text: `Auto-approval ${enabled ? 'enabled' : 'disabled'} successfully` 
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      setMessage({ type: 'error', text: 'Failed to update settings' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading settings...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Project Review Settings</span>
          </CardTitle>
          <CardDescription>
            Configure how new project submissions are handled
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {message && (
            <Alert className={message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                {message.text}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="auto-approve" className="text-base font-medium">
                    Automatic Project Approval
                  </Label>
                  <Badge variant={settings?.autoApproveProjects ? "default" : "secondary"}>
                    {settings?.autoApproveProjects ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  When enabled, new projects will be automatically approved and published immediately
                </p>
              </div>
              <Switch
                id="auto-approve"
                checked={settings?.autoApproveProjects || false}
                onCheckedChange={handleToggleAutoApprove}
                disabled={saving}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex items-center space-x-3 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h4 className="font-medium">Automatic Approval</h4>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Projects go live immediately</li>
                <li>• Faster user experience</li>
                <li>• Less admin workload</li>
                <li>• Protected by duplicate URL check</li>
              </ul>
            </Card>

            <Card className="p-4">
              <div className="flex items-center space-x-3 mb-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <h4 className="font-medium">Manual Review</h4>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Projects require admin approval</li>
                <li>• Higher quality control</li>
                <li>• Prevent inappropriate content</li>
                <li>• Review before publishing</li>
              </ul>
            </Card>
          </div>

          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Duplicate URL Protection:</strong> Regardless of the approval setting, 
              the system will always prevent projects with duplicate URLs from being submitted.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Security & Quality</span>
          </CardTitle>
          <CardDescription>
            Built-in protections for project submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-800">Duplicate URL Prevention</h4>
                <p className="text-sm text-green-700">
                  Automatically blocks projects with existing URLs
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-800">Email Verification Required</h4>
                <p className="text-sm text-blue-700">
                  Only verified users can submit projects
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-purple-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-purple-800">Admin Override</h4>
                <p className="text-sm text-purple-700">
                  Admins can always manually review and modify projects
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <Clock className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-orange-800">Audit Trail</h4>
                <p className="text-sm text-orange-700">
                  All approvals are logged with timestamps
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
