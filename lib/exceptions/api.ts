export class ApiException extends Error {
    constructor(
        public message: string,
        public httpCode: number,
    ) {
        super(message);
    }
}
