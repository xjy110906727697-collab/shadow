export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-600 text-sm">
          <p>&copy; {new Date().getFullYear()} HangulStudy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
