export async function GET(req: NextRequest) {
  const auth = await verifyAuth(req);
  if (auth.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const response = await fetch('https://api.paystack.co/balance', {
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    },
  });
  
  const data = await response.json();
  return NextResponse.json(data);
}

