export const metadata = {
  title: "DEV.WAREHOUSE | Private Developer Workspace",
  description: "Private self-hosted developer notebook and visual workspace",
};

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-screen h-screen overflow-hidden flex flex-col bg-background text-foreground">
      {children}
    </div>
  );
}
