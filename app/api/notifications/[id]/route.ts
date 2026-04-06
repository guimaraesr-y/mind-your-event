import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { retrieveUserBySessionToken } from "@/actions/user/retrieve";
import { NotificationRepository } from "@/modules/notifications/repository/notification-repository";
import { registerNotificationHandlers } from "@/modules/notifications";

registerNotificationHandlers();

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const c = await cookies();
        const sessionToken = c.get("session_token")?.value;
        const currentUser = await retrieveUserBySessionToken(sessionToken);

        if (!currentUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const repository = new NotificationRepository();
        await repository.markAsRead(id, currentUser.id);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error marking notification as read:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const c = await cookies();
        const sessionToken = c.get("session_token")?.value;
        const currentUser = await retrieveUserBySessionToken(sessionToken);

        if (!currentUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const repository = new NotificationRepository();
        await repository.delete(id, currentUser.id);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting notification:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}