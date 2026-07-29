"use client"

import { ArrowLeft, UploadCloud, Receipt, X, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useState, useRef } from 'react'
import { insertExpense } from '@/app/actions/expenses'
import { useRouter } from 'next/navigation'

export default function NewExpensePage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [loadingOcr, setLoadingOcr] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  // Form State for Autofill
  const [date, setDate] = useState('')
  const [category, setCategory] = useState('交通費')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')

  const handleFile = async (selectedFile: File) => {
    if (!selectedFile || !selectedFile.type.startsWith('image/')) {
      alert('画像ファイルを選択してください。')
      return
    }
    setFile(selectedFile)

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_VISION_API_KEY
    if (!apiKey) {
      alert('Gemini APIキーが設定されていません。')
      return
    }

    setLoadingOcr(true)
    try {
      const base64 = await toBase64(selectedFile)
      const base64Content = base64.replace(/^data:image\/\w+;base64,/, '')
      
      const result = await callGeminiAPI(apiKey, base64Content, selectedFile.type)
      
      // Auto fill
      if (result.date) setDate(result.date)
      if (result.account_title) {
        // Map account_title to our category options if possible
        const validCategories = ['交通費', '交際費', '消耗品費', '通信費', 'その他']
        let cat = 'その他'
        if (result.account_title === '旅費交通費') cat = '交通費'
        else if (validCategories.includes(result.account_title)) cat = result.account_title
        setCategory(cat)
      }
      if (result.amount) setAmount(result.amount.toString())
      if (result.description) setDescription(result.description)

    } catch (err: any) {
      alert('OCR解析に失敗しました: ' + err.message)
    } finally {
      setLoadingOcr(false)
    }
  }

  const toBase64 = (f: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(f)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = error => reject(error)
  })

  const PROMPT_TEXT = `添付された領収書（レシート）の画像を解析し、以下の情報を正確に抽出して指定されたJSONフォーマットのみで出力してください。

# 抽出・判定する項目
1. date: 日付 (format: YYYY-MM-DD。年が不明な場合は今年2026年と仮定してください)
2. amount: 金額 (数値のみ、カンマや円マークなどの記号は除外してください)
3. description: 但し書き (品目や店舗名から推測される購入内容)
4. account_title: 勘定科目 (以下の【選択肢リスト】の中から、最も適切なものを1つだけ選んでください)

# 【選択肢リスト】
- 交通費
- 交際費
- 消耗品費
- 通信費
- その他
※どれにも当てはまらない、または判断が難しい場合は「その他」としてください。

# 出力フォーマット例
{
  "date": "2026-10-15",
  "amount": 12800,
  "description": "カフェでの打ち合わせ代",
  "account_title": "交際費"
}`;

  async function callGeminiAPI(apiKey: string, base64Data: string, mimeType: string) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${apiKey}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: PROMPT_TEXT },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Data
                }
              }
            ]
          }
        ],
        generationConfig: {
          response_mime_type: "application/json"
        }
      })
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.error?.message || `API Error: Status ${response.status}`);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      throw new Error('Gemini APIからのレスポンスが空でした。');
    }

    return JSON.parse(rawText);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 md:pb-6 h-full flex flex-col relative">
      <div className="flex items-center space-x-4">
        <Link href="/expenses" className="p-2 bg-white rounded-full shadow-sm text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight flex items-center">
          経費の新規申請
        </h1>
      </div>

      <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 space-y-6 flex-1">
        
        <form ref={formRef} action={async (formData) => {
          setSubmitting(true)
          try {
            if (file) {
              formData.append('receipt_image', file)
            }
            await insertExpense(formData)
            router.push('/expenses')
          } catch (e) {
            alert('保存に失敗しました')
            setSubmitting(false)
          }
        }} className="space-y-4">
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">領収書画像 (AI自動入力)</label>
            
            {file ? (
              <div className="relative border-2 border-indigo-100 bg-indigo-50/50 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white rounded-lg shadow-sm border border-slate-100 flex items-center justify-center relative">
                    {loadingOcr ? <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" /> : <Receipt className="w-6 h-6 text-indigo-500" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 line-clamp-1">{file.name}</p>
                    <p className="text-xs font-medium text-slate-500">
                      {loadingOcr ? 'AI解析中...' : `${(file.size / 1024).toFixed(1)} KB`}
                    </p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => { setFile(null); setDate(''); setAmount(''); setDescription('') }}
                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div 
                className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100/50 hover:border-indigo-300 transition-colors cursor-pointer relative group"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    handleFile(e.dataTransfer.files[0])
                  }
                }}
              >
                <input 
                  type="file" 
                  accept="image/*,.pdf"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) handleFile(e.target.files[0])
                  }}
                />
                <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-6 h-6 text-indigo-500" />
                </div>
                <p className="text-sm font-bold text-slate-700 mb-1">タップまたはドラッグ＆ドロップで添付</p>
                <p className="text-xs text-slate-500 font-medium">JPEG, PNG, PDF (最大 5MB)</p>
              </div>
            )}
          </div>

          <div className="pt-2">
            <label className="block text-sm font-bold text-slate-700 mb-1.5">日付</label>
            <input name="date" type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium text-slate-800" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">種別</label>
              <select name="category" value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium text-slate-800">
                <option>交通費</option>
                <option>交際費</option>
                <option>消耗品費</option>
                <option>通信費</option>
                <option>その他</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">金額</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">¥</span>
                <input name="amount" type="number" required value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-bold text-slate-800 tabular-nums" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">申請内容 (用途・行き先など)</label>
            <input name="description" type="text" required value={description} onChange={e => setDescription(e.target.value)} placeholder="例: 品川〜新宿 往復 (A社様訪問)" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium text-slate-800" />
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end space-x-3">
            <Link href="/expenses" className="px-5 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors">
              キャンセル
            </Link>
            <button disabled={submitting} className="px-5 py-2.5 bg-indigo-600 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all">
              {submitting ? '申請中...' : '申請する'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Background Blob */}
      <div className="fixed top-20 right-0 w-96 h-96 bg-indigo-300/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 translate-x-1/2 pointer-events-none -z-10"></div>
    </div>
  )
}
