import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import Link from "next/link"

export function Login() {
  return (
    <AlertDialog defaultOpen>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you going to share something?</AlertDialogTitle>
          <AlertDialogDescription>
            To share anything, you first need to log in to your account. Logging in will be quick, use your Google account.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>No!</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Link href="/handler/sign-in">Login</Link>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
</AlertDialog>
  )
}