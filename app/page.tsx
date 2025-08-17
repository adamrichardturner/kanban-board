'use client';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/auth/useAuth';
import { ExternalLink, Play } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import KanBanLogo from '@/public/logo/kanban-board-logo.svg';
import Spinner from '@/public/spinner.svg';

export default function Home() {
  const { isLoginLoading, handleDemoLogin } = useAuth();

  return (
    <div className='grid min-h-screen items-center justify-items-center bg-gradient-to-br from-slate-50 to-slate-100 font-sans dark:from-slate-900 dark:to-slate-800'>
      <main className='mx-auto flex max-w-2xl flex-col items-center justify-center gap-8 px-6 text-center'>
        {/* Logo */}
        <div className='mb-4'>
          <Image
            className='dark:invert'
            src={KanBanLogo}
            alt='Kanban Board Logo'
            width={200}
            height={33}
            priority
          />
        </div>

        {/* Hero Content */}
        <div className='space-y-6'>
          <h1 className='text-4xl leading-tight font-bold text-slate-900 md:text-5xl dark:text-slate-100'>
            Streamline Your Workflow
          </h1>

          <p className='max-w-xl text-lg leading-relaxed text-slate-600 md:text-xl dark:text-slate-300'>
            Try out this feature-rich Kanban board designed for effortless task
            organisation and team collaboration. Explore the demo account with
            sample boards and tasks.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className='mt-8 flex flex-col gap-4 sm:flex-row'>
          <Button
            onClick={handleDemoLogin}
            disabled={isLoginLoading}
            className='transform bg-blue-600 px-8 py-3 text-lg font-medium text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-blue-700 hover:shadow-xl'
          >
            {isLoginLoading ? (
              <div className='flex items-center gap-2'>
                <Image
                  src={Spinner}
                  alt='Loading...'
                  width={16}
                  height={16}
                  priority
                  className='brightness-0 invert'
                />
                Loading Demo...
              </div>
            ) : (
              <div className='flex items-center gap-2'>
                <Play size={20} />
                Try Demo Account
              </div>
            )}
          </Button>

          <Button
            variant='outline'
            asChild
            className='border-slate-300 px-8 py-3 text-lg font-medium transition-all duration-200 hover:border-slate-400 hover:bg-slate-50 dark:border-slate-600 dark:hover:border-slate-500 dark:hover:bg-slate-800'
          >
            <Link href='/register'>Get Started Free</Link>
          </Button>
        </div>

        {/* Features Preview */}
        <div className='mt-12 grid grid-cols-1 gap-6 text-sm md:grid-cols-3'>
          <div className='rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800'>
            <div className='mb-2 font-semibold text-slate-900 dark:text-slate-100'>
              Multiple Boards
            </div>
            <div className='text-slate-600 dark:text-slate-300'>
              Organize different projects with dedicated boards
            </div>
          </div>

          <div className='rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800'>
            <div className='mb-2 font-semibold text-slate-900 dark:text-slate-100'>
              Drag & Drop
            </div>
            <div className='text-slate-600 dark:text-slate-300'>
              Effortlessly move tasks between columns
            </div>
          </div>

          <div className='rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800'>
            <div className='mb-2 font-semibold text-slate-900 dark:text-slate-100'>
              Subtasks
            </div>
            <div className='text-slate-600 dark:text-slate-300'>
              Break down complex tasks into smaller steps
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className='row-start-3 flex flex-wrap items-center justify-center gap-6 py-8'>
        <Link
          href='https://adamrichardturner.dev'
          target='_blank'
          rel='noopener noreferrer'
          className='flex items-center gap-2 text-sm text-slate-500 transition-colors duration-200 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
        >
          Made by Adam Turner
          <ExternalLink size={14} />
        </Link>
      </footer>
    </div>
  );
}
