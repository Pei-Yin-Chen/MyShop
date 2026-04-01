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

export function Footer() {
  return (
    <footer className="border-t border-[var(--footer-border)] bg-[var(--footer-bg)] py-16 text-[var(--footer-text)]">
      <div className="container mx-auto px-4">
        <div className="mb-14 grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-5">
            <Link href="/" className="w-fit">
              <span className="text-2xl font-semibold tracking-tight text-[var(--footer-heading)]">
                My<span className="text-[var(--footer-accent)]">Pâtisserie</span>
              </span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-[var(--footer-muted)]">
              專注蛋糕、麵包與季節甜點，以柔和風味與當日烘焙，陪伴你的日常與節慶。
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

          <div>
            <h3 className="mb-5 text-sm font-semibold uppercase tracking-wider text-[var(--footer-heading)]">
              聯絡我們
            </h3>
            <ul className="space-y-4 text-sm text-[var(--footer-muted)]">
              <li className="flex gap-3">
                <MapPin
                  className="mt-0.5 h-4 w-4 shrink-0 text-[var(--footer-accent)]"
                  aria-hidden
                />
                <span>台北市大安區烘焙街 88 號 1 樓</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-[var(--footer-accent)]" aria-hidden />
                <span>02-2345-6789</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-[var(--footer-accent)]" aria-hidden />
                <span>hello@mypatisserie.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div
          className="flex flex-col items-center justify-between gap-4 border-t pt-8 text-xs text-[var(--footer-subtle)] md:flex-row"
          style={{ borderColor: "var(--footer-divider)" }}
        >
          <p>© 2026 My Pâtisserie. All rights reserved.</p>
          <span>繁體中文 · TWD</span>
        </div>
      </div>
    </footer>
  );
}
