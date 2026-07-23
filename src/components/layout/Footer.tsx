export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="w-full px-4 md:px-6 py-4">
        <div className="text-center text-gray-600 text-xs">
          <p>&copy; {new Date().getFullYear()} Shadow Korean. 保留所有权利。</p>
        </div>
      </div>
    </footer>
  );
}
