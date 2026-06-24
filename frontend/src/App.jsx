import React, { useEffect, useMemo, useState } from "react";
import "./styles.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function getItems() {
  const response = await fetch(`${API_BASE_URL}/items`);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to load inventory.");
  }
  return response.json();
}

async function createItem(item) {
  const response = await fetch(`${API_BASE_URL}/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to create item.");
  }
  return response.json();
}

async function updateItem(id, item) {
  const response = await fetch(`${API_BASE_URL}/items/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to update item.");
  }
  return response.json();
}

async function deleteItem(id) {
  const response = await fetch(`${API_BASE_URL}/items/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to delete item.");
  }
  return response.json();
}

const currencyFormatter = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });

function formatCurrency(v) {
  return currencyFormatter.format(Number(v));
}

function Header() {
  return (
    <header className="app-header">
      <div className="header-inner">
        <h1>Inventory Management System</h1>
        <div className="header-actions">
          <div className="user-pill">Admin</div>
        </div>
      </div>
    </header>
  );
}

function SummaryCard({ title, value, accent, icon }) {
  return (
    <div className="card summary-card" style={{ borderTop: `4px solid ${accent}` }}>
      <div className="card-body">
        <div className="card-left">
          <div className="card-title">{title}</div>
          <div className="card-value">{value}</div>
        </div>
        <div className="card-icon" dangerouslySetInnerHTML={{ __html: icon }} />
      </div>
    </div>
  );
}

function AddItemForm({ onAdd, disabled }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [price, setPrice] = useState(0);

  function reset() {
    setName("");
    setDescription("");
    setCategory("");
    setQuantity(0);
    setPrice(0);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({
      name: name.trim(),
      description: description.trim(),
      category: category.trim() || "General",
      quantity: Number(quantity),
      price: Number(price),
    });
    reset();
  }

  return (
    <form className="card add-card" onSubmit={handleSubmit}>
      <h3>Add New Item</h3>
      <div className="form-row">
        <label>Item Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Laptop Stand" disabled={disabled} />
      </div>
      <div className="form-row">
        <label>Category</label>
        <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Accessories" disabled={disabled} />
      </div>
      <div className="form-row">
        <label>Description</label>
        <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description of the product" disabled={disabled} />
      </div>
      <div className="form-row grid-2">
        <div>
          <label>Quantity</label>
          <input type="number" min="0" value={quantity} onChange={(e) => setQuantity(e.target.value)} disabled={disabled} />
        </div>
        <div>
          <label>Price</label>
          <input type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} disabled={disabled} />
        </div>
      </div>
      <div className="form-actions">
        <button className="btn btn-success" type="submit" disabled={disabled}>Add Item</button>
      </div>
    </form>
  );
}

function InventoryTable({ items, onEdit, onDelete, deleteId, disabled }) {
  if (!items.length) {
    return (
      <div className="card empty-card">
        <div className="empty-state">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#9AA4B2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7h18" />
            <path d="M5 7v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V7" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
          </svg>
          <div className="empty-text">No items in inventory. Add your first product.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="card table-card">
      <div className="table-wrap">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Product ID</th>
              <th>Product Name</th>
              <th>Description</th>
              <th>Category</th>
              <th>Price</th>
              <th>Quantity</th>
              <th className="actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, idx) => (
              <tr key={it.id} className={idx % 2 === 0 ? "even" : "odd"}>
                <td>{it.id}</td>
                <td className="prod-name">{it.name}</td>
                <td className="prod-desc">{it.description}</td>
                <td>{it.category}</td>
                <td>{formatCurrency(it.price)}</td>
                <td>{it.quantity}</td>
                <td className="actions">
                  <button className="btn btn-edit" onClick={() => onEdit(it)} disabled={disabled}>Edit</button>
                  <button className="btn btn-delete" onClick={() => onDelete(it.id)} disabled={disabled || deleteId === it.id}>
                    {deleteId === it.id ? "Deleting..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EditModal({ item, onClose, onSave, disabled }) {
  const [name, setName] = useState(item?.name || "");
  const [description, setDescription] = useState(item?.description || "");
  const [category, setCategory] = useState(item?.category || "");
  const [quantity, setQuantity] = useState(item?.quantity || 0);
  const [price, setPrice] = useState(item?.price || 0);

  useEffect(() => {
    setName(item?.name || "");
    setDescription(item?.description || "");
    setCategory(item?.category || "");
    setQuantity(item?.quantity || 0);
    setPrice(item?.price || 0);
  }, [item]);

  if (!item) return null;

  function handleSubmit(e) {
    e.preventDefault();
    onSave({
      ...item,
      name: name.trim(),
      description: description.trim(),
      category: category.trim() || "General",
      quantity: Number(quantity),
      price: Number(price),
    });
  }

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <h3>Edit Item</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label>Item Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} disabled={disabled} />
          </div>
          <div className="form-row">
            <label>Description</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)} disabled={disabled} />
          </div>
          <div className="form-row">
            <label>Category</label>
            <input value={category} onChange={(e) => setCategory(e.target.value)} disabled={disabled} />
          </div>
          <div className="form-row grid-2">
            <div>
              <label>Quantity</label>
              <input type="number" min="0" value={quantity} onChange={(e) => setQuantity(e.target.value)} disabled={disabled} />
            </div>
            <div>
              <label>Price</label>
              <input type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} disabled={disabled} />
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn" onClick={onClose} disabled={disabled}>Cancel</button>
            <button className="btn btn-primary" type="submit" disabled={disabled}>Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function App() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => i.name.toLowerCase().includes(q));
  }, [items, search]);

  const totals = useMemo(() => {
    const totalProducts = items.length;
    const totalQty = items.reduce((s, it) => s + Number(it.quantity), 0);
    const totalValue = items.reduce((s, it) => s + it.quantity * it.price, 0);
    return { totalProducts, totalQty, totalValue };
  }, [items]);

  async function loadItems() {
    setLoading(true);
    setError("");
    try {
      const data = await getItems();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unable to load inventory.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  async function handleAdd(data) {
    setSaving(true);
    setError("");
    try {
      await createItem(data);
      await loadItems();
    } catch (err) {
      setError(err.message || "Unable to add item.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm("Delete this item?");
    if (!confirmed) return;
    setDeleteId(id);
    setError("");
    try {
      await deleteItem(id);
      await loadItems();
    } catch (err) {
      setError(err.message || "Unable to delete item.");
    } finally {
      setDeleteId(null);
    }
  }

  async function handleSave(updatedItem) {
    setSaving(true);
    setError("");
    try {
      await updateItem(updatedItem.id, updatedItem);
      setEditing(null);
      await loadItems();
    } catch (err) {
      setError(err.message || "Unable to save item.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="app-root">
      <Header />
      <main className="container">
        <section className="top-grid">
          <div className="left-column">
            <div className="summary-grid">
              <SummaryCard
                title="Total Products"
                value={totals.totalProducts}
                accent="#4F46E5"
                icon={`<svg width="36" height="36" viewBox="0 0 24 24"><path fill="#4F46E5" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/></svg>`}
              />
              <SummaryCard
                title="Total Quantity"
                value={totals.totalQty}
                accent="#7C3AED"
                icon={`<svg width="36" height="36" viewBox="0 0 24 24"><path fill="#7C3AED" d="M12 2v20M2 12h20"/></svg>`}
              />
              <SummaryCard
                title="Total Value"
                value={formatCurrency(totals.totalValue)}
                accent="#10B981"
                icon={`<svg width="36" height="36" viewBox="0 0 24 24"><path fill="#10B981" d="M12 1v22M5 6h14"/></svg>`}
              />
            </div>

            {error && <div className="error-message">{error}</div>}
            {loading ? (
              <div className="loading-state">Loading inventory...</div>
            ) : (
              <>
                <div className="controls-card card">
                  <div className="controls-left">
                    <input
                      className="search-input"
                      placeholder="Search products..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      disabled={saving}
                    />
                  </div>
                  <div className="controls-right">
                    <div className="small-hint">Showing {filtered.length} of {items.length}</div>
                  </div>
                </div>

                <InventoryTable
                  items={filtered}
                  onEdit={(it) => setEditing(it)}
                  onDelete={handleDelete}
                  deleteId={deleteId}
                  disabled={saving}
                />
              </>
            )}
          </div>

          <aside className="right-column">
            <AddItemForm onAdd={handleAdd} disabled={saving || loading} />
            <div className="card info-card">
              <h4>Tips</h4>
              <ul>
                <li>Keep product names descriptive.</li>
                <li>Use categories to filter and organize items.</li>
                <li>Prices are in INR (₹) for demo purposes.</li>
              </ul>
            </div>
          </aside>
        </section>
      </main>

      {editing && (
        <EditModal item={editing} onClose={() => setEditing(null)} onSave={handleSave} disabled={saving} />
      )}
    </div>
  );
}
