import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaHome, FaCar, FaShoppingBag } from 'react-icons/fa';
import ItemsServices from '../services/itemsServices';
import PillButton from '../components/PillButton';
import { getAiClient } from '../api/ai';
import { createUserContent, createPartFromBase64, type Part } from '@google/genai';
import { toast } from 'react-toastify';
import { SiGooglegemini } from "react-icons/si";
import { categoryTree, type CategoryNode } from '../data/categories';

const categoryIcons: Record<string, typeof FaHome> = {
  'נדל"ן': FaHome,
  'רכבים': FaCar,
  'מוצרים': FaShoppingBag,
};

function getOptionsAtLevel(path: string[]): CategoryNode[] {
  let nodes = categoryTree;
  for (const label of path) {
    const found = nodes.find((n) => n.label === label);
    if (!found?.subCategories) return [];
    nodes = found.subCategories;
  }
  return nodes;
}

export default function PublishItem() {
  const navigate = useNavigate();
  const [categoryPath, setCategoryPath] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false)

  const isCategoryComplete = categoryPath.length > 0 && getOptionsAtLevel(categoryPath).length === 0;
  const categoryLabel = categoryPath.join(' / ');

  const handleSelectAt = (level: number, label: string) => {
    setCategoryPath((prev) => [...prev.slice(0, level), label]);
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isCategoryComplete) {
      setError('יש לבחור קטגוריה עד הסוף');
      return;
    }
    if (!title.trim() || !description.trim() || !price) {
      setError('יש למלא את כל השדות');
      return;
    }

    setIsSubmitting(true);
    try {
      await ItemsServices.createItem({
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        category: categoryLabel,
        image: imageFile,
      });
      navigate('/my-listings');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const serverMessage = err.response?.data?.error;
        if (status === 400 && serverMessage) {
          // Image moderation rejection - the message is already a full, user-facing sentence.
          setError(serverMessage);
        } else {
          setError(`הפרסום נכשל (${status ?? 'שגיאת רשת'}): ${serverMessage ?? 'ללא פרטים נוספים'}`);
        }
      } else {
        setError('הפרסום נכשל, נסו שוב');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleGenerate = async () => {

    const prompt = `כתוב לי או שפר את המודעה שתהיה קצרה ומושכת למכירת ${categoryLabel} עם הכותרת "${title}" ותיאור "${description}". המחיר הוא ${price} ש"ח.${
      imageFile ? ' התבסס גם על התמונה המצורפת של הפריט.' : ''
    } חשוב מאוד: החזר אך ורק את טקסט התיאור עצמו, ללא כותרות, ללא הסברים וללא עטיפה של מרכאות או Markdown.`;

    if (!prompt.trim()) return;

    setIsLoadingAi(true);

    try {
      const ai = getAiClient();
      const parts: (string | Part)[] = [prompt];
      if (imageFile) {
        const base64Data = await fileToBase64(imageFile);
        parts.push(createPartFromBase64(base64Data, imageFile.type));
      }

      const result = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: createUserContent(parts),
      });

      if (!result.text) {
        toast.error('לא התקבלה תגובה מהמודל. נסה שוב מאוחר יותר.');
        return;
      }

      setDescription(result.text);
    } catch (error) {
      console.error('Error calling Gemini:', error);
      toast.error('שגיאה ביצירת תוכן. נסה שוב מאוחר יותר.');
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <section className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-center font-display text-3xl font-extrabold text-ink">פרסום מודעה חדשה</h1>

      <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-8">
        <div>
          <p className="mb-3 font-sans text-sm font-bold text-ink">1. באיזו קטגוריה?</p>

          {[0, 1, 2].map((level) => {
            const options = getOptionsAtLevel(categoryPath.slice(0, level));
            if (options.length === 0) return null;
            return (
              <div key={level} className={level === 0 ? '' : 'mt-4'}>
                {level > 0 && (
                  <p className="mb-2 font-sans text-sm text-ink/70">{level === 1 ? 'תת-קטגוריה' : 'סוג'}</p>
                )}
                <div className={level === 0 ? 'grid grid-cols-3 gap-3' : 'flex flex-wrap gap-2'}>
                  {options.map((node) => {
                    const isSelected = categoryPath[level] === node.label;
                    if (level === 0) {
                      const Icon = categoryIcons[node.label] ?? FaShoppingBag;
                      return (
                        <button
                          key={node.label}
                          type="button"
                          onClick={() => handleSelectAt(level, node.label)}
                          className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-colors duration-150 ease-out ${
                            isSelected ? 'border-navy bg-navy/5' : 'border-ink/10 hover:border-navy/40'
                          }`}
                        >
                          <Icon size={22} className={isSelected ? 'text-navy' : 'text-ink/60'} />
                          <span className="font-sans text-sm font-medium text-ink">{node.label}</span>
                        </button>
                      );
                    }
                    return (
                      <button
                        key={node.label}
                        type="button"
                        onClick={() => handleSelectAt(level, node.label)}
                        className={`rounded-pill border px-4 py-2 font-sans text-sm transition-colors duration-150 ease-out ${
                          isSelected
                            ? 'border-navy bg-navy text-white'
                            : 'border-ink/15 text-ink/70 hover:border-navy/40'
                        }`}
                      >
                        {node.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div>
          <p className="mb-3 font-sans text-sm font-bold text-ink">2. פרטי המודעה</p>
          <div className="flex flex-col gap-4">
            <div>
              <label className="mb-1 block font-sans text-sm text-ink/70">כותרת</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder='למשל: "אייפון 13, מצב מעולה"'
                className="w-full rounded-xl border border-ink/15 px-4 py-3 font-sans text-ink outline-none focus:border-navy"
              />
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between gap-2">
                <label className="block font-sans text-sm text-ink/70">תיאור</label>
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isLoadingAi || categoryPath.length === 0}
                  className="inline-flex items-center gap-1.5 rounded-pill border border-navy/15 bg-navy/5 px-3 py-1.5 font-sans text-xs font-medium text-navy transition-[background-color,color,transform,box-shadow] duration-150 ease-out hover:scale-[1.03] hover:border-navy/0 hover:text-white hover:shadow-sm hover:bg-gradient-to-r hover:from-navy hover:via-sky-500 hover:to-navy-soft hover:bg-[length:200%_200%] hover:animate-gradient-flow active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 disabled:hover:bg-navy/5 disabled:hover:text-navy"
                >
                  <SiGooglegemini size={13} className={isLoadingAi ? 'animate-spin' : ''} />
                  {isLoadingAi ? 'מייצר תיאור...' : 'שיפור תיאור באמצעות AI'}
                </button>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="ספרו על הפריט..."
                rows={4}
                className="w-full rounded-xl border border-ink/15 px-4 py-3 font-sans text-ink outline-none focus:border-navy"
              />
            </div>
            <div>
              <label className="mb-1 block font-sans text-sm text-ink/70">מחיר (בש"ח)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
                className="w-full rounded-xl border border-ink/15 px-4 py-3 font-sans text-ink outline-none focus:border-navy"
              />
            </div>
            <div>
              <label className="mb-1 block font-sans text-sm text-ink/70">תמונה</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full font-sans text-sm text-ink/70"
              />
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="תצוגה מקדימה"
                  className="mt-3 h-40 w-full rounded-xl object-cover"
                />
              )}
            </div>
          </div>
        </div>

        {error && <p className="text-center font-sans text-sm text-red-600">{error}</p>}

        <div>
          <p className="mb-3 font-sans text-sm font-bold text-ink">3. אישור פרסום</p>
          <PillButton type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'מפרסמת...' : 'פרסמו את המודעה'}
          </PillButton>
        </div>
      </form>
    </section>
  );
}