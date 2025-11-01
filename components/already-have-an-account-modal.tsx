"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";

export function AlreadyHaveAnAccountModal() {
    const t = useTranslations("Modal.AlreadyHaveAnAccountModal");
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    const handleLoginRedirect = () => {
        router.push("/verify");
    };

    useEffect(() => {
        if (!isLoading && !user) {
            setIsOpen(true);
        }
    }, [user, isLoading]);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[425px] bg-card text-card-foreground">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">{t("title")}</DialogTitle>
                    <DialogDescription>{t("description")}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button onClick={handleLoginRedirect} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                        {t("login")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
