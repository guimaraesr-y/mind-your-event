import { UserInterface } from "../user";
import { IUserRepository } from "../interfaces/user-repository.interface";
import UserRepository from "../repository";

export default class FindOrCreateUserUseCase {
    constructor(
        private userRepository: IUserRepository = new UserRepository()
    ) { }

    public async execute(email: string, name: string): Promise<{ user: UserInterface; created: boolean }> {
        const user = await this.userRepository.getUserByEmail(email);

        if (!user) {
            const newUser = await this.userRepository.createUser({
                email,
                name,
                session_token: undefined,
            });
            return { user: newUser, created: true };
        }
        return { user, created: false };
    }
}
