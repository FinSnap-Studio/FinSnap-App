"use client";

import { Github, Linkedin, Instagram, Mail, Globe } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { useTranslation } from "@/hooks/use-translation";

const SOCIALS = [
  { icon: Github, href: "https://github.com/ikhwanulhakim-code", label: "GitHub" },
  { icon: Linkedin, href: "https://linkedin.com/in/ikhwanulhakimm", label: "LinkedIn" },
  { icon: Instagram, href: "https://instagram.com/ikhwanulhakim.me/", label: "Instagram" },
  { icon: Mail, href: "mailto:ikhwanulhakim.work@gmail.com", label: "Email" },
  { icon: Globe, href: "https://ikhwanulhakim.site/", label: "Website" },
];

export function DeveloperSection() {
  const { t } = useTranslation();
  const ref = useScrollAnimation();

  return (
    <section id="developer" className="py-20 sm:py-28 bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div
          ref={ref}
          className="text-center landing-animate animate-fade-up"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-10">
            {t("landing.developer.title")}
          </h2>

          <Avatar className="size-20 mx-auto mb-4">
            <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
              MH
            </AvatarFallback>
          </Avatar>

          <h3 className="text-xl font-semibold">
            {t("landing.developer.name")}{" "}
            <span className="text-muted-foreground font-normal">
              {t("landing.developer.nickname")}
            </span>
          </h3>

          <p className="max-w-lg mx-auto text-muted-foreground mt-3 mb-6 leading-relaxed">
            {t("landing.developer.bio")}
          </p>

          <div className="flex items-center justify-center gap-2 flex-wrap">
            {SOCIALS.map((s) => (
              <Button
                key={s.label}
                variant="outline"
                size="icon"
                className="rounded-full"
                asChild
              >
                <a href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}>
                  <s.icon className="size-4" />
                </a>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
