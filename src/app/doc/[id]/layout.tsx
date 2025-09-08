import RoomProvider from "@/components/RoomProvider";
import { auth } from "@clerk/nextjs/server";

async function DocLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
    const { userId } = await auth();
      const { id } = await params;
    if (!userId) {
        // You can redirect or throw an error here
        throw new Error("Unauthorized");
    }
    
    return (
        <RoomProvider roomId={id}>{children}</RoomProvider>
    )
}
export default DocLayout