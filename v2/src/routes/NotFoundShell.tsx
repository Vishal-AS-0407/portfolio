/* 404 with the stage behind it. Lazy for the same reason HomeShell is: it
   imports Stage, and Stage imports three. */
import Stage from '@/components/chrome/Stage';
import NotFound from '@/routes/NotFound';

export default function NotFoundShell() {
  return (
    <>
      <Stage />
      <main className="relative z-[5]">
        <NotFound />
      </main>
    </>
  );
}
