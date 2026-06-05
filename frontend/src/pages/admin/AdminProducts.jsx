import { useState, useEffect } from 'react';
import api from '../../hooks/useApi';
import styles from './Admin.module.css';

const EMPTY = { name:'', category:'Electronics', price:'', stock:'', image:'📦', description:'', isFeatured:false };
const CATS   = ['Electronics','Audio','Wearables','Photography','Peripherals','Other'];

export default function AdminProducts() {
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [form, setForm]           = useState(null);  // null = closed, {} = new, {_id:...} = edit
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');

  const load = () => api.get('/products?limit=100').then(({data})=>setProducts(data.products)).finally(()=>setLoading(false));
  useEffect(() => { load(); }, []);

  const openNew  = ()      => setForm({ ...EMPTY });
  const openEdit = (p)     => setForm({ ...p });
  const close    = ()      => { setForm(null); setError(''); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      if (form._id) await api.put(`/products/${form._id}`, form);
      else          await api.post('/products', form);
      await load();
      close();
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    await api.delete(`/products/${id}`);
    setProducts(prev => prev.filter(p => p._id !== id));
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <span className={styles.adminBadge}>ADMIN PANEL</span>
          <h1 className={styles.pageTitle}>Products</h1>
        </div>
        <button className={styles.actionBtnPrimary} onClick={openNew}>+ Add Product</button>
      </div>

      {form && (
        <div className={styles.modal}>
          <div className={styles.modalCard}>
            <h3 className={styles.modalTitle}>{form._id ? 'Edit Product' : 'New Product'}</h3>
            <form onSubmit={handleSave} className={styles.formGrid}>
              <div className={styles.formField} style={{gridColumn:'1/-1'}}>
                <label>Product Name</label>
                <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} required />
              </div>
              <div className={styles.formField}>
                <label>Category</label>
                <select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>
                  {CATS.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div className={styles.formField}>
                <label>Emoji / Icon</label>
                <input value={form.image} onChange={e=>setForm(f=>({...f,image:e.target.value}))} />
              </div>
              <div className={styles.formField}>
                <label>Price ($)</label>
                <input type="number" min="0" value={form.price} onChange={e=>setForm(f=>({...f,price:Number(e.target.value)}))} required />
              </div>
              <div className={styles.formField}>
                <label>Stock</label>
                <input type="number" min="0" value={form.stock} onChange={e=>setForm(f=>({...f,stock:Number(e.target.value)}))} required />
              </div>
              <div className={styles.formField} style={{gridColumn:'1/-1'}}>
                <label>Description</label>
                <textarea rows={3} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} required style={{resize:'vertical'}} />
              </div>
              <div className={styles.formField} style={{gridColumn:'1/-1',flexDirection:'row',alignItems:'center',gap:10}}>
                <input type="checkbox" id="feat" checked={form.isFeatured} onChange={e=>setForm(f=>({...f,isFeatured:e.target.checked}))} style={{width:'auto'}} />
                <label htmlFor="feat" style={{textTransform:'none',letterSpacing:0}}>Featured Product</label>
              </div>
              {error && <div className={styles.formError} style={{gridColumn:'1/-1'}}>{error}</div>}
              <div style={{gridColumn:'1/-1',display:'flex',gap:10}}>
                <button type="submit" className={styles.actionBtnPrimary} disabled={saving}>{saving?'Saving…':'Save Product'}</button>
                <button type="button" className={styles.actionBtn} onClick={close}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? <div className={styles.loading}>Loading products…</div> : (
        <div className={styles.productGrid}>
          {products.map(p => (
            <div key={p._id} className={styles.productCard}>
              <div className={styles.productEmoji}>{p.image}</div>
              <div className={styles.productInfo}>
                <div className={styles.productName}>{p.name}</div>
                <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:8,flexWrap:'wrap'}}>
                  <span className={styles.catTag}>{p.category}</span>
                  {p.isFeatured && <span className={styles.featTag}>Featured</span>}
                  <span className={styles.badge} style={{color:p.stock<10?'var(--red)':'var(--green)',borderColor:(p.stock<10?'var(--red)':'var(--green)')+'44',background:(p.stock<10?'var(--red)':'var(--green)')+'14'}}>{p.stock} in stock</span>
                </div>
                <div className={styles.productPrice}>${p.price.toLocaleString()}</div>
              </div>
              <div className={styles.productActions}>
                <button className={styles.editBtn} onClick={()=>openEdit(p)}>Edit</button>
                <button className={styles.deleteBtn} onClick={()=>handleDelete(p._id,p.name)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
