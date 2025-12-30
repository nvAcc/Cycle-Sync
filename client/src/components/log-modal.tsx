import { useState } from "react";
import { Plus, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { toast } from "@/hooks/use-toast";
import { db } from "@/lib/db";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export default function LogModal() {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [flow, setFlow] = useState<string>("medium");
  const [moods, setMoods] = useState<string[]>([]);
  const [pain, setPain] = useState([30]);

  const toggleMood = (mood: string) => {
    setMoods(current =>
      current.includes(mood)
        ? current.filter(m => m !== mood)
        : [...current, mood]
    );
  };

  const handleSubmit = async () => {
    try {
      await db.periodLogs.add({
        startDate: date,
        flowIntensity: flow as any,
        symptoms: moods,
        notes: `Pain Level: ${pain[0]}`,
        createdAt: new Date()
      });

      toast({
        title: "Logged successfully",
        description: "Your cycle data has been updated encrypted on-device.",
      });
      setOpen(false);
      // Reset form slightly
      setMoods([]);
      setPain([30]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save data locally.",
        variant: "destructive"
      });
    }
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          size="lg"
          className="rounded-full h-14 px-8 text-lg shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all duration-300"
          data-testid="button-log-today"
        >
          <Plus className="mr-2 h-5 w-5" /> Log
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[90vh]">
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle className="text-2xl font-serif text-center">How are you feeling?</DrawerTitle>
            <DrawerDescription className="text-center">Log your symptoms to improve predictions.</DrawerDescription>
          </DrawerHeader>

          <div className="p-4 space-y-6 overflow-y-auto max-h-[60vh]">

            {/* Date Picker */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => d && setDate(d)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* flow */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Flow Intensity</Label>
              <RadioGroup value={flow} onValueChange={setFlow} className="flex justify-between">
                {["Light", "Medium", "Heavy"].map((f) => (
                  <div key={f} className="flex items-center space-x-2">
                    <RadioGroupItem value={f.toLowerCase()} id={f} className="peer sr-only" />
                    <Label
                      htmlFor={f}
                      className="flex flex-col items-center justify-center w-20 h-20 rounded-xl border-2 border-muted bg-card hover:bg-accent/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 peer-data-[state=checked]:text-primary cursor-pointer transition-all"
                    >
                      <div className="mb-1 text-primary/80">
                        <span className={f === "Light" ? "text-lg opacity-60" : f === "Medium" ? "text-xl opacity-80" : "text-2xl font-bold"}>
                          ●
                        </span>
                      </div>
                      <span className="text-xs font-medium">{f}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* mood */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Mood</Label>
              <div className="grid grid-cols-3 gap-3">
                {["Happy", "Sad", "Anxious", "Calm", "Tired", "Energetic"].map((m) => (
                  <div key={m} className="flex items-center space-x-2">
                    <Checkbox
                      id={`mood-${m}`}
                      className="peer sr-only"
                      checked={moods.includes(m)}
                      onCheckedChange={() => toggleMood(m)}
                    />
                    <Label
                      htmlFor={`mood-${m}`}
                      className="flex flex-col items-center justify-center w-full h-16 rounded-lg border border-muted bg-card hover:bg-accent/50 peer-data-[state=checked]:border-secondary peer-data-[state=checked]:bg-secondary/10 peer-data-[state=checked]:text-secondary-foreground cursor-pointer transition-all"
                    >
                      <span className="text-sm font-medium">{m}</span>
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* pain */}
            <div className="space-y-4">
              <div className="flex justify-between">
                <Label className="text-base font-medium">Pain Level</Label>
                <span className="text-sm text-muted-foreground">{pain[0]}%</span>
              </div>
              <Slider value={pain} onValueChange={setPain} max={100} step={1} className="w-full" />
            </div>

          </div>

          <DrawerFooter>
            <Button onClick={handleSubmit} className="w-full h-12 text-lg rounded-xl">Save Entry</Button>
            <DrawerClose asChild>
              <Button variant="outline" className="w-full rounded-xl">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
