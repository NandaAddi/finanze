export async function callAlibabaAI(prompt: string) {
  const apiKey = process.env.ALIBABA_AI_API_KEY;
  
  if (!apiKey) {
    throw new Error('Alibaba AI API Key is not configured');
  }

  // Verify key loading (safe logging)
  console.log(`AI Key loaded: ${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 3)}`);

  console.log(`Calling Alibaba AI (qwen-turbo) with prompt length: ${prompt.length}`);

  // Menggunakan International Endpoint jika menggunakan akun luar China
  const response = await fetch('https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'qwen-plus', // Mencoba model plus yang lebih stabil untuk akun internasional
      input: {
        messages: [
          {
            role: 'system',
            content: 'You are a professional and friendly Financial Advisor. Your goal is to analyze the user\'s financial data and provide actionable, encouraging advice on how to save money and improve financial stability. Keep your advice concise and formatted in markdown.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      },
      parameters: {
        result_format: 'message'
      }
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Alibaba AI API Error:', {
      status: response.status,
      statusText: response.statusText,
      error: errorData
    });
    
    if (response.status === 401) {
      throw new Error('API Key Alibaba AI tidak valid atau belum terkonfigurasi dengan benar.');
    }
    
    throw new Error(errorData.error?.message || errorData.message || errorData.code || `Alibaba AI Error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.output.choices[0].message.content;
}

export async function callAlibabaMultimodal(base64Image: string, prompt: string) {
  const apiKey = process.env.ALIBABA_AI_API_KEY;
  
  if (!apiKey) {
    throw new Error('Alibaba AI API Key is not configured');
  }

  const response = await fetch('https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'qwen-vl-plus',
      input: {
        messages: [
          {
            role: 'user',
            content: [
              { image: `data:image/jpeg;base64,${base64Image}` },
              { text: prompt }
            ]
          }
        ]
      }
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || errorData.message || `AI Error: ${response.statusText}`);
  }

  const data = await response.json();
  // Multimodal output structure is slightly different
  return data.output.choices[0].message.content[0].text;
}
