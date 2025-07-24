const aiService = require('../services/aiService');

/**
 * GET /api/suggestions?userId=<id>
 * Fetches all AI suggestions for a specific user.
 * Query Parameters:
 *   - userId: (string) ID of the user whose suggestions to retrieve.
 * Responses:
 *   - 200: Array of suggestion objects.
 *   - 400: Missing userId parameter.
 *   - 500: Internal server error.
 */
exports.getSuggestions = async (req, res, next) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'userId query param required' });
    }

    // Retrieve list of suggestions from the AI service
    const rows = await aiService.list(userId);
    res.json(rows);
  } catch (err) {
    // Delegate error to the global error handler
    next(err);
  }
};

/**
 * POST /api/suggestions/generate
 * Generates a new AI suggestion and saves it.
 * Body Parameters:
 *   - userId: (string) ID of the user requesting the suggestion.
 *   - prompt: (string) The input prompt for the AI.
 * Responses:
 *   - 201: Created suggestion object.
 *   - 400: Missing prompt or userId.
 *   - 500: Error during generation or saving.
 */
exports.generateAndSaveSuggestion = async (req, res, next) => {
  try {
    const { userId, prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Call AI service to generate and persist a suggestion
    const record = await aiService.generateAndSave(userId, prompt);
    res.status(201).json(record);
  } catch (err) {
    // Extract meaningful error message if available
    const message =
      err.response?.data?.error ||
      err.message ||
      'Failed to fetch/save AI suggestion';
    // Pass a new Error to the next middleware
    next(new Error(message));
  }
};
