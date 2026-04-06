import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { retrieveUserBySessionToken } from "@/actions/user/retrieve";
import { NotificationRepository } from "@/modules/notifications/repository/notification-repository";
import { registerNotificationHandlers } from "@/modules/notifications";

registerNotificationHandlers();

export async function GET(request: NextRequest) {
    try {
        const c = await cookies();
        const sessionToken = c.get("session_token")?.value;
        const currentUser = await retrieveUserBySessionToken(sessionToken);

        if (!currentUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const repository = new NotificationRepository();
        const unreadCount = await repository.getUnreadCount(currentUser.id);

        return NextResponse.json({ unreadCount });
    } catch (error) {
        console.error("Error fetching unread count:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}