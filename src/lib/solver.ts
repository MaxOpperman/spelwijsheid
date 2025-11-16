/**
 * Generate a list of filtered words based on the input characters and mode.
 * @param inputChars - The characters to filter words by.
 * @param lowercaseModeParam - Whether to ignore case when filtering.
 * @returns An array of filtered words.
 */
export default function generateFilteredWords(wordList: string[], inputChars: string[], lowercaseModeParam: boolean): string[] {
    if (inputChars.includes('ij')) {
        // replace 'ij' with a placeholder to treat it as a single character
        inputChars = inputChars.map(char => (char === 'ij' ? 'ĳ' : char));
    }
    // Filter words that contain only a subset of the available characters
    // The first character (mandatory) must always be present in the word
    const filteredWords = wordList.filter(word => {
        // Convert word to lowercase for comparison (if lowercase mode is enabled)
        const normalizedWord = lowercaseModeParam ? word.toLowerCase() : word;
        
        // Check if mandatory first character is present in the word
        const mandatoryChar = inputChars[0].toLowerCase();
        if (!normalizedWord.includes(mandatoryChar)) {
            return false; // Mandatory character must be present
        }
        
        // Get unique characters from the word (treating 'ij' as single unit)
        const wordCharsSet = new Set<string>();
        let i = 0;
        while (i < normalizedWord.length) {
            if (i < normalizedWord.length - 1 && normalizedWord.substring(i, i + 2) === 'ij') {
                wordCharsSet.add('ĳ');
                i += 2;
            } else {
                wordCharsSet.add(normalizedWord[i]);
                i += 1;
            }
        }
        
        // Convert input characters to lowercase set
        const availableCharsSet = new Set(inputChars.map(char => char.toLowerCase()));
        
        // Check if all unique characters in the word are available in input
        for (const wordChar of wordCharsSet) {
            if (!availableCharsSet.has(wordChar)) {
                return false; // Word contains a character not in input
            }
        }
        
        return true;
    });
    
    // Remove duplicates by converting to Set and back to array
    const uniqueWords = Array.from(new Set(filteredWords));
    
    // Sort results by length (shorter words first)
    return uniqueWords.sort((a, b) => a.length - b.length);
}
