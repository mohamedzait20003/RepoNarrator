import { useState } from "react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/common/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/common/components/ui/avatar";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { Button } from "@/common/components/ui/button";
import { useStore } from "@/store";

export function ProfileCard() {
  const userData = useStore((s) => s.userData);
  const [name, setName] = useState(userData?.name ?? "");

  const fallback = (userData?.name ?? userData?.email ?? "U")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>
          How your name appears across CodeAtlas.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center gap-4">
          <Avatar size="lg">
            {userData?.avatarUrl && (
              <AvatarImage src={userData.avatarUrl} alt="" />
            )}
            <AvatarFallback>{fallback}</AvatarFallback>
          </Avatar>
          <div className="text-sm text-muted-foreground">
            Synced from your GitHub account.
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="profile-name">Name</Label>
            <Input
              id="profile-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-email">Email</Label>
            <Input
              id="profile-email"
              value={userData?.email ?? ""}
              readOnly
              disabled
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t">
        <Button className="bg-violet-600 text-white hover:bg-violet-700">
          Save changes
        </Button>
      </CardFooter>
    </Card>
  );
}
