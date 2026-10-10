import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CATEGORIES, toISODate, type Workout } from "@/lib/api";
import { useSaveWorkout } from "@/hooks/use-workouts";
import { cn } from "@/lib/utils";

const schema = z.object({
  exercise: z.string().trim().min(1, "Exercise is required").max(80, "Keep it under 80 characters"),
  category: z.enum(CATEGORIES),
  duration: z.coerce.number({ invalid_type_error: "Enter minutes" }).int("Whole minutes").min(1, "At least 1 minute").max(600, "Max 600 minutes"),
  calories: z.coerce.number({ invalid_type_error: "Enter calories" }).int("Whole number").min(0, "Can't be negative").max(5000, "Max 5000"),
  date: z.date({ required_error: "Pick a date" }).refine((d) => d <= new Date(), "Date can't be in the future"),
  notes: z.string().max(500, "Max 500 characters").optional(),
});
type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  workout?: Workout | null;
}

export function WorkoutDialog({ open, onOpenChange, workout }: Props) {
  const save = useSaveWorkout();
  const [calOpen, setCalOpen] = useState(false);
  const form = useForm<FormValues>({ resolver: zodResolver(schema) });
  const { register, handleSubmit, control, reset, formState: { errors } } = form;

  useEffect(() => {
    if (!open) return;
    reset(
      workout
        ? { ...workout, date: parseISO(workout.date), notes: workout.notes ?? "" }
        : { exercise: "", category: "Cardio", duration: 30, calories: 250, date: new Date(), notes: "" },
    );
  }, [open, workout, reset]);

  const onSubmit = handleSubmit(async (v) => {
    try {
      await save.mutateAsync({
        id: workout?.id,
        data: { ...v, date: toISODate(v.date), notes: v.notes?.trim() || undefined },
      });
      toast.success(workout ? "Workout updated" : "Workout added", { description: v.exercise });
      onOpenChange(false);
    } catch (e) {
      toast.error("Couldn't save workout", { description: e instanceof Error ? e.message : undefined });
    }
  });

  const Err = ({ msg }: { msg?: string | undefined }) => (msg ? <p className="text-xs text-destructive">{msg}</p> : null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">{workout ? "Edit workout" : "Log a workout"}</DialogTitle>
          <DialogDescription>Track what you did and how hard you worked.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-4" noValidate>
          <div className="grid gap-1.5">
            <Label htmlFor="exercise">Exercise</Label>
            <Input id="exercise" placeholder="e.g. Morning run" {...register("exercise")} />
            <Err msg={errors.exercise?.message} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label>Category</Label>
              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Date</Label>
              <Controller
                control={control}
                name="date"
                render={({ field }) => (
                  <Popover open={calOpen} onOpenChange={setCalOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("justify-start font-normal", !field.value && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "MMM d, yyyy") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(d) => { field.onChange(d); setCalOpen(false); }}
                        disabled={(d) => d > new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
              <Err msg={errors.date?.message} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="duration">Duration (min)</Label>
              <Input id="duration" type="number" inputMode="numeric" {...register("duration")} />
              <Err msg={errors.duration?.message} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="calories">Calories (kcal)</Label>
              <Input id="calories" type="number" inputMode="numeric" {...register("calories")} />
              <Err msg={errors.calories?.message} />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="notes">Notes <span className="text-muted-foreground">(optional)</span></Label>
            <Textarea id="notes" rows={3} placeholder="How did it feel?" {...register("notes")} />
            <Err msg={errors.notes?.message} />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? "Saving…" : workout ? "Save changes" : "Add workout"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
