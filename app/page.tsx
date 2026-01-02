import { redirect } from "next/navigation";

export default async function Home() {
  redirect("/meals");
}

    <div className="flex min-h-screen flex-col">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 md:max-w-lg md:px-0 lg:max-w-xl">
          <main className="flex flex-1 flex-col justify-center">
            <div className="flex gap-6 lg:gap-8 items-center mb-6 md:mb-7">
              <Image
                className="lg:h-8 lg:w-auto dark:hidden"
                src={logo}
                alt="MongoDB logo"
                width={88}
                height={24}
                priority
              />
              <Image
                className="hidden lg:h-8 lg:w-auto dark:block"
                src={logoDark}
                alt="MongoDB logo"
                width={88}
                height={24}
                priority
              />
              <Image
                className="lg:h-6 lg:w-auto dark:hidden"
                src={vercelLogotypeLight}
                alt="MongoDB logo"
                width={88}
                height={24}
                priority
              />
              <Image
                className="hidden lg:h-6 lg:w-auto dark:block"
                src={vercelLogotypeDark}
                alt="MongoDB logo"
                width={88}
                height={24}
                priority
              />
            </div>
            <h1 className="text-3xl font-semibold leading-none tracking-tighter md:text-4xl md:leading-none lg:text-5xl lg:leading-none">
              {DATA.title}
            </h1>
            <p className="mt-3.5 max-w-lg text-base leading-snug tracking-tight text-[#61646B] md:text-lg md:leading-snug lg:text-xl lg:leading-snug dark:text-[#94979E]">
              {DATA.description}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-5 md:mt-9 lg:mt-10">
              <Button
                asChild
                className="rounded-full bg-[#00ED64] px-5 py-2.5 font-semibold tracking-tight text-[#001E2B] transition-colors duration-200 hover:bg-[#00684A] hover:text-[#FFFFFF] lg:px-7 lg:py-3"
              >
                <Link href={DATA.button.href} target="_blank">
                  {DATA.button.text}
                </Link>
              </Button>
              <Button
                variant="ghost"
                asChild
                className="group flex items-center gap-2 leading-none tracking-tight"
              >
                <Link href={DATA.link.href} target="_blank">
                  {DATA.link.text}
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 dark:text-white" />
                </Link>
              </Button>
            </div>
          </main>
          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[#023430] py-5 sm:gap-2 sm:gap-6 md:pb-12 md:pt-10 dark:border-[#023430]">
            <ul className="flex items-center">
              {DATA.footerLinks.map((link) => {
                const icons = {
                  FileText: FileText,
                  LogIn: LogIn,
                };
                const Icon = icons[link.icon as keyof typeof icons];
                return (
                  <Button
                    key={link.text}
                    variant="ghost"
                    asChild
                    className="flex items-center gap-2 opacity-70 transition-opacity duration-200 hover:opacity-100 h-auto"
                  >
                    <Link href={link.href} target="_blank">
                      <Icon className="h-4 w-4 dark:text-white" />
                      <span className="text-sm tracking-tight">{link.text}</span>
                    </Link>
                  </Button>
                );
              })}
            </ul>
            <Badge
              variant={result === "Database connected" ? "default" : "destructive"}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                result === "Database connected"
                  ? "border-[#00ED64]/20 bg-[#00ED64]/10 text-[#00684A] dark:bg-[#00ED64]/10 dark:text-[#00ED64]"
                  : "border-red-500/20 bg-red-500/10 text-red-500 dark:text-red-500"
              }`}
            >
              {result}
            </Badge>
          </footer>
      </div>
    </div>
  );
}
