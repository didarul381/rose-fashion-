import React from 'react';
import { Head } from '@inertiajs/react';
import ShopLayout from '../../Layouts/ShopLayout';
import { CalendarDays, Clock3, Dot } from 'lucide-react';

export default function ShopPage({ page, seo }) {
    const updatedAt = page.updated_at ? new Date(page.updated_at) : null;
    const publishedAt = page.created_at ? new Date(page.created_at) : null;
    const formatDate = (value) =>
        value && !Number.isNaN(value.getTime())
            ? value.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
            : null;

    const html = page.content || '<p>This page is ready for your custom content.</p>';
    const updatedText = formatDate(updatedAt);
    const publishedText = formatDate(publishedAt);

    return (
        <ShopLayout>
            <Head title={seo?.title || page.title}>
                {seo?.meta_description && <meta name="description" content={seo.meta_description} />}
            </Head>

            <style>{`
                .page-article h2,
                .page-article h3,
                .page-article h4 {
                    font-weight: 700;
                    color: #0f172a;
                    margin: 1.5rem 0 0.75rem;
                    line-height: 1.35;
                }

                .page-article h2 { font-size: 1.5rem; }
                .page-article h3 { font-size: 1.2rem; }
                .page-article h4 { font-size: 1.05rem; }

                .page-article p {
                    margin: 0 0 1rem;
                    line-height: 2;
                    color: #334155;
                    font-size: 1.02rem;
                }

                .page-article ul,
                .page-article ol {
                    margin: 1rem 0 1.25rem;
                    padding-left: 1.5rem;
                    color: #334155;
                }

                .page-article li {
                    margin: 0.4rem 0;
                    line-height: 1.9;
                }

                .page-article a {
                    color: #0f62fe;
                    text-decoration: underline;
                    text-underline-offset: 2px;
                }

                .page-article blockquote {
                    margin: 1.5rem 0;
                    padding: 1rem 1.25rem;
                    border-left: 4px solid #0f62fe;
                    background: #eff6ff;
                    border-radius: 0.75rem;
                    color: #1e293b;
                }

                .page-article table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 1.5rem 0;
                }

                .page-article table th,
                .page-article table td {
                    border: 1px solid #e2e8f0;
                    padding: 0.75rem;
                    text-align: left;
                    vertical-align: top;
                }

                .page-article img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 1rem;
                    margin: 1.25rem 0;
                }
            `}</style>

            <div className="bg-[#f5f5f3]">
                <div className="mx-auto max-w-9xl px-4 py-10 sm:px-6 lg:px-8 md:py-16">
                    <div className="rounded-[2rem] border border-slate-100 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
                        <div className="px-5 pt-8 sm:px-8 lg:px-14 md:pt-12">
                            <div className="mx-auto max-w-3xl text-center">
                                <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
                                    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-600">
                                        <Dot className="h-4 w-4" />
                                        Website Page
                                    </span>
                                    {updatedText && (
                                        <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-600 normal-case tracking-normal">
                                            <CalendarDays className="h-3.5 w-3.5" />
                                            Updated {updatedText}
                                        </span>
                                    )}
                                </div>

                                <h1 className="mt-5 text-[2.2rem] font-bold tracking-tight text-slate-950 sm:text-5xl">
                                    {page.title}
                                </h1>

                                {page.excerpt && (
                                    <p className="mt-5 text-base leading-8 text-slate-600 sm:text-lg">
                                        {page.excerpt}
                                    </p>
                                )}

                                {(publishedText || page.slug) && (
                                    <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-[12px] text-slate-500">
                                        {publishedText && (
                                            <span className="inline-flex items-center gap-1.5">
                                                <Clock3 className="h-3.5 w-3.5" />
                                                Published {publishedText}
                                            </span>
                                        )}
                                        {page.slug && (
                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">
                                                /page/{page.slug}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="px-5 pb-10 pt-10 sm:px-8 lg:px-14 md:pb-14">
                            <div className="mx-auto max-w-6xl">
                                <article
                                    id="page-content"
                                    className="page-article text-[16px] leading-[2.05] text-slate-700"
                                    dangerouslySetInnerHTML={{ __html: html }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ShopLayout>
    );
}
