import type { ReactNode } from "react";

type LogoutButtonProps = {
  className?: string;
  children: ReactNode;
};

export function LogoutButton({ className, children }: LogoutButtonProps) {
  return (
    <form action="/auth/signout" method="post">
      <button className={className} type="submit">
        {children}
      </button>
    </form>
  );
}
