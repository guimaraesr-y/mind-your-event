export interface EmailStrategy {

    sendMail(params: {
        to: string | string[];
        subject: string;
        html: string;
    }): Promise<boolean>;

}
