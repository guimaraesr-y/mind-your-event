import { type ReactNode } from "react";
import { renderComponent } from "@/lib/server";
import UserRepository from "../repository";
import { UserInterface } from "../user";

export class UpdateUserUseCase {

    constructor(
        private repository = new UserRepository(),
    ) {}

    public async execute(data: UserInterface): Promise<UserInterface> {
        return await this.repository.updateUser(data);
    }

    private async getHtmlContent(component: ReactNode): Promise<string> {
        return await renderComponent(component);
    }

}
