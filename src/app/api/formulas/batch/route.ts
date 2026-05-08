import { NextRequest, NextResponse } from 'next/server';
import { getFormulasByIds } from '@/lib/data';

export async function POST(req: NextRequest) {
  try {
    const { ids } = await req.json();
    if (!Array.isArray(ids)) {
      return NextResponse.json({ error: 'Invalid IDs' }, { status: 400 });
    }
    const formulas = await getFormulasByIds(ids);
    return NextResponse.json(formulas);
  } catch (error) {
    console.error('Batch fetch error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
