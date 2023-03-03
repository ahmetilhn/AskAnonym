"use client";

import { ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useCallback, useRef } from "react";

export const AvatarUpload = ({ username }: { username: string }) => {
  const supabase = useSupabaseClient();
  const user = useUser();
  const inputRef = useRef<HTMLInputElement>(null);
  const isOwnerUser = user && user.user_metadata.username === username;

  const imageSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      console.log(file);
      if (!file) return;
      const { data, error } = await supabase.storage
        .from("avatars")
        .upload(`${username}.png`, file, {
          cacheControl: "3600",
          upsert: true,
        });
      console.log(data);
      if (error) {
        console.log(error);
      }
      await supabase
        .from("profiles")
        .update({
          avatar_url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}storage/v1/object/public/avatars/${data?.path}`,
        })
        .match({ id: user?.id });
    },
    [supabase, user?.id, username]
  );

  if (!isOwnerUser) return null;
  return (
    <div className="absolute top-1 right-1 z-20 w-5">
      <ArrowUpTrayIcon onClick={() => inputRef.current?.click()} />
      <input
        type="file"
        className="hidden"
        ref={inputRef}
        onChange={imageSelect}
      />
    </div>
  );
};
