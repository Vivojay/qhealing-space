import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2, Upload, ArrowLeft, Save } from 'lucide-react';
import { adminApi } from './api';

const EMPTY_BLOCK = (type = 'paragraph') => ({ type, text: '' });

const EMPTY_FORM = {
  title: '',
  slug: '',
  excerpt: '',
  cover_image: '',
  status: 'draft',
  tags: [],
  author_name: 'Vartika Shukla',
  published_at: '',
  blocks: [EMPTY_BLOCK()],
  meta_title: '',
  meta_description: '',
};

function TextInput({ label, value, onChange, placeholder = '' }) {
  return (
    <label className="block">
      <span className="text-[10px] tracking-[0.24em] uppercase mb-2 block" style={{ color: 'var(--fg3)' }}>
        {label}
      </span>
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl px-4 py-3"
        style={{ background: 'var(--bg)', border: '1px solid var(--border2)', color: 'var(--fg)' }}
      />
    </label>
  );
}

function TextArea({ label, value, onChange, rows = 4, placeholder = '' }) {
  return (
    <label className="block">
      <span className="text-[10px] tracking-[0.24em] uppercase mb-2 block" style={{ color: 'var(--fg3)' }}>
        {label}
      </span>
      <textarea
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl px-4 py-3 resize-y"
        style={{ background: 'var(--bg)', border: '1px solid var(--border2)', color: 'var(--fg)' }}
      />
    </label>
  );
}

function BlockEditor({ block, index, onChange, onRemove }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: 'var(--bg)', border: '1px solid var(--border2)' }}>
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <span className="text-[10px] tracking-[0.24em] uppercase" style={{ color: 'var(--fg3)' }}>
            Block {String(index + 1).padStart(2, '0')}
          </span>
          <select
            value={block.type}
            onChange={(event) => onChange({ ...block, type: event.target.value })}
            className="rounded-full px-3 py-1.5 text-[11px]"
            style={{ background: 'var(--bg-elev)', border: '1px solid var(--border2)', color: 'var(--fg)' }}
          >
            {['heading', 'paragraph', 'image', 'video', 'embed', 'quote', 'divider', 'spacer', 'button'].map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <button type="button" onClick={onRemove} className="inline-flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase" style={{ color: '#c96f6f' }}>
          <Trash2 className="w-3.5 h-3.5" />
          Remove
        </button>
      </div>

      {block.type === 'divider' ? null : block.type === 'spacer' ? (
        <TextInput
          label="Spacer Height"
          value={String(block.height || '')}
          onChange={(event) => onChange({ ...block, height: Number(event.target.value || 0) })}
          placeholder="24"
        />
      ) : (
        <div className="grid gap-4">
          {(block.type === 'image' || block.type === 'video' || block.type === 'embed' || block.type === 'button') && (
            <TextInput
              label={block.type === 'button' ? 'Link' : 'URL'}
              value={block.href || block.url || ''}
              onChange={(event) =>
                onChange(
                  block.type === 'button'
                    ? { ...block, href: event.target.value }
                    : { ...block, url: event.target.value }
                )
              }
            />
          )}
          {block.type === 'button' ? (
            <TextInput
              label="Button Label"
              value={block.label || ''}
              onChange={(event) => onChange({ ...block, label: event.target.value })}
            />
          ) : (
            <TextArea
              label={block.type === 'heading' ? 'Heading Text' : 'Content'}
              value={block.text || block.content || ''}
              onChange={(event) => onChange({ ...block, text: event.target.value, content: event.target.value })}
              rows={block.type === 'paragraph' ? 5 : 3}
            />
          )}
          {(block.type === 'image' || block.type === 'video') && (
            <TextInput
              label="Caption / Alt"
              value={block.caption || block.alt || ''}
              onChange={(event) => onChange({ ...block, caption: event.target.value, alt: event.target.value })}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminBlogs({ mode = 'list' }) {
  const navigate = useNavigate();
  const { blogId } = useParams();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(mode === 'list');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('updated_at');
  const [sortDir, setSortDir] = useState('desc');
  const [form, setForm] = useState(EMPTY_FORM);

  const isEditor = mode !== 'list';
  const editorTitle = mode === 'new' ? 'Create Blog' : 'Edit Blog';

  useEffect(() => {
    if (mode !== 'list') return undefined;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        const data = await adminApi.listBlogs({ status: statusFilter, query, sortBy, sortDir, limit: 400 });
        if (!cancelled) setRows(data?.data || []);
      } catch (err) {
        if (!cancelled) setError(err?.message || 'Unable to load blogs');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 220);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [mode, query, statusFilter, sortBy, sortDir]);

  useEffect(() => {
    if (!isEditor || mode !== 'edit' || !blogId) return undefined;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await adminApi.getBlog(blogId);
        const blog = res?.data || EMPTY_FORM;
        if (!cancelled) {
          setForm({
            ...EMPTY_FORM,
            ...blog,
            tags: Array.isArray(blog.tags) ? blog.tags : [],
            blocks: Array.isArray(blog.blocks) && blog.blocks.length ? blog.blocks : [EMPTY_BLOCK()],
            published_at: blog.published_at || '',
          });
        }
      } catch (err) {
        if (!cancelled) setError(err?.message || 'Unable to load blog');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [isEditor, mode, blogId]);

  const canSubmit = useMemo(() => form.title.trim().length >= 2, [form.title]);

  const updateBlock = (index, nextBlock) => {
    setForm((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block, blockIndex) => (blockIndex === index ? nextBlock : block)),
    }));
  };

  const removeBlock = (index) => {
    setForm((prev) => ({
      ...prev,
      blocks: prev.blocks.filter((_, blockIndex) => blockIndex !== index) || [EMPTY_BLOCK()],
    }));
  };

  const addBlock = (type) => {
    setForm((prev) => ({ ...prev, blocks: [...prev.blocks, EMPTY_BLOCK(type)] }));
  };

  const handleUpload = async (event, target = 'cover') => {
    const file = event.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setSaving(true);
    setError('');
    try {
      const res = await adminApi.uploadBlogMedia(formData);
      const url = res?.data?.url || '';
      if (!url) throw new Error('Upload returned no URL');
      if (target === 'cover') {
        setForm((prev) => ({ ...prev, cover_image: url }));
      }
    } catch (err) {
      setError(err?.message || 'Unable to upload media');
    } finally {
      setSaving(false);
      event.target.value = '';
    }
  };

  const handleSave = async () => {
    if (!canSubmit) return;
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        tags: Array.isArray(form.tags) ? form.tags : [],
      };
      if (mode === 'new') {
        const res = await adminApi.createBlog(payload);
        navigate(`/admin/blogs/${res?.data?.id}/edit`);
      } else if (blogId) {
        await adminApi.updateBlog(blogId, payload);
      }
    } catch (err) {
      setError(err?.message || 'Unable to save blog');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this blog?')) return;
    try {
      await adminApi.deleteBlog(id);
      setRows((prev) => prev.filter((row) => row.id !== id));
    } catch (err) {
      setError(err?.message || 'Unable to delete blog');
    }
  };

  if (isEditor) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] tracking-[0.45em] uppercase mb-2" style={{ color: 'var(--accent-text)' }}>
              Blogs
            </p>
            <h1 className="hero-display text-4xl lg:text-6xl" style={{ color: 'var(--fg)' }}>
              {editorTitle}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/admin/blogs"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] tracking-[0.2em] uppercase"
              style={{ border: '1px solid var(--border2)', color: 'var(--fg2)' }}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </Link>
            <button
              type="button"
              onClick={handleSave}
              disabled={!canSubmit || saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] tracking-[0.2em] uppercase"
              style={{ background: 'var(--accent)', color: '#fff', opacity: !canSubmit || saving ? 0.6 : 1 }}
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? 'Saving' : 'Save Blog'}
            </button>
          </div>
        </div>

        {error ? <p style={{ color: '#c96f6f' }}>{error}</p> : null}

        <div className="grid xl:grid-cols-[1.2fr_0.8fr] gap-6">
          <div className="rounded-[28px] p-6 lg:p-8 space-y-5" style={{ border: '1px solid var(--border2)', background: 'var(--bg-elev)' }}>
            <TextInput label="Title" value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} />
            <TextInput label="Slug" value={form.slug} onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))} placeholder="auto from title if blank" />
            <TextArea label="Excerpt" value={form.excerpt} onChange={(e) => setForm((prev) => ({ ...prev, excerpt: e.target.value }))} rows={4} />
            <div className="grid sm:grid-cols-2 gap-4">
              <TextInput label="Author Name" value={form.author_name} onChange={(e) => setForm((prev) => ({ ...prev, author_name: e.target.value }))} />
              <label className="block">
                <span className="text-[10px] tracking-[0.24em] uppercase mb-2 block" style={{ color: 'var(--fg3)' }}>
                  Status
                </span>
                <select
                  value={form.status}
                  onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                  className="w-full rounded-xl px-4 py-3"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border2)', color: 'var(--fg)' }}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </label>
            </div>
            <TextInput
              label="Tags"
              value={form.tags.join(', ')}
              onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value.split(',').map((tag) => tag.trim()).filter(Boolean) }))}
              placeholder="healing, rituals, guidance"
            />
            <TextInput label="Cover Image URL" value={form.cover_image} onChange={(e) => setForm((prev) => ({ ...prev, cover_image: e.target.value }))} />
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] tracking-[0.2em] uppercase cursor-pointer" style={{ border: '1px solid var(--border2)', color: 'var(--fg2)' }}>
              <Upload className="w-3.5 h-3.5" />
              Upload Cover
              <input type="file" accept="image/*,video/*" hidden onChange={(e) => handleUpload(e, 'cover')} />
            </label>
            <TextInput label="Meta Title" value={form.meta_title} onChange={(e) => setForm((prev) => ({ ...prev, meta_title: e.target.value }))} />
            <TextArea label="Meta Description" value={form.meta_description} onChange={(e) => setForm((prev) => ({ ...prev, meta_description: e.target.value }))} rows={3} />
          </div>

          <div className="rounded-[28px] p-6 lg:p-8 space-y-4" style={{ border: '1px solid var(--border2)', background: 'var(--bg-elev)' }}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] tracking-[0.24em] uppercase mb-2" style={{ color: 'var(--fg3)' }}>
                  Content Blocks
                </p>
                <h2 className="text-2xl" style={{ color: 'var(--fg)' }}>
                  Editor
                </h2>
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                {['heading', 'paragraph', 'image', 'embed', 'quote', 'button'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => addBlock(type)}
                    className="px-3 py-1.5 rounded-full text-[10px] tracking-[0.18em] uppercase"
                    style={{ border: '1px solid var(--border2)', color: 'var(--fg2)' }}
                  >
                    + {type}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              {form.blocks.map((block, index) => (
                <BlockEditor
                  key={`${block.type}-${index}`}
                  block={block}
                  index={index}
                  onChange={(nextBlock) => updateBlock(index, nextBlock)}
                  onRemove={() => removeBlock(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] tracking-[0.45em] uppercase mb-2" style={{ color: 'var(--accent-text)' }}>
            Blogs
          </p>
          <h1 className="hero-display text-4xl lg:text-6xl" style={{ color: 'var(--fg)' }}>
            Blog desk
          </h1>
        </div>
        <Link
          to="/admin/blogs/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] tracking-[0.2em] uppercase"
          style={{ background: 'var(--accent)', color: '#fff' }}
        >
          <Plus className="w-3.5 h-3.5" />
          New Blog
        </Link>
      </div>

      <div className="rounded-[28px] p-5 grid lg:grid-cols-4 gap-4" style={{ border: '1px solid var(--border2)', background: 'var(--bg-elev)' }}>
        <TextInput label="Search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="title, slug, tag" />
        <label className="block">
          <span className="text-[10px] tracking-[0.24em] uppercase mb-2 block" style={{ color: 'var(--fg3)' }}>
            Status
          </span>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full rounded-xl px-4 py-3" style={{ background: 'var(--bg)', border: '1px solid var(--border2)', color: 'var(--fg)' }}>
            <option value="">All</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </label>
        <label className="block">
          <span className="text-[10px] tracking-[0.24em] uppercase mb-2 block" style={{ color: 'var(--fg3)' }}>
            Sort By
          </span>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full rounded-xl px-4 py-3" style={{ background: 'var(--bg)', border: '1px solid var(--border2)', color: 'var(--fg)' }}>
            <option value="updated_at">Updated</option>
            <option value="published_at">Published</option>
            <option value="title">Title</option>
            <option value="status">Status</option>
          </select>
        </label>
        <label className="block">
          <span className="text-[10px] tracking-[0.24em] uppercase mb-2 block" style={{ color: 'var(--fg3)' }}>
            Direction
          </span>
          <select value={sortDir} onChange={(e) => setSortDir(e.target.value)} className="w-full rounded-xl px-4 py-3" style={{ background: 'var(--bg)', border: '1px solid var(--border2)', color: 'var(--fg)' }}>
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </label>
      </div>

      {error ? <p style={{ color: '#c96f6f' }}>{error}</p> : null}
      {loading ? (
        <p style={{ color: 'var(--fg2)' }}>Loading blogs…</p>
      ) : (
        <div className="grid gap-4">
          {rows.map((row) => (
            <div key={row.id} className="rounded-[24px] p-5 lg:p-6 flex flex-col lg:flex-row lg:items-center gap-5" style={{ border: '1px solid var(--border2)', background: 'var(--bg-elev)' }}>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] tracking-[0.22em] uppercase mb-2" style={{ color: 'var(--fg3)' }}>
                  {row.status} · {row.slug}
                </p>
                <h2 className="text-2xl leading-tight" style={{ color: 'var(--fg)' }}>
                  {row.title}
                </h2>
                <p className="mt-2 text-sm font-light leading-relaxed" style={{ color: 'var(--fg2)' }}>
                  {row.excerpt || 'No excerpt'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link to={`/admin/blogs/${row.id}/edit`} className="px-4 py-2 rounded-full text-[10px] tracking-[0.18em] uppercase" style={{ border: '1px solid var(--border2)', color: 'var(--fg2)' }}>
                  Edit
                </Link>
                <button type="button" onClick={() => handleDelete(row.id)} className="px-4 py-2 rounded-full text-[10px] tracking-[0.18em] uppercase" style={{ border: '1px solid rgba(201,111,111,0.45)', color: '#c96f6f' }}>
                  Delete
                </button>
              </div>
            </div>
          ))}
          {!rows.length ? (
            <div className="rounded-[24px] p-6" style={{ border: '1px solid var(--border2)', background: 'var(--bg-elev)', color: 'var(--fg2)' }}>
              No blogs matched these filters.
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
