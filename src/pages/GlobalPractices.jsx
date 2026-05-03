import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, CalendarDays } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '@/components/wellness/Footer';
import { apiUrl } from '@/utils';

function formatDate(value) {
  if (!value) return 'Draft';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Draft';
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function GlobalPractices() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(apiUrl('/api/blogs'));
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!cancelled) setRows(Array.isArray(json?.data) ? json.data : []);
      } catch (err) {
        if (!cancelled) setError(err?.message || 'Unable to load blogs');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <section className="px-6 lg:px-16 pt-24 lg:pt-28 pb-12 lg:pb-16">
        <div className="max-w-7xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65 }}
            className="text-[10px] tracking-[0.42em] uppercase mb-5"
            style={{ color: 'var(--accent-text)' }}
          >
            ◊ Blogs
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="hero-display text-5xl lg:text-7xl max-w-4xl"
            style={{ color: 'var(--fg)' }}
          >
            Notes, reflections, and
            <span
              style={{
                color: 'var(--accent-text)',
                fontFamily: 'Cormorant Garamond, serif',
                fontStyle: 'italic',
                fontWeight: 300,
              }}
            >
              {' '}teaching pieces
            </span>
          </motion.h1>
        </div>
      </section>

      <section className="px-6 lg:px-16 pb-16 lg:pb-24">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <p className="text-sm font-light" style={{ color: 'var(--fg2)' }}>
              Loading blogs…
            </p>
          ) : error ? (
            <p className="text-sm font-light" style={{ color: 'var(--fg2)' }}>
              {error}
            </p>
          ) : rows.length === 0 ? (
            <div className="rounded-[28px] p-8" style={{ border: '1px solid var(--border2)', background: 'var(--bg-elev)' }}>
              <p className="text-sm font-light" style={{ color: 'var(--fg2)' }}>
                No published blogs yet.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
              {rows.map((post, index) => (
                <motion.article
                  key={post.id || post.slug}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.7, delay: index * 0.03 }}
                  className="rounded-[28px] overflow-hidden"
                  style={{ border: '1px solid var(--border2)', background: 'var(--bg-elev)' }}
                >
                  <div className="aspect-[16/10]" style={{ background: 'var(--bg2)' }}>
                    {post.cover_image ? (
                      <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, var(--accent-dim), transparent 72%)' }} />
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-4 text-[10px] tracking-[0.18em] uppercase" style={{ color: 'var(--fg3)' }}>
                      <CalendarDays className="w-3.5 h-3.5" />
                      {formatDate(post.published_at || post.updated_at)}
                    </div>
                    <h2 className="text-2xl leading-tight" style={{ color: 'var(--fg)' }}>
                      {post.title}
                    </h2>
                    <p className="mt-3 text-sm font-light leading-relaxed min-h-[72px]" style={{ color: 'var(--fg2)' }}>
                      {post.excerpt || 'Open the post to read more.'}
                    </p>
                    <Link
                      to={`/blogs/${post.slug}`}
                      className="inline-flex items-center gap-2 mt-5 text-[10px] tracking-[0.22em] uppercase"
                      style={{ color: 'var(--accent-text)' }}
                    >
                      Read article
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
