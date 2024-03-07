import { UserProfile } from "@clerk/nextjs";

export default function UserProfilePage() {
  return (
    <UserProfile
      appearance={{
        variables: {
          colorBackground: "transparent",
        },
      }}
    />
  );
}
