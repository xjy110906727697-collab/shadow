export function Footer() {
  return (
    <footer className="border-t border-gray-200/50 dark:border-white/5 bg-[#f0ece6] dark:bg-[#0d0d12]">
      <div className="w-full px-4 md:px-6 py-4">
        <div className="text-center text-gray-600 dark:text-slate-400 text-xs">
          <p>&copy; {new Date().getFullYear()} Shadow Korean. 保留所有权利。</p>
        </div>
      </div>
    </footer>
  );
}
