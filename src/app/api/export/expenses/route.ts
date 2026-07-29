import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import ExcelJS from 'exceljs'
import { getProfile } from '@/app/actions/profile'

export async function GET(request: NextRequest) {
  try {
    const profile = await getProfile()
    if (!profile || (profile.role !== '管理者' && profile.role !== '役員')) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const supabase = await createClient()

    let query = supabase
      .from('expenses')
      .select(`
        *,
        profiles:user_id ( full_name, department )
      `)
      .order('created_at', { ascending: false })

    if (startDate) {
      query = query.gte('date', startDate)
    }
    if (endDate) {
      query = query.lte('date', endDate)
    }

    const { data: expenses, error } = await query

    if (error) {
      console.error('Error fetching expenses for export:', error)
      return new NextResponse('Error fetching data', { status: 500 })
    }

    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet('経費申請一覧', {
      views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }]
    })

    // Define columns
    sheet.columns = [
      { header: '申請日', key: 'date', width: 12 },
      { header: '申請者', key: 'name', width: 20 },
      { header: '部署', key: 'department', width: 20 },
      { header: 'ステータス', key: 'status', width: 15 },
      { header: '種別', key: 'category', width: 15 },
      { header: '金額', key: 'amount', width: 15 },
      { header: '用途・備考', key: 'description', width: 40 },
      { header: '領収書画像', key: 'receipt', width: 40 },
    ]

    // Style header row
    sheet.getRow(1).font = { bold: true }
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF0F0F0' }
    }

    // Add data and process images
    for (let i = 0; i < (expenses || []).length; i++) {
      const expense = expenses[i]
      const rowNum = i + 2 // Row 1 is header

      const row = sheet.addRow({
        date: expense.date,
        name: expense.profiles?.full_name || '不明',
        department: expense.profiles?.department || '不明',
        status: expense.status,
        category: expense.category,
        amount: expense.amount,
        description: expense.description || '',
      })

      row.height = 100 // Set row height to accommodate image

      // Format amount column
      row.getCell('amount').numFmt = '#,##0'

      // Embed receipt image if available
      if (expense.receipt_image_url) {
        try {
          const imageRes = await fetch(expense.receipt_image_url)
          if (imageRes.ok) {
            const arrayBuffer = await imageRes.arrayBuffer()
            const ext = expense.receipt_image_url.split('.').pop()?.toLowerCase() || 'png'
            
            let extension: 'jpeg' | 'png' | 'gif' = 'png'
            if (ext === 'jpg' || ext === 'jpeg') extension = 'jpeg'
            else if (ext === 'gif') extension = 'gif'

            const imageId = workbook.addImage({
              buffer: arrayBuffer,
              extension
            })

            // Add image to the 'receipt' column (column 8)
            // col and row are 0-indexed in tl/br positioning for some reason in exceljs
            sheet.addImage(imageId, {
              tl: { col: 7, row: rowNum - 1 },
              br: { col: 8, row: rowNum },
              editAs: 'oneCell'
            } as any)
          }
        } catch (imageError) {
          console.error('Failed to embed image for expense', expense.id, imageError)
          row.getCell('receipt').value = '画像読み込みエラー'
        }
      }
    }

    const buffer = await workbook.xlsx.writeBuffer()

    const headers = new Headers()
    headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    headers.set('Content-Disposition', `attachment; filename="expenses_${startDate || 'all'}_to_${endDate || 'all'}.xlsx"`)

    return new NextResponse(buffer, {
      status: 200,
      headers
    })
  } catch (error) {
    console.error('Export error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
