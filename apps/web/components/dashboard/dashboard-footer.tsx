/*
 * Dashboard Footer
 * Displays author credit as required by the assignment submission guidelines:
 * "Make sure your name, Github Profile and LinkedIn profile is mentioned
 *  in the footer of the application."
 */
export function DashboardFooter() {
  return (
    <footer className="mt-auto border-t bg-card px-6 py-4">
      <p className="text-center text-xs text-muted-foreground">
        Built by{" "}
        <span className="font-semibold text-foreground">Rohan Bondre</span>
        {" · "}
        <a
          href="https://github.com/therohanbondre"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-foreground underline-offset-4 hover:underline"
          aria-label="Rohan Bondre's GitHub profile"
        >
          GitHub
        </a>
        {" · "}
        <a
          href="https://www.linkedin.com/in/rohan-bondre1/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-foreground underline-offset-4 hover:underline"
          aria-label="Rohan Bondre's LinkedIn profile"
        >
          LinkedIn
        </a>
        {" · "}
        <span>&copy; {new Date().getFullYear()} AI Career Mentor</span>
      </p>
    </footer>
  )
}
