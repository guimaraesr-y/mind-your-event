export interface EmailStrategy {

    sendMail(params: {
        to: string;
        subject: string;
        html: string;
    }): Promise<boolean>;

}
