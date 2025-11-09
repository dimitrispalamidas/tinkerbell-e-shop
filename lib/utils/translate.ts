export async function translateText(text: string, from: string = 'el', to: string = 'en'): Promise<string> {
  if (!text || text.trim() === '') {
    return '';
  }

  try {
    // Using MyMemory Translation API (free, no key required)
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`
    );
    
    const data = await response.json();
    
    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      return data.responseData.translatedText;
    }
    
    throw new Error('Translation failed');
  } catch (error) {
    console.error('Translation error:', error);
    throw error;
  }
}

