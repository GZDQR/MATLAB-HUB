import { useState, useEffect, useRef } from 'react';
import { Pencil, Trash2, Plus, ArrowLeft, Image as ImageIcon, Save, Loader2, Link, Link2, FileText, Video, ShoppingCart } from 'lucide-react';
import { fetchModels, deleteModel, saveModel, uploadImage, Model, Resource } from './api/admin-api';

function App() {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingModel, setEditingModel] = useState<Model | null>(null);

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    setLoading(true);
    try {
      const data = await fetchModels();
      setModels(data);
    } catch (e) {
      alert("Failed to load models");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this model?")) return;
    try {
      await deleteModel(id);
      await loadModels();
    } catch {
      alert("Delete failed");
    }
  };

  if (editingModel) {
    return <EditView model={editingModel} onBack={() => setEditingModel(null)} onSave={async () => { await loadModels(); setEditingModel(null); }} />
  }

  return (
    <div className="min-h-screen bg-surface p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary">MATLAB Hub Admin</h1>
        <button onClick={() => setEditingModel({ id: '', title: '', category: '', description: '', image_url: '', version: 'v1.0', resources: [] })} className="bg-primary text-on-primary px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:opacity-90">
          <Plus size={18} /> Add Model
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>
      ) : (
        <div className="bg-surface-container rounded-xl overflow-hidden border border-outline/30">
          <table className="w-full text-left">
            <thead className="bg-surface-container-high border-b border-outline/30">
              <tr>
                <th className="p-4">ID / Title</th>
                <th className="p-4">Category</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {models.map(m => (
                <tr key={m.id} className="border-b border-outline/20 hover:bg-surface-container-high/50 transition-colors">
                  <td className="p-4">
                    <div className="font-bold">{m.title}</div>
                    <div className="text-sm text-on-surface-variant font-mono">{m.id}</div>
                  </td>
                  <td className="p-4"><span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm">{m.category}</span></td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => setEditingModel(JSON.parse(JSON.stringify(m)))} className="p-2 bg-on-surface-variant/20 hover:bg-primary hover:text-on-primary rounded-lg transition-colors inline-block"><Pencil size={18} /></button>
                    <button onClick={() => handleDelete(m.id)} className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors inline-block"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
              {models.length === 0 && (
                <tr><td colSpan={3} className="p-8 text-center text-on-surface-variant">No models found in database.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function EditView({ model, onBack, onSave }: { model: Model, onBack: () => void, onSave: () => void }) {
  const [formData, setFormData] = useState<Model>(model);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleResourceChange = (index: number, field: keyof Resource, value: string) => {
    const newRes = [...formData.resources];
    newRes[index] = { ...newRes[index], [field]: value };
    setFormData({ ...formData, resources: newRes });
  };

  const addResource = (type: Resource['type']) => {
    const newRes = [...formData.resources, { type, title: `New ${type}`, url: '', sort_order: formData.resources.length }];
    setFormData({ ...formData, resources: newRes });
  };

  const removeResource = (index: number) => {
    setFormData({ ...formData, resources: formData.resources.filter((_, i) => i !== index) });
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setFormData({ ...formData, image_url: url });
    } catch {
      alert("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.id || !formData.title || !formData.category) {
      alert("ID, Title, and Category are required");
      return;
    }
    setSaving(true);
    try {
      await saveModel(formData);
      onSave();
    } catch {
      alert("Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface p-8 max-w-4xl mx-auto pb-32">
      <button onClick={onBack} className="flex items-center gap-2 text-on-surface-variant hover:text-white mb-6 transition-colors">
        <ArrowLeft size={18} /> Back to list
      </button>

      <h2 className="text-2xl font-bold mb-6">{model.id ? 'Edit Model' : 'New Model'}</h2>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-on-surface-variant mb-2">Unique ID (English, no spaces)</label>
            <input disabled={!!model.id} value={formData.id} onChange={e => setFormData({ ...formData, id: e.target.value })} className="w-full bg-surface-container border border-outline/50 rounded-lg p-3 outline-none focus:border-primary disabled:opacity-50" placeholder="e.g. model-xyz" />
          </div>
          <div>
            <label className="block text-sm text-on-surface-variant mb-2">Title</label>
            <input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full bg-surface-container border border-outline/50 rounded-lg p-3 outline-none focus:border-primary" placeholder="Model Name" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-on-surface-variant mb-2">Category</label>
            <input value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full bg-surface-container border border-outline/50 rounded-lg p-3 outline-none focus:border-primary" placeholder="e.g. AI / Automation" />
          </div>
          <div>
            <label className="block text-sm text-on-surface-variant mb-2">Version</label>
            <input value={formData.version} onChange={e => setFormData({ ...formData, version: e.target.value })} className="w-full bg-surface-container border border-outline/50 rounded-lg p-3 outline-none focus:border-primary" placeholder="e.g. v1.0" />
          </div>
        </div>

        <div>
          <label className="block text-sm text-on-surface-variant mb-2">Description</label>
          <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full h-32 bg-surface-container border border-outline/50 rounded-lg p-3 outline-none focus:border-primary resize-none" placeholder="Description..." />
        </div>

        <div>
          <label className="block text-sm text-on-surface-variant mb-2">Cover Image</label>
          <div className="flex gap-4 items-start">
            {formData.image_url ? (
              <img src={formData.image_url} alt="Cover" className="w-48 h-32 object-cover rounded-xl border border-outline/50" />
            ) : (
              <div className="w-48 h-32 bg-surface-container rounded-xl flex items-center justify-center border border-outline/50 border-dashed text-on-surface-variant">No Image</div>
            )}
            <div className="flex-1 space-y-4">
              <input type="file" ref={fileRef} accept=".jpg,.jpeg,.png" className="hidden" onChange={handleUpload} />
              <button onClick={() => fileRef.current?.click()} disabled={uploading} className="bg-surface-container-high px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-outline transition-colors disabled:opacity-50">
                {uploading ? <Loader2 className="animate-spin" size={18} /> : <ImageIcon size={18} />}
                Upload to Cloudflare R2
              </button>
              <input value={formData.image_url} onChange={e => setFormData({ ...formData, image_url: e.target.value })} className="w-full bg-surface-container border border-outline/50 rounded-lg p-3 outline-none focus:border-primary text-sm font-mono" placeholder="Or paste image URL directly..." />
            </div>
          </div>
        </div>

        <hr className="border-outline/30 my-8" />
        
        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-lg font-bold">Related Resources</label>
            <div className="flex gap-2">
              <button onClick={() => addResource('doc')} className="text-xs bg-surface-container-high px-2 py-1 rounded hover:bg-outline flex items-center gap-1"><FileText size={12}/>+ Doc</button>
              <button onClick={() => addResource('video')} className="text-xs bg-surface-container-high px-2 py-1 rounded hover:bg-outline flex items-center gap-1"><Video size={12}/>+ Video</button>
              <button onClick={() => addResource('shop')} className="text-xs bg-surface-container-high px-2 py-1 rounded hover:bg-outline flex items-center gap-1"><ShoppingCart size={12}/>+ Shop</button>
              <button onClick={() => addResource('link')} className="text-xs bg-surface-container-high px-2 py-1 rounded hover:bg-outline flex items-center gap-1"><Link2 size={12}/>+ Link</button>
            </div>
          </div>
          
          <div className="space-y-3">
            {formData.resources.map((res, i) => (
              <div key={i} className="flex gap-3 items-center bg-surface-container p-3 rounded-lg border border-outline/30">
                <span className="text-xs uppercase font-bold text-on-surface-variant bg-surface px-2 py-1 rounded w-16 text-center">{res.type}</span>
                <input value={res.title} onChange={e => handleResourceChange(i, 'title', e.target.value)} className="flex-1 bg-transparent border-b border-outline/50 p-1 outline-none focus:border-primary" placeholder="Title" />
                <input value={res.url} onChange={e => handleResourceChange(i, 'url', e.target.value)} className="flex-[2] bg-transparent border-b border-outline/50 p-1 outline-none focus:border-primary font-mono text-sm" placeholder="https://..." />
                <button onClick={() => removeResource(i)} className="text-red-400 p-2 hover:bg-red-400/10 rounded"><Trash2 size={16}/></button>
              </div>
            ))}
            {formData.resources.length === 0 && <div className="text-sm text-on-surface-variant text-center p-4">No resources added.</div>}
          </div>
        </div>

      </div>

      <div className="fixed bottom-0 left-0 w-full bg-surface-container/80 backdrop-blur-md border-t border-outline/30 p-4 flex justify-center">
        <button onClick={handleSave} disabled={saving} className="bg-primary text-on-primary px-8 py-3 rounded-lg font-bold flex items-center gap-2 hover:opacity-90 disabled:opacity-50">
          {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          Save Changes
        </button>
      </div>
    </div>
  );
}

export default App;
