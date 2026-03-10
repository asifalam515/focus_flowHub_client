import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Plus, Edit2, Trash2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Book } from "@/types";

export default function BooksPage() {
  const { books, loading, addBook, updateBook, deleteBook } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Book | null>(null);
  const [detailBook, setDetailBook] = useState<Book | null>(null);
  const [form, setForm] = useState({ title: "", author: "", totalPages: 0, completedPages: 0, notes: "", summary: "" });

  const openNew = () => { setEditing(null); setForm({ title: "", author: "", totalPages: 0, completedPages: 0, notes: "", summary: "" }); setModalOpen(true); };
  const openEdit = (b: Book) => { setEditing(b); setForm({ title: b.title, author: b.author, totalPages: b.totalPages, completedPages: b.completedPages, notes: b.notes, summary: b.summary }); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    if (editing) { await updateBook(editing.id, form); } else { await addBook(form); }
    setModalOpen(false);
  };

  if (loading.books) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Books</h1>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" />Add Book</Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {books.map(book => {
          const pct = Math.round(book.completedPages / book.totalPages * 100);
          return (
            <div key={book.id} className="bg-card rounded-xl border border-border shadow-sm p-5 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setDetailBook(book)}>
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-info" />
                </div>
                <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                  <Button variant="ghost" size="sm" onClick={() => openEdit(book)}><Edit2 className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteBook(book.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
              <h3 className="font-semibold text-card-foreground">{book.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{book.author}</p>
              <Progress value={pct} className="h-2 mb-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{book.completedPages}/{book.totalPages} pages</span>
                <span>{pct}%</span>
              </div>
            </div>
          );
        })}
        {books.length === 0 && <p className="col-span-full text-center text-muted-foreground py-8">No books yet</p>}
      </div>

      {/* Detail Modal */}
      <Dialog open={!!detailBook} onOpenChange={() => setDetailBook(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{detailBook?.title}</DialogTitle></DialogHeader>
          {detailBook && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">by {detailBook.author}</p>
              <Progress value={detailBook.completedPages / detailBook.totalPages * 100} className="h-2" />
              <p className="text-xs text-muted-foreground">{detailBook.completedPages}/{detailBook.totalPages} pages</p>
              {detailBook.summary && <div><p className="text-sm font-medium text-card-foreground mb-1">Summary</p><p className="text-sm text-muted-foreground">{detailBook.summary}</p></div>}
              {detailBook.notes && <div><p className="text-sm font-medium text-card-foreground mb-1">Notes</p><p className="text-sm text-muted-foreground">{detailBook.notes}</p></div>}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Book" : "Add Book"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Title</Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
            <div><Label>Author</Label><Input value={form.author} onChange={e => setForm(p => ({ ...p, author: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Total Pages</Label><Input type="number" value={form.totalPages} onChange={e => setForm(p => ({ ...p, totalPages: +e.target.value }))} /></div>
              <div><Label>Completed Pages</Label><Input type="number" value={form.completedPages} onChange={e => setForm(p => ({ ...p, completedPages: +e.target.value }))} /></div>
            </div>
            <div><Label>Summary</Label><Textarea value={form.summary} onChange={e => setForm(p => ({ ...p, summary: e.target.value }))} /></div>
            <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} /></div>
          </div>
          <DialogFooter><Button onClick={handleSave}>{editing ? "Update" : "Add"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
