"use client";

import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogTitle,
} from "@/components/common/dialog";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

const schema = z.object({
  title: z.string().min(2, "Enter a room title"),
  bpm: z.number().int().min(40, "Too slow").max(240, "Too fast"),
  keySig: z.string().regex(/^[A-G](#|b)?$/, "A–G plus optional sharp/flat"),
  publicRoom: z.boolean().default(false),
});
type FormValues = z.infer<typeof schema>;

export default function CreateRoom() {
  const [isOpen, setIsOpen] = useState(false);

  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: { title: "", bpm: 120, keySig: "C", publicRoom: false },
  });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  async function onSubmit(values: FormValues) {
    setLoading(true);
    const { title, bpm, keySig, publicRoom } = values;
    const res = await fetch("/api/rooms", {
      method: "POST",
      credentials: "include", // ← ensure cookies go along
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        bpm,
        keySig,
        isPublic: publicRoom,
      }),
    }).then((r) => r.json());

    router.push(`/rooms/${res.id}`);
  }

  return (
    <>
      <Button type="button" onClick={() => setIsOpen(true)}>
        Create Room
      </Button>
      <Dialog open={isOpen} onClose={setIsOpen}>
        <div className="w-screen h-screen bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-none p-0 overflow-y-auto flex flex-col">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="text-white/80 hover:text-white text-sm flex items-center gap-2 mb-4 focus:outline-none mt-6 ml-6"
          >
            <span className="text-xl">←</span> Back
          </button>
          <DialogTitle>
            <span className="text-3xl font-extrabold text-white bg-gradient-to-r from-[#00d2ff] via-[#006bff] to-[#001085] bg-clip-text text-transparent drop-shadow-xl block text-center mb-2">
              Create Jam Room
            </span>
          </DialogTitle>
          <DialogBody>
            <Form<FormValues> {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 px-8 max-w-3xl mx-auto w-full">
                <div className="flex flex-col md:flex-row items-center gap-4 w-full">
                  <div className="flex-1 w-full">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/90">Room title</FormLabel>
                          <FormControl>
                            <Input placeholder="My Funky Jam" {...field} className="bg-white/20 text-white border border-white/30 rounded-lg shadow-inner placeholder:text-white/60 focus:ring-2 focus:ring-primary focus:border-primary" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-4 md:mt-7">
                    <FormField
                      control={form.control}
                      name="publicRoom"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center gap-2">
                          <FormLabel className="text-white/90 mb-0">Public Room</FormLabel>
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={e => field.onChange(e.target.checked)}
                              className="w-6 h-6 accent-primary rounded focus:ring-2 focus:ring-primary border border-white/30 bg-white/10"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="bpm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/90">BPM: {field.value}</FormLabel>
                      <FormControl>
                        <Slider
                          min={40}
                          max={240}
                          step={1}
                          value={[field.value]}
                          onValueChange={(v) => field.onChange(v[0])}
                          className="accent-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="keySig"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/90">Key signature</FormLabel>
                      <FormControl>
                        <Input placeholder="C, G#, Bb…" {...field} className="bg-white/20 text-white border border-white/30 rounded-lg shadow-inner placeholder:text-white/60 focus:ring-2 focus:ring-primary focus:border-primary" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogActions className="flex gap-4 mt-8">
                  <Button type="submit" className="w-1/2 bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-lg hover:scale-105 transition-transform" disabled={loading}>
                    {loading ? "Creating…" : "Create & enter room"}
                  </Button>
                </DialogActions>
              </form>
            </Form>
          </DialogBody>
        </div>
      </Dialog>
    </>
  );
}
