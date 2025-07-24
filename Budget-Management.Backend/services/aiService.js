// server/services/aiService.js

const axios = require('axios');
const AISuggestion = require('../models/AISuggestion');

/**
 * Calls the external LLM provider to generate a suggestion based on the given prompt.
 * @param {string} prompt - The natural language query to send to the LLM.
 * @returns {Promise<string>} - The generated text response from the LLM.
 * @throws {Error} - If the HTTP request fails or the provider returns an error.
 */
async function callLLM(prompt) {
  // API key for authentication with the LLM provider
  const { DEEPSEEK_API_KEY } = process.env;
  try {
    // Send POST request to DeepSeek chat endpoint
    const res = await axios.post(
      'https://api.deepseek.com/v1/chat/completions',
      {
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: 'You are a friendly budget assistant.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,    // Controls randomness of output
        max_tokens: 1000     // Maximum number of tokens in the response
      },
      {
        headers: {
          Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    // Extract and return the assistant's message content
    return res.data.choices[0].message.content.trim();
  } catch (err) {
    // Log provider error details for debugging
    console.error('LLM call failed:', err.response?.data || err.message);
    // Throw a generic error to be handled by calling code
    throw new Error('LLM provider error');
  }
}

module.exports = {
  /**
   * Lists all AI suggestions stored for a given user, sorted by creation date.
   * @param {string} userId - ID of the user whose suggestions to fetch.
   * @returns {Promise<Array>} - Resolves to an array of AISuggestion records.
   */
  list: async (userId) => {
    return AISuggestion.findAll({
      where: { userId },           // Filter by user ID
      order: [['createdAt', 'DESC']] // Most recent first
    });
  },

  /**
   * Generates a new suggestion via the LLM, saves it to the database, and returns it.
   * @param {string} userId - ID of the user requesting the suggestion.
   * @param {string} prompt  - The prompt text to send to the LLM.
   * @returns {Promise<Object>} - The newly created AISuggestion record.
   */
  generateAndSave: async (userId, prompt) => {
    // Call the LLM to get a generated response
    const response = await callLLM(prompt);
    // Persist the prompt and response to the database
    const record = await AISuggestion.create({
      userId,
      prompt,
      response
    });
    return record;
  }
};
