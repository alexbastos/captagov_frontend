export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <section className="w-full max-w-md space-y-3 text-center" aria-labelledby="page-title">
        <p className="text-sm font-medium tracking-[0.16em] text-muted-foreground">
          CAPTAGOV
        </p>
        <h1 id="page-title" className="text-2xl font-semibold tracking-tight">
          Fundação do projeto pronta.
        </h1>
        <p className="text-sm leading-6 text-muted-foreground">
          A interface de autenticação será construída na próxima etapa.
        </p>
      </section>
    </main>
  );
}
