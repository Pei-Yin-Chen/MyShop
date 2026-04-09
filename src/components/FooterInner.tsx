"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Camera,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Play,
  Share2,
} from "lucide-react";
import { SiteLogo } from "@/components/SiteLogo";
import type { SiteSettings } from "@/lib/site-settings";
import { cn } from "@/lib/utils";

export function FooterInner({ site }: { site: SiteSettings }) {
  const logoSrc = site.footerLogoUrl || site.siteLogoUrl;
  const year = new Date().getFullYear();
  const showContact = Boolean(
    site.footerContactAddress || site.footerContactPhone || site.footerContactEmail,
  );

  return (
    <footer className="border-t border-[var(--footer-border)] bg-[var(--footer-bg)] py-16 text-[var(--footer-text)]">
      <div className="container mx-auto px-4">
        <div
          className={cn(
            "mb-14 grid grid-cols-1 gap-12 md:grid-cols-2",
            showContact ? "lg:grid-cols-4" : "lg:grid-cols-3",
          )}
        >
          <div className="flex flex-col gap-5">
            <Link href="/" className="w-fit">
              {logoSrc ? (
                <Image
                  src={logoSrc}
                  alt={site.siteTitle}
                  width={220}
                  height={56}
                  priority={false}
                  sizes="(max-width: 768px) 70vw, 220px"
                  style={{ width: "auto", height: "auto" }}
                  className="h-10 w-auto max-h-11 max-w-[min(220px,70vw)] object-contain object-left"
                />
              ) : (
                <SiteLogo text={site.siteTitle} className="text-2xl" />
              )}
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-[var(--footer-muted)]">
              {site.footerTagline}
            </p>
            <div className="flex gap-2">
              <Link
                href="#"
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--footer-border)] bg-[var(--footer-elevated)] text-[var(--footer-text)] transition-colors hover:border-primary/25 hover:bg-primary/10 hover:text-primary"
              >
                <Share2 className="h-4 w-4" />
              </Link>
              <Link
                href="#"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--footer-border)] bg-[var(--footer-elevated)] text-[var(--footer-text)] transition-colors hover:border-primary/25 hover:bg-primary/10 hover:text-primary"
              >
                <Camera className="h-4 w-4" />
              </Link>
              <Link
                href="#"
                aria-label="X（Twitter）"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--footer-border)] bg-[var(--footer-elevated)] text-[var(--footer-text)] transition-colors hover:border-primary/25 hover:bg-primary/10 hover:text-primary"
              >
                <MessageCircle className="h-4 w-4" />
              </Link>
              <Link
                href="#"
                aria-label="YouTube"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--footer-border)] bg-[var(--footer-elevated)] text-[var(--footer-text)] transition-colors hover:border-primary/25 hover:bg-primary/10 hover:text-primary"
              >
                <Play className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div>
            <h3 className="mb-5 text-sm font-semibold uppercase tracking-wider text-[var(--footer-heading)]">
              快速連結
            </h3>
            <ul className="space-y-3 text-sm text-[var(--footer-muted)]">
              <li>
                <Link
                  href="/products"
                  className="transition-colors hover:text-[var(--footer-heading)]"
                >
                  所有商品
                </Link>
              </li>
              <li>
                <Link href="/cakes" className="transition-colors hover:text-[var(--footer-heading)]">
                  蛋糕
                </Link>
              </li>
              <li>
                <Link href="/bread" className="transition-colors hover:text-[var(--footer-heading)]">
                  麵包
                </Link>
              </li>
              <li>
                <Link href="/about" className="transition-colors hover:text-[var(--footer-heading)]">
                  關於我們
                </Link>
              </li>
              <li>
                <Link href="/blog" className="transition-colors hover:text-[var(--footer-heading)]">
                  烘焙誌
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-5 text-sm font-semibold uppercase tracking-wider text-[var(--footer-heading)]">
              客戶服務
            </h3>
            <ul className="space-y-3 text-sm text-[var(--footer-muted)]">
              <li>
                <Link href="/faq" className="transition-colors hover:text-[var(--footer-heading)]">
                  常見問題
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="transition-colors hover:text-[var(--footer-heading)]">
                  運送與取貨
                </Link>
              </li>
              <li>
                <Link href="/returns" className="transition-colors hover:text-[var(--footer-heading)]">
                  取消與變更
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="transition-colors hover:text-[var(--footer-heading)]">
                  隱私權政策
                </Link>
              </li>
              <li>
                <Link href="/terms" className="transition-colors hover:text-[var(--footer-heading)]">
                  服務條款
                </Link>
              </li>
            </ul>
          </div>

          {showContact ? (
            <div>
              <h3 className="mb-5 text-sm font-semibold uppercase tracking-wider text-[var(--footer-heading)]">
                聯絡我們
              </h3>
              <ul className="space-y-4 text-sm text-[var(--footer-muted)]">
                {site.footerContactAddress ? (
                  <li className="flex gap-3">
                    <MapPin
                      className="mt-0.5 h-4 w-4 shrink-0 text-[var(--footer-accent)]"
                      aria-hidden
                    />
                    <span className="whitespace-pre-line">{site.footerContactAddress}</span>
                  </li>
                ) : null}
                {site.footerContactPhone ? (
                  <li className="flex items-center gap-3">
                    <Phone className="h-4 w-4 shrink-0 text-[var(--footer-accent)]" aria-hidden />
                    <a
                      href={`tel:${site.footerContactPhone.replace(/\s/g, "")}`}
                      className="transition-colors hover:text-[var(--footer-heading)]"
                    >
                      {site.footerContactPhone}
                    </a>
                  </li>
                ) : null}
                {site.footerContactEmail ? (
                  <li className="flex items-center gap-3">
                    <Mail className="h-4 w-4 shrink-0 text-[var(--footer-accent)]" aria-hidden />
                    <a
                      href={`mailto:${site.footerContactEmail}`}
                      className="break-all transition-colors hover:text-[var(--footer-heading)]"
                    >
                      {site.footerContactEmail}
                    </a>
                  </li>
                ) : null}
              </ul>
            </div>
          ) : null}
        </div>

        <div
          className="flex flex-col items-center justify-between gap-4 border-t pt-8 text-xs text-[var(--footer-subtle)] md:flex-row"
          style={{ borderColor: "var(--footer-divider)" }}
        >
          <p>
            © {year} {site.siteTitle}. All rights reserved.
          </p>
          <span>繁體中文 · TWD</span>
        </div>
      </div>
    </footer>
  );
}
