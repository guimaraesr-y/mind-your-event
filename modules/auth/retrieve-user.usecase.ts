import UserRepository from "../user/repository";
import { UserInterface } from "../user/user";

type RetrieveUserUseCaseQueryBy = "email" | "sessionToken";

export default class RetrieveUserUseCase {
    constructor(
        private userRepository = new UserRepository(),
        private queryBy: RetrieveUserUseCaseQueryBy = "email"
    ) {}

    async execute(value: string): Promise<UserInterface | null> {
        if (this.queryBy === "sessionToken") {
            return await this.userRepository.getUserBySessionToken(value);
        }
        
        return await this.userRepository.getUserByEmail(value);
    }
}
