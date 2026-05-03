import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import Footer from '@/components/wellness/Footer';
import { apiUrl } from '@/utils';

function renderBlock(block, index) {
  if (!block || typeof block !== 'object') return null;
  const key = `${block.id || block.type || 'block'}-${index}`;
  switch (block.type) {
    case 'heading':
      return (
        <h2 key={key} className="hero-display text-3xl lg:text-4xl mt-8" style={{ color: 'var(--fg)' }}>
          {block.text || block.content || ''}
        </h2>
      );
    case 'paragraph':
      return (
        <p key={key} className="text-base font-light leading-relaxed mt-5" style={{ color: 'var(--fg2)' }}>
          {block.text || block.content || ''}
        </p>
      );
    case 'quote':
      return (
        <blockquote key={key} className="mt-8 pl-5 border-l-2 italic text-lg" style={{ borderColor: 'var(--accent)', color: 'var(--fg)' }}>
          {block.text || block.content || ''}
        </blockquote>
      );
    case 'image':
      return block.url ? (
        <figure key={key} className="mt-8">
          <img src={block.url} alt={block.alt || ''} className="w-full rounded-[24px]" />
          {block.caption ? (
            <figcaption className="mt-3 text-sm font-light" style={{ color: 'var(--fg3)' }}>
              {block.caption}
            </figcaption>
          ) : null}
        </figure>
      ) : null;
    case 'video':
      return block.url ? (
        <div key={key} className="mt-8 rounded-[24px] overflow-hidden" style={{ border: '1px solid var(--border2)' }}>
          <video controls className="w-full" src={block.url} />
        </div>
      ) : null;
    case 'embed':
      return block.url ? (
        <div key={key} className="mt-8 rounded-[24px] overflow-hidden" style={{ border: '1px solid var(--border2)' }}>
          <iframe src={block.url} title={block.title || `embed-${index}`} className="w-full min-h-[420px]" />
        </div>
      ) : null;
    case 'divider':
      return <div key={key} className="mt-8 h-px" style={{ background: 'var(--border)' }} />;
    case 'spacer':
      return <div key={key} style={{ height: `${Number(block.height || 24)}px` }} />;
    case 'button':
    case 'cta':
      return block.href ? (
        <a
          key={key}
          href={block.href}
          target={block.href.startsWith('http') ? '_blank' : undefined}
          rel={block.href.startsWith('http') ? 'noopener noreferrer' : undefined}
          className="inline-flex mt-8 px-5 py-3 rounded-full text-[10px] tracking-[0.22em] uppercase"
          style={{ background: 'var(--accent)', color: '#fff' }}
        >
          {block.label || block.text || 'Open'}
        </a>
      ) : null;
    case 'two-column':
    case 'container':
      return (
        <div key={key} className="mt-8 grid md:grid-cols-2 gap-5">
          {(Array.isArray(block.columns) ? block.columns : []).map((col, colIndex) => (
            <div key={`${key}-${colIndex}`} className="rounded-[24px] p-5" style={{ border: '1px solid var(--border2)', background: 'var(--bg-elev)' }}>
              {(Array.isArray(col?.blocks) ? col.blocks : []).map((child, childIndex) =>
                renderBlock(child, childIndex)
              )}
            </div>
          ))}
        </div>
      );
    default:
      return null;
  }
}

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(apiUrl(`/api/blogs/${encodeURIComponent(slug)}`));
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!cancelled) setPost(json?.data || null);
      } catch (err) {
        if (!cancelled) setError(err?.message || 'Unable to load blog');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    if (slug) load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <section className="px-6 lg:px-16 pt-24 lg:pt-28 pb-12 lg:pb-16">
        <div className="max-w-4xl mx-auto">
          <Link to="/blogs" className="text-[10px] tracking-[0.24em] uppercase" style={{ color: 'var(--accent-text)' }}>
            Back to blogs
          </Link>
          {loading ? (
            <p className="mt-8 text-sm font-light" style={{ color: 'var(--fg2)' }}>
              Loading post…
            </p>
          ) : error ? (
            <p className="mt-8 text-sm font-light" style={{ color: 'var(--fg2)' }}>
              {error}
            </p>
          ) : !post ? (
            <p className="mt-8 text-sm font-light" style={{ color: 'var(--fg2)' }}>
              This blog could not be found.
            </p>
          ) : (
            <>
              <motion.h1
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.85, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="hero-display text-5xl lg:text-7xl mt-6"
                style={{ color: 'var(--fg)' }}
              >
                {post.title}
              </motion.h1>
              {post.excerpt ? (
                <p className="mt-6 max-w-2xl text-base font-light leading-relaxed" style={{ color: 'var(--fg2)' }}>
                  {post.excerpt}
                </p>
              ) : null}
            </>
          )}
        </div>
      </section>

      {post ? (
        <section className="px-6 lg:px-16 pb-16 lg:pb-24">
          <div className="max-w-4xl mx-auto">
            {post.cover_image ? (
              <img src={post.cover_image} alt={post.title} className="w-full rounded-[28px] mb-10" />
            ) : null}
            {(Array.isArray(post.blocks) ? post.blocks : []).map((block, index) => renderBlock(block, index))}
          </div>
        </section>
      ) : null}

      <Footer />
    </div>
  );
}
