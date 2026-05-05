import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File | null;
    const prompt = formData.get('prompt') as string;
    const sessionId = formData.get('sessionId') as string;

    if (!prompt || !prompt.trim()) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // 从数据库加载历史消息作为上下文
    let historyMessages: Array<{ role: string; content: string }> = [];
    if (sessionId) {
      try {
        const messagesResponse = await fetch(`${process.env.SUPABASE_URL}/rest/v1/messages?conversation_id=eq.${sessionId}&order=created_at.asc`, {
          headers: {
            'apikey': process.env.SUPABASE_ANON_KEY!,
            'authorization': `Bearer ${process.env.SUPABASE_ANON_KEY!}`,
          },
        });
        if (messagesResponse.ok) {
          const messages: Array<{ role: string; content: string }> = await messagesResponse.json();
          historyMessages = messages.slice(-6); // 只保留最近 6 条消息作为上下文
        }
      } catch (err) {
        console.error('Failed to load history:', err);
      }
    }

    // 构建消息内容（包含历史上下文）
    const messagesPayload: Array<{ role: string; content: any }> = [];

    // 添加历史消息作为上下文
    if (historyMessages.length > 0) {
      messagesPayload.push(
        ...historyMessages.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: [{ type: 'text', text: msg.content }]
        }))
      );
    }

    // 构建当前用户消息
    let currentContent: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
      { type: 'text', text: prompt }
    ];

    // 如果有图片，添加到消息中
    if (image && image.size > 0) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64 = buffer.toString('base64');
      const mimeType = image.type;
      currentContent.push({
        type: 'image_url',
        image_url: { url: `data:${mimeType};base64,${base64}` }
      });
    }

    // 添加当前消息到最后
    messagesPayload.push({
      role: 'user',
      content: currentContent
    });

    // 调用 ModelScope API (OpenAI 兼容格式)
    const response = await fetch(`${process.env.AI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL || 'Qwen/Qwen2.5-VL-72B-Instruct',
        messages: messagesPayload,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('AI API Error:', errorData);
      return NextResponse.json(
        { error: `API Error: ${response.status} ${errorData}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || 'No response from AI';

    return NextResponse.json({ result, raw: data });
  } catch (error) {
    console.error('Server Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
