export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  /* 後台無 Navbar：用 dvh 鎖定視窗高度，避免長內容（如編輯頁圖片區）把 body 撐出第二條捲動 */
  return (
    <div className="flex h-dvh max-h-dvh min-h-0 w-full flex-col overflow-hidden overscroll-none">
      {children}
    </div>
  )
}
