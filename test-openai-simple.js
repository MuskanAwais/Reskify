import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function testOpenAI() {
  try {
    console.log('Testing OpenAI API with minimal request...');
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Say hello' }
      ],
      max_tokens: 50,
      temperature: 0.3,
    });

    console.log('OpenAI Response:', response.choices[0].message.content);
    console.log('SUCCESS: OpenAI API is working');
    
  } catch (error) {
    console.error('OpenAI API Error:', error.message);
    console.error('ERROR: OpenAI API is not working');
  }
}

testOpenAI();