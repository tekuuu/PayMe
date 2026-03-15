'use client';

import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { IconSearch, IconFilter, IconArrowUpRight, IconArrowDownLeft } from '@tabler/icons-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const activities: any[] = []; // Removed mock data

export default function ActivityPage() {
    return (
        <PageContainer scrollable>
            <div className="flex-1 space-y-2 pt-1">
                <div className="flex items-center justify-between space-y-0 pb-1">
                    <h2 className="text-xl font-bold tracking-tight">Activity</h2>
                    <div className="flex items-center space-x-2">
                        <div className="relative w-64">
                            <IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search transactions..." className="pl-8" />
                        </div>
                        <Button variant="outline" size="icon">
                            <IconFilter className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Transactions</CardTitle>
                        <CardDescription>Your encrypted transaction history via Zama FHEVM.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead className="text-right">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {activities.length > 0 ? (
                                    activities.map((activity) => (
                                        <TableRow key={activity.id}>
                                            <TableCell className="font-medium">{activity.description}</TableCell>
                                            <TableCell className={activity.type === 'Income' ? 'text-green-600' : 'text-primary'}>
                                                <div className="flex items-center gap-1">
                                                    {activity.type === 'Income' ? <IconArrowDownLeft size={14} /> : <IconArrowUpRight size={14} />}
                                                    {activity.amount}
                                                </div>
                                            </TableCell>
                                            <TableCell>{activity.date}</TableCell>
                                            <TableCell>{activity.type}</TableCell>
                                            <TableCell className="text-right">{activity.status}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground italic">
                                            No transaction history found on-chain.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </PageContainer>
    );
}
