import React from "react";
import Image from "next/image";
import Link from "next/link";

import layoutImage from "@/assets/images/laptop.jpg";
import logoImage from "@/assets/images/logo.jpg";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/shared/presentation/libraries/auth/auth";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default async function AuthLayout({ children }: AuthLayoutProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/");
  }

  return (
    <div className="container relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      {/* LEFT SIDE: Forms (Children) */}
      <div className="lg:p-8 h-full flex items-center justify-center">
        <div className="mx-auto flex w-full flex-col justify-center">
          {/* 🔥 Add Logo / Identity Here */}
          <div className="flex justify-center space-x-2">
            <Image
              src={logoImage}
              alt=""
              aria-hidden
              className="size-8 rounded-sm"
            />
            <span className="text-2xl font-bold text-primary">Nerpai ERP</span>
          </div>

          {children}

          <p className="px-8 text-center text-sm text-muted-foreground">
            By clicking continue, you agree to our{" "}
            <Link
              href="/terms"
              className="underline underline-offset-4 hover:text-primary"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="underline underline-offset-4 hover:text-primary"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Visual Image & Branding */}
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src={layoutImage}
            alt=""
            aria-hidden
            fill
            className="object-cover grayscale-20 hover:grayscale-0 transition-all duration-500"
            priority
          />
          {/* Gradient Overlay for bottom text */}
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
        </div>

        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 from-zinc-900/50 to-zinc-900/30 via-blue-600/20 bg-linear-to-tr" />

        {/* Top Logo Area */}
        <div className="relative z-10 flex items-center">
          <Image
            src={logoImage}
            alt=""
            aria-hidden
            className="size-12 rounded-sm"
          />
        </div>

        {/* Bottom Quote / Testimonial */}
        <div className="relative z-10 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;This library has saved me countless hours of work and
              helped me deliver stunning designs to my clients faster than ever
              before.&rdquo;
            </p>
            <footer className="text-sm font-medium text-zinc-300">
              John Doe
            </footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
}
