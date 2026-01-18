import Layout from "@/components/layout";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, ArrowLeft, Calendar } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function HistoryPage() {
    const [, setLocation] = useLocation();
    const { toast } = useToast();

    // Fetch logs sorted by date (newest first)
    const logs = useLiveQuery(() => db.periodLogs.orderBy("startDate").reverse().toArray());

    const handleDelete = async (id: number | undefined) => {
        if (!id) return;
        try {
            await db.periodLogs.delete(id);
            toast({
                title: "Log deleted",
                description: "The period entry has been removed.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete log.",
                variant: "destructive",
            });
        }
    };

    return (
        <Layout>
            <div className="flex flex-col pt-8 px-6 space-y-6 pb-20">

                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setLocation("/")}
                        className="rounded-full"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-serif text-foreground">Log History</h1>
                        <p className="text-sm text-muted-foreground">Manage your period entries</p>
                    </div>
                </div>

                {/* List */}
                <div className="space-y-4">
                    {logs?.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>No logs found.</p>
                        </div>
                    ) : (
                        logs?.map((log) => (
                            <Card key={log.id} className="bg-white/50 backdrop-blur-sm">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="font-serif text-lg text-foreground">
                                            {format(new Date(log.startDate), "MMMM do, yyyy")}
                                        </p>
                                        <div className="flex gap-2 text-xs text-muted-foreground">
                                            <span>{log.flowIntensity ? `Flow: ${log.flowIntensity}` : "No flow details"}</span>
                                            {log.symptoms && log.symptoms.length > 0 && (
                                                <span>• {log.symptoms.length} symptoms</span>
                                            )}
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                        onClick={() => handleDelete(log.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

            </div>
        </Layout>
    );
}
