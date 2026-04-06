import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { retrieveUserBySessionToken } from "@/actions/user/retrieve";
import { NotificationRepository } from "@/modules/notifications/repository/notification-repository";
import { registerNotificationHandlers } from "@/modules/notifications";

registerNotificationHandlers();

/**
 * Get paginated notifications for current user
 */
export async function GET(request: NextRequest) {
    try {
        const c = await cookies();
        const sessionToken = c.get("session_token")?.value;
        const currentUser = await retrieveUserBySessionToken(sessionToken);

        if (!currentUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const cursor = searchParams.get("cursor") || undefined;
        const limit = parseInt(searchParams.get("limit") || "20");
        const includeRead = searchParams.get("includeRead") === "true";

        const repository = new NotificationRepository();
        const notifications = await repository.getByUserId(currentUser.id, {
            cursor,
            limit: Math.min(limit, 100),
            includeRead,
        });

        return NextResponse.json(notifications);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

/**
 * Bulk operations
 */
export async function PATCH(request: NextRequest) {
    try {
        const c = await cookies();
        const sessionToken = c.get("session_token")?.value;
        const currentUser = await retrieveUserBySessionToken(sessionToken);

        if (!currentUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();

        if (body.action === "markAllRead") {
            const repository = new NotificationRepository();
            await repository.markAllAsRead(currentUser.id);
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (error) {
        console.error("Error updating notifications:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}