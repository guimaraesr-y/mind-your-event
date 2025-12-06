import { retrieveUserBySessionToken } from "@/actions/user/retrieve";
import { UpdateUserUseCase } from "@/modules/user/usecases/updateUserUseCase";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest) {
    const c = await cookies();
    const sessionToken = c.get("session_token")?.value;
    const currentUser = await retrieveUserBySessionToken(sessionToken);

    const body = await request.json();
    
    if (!currentUser) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (body.id != currentUser.id) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const usecase = new UpdateUserUseCase();
    const user = usecase.execute(body);
    return NextResponse.json(user);
}
