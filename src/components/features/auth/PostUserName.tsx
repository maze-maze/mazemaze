"use client"

import { Button } from "🎙️/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "🎙️/components/ui/form";
import { Input } from "🎙️/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import { redirect } from "next/navigation";

const formSchema = z
  .object({
    username: z
      .string()
      .min(3, "3文字以上で入力してください")
      .max(20, "20文字以内で入力してください")
      .regex(/^[a-zA-Z0-9_]+$/, "英数字とアンダースコアのみ使用できます"),
  })
  .refine(
    async (data) => {
      const res = await fetch(`/api/username/check?username=${data.username}`);
      const json = await res.json();
      return json.available;
    },
    {
      message: "このユーザー名はすでに使われています",
      path: ["username"],
    }
  );

type FormData = z.infer<typeof formSchema>



export default function PostUserName() {

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  })

  const onSubmit = async (data: FormData) => {

    const { username } = data

    await fetch("/api/me/username", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
    redirect("/user")
  };

  return (
    <div className="w-full flex-1  flex items-center px-8 mb-10">
      <div className="w-full flex flex-col items-center justify-center">
      <h1 className="font-bold text-2xl mb-10">ユーザーを作成しよう！</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>your name</FormLabel>
                  <FormControl>
                    <Input placeholder="soma_takata" {...field} />
                  </FormControl>
                  <FormDescription>
                    This will be the name of user_id.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full cursor-pointer">
              Create your account
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
