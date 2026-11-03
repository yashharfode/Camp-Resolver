import StudentPortalPage from './student/page';

/**
 * Root Home Route: Displays the Student Grievance Portal directly without requiring any password.
 * Administrative functions are securely isolated at /admin with password authentication (123456).
 */
export default function HomePage() {
  return <StudentPortalPage />;
}
