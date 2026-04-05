export class EmailRetryService {
    private readonly DEFAULT_MAX_RETRIES = 3;
    private readonly DEFAULT_BASE_DELAY = 1000;

    async executeWithRetry<T>(
        fn: () => Promise<T>,
        maxRetries: number = this.DEFAULT_MAX_RETRIES,
        baseDelay: number = this.DEFAULT_BASE_DELAY
    ): Promise<T> {
        let lastError: Error | null = null;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));

                if (attempt < maxRetries) {
                    const delay = baseDelay * Math.pow(2, attempt - 1);
                    console.warn(`Email attempt ${attempt}/${maxRetries} failed, retrying in ${delay}ms`);
                    await this.sleep(delay);
                }
            }
        }

        throw lastError;
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export const emailRetryService = new EmailRetryService();
