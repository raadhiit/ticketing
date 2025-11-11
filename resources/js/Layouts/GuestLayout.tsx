import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link, Head } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
  return (
      <>
          <Head title="Log in" />
          <div className="grid min-h-dvh grid-cols-1 bg-slate-950 text-neutral-100 lg:grid-cols-2">
              {/* LEFT — hero only on lg+ */}
              <section className="relative hidden lg:block">
                  {/* background gradient + subtle vignette */}
                  <div className="absolute inset-0 bg-gradient-to-b from-slate-950 to-slate-900" />
                  <div className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(100%_100%_at_0%_0%,black,transparent)]" />

                  <div className="relative z-10 flex h-full flex-col justify-between p-8">
                      {/* brand */}
                      <div className="flex items-center gap-3">
                          <ApplicationLogo className="h-8 w-auto" />
                          <span className="text-xl font-semibold tracking-wide">
                              RSHM TICKETING SYSTEM
                          </span>
                      </div>

                      {/* quote */}
                      <figure className="max-w-xl">
                          <blockquote className="text-lg font-medium leading-relaxed">
                              “Dua Tiga Tutup Botol”
                          </blockquote>
                          <figcaption className="mt-3 text-sm text-neutral-400">
                              Gus Miftah
                          </figcaption>
                      </figure>
                  </div>
              </section>

              {/* RIGHT — form area */}
              <main className="relative flex min-h-dvh items-center justify-center bg-slate-900 lg:bg-transparent">
                  {/* mobile brand */}
                  <div className="absolute left-0 top-0 flex items-center gap-3 p-5 lg:hidden">
                      <ApplicationLogo className="h-7 w-auto" />
                      <span className="text-lg font-semibold">RSHM HRIS</span>
                  </div>

                  <div className="w-full max-w-md p-6 sm:p-8">{children}</div>
              </main>
          </div>
      </>
  );
}
