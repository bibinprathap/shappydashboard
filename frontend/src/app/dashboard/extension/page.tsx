'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Chrome, 
  Smartphone, 
  Bell,
  Palette,
  Link,
  Save
} from 'lucide-react';
import { useState } from 'react';

export default function ExtensionPage() {
  const [settings, setSettings] = useState({
    // General Settings
    extensionEnabled: true,
    autoApplyCoupons: true,
    showNotifications: true,
    
    // Chrome Extension
    chromeVersion: '2.4.1',
    chromeMinVersion: '2.0.0',
    chromeUpdateUrl: 'https://chrome.google.com/webstore/detail/shappy',
    
    // Mobile App
    iosVersion: '3.2.0',
    iosMinVersion: '3.0.0',
    androidVersion: '3.2.0',
    androidMinVersion: '3.0.0',
    forceUpdate: false,
    
    // Appearance
    primaryColor: '#8B5CF6',
    accentColor: '#22C55E',
    darkModeEnabled: true,
    
    // URLs
    termsUrl: 'https://shappy.com/terms',
    privacyUrl: 'https://shappy.com/privacy',
    supportUrl: 'https://shappy.com/support',
    faqUrl: 'https://shappy.com/faq',
  });

  const handleSave = () => {
    // Save settings logic would go here
    console.log('Saving settings:', settings);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Extension Settings</h1>
          <p className="text-muted-foreground">Configure extension and app settings</p>
        </div>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="extension" className="flex items-center gap-2">
            <Chrome className="h-4 w-4" />
            Browser Extension
          </TabsTrigger>
          <TabsTrigger value="mobile" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            Mobile App
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="links" className="flex items-center gap-2">
            <Link className="h-4 w-4" />
            Links
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure general extension behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="extensionEnabled" className="text-base">Extension Enabled</Label>
                  <p className="text-sm text-muted-foreground">Enable or disable the extension globally</p>
                </div>
                <Switch
                  id="extensionEnabled"
                  checked={settings.extensionEnabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, extensionEnabled: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoApply" className="text-base">Auto-Apply Coupons</Label>
                  <p className="text-sm text-muted-foreground">Automatically apply best coupon at checkout</p>
                </div>
                <Switch
                  id="autoApply"
                  checked={settings.autoApplyCoupons}
                  onCheckedChange={(checked) => setSettings({ ...settings, autoApplyCoupons: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications" className="text-base">Show Notifications</Label>
                  <p className="text-sm text-muted-foreground">Display notifications when coupons are available</p>
                </div>
                <Switch
                  id="notifications"
                  checked={settings.showNotifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, showNotifications: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Browser Extension Settings */}
        <TabsContent value="extension" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Chrome Extension</CardTitle>
              <CardDescription>Configure Chrome extension version requirements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="chromeVersion">Current Version</Label>
                  <Input
                    id="chromeVersion"
                    value={settings.chromeVersion}
                    onChange={(e) => setSettings({ ...settings, chromeVersion: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="chromeMinVersion">Minimum Version</Label>
                  <Input
                    id="chromeMinVersion"
                    value={settings.chromeMinVersion}
                    onChange={(e) => setSettings({ ...settings, chromeMinVersion: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="chromeUpdateUrl">Update URL</Label>
                <Input
                  id="chromeUpdateUrl"
                  value={settings.chromeUpdateUrl}
                  onChange={(e) => setSettings({ ...settings, chromeUpdateUrl: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mobile App Settings */}
        <TabsContent value="mobile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>iOS App</CardTitle>
              <CardDescription>Configure iOS app version requirements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="iosVersion">Current Version</Label>
                  <Input
                    id="iosVersion"
                    value={settings.iosVersion}
                    onChange={(e) => setSettings({ ...settings, iosVersion: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="iosMinVersion">Minimum Version</Label>
                  <Input
                    id="iosMinVersion"
                    value={settings.iosMinVersion}
                    onChange={(e) => setSettings({ ...settings, iosMinVersion: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Android App</CardTitle>
              <CardDescription>Configure Android app version requirements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="androidVersion">Current Version</Label>
                  <Input
                    id="androidVersion"
                    value={settings.androidVersion}
                    onChange={(e) => setSettings({ ...settings, androidVersion: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="androidMinVersion">Minimum Version</Label>
                  <Input
                    id="androidMinVersion"
                    value={settings.androidMinVersion}
                    onChange={(e) => setSettings({ ...settings, androidMinVersion: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between pt-4">
                <div>
                  <Label htmlFor="forceUpdate" className="text-base">Force Update</Label>
                  <p className="text-sm text-muted-foreground">Require users to update to the latest version</p>
                </div>
                <Switch
                  id="forceUpdate"
                  checked={settings.forceUpdate}
                  onCheckedChange={(checked) => setSettings({ ...settings, forceUpdate: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Theme Colors</CardTitle>
              <CardDescription>Customize the app appearance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      value={settings.primaryColor}
                      onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                    />
                    <div
                      className="w-10 h-10 rounded border"
                      style={{ backgroundColor: settings.primaryColor }}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="accentColor">Accent Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="accentColor"
                      value={settings.accentColor}
                      onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                    />
                    <div
                      className="w-10 h-10 rounded border"
                      style={{ backgroundColor: settings.accentColor }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4">
                <div>
                  <Label htmlFor="darkMode" className="text-base">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">Enable dark mode support in the app</p>
                </div>
                <Switch
                  id="darkMode"
                  checked={settings.darkModeEnabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, darkModeEnabled: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Links Settings */}
        <TabsContent value="links" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>App Links</CardTitle>
              <CardDescription>Configure URLs displayed in the app</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="termsUrl">Terms of Service URL</Label>
                <Input
                  id="termsUrl"
                  value={settings.termsUrl}
                  onChange={(e) => setSettings({ ...settings, termsUrl: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="privacyUrl">Privacy Policy URL</Label>
                <Input
                  id="privacyUrl"
                  value={settings.privacyUrl}
                  onChange={(e) => setSettings({ ...settings, privacyUrl: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="supportUrl">Support URL</Label>
                <Input
                  id="supportUrl"
                  value={settings.supportUrl}
                  onChange={(e) => setSettings({ ...settings, supportUrl: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="faqUrl">FAQ URL</Label>
                <Input
                  id="faqUrl"
                  value={settings.faqUrl}
                  onChange={(e) => setSettings({ ...settings, faqUrl: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
