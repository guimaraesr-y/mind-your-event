import { UserInterface } from "@/modules/user/user";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";

export function useUser() {
    const t = useTranslations();
    
    const updateUser = async (data: Partial<UserInterface>) => {
        try {
            const response = await fetch("/api/user", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })
    
            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error)
            }

            return await response.json()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : t('DashboardPage.updateNameError'))
        }
    }

    return { updateUser }
}
