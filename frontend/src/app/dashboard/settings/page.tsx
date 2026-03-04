'use client';

import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { IconSettings, IconShieldLock, IconBell, IconKey } from '@tabler/icons-react';

export default function SettingsPage() {
    return (
        <PageContainer scrollable>
            <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
                </div>

                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <IconShieldLock className="text-primary" size={20} />
                                <CardTitle>Privacy & Security</CardTitle>
                            </div>
                            <CardDescription>Manage your Zama FHEVM encryption settings.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between space-y-2">
                                <div className="space-y-0.5">
                                    <Label>End-to-End Encryption</Label>
                                    <p className="text-sm text-muted-foreground">Always encrypt transaction data before sending.</p>
                                </div>
                                <Switch checked />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between space-y-2">
                                <div className="space-y-0.5">
                                    <Label>Stealth Mode</Label>
                                    <p className="text-sm text-muted-foreground">Hide balance from the dashboard view.</p>
                                </div>
                                <Switch />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between space-y-2">
                                <div className="space-y-0.5">
                                    <Label>Hardware Wallet Integration</Label>
                                    <p className="text-sm text-muted-foreground">Use Ledger or Trezor for signing transactions.</p>
                                </div>
                                <Button variant="outline" size="sm">Connect</Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <IconBell className="text-primary" size={20} />
                                <CardTitle>Notifications</CardTitle>
                            </div>
                            <CardDescription>Configure how you receive activity alerts.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between space-y-2">
                                <div className="space-y-0.5">
                                    <Label>Transaction Alerts</Label>
                                    <p className="text-sm text-muted-foreground">Receive push notifications for all spending.</p>
                                </div>
                                <Switch checked />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between space-y-2">
                                <div className="space-y-0.5">
                                    <Label>Email Weekly Reports</Label>
                                    <p className="text-sm text-muted-foreground">Get a summary of your activity via email.</p>
                                </div>
                                <Switch checked />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </PageContainer>
    );
}
