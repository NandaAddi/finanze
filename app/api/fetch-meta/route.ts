import { NextRequest, NextResponse } from 'next/server';

const LINKPREVIEW_API_KEY = process.env.LINKPREVIEW_API_KEY;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');
  if (!url) return NextResponse.json({ error: 'No url' }, { status: 400 });
  if (!LINKPREVIEW_API_KEY) {
    // Fallback if no API key
    try {
      const u = new URL(url);
      return NextResponse.json({
        title: u.hostname,
        description: '',
        icon: `${u.origin}/favicon.ico`,
      });
    } catch {
      return NextResponse.json({ title: url, description: '', icon: '' });
    }
  }

  try {
    const res = await fetch(`https://api.linkpreview.net/?key=${LINKPREVIEW_API_KEY}&q=${encodeURIComponent(url)}`);
    if (!res.ok) {
      const u = new URL(url);
      return NextResponse.json({
        title: u.hostname,
        description: '',
        icon: `${u.origin}/favicon.ico`,
      });
    }
    const data = await res.json();
 
    // Favicon fallback
    let favicon = data.icon;
    if (!favicon) {
      try {
        const u = new URL(url);
        favicon = `${u.origin}/favicon.ico`;
      } catch {
        favicon = '';
      }
    }

    return NextResponse.json({
      title: data.title,
      description: data.description,
      icon: favicon,
    });
  } catch (e) {
    try {
      const u = new URL(url);
      return NextResponse.json({
        title: u.hostname,
        description: '',
        icon: `${u.origin}/favicon.ico`,
      });
    } catch {
      return NextResponse.json({ title: url, description: '', icon: '' });
    }
  }
} 
