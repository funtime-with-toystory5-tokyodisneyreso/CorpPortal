import { getPendingExpenses } from '@/app/actions/expenses'
import { getPendingApprovals } from '@/app/actions/approvals'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const expenses = await getPendingExpenses()
    const approvals = await getPendingApprovals()
    return NextResponse.json({ expenses, approvals })
  } catch (error: any) {
    return NextResponse.json({ error: error.message })
  }
}