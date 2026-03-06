const generateSummary = async (htmlContent) => {
  try {
    // Remove HTML tags and get plain text
    const plainText = htmlContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    
    // Skip if content is too short
    if (plainText.length < 50) {
      return 'Content too short to generate summary.';
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.warn('OPENAI_API_KEY not found in environment variables');
      return null;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that creates concise, educational summaries of learning content. Create summaries as 3-5 key points, with each point on a separate line. Focus on key concepts and takeaways.'
          },
          {
            role: 'user',
            content: `Please provide a concise summary of the following educational content as separate key points (one per line):\n\n${plainText.substring(0, 3000)}`
          }
        ],
        temperature: 0.7,
        max_tokens: 200
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      return null;
    }

    const data = await response.json();
    return data.choices[0]?.message?.content?.trim() || null;
  } catch (error) {
    console.error('Error generating AI summary:', error);
    return null;
  }
};

module.exports = { generateSummary };
