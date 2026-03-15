'use client';

import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IconCalendarRepeat, IconDeviceTv, IconBrandSpotify, IconBrandYoutube } from '@tabler/icons-react';

const subscriptions: any[] = []; // Removed mock data

export default function SubscriptionsPage() {
    return (
        <PageContainer scrollable>
            <div className="flex-1 space-y-2 pt-1">
                <div className="flex items-center justify-between space-y-0 pb-1">
                    <h2 className="text-xl font-bold tracking-tight">Subscriptions</h2>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {subscriptions.length > 0 ? (
                        subscriptions.map((sub) => (
                            <Card key={sub.name} className="hover:shadow-md transition-shadow">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${sub.color}`}>
                                            <sub.icon size={24} />
                                        </div>
                                        <div>
                                            <CardTitle className="text-sm font-medium">{sub.name}</CardTitle>
                                            <CardDescription>{sub.price} / month</CardDescription>
                                        </div>
                                    </div>
                                    <Badge variant={sub.status === 'Active' ? 'default' : 'secondary'}>
                                        {sub.status}
                                    </Badge>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-xs text-muted-foreground mt-4 flex items-center gap-1">
                                        <IconCalendarRepeat size={14} />
                                        Next billing: {sub.nextBilling}
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="col-span-full py-12 text-center border-2 border-dashed rounded-xl bg-muted/20">
                            <p className="text-muted-foreground italic">No active subscriptions detected.</p>
                        </div>
                    )}
                </div>
            </div>
        </PageContainer>
    );
}
